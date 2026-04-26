import { and, eq } from 'drizzle-orm';
import { getDb } from './client';
import { apps, docs } from './schema';
import { slugify } from '../slug';
import type { AgentApp, AgentDoc, AppWithDocs } from '../types';

function requireDb() {
  const db = getDb();
  if (!db) throw new Error('DATABASE_URL is not configured');
  return db;
}

function asApp(row: typeof apps.$inferSelect): AgentApp {
  return {
    id: row.id,
    ownerSlug: row.ownerSlug,
    name: row.name,
    slug: row.slug,
    description: row.description,
    visibility: row.visibility === 'private' ? 'private' : 'public',
    repoUrl: row.repoUrl ?? undefined,
    homepageUrl: row.homepageUrl ?? undefined,
    tags: row.tags ?? [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

function asDoc(row: typeof docs.$inferSelect): AgentDoc {
  return {
    id: row.id,
    appId: row.appId,
    title: row.title,
    slug: row.slug,
    description: row.description,
    content: row.content,
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

function withDocs(app: AgentApp, allDocs: AgentDoc[]): AppWithDocs {
  return { ...app, docs: allDocs.filter((doc) => doc.appId === app.id) };
}

function uniqueSlug(base: string) {
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

export async function dbListPublicApps(): Promise<AppWithDocs[]> {
  const db = requireDb();
  const appRows = await db.select().from(apps).where(eq(apps.visibility, 'public'));
  const docRows = await db.select().from(docs).where(eq(docs.published, true));
  const allDocs = docRows.map(asDoc);
  return appRows.map(asApp).map((app) => withDocs(app, allDocs));
}

export async function dbListAllApps(): Promise<AppWithDocs[]> {
  const db = requireDb();
  const [appRows, docRows] = await Promise.all([db.select().from(apps), db.select().from(docs)]);
  const allDocs = docRows.map(asDoc);
  return appRows.map(asApp).map((app) => withDocs(app, allDocs));
}

export async function dbGetApp(ownerSlug: string, appSlug: string): Promise<AppWithDocs | null> {
  const db = requireDb();
  const [appRow] = await db.select().from(apps).where(and(eq(apps.ownerSlug, ownerSlug), eq(apps.slug, appSlug))).limit(1);
  if (!appRow) return null;
  const docRows = await db.select().from(docs).where(eq(docs.appId, appRow.id));
  return withDocs(asApp(appRow), docRows.map(asDoc));
}

export async function dbGetPublicDoc(ownerSlug: string, appSlug: string, docSlug: string) {
  const app = await dbGetApp(ownerSlug, appSlug);
  if (!app || app.visibility !== 'public') return null;
  const doc = app.docs.find((item) => item.slug === docSlug && item.published);
  return doc ? { app, doc } : null;
}

export async function dbCreateApp(input: { ownerSlug?: string; name: string; description?: string; repoUrl?: string }) {
  const db = requireDb();
  const now = new Date();
  const baseSlug = slugify(input.name);
  const app: typeof apps.$inferInsert = {
    id: `app_${crypto.randomUUID()}`,
    ownerSlug: input.ownerSlug ? slugify(input.ownerSlug) : 'demo',
    name: input.name,
    slug: uniqueSlug(baseSlug),
    description: input.description ?? '',
    visibility: 'public',
    repoUrl: input.repoUrl,
    tags: [],
    createdAt: now,
    updatedAt: now
  };
  const [row] = await db.insert(apps).values(app).returning();
  return asApp(row);
}

export async function dbCreateDoc(input: { appId: string; title: string; content: string; description?: string }) {
  const db = requireDb();
  const now = new Date();
  const baseSlug = slugify(input.title);
  const doc: typeof docs.$inferInsert = {
    id: `doc_${crypto.randomUUID()}`,
    appId: input.appId,
    title: input.title,
    slug: uniqueSlug(baseSlug),
    description: input.description ?? '',
    content: input.content,
    published: true,
    createdAt: now,
    updatedAt: now
  };
  const [row] = await db.insert(docs).values(doc).returning();
  return asDoc(row);
}

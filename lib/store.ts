import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  blobCreateApp,
  blobCreateDoc,
  blobCreateAppWithDoc,
  blobGetApp,
  blobGetPublicDoc,
  blobListAllApps,
  blobListPublicApps
} from './blob/store';
import {
  dbCreateApp,
  dbCreateDoc,
  dbGetApp,
  dbGetPublicDoc,
  dbListAllApps,
  dbListPublicApps
} from './db/store';
import { seedData } from './seed';
import { slugify } from './slug';
import type { AgentApp, AgentDoc, AppWithDocs, StoreData } from './types';

const dataFile = path.join(process.cwd(), '.data', 'demo.json');
const isVercel = process.env.VERCEL === '1';
const hasDatabase = Boolean(process.env.DATABASE_URL);
const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function readData(): Promise<StoreData> {
  if (isVercel) return seedData;
  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    return JSON.parse(raw) as StoreData;
  } catch {
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    await fs.writeFile(dataFile, JSON.stringify(seedData, null, 2));
    return seedData;
  }
}

async function writeData(data: StoreData) {
  if (isVercel) return;
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
}

function withDocs(app: AgentApp, docs: AgentDoc[]): AppWithDocs {
  return { ...app, docs: docs.filter((doc) => doc.appId === app.id) };
}

function uniqueSlug(base: string) {
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

export async function listPublicApps(): Promise<AppWithDocs[]> {
  if (hasDatabase) return dbListPublicApps();
  if (hasBlob) return blobListPublicApps();
  const data = await readData();
  return data.apps
    .filter((app) => app.visibility === 'public')
    .map((app) => withDocs(app, data.docs.filter((doc) => doc.published)));
}

export async function listAllApps(): Promise<AppWithDocs[]> {
  if (hasDatabase) return dbListAllApps();
  if (hasBlob) return blobListAllApps();
  const data = await readData();
  return data.apps.map((app) => withDocs(app, data.docs));
}

export async function getApp(ownerSlug: string, appSlug: string): Promise<AppWithDocs | null> {
  if (hasDatabase) return dbGetApp(ownerSlug, appSlug);
  if (hasBlob) return blobGetApp(ownerSlug, appSlug);
  const data = await readData();
  const app = data.apps.find((item) => item.ownerSlug === ownerSlug && item.slug === appSlug);
  return app ? withDocs(app, data.docs) : null;
}

export async function getPublicDoc(ownerSlug: string, appSlug: string, docSlug: string) {
  if (hasDatabase) return dbGetPublicDoc(ownerSlug, appSlug, docSlug);
  if (hasBlob) return blobGetPublicDoc(ownerSlug, appSlug, docSlug);
  const app = await getApp(ownerSlug, appSlug);
  if (!app || app.visibility !== 'public') return null;
  const doc = app.docs.find((item) => item.slug === docSlug && item.published);
  return doc ? { app, doc } : null;
}

export async function createApp(input: { ownerSlug?: string; name: string; description?: string; repoUrl?: string; namespaceId?: string | null; actorUserId?: string | null }) {
  if (hasDatabase) return dbCreateApp(input);
  if (hasBlob) return blobCreateApp(input);
  const data = await readData();
  const now = new Date().toISOString();
  const slug = uniqueSlug(slugify(input.name));
  const app: AgentApp = {
    id: `app_${crypto.randomUUID()}`,
    ownerSlug: input.ownerSlug ? slugify(input.ownerSlug) : 'demo',
    name: input.name,
    slug,
    description: input.description ?? '',
    visibility: 'public',
    repoUrl: input.repoUrl,
    tags: [],
    createdAt: now,
    updatedAt: now
  };
  data.apps.unshift(app);
  await writeData(data);
  return app;
}

export async function createDoc(input: { appId: string; title: string; content: string; description?: string; actorUserId?: string | null }) {
  if (hasDatabase) return dbCreateDoc(input);
  if (hasBlob) return blobCreateDoc(input);
  const data = await readData();
  const now = new Date().toISOString();
  const doc: AgentDoc = {
    id: `doc_${crypto.randomUUID()}`,
    appId: input.appId,
    title: input.title,
    slug: uniqueSlug(slugify(input.title)),
    description: input.description ?? '',
    content: input.content,
    published: true,
    createdAt: now,
    updatedAt: now
  };
  data.docs.unshift(doc);
  await writeData(data);
  return doc;
}

export async function createAppWithDoc(input: {
  ownerSlug?: string;
  appName: string;
  description?: string;
  repoUrl?: string;
  docTitle: string;
  content: string;
  namespaceId?: string | null;
  actorUserId?: string | null;
}) {
  if (hasBlob && !hasDatabase) return blobCreateAppWithDoc(input);

  const app = await createApp({
    ownerSlug: input.ownerSlug,
    name: input.appName,
    description: input.description,
    repoUrl: input.repoUrl,
    namespaceId: input.namespaceId,
    actorUserId: input.actorUserId
  });
  const doc = await createDoc({
    appId: app.id,
    title: input.docTitle,
    content: input.content,
    description: input.description,
    actorUserId: input.actorUserId
  });
  return { app, doc };
}

export function isDemoReadonly() {
  return isVercel && !hasDatabase && !hasBlob;
}

export function isPersistentStorageEnabled() {
  return hasDatabase || hasBlob;
}

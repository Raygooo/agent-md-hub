import { promises as fs } from 'node:fs';
import path from 'node:path';
import { seedData } from './seed';
import { slugify } from './slug';
import type { AgentApp, AgentDoc, AppWithDocs, StoreData } from './types';

const dataFile = path.join(process.cwd(), '.data', 'demo.json');
const isVercel = process.env.VERCEL === '1';

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

export async function listPublicApps(): Promise<AppWithDocs[]> {
  const data = await readData();
  return data.apps
    .filter((app) => app.visibility === 'public')
    .map((app) => withDocs(app, data.docs.filter((doc) => doc.published)));
}

export async function listAllApps(): Promise<AppWithDocs[]> {
  const data = await readData();
  return data.apps.map((app) => withDocs(app, data.docs));
}

export async function getApp(ownerSlug: string, appSlug: string): Promise<AppWithDocs | null> {
  const data = await readData();
  const app = data.apps.find((item) => item.ownerSlug === ownerSlug && item.slug === appSlug);
  return app ? withDocs(app, data.docs) : null;
}

export async function getPublicDoc(ownerSlug: string, appSlug: string, docSlug: string) {
  const app = await getApp(ownerSlug, appSlug);
  if (!app || app.visibility !== 'public') return null;
  const doc = app.docs.find((item) => item.slug === docSlug && item.published);
  return doc ? { app, doc } : null;
}

export async function createApp(input: { ownerSlug?: string; name: string; description?: string; repoUrl?: string }) {
  const data = await readData();
  const now = new Date().toISOString();
  const slug = slugify(input.name);
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

export async function createDoc(input: { appId: string; title: string; content: string; description?: string }) {
  const data = await readData();
  const now = new Date().toISOString();
  const doc: AgentDoc = {
    id: `doc_${crypto.randomUUID()}`,
    appId: input.appId,
    title: input.title,
    slug: slugify(input.title),
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

export function isDemoReadonly() {
  return isVercel && !process.env.DATABASE_URL;
}

import { list, put } from '@vercel/blob';
import { seedData } from '../seed';
import { slugify } from '../slug';
import type { AgentApp, AgentDoc, AppWithDocs, StoreData } from '../types';

const DATA_PREFIX = 'agent-md-hub/data/';

function requireBlobToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
  }
}

async function readBlobData(): Promise<StoreData> {
  requireBlobToken();
  try {
    const { blobs } = await list({ prefix: DATA_PREFIX, limit: 1000 });
    const blob = blobs.sort((a, b) => b.pathname.localeCompare(a.pathname))[0];
    if (blob) {
      const response = await fetch(blob.url, { cache: 'no-store' });
      if (response.ok) {
        return (await response.json()) as StoreData;
      }
    }
  } catch (error) {
    console.warn('Blob store read failed; initializing seed data', error);
  }

  await writeBlobData(seedData);
  return seedData;
}

async function writeBlobData(data: StoreData) {
  requireBlobToken();
  const pathname = `${DATA_PREFIX}${Date.now()}-${crypto.randomUUID()}.json`;
  await put(pathname, JSON.stringify(data, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    cacheControlMaxAge: 60
  });
}

function withDocs(app: AgentApp, docs: AgentDoc[]): AppWithDocs {
  return { ...app, docs: docs.filter((doc) => doc.appId === app.id) };
}

function uniqueSlug(base: string) {
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

export async function blobListPublicApps(): Promise<AppWithDocs[]> {
  const data = await readBlobData();
  return data.apps
    .filter((app) => app.visibility === 'public')
    .map((app) => withDocs(app, data.docs.filter((doc) => doc.published)));
}

export async function blobListAllApps(): Promise<AppWithDocs[]> {
  const data = await readBlobData();
  return data.apps.map((app) => withDocs(app, data.docs));
}

export async function blobGetApp(ownerSlug: string, appSlug: string): Promise<AppWithDocs | null> {
  const data = await readBlobData();
  const app = data.apps.find((item) => item.ownerSlug === ownerSlug && item.slug === appSlug);
  return app ? withDocs(app, data.docs) : null;
}

export async function blobGetPublicDoc(ownerSlug: string, appSlug: string, docSlug: string) {
  const app = await blobGetApp(ownerSlug, appSlug);
  if (!app || app.visibility !== 'public') return null;
  const doc = app.docs.find((item) => item.slug === docSlug && item.published);
  return doc ? { app, doc } : null;
}

function buildApp(input: { ownerSlug?: string; name: string; description?: string; repoUrl?: string }, now: string): AgentApp {
  return {
    id: `app_${crypto.randomUUID()}`,
    ownerSlug: input.ownerSlug ? slugify(input.ownerSlug) : 'demo',
    name: input.name,
    slug: uniqueSlug(slugify(input.name)),
    description: input.description ?? '',
    visibility: 'public',
    repoUrl: input.repoUrl,
    tags: [],
    createdAt: now,
    updatedAt: now
  };
}

function buildDoc(input: { appId: string; title: string; content: string; description?: string }, now: string): AgentDoc {
  return {
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
}

export async function blobCreateApp(input: { ownerSlug?: string; name: string; description?: string; repoUrl?: string }) {
  const data = await readBlobData();
  const now = new Date().toISOString();
  const app = buildApp(input, now);
  data.apps.unshift(app);
  await writeBlobData(data);
  return app;
}

export async function blobCreateDoc(input: { appId: string; title: string; content: string; description?: string }) {
  const data = await readBlobData();
  const now = new Date().toISOString();
  const doc = buildDoc(input, now);
  data.docs.unshift(doc);
  await writeBlobData(data);
  return doc;
}

export async function blobCreateAppWithDoc(input: {
  ownerSlug?: string;
  appName: string;
  description?: string;
  repoUrl?: string;
  docTitle: string;
  content: string;
}) {
  const data = await readBlobData();
  const now = new Date().toISOString();
  const app = buildApp({ ownerSlug: input.ownerSlug, name: input.appName, description: input.description, repoUrl: input.repoUrl }, now);
  const doc = buildDoc({ appId: app.id, title: input.docTitle, content: input.content, description: input.description }, now);
  data.apps.unshift(app);
  data.docs.unshift(doc);
  await writeBlobData(data);
  return { app, doc };
}

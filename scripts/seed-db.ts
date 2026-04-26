import 'dotenv/config';
import { getDb } from '../lib/db/client';
import { apps, docs } from '../lib/db/schema';
import { seedData } from '../lib/seed';

async function main() {
  const db = getDb();
  if (!db) throw new Error('DATABASE_URL is required to seed the database');
  await db.insert(apps).values(seedData.apps.map((app) => ({
    id: app.id,
    ownerSlug: app.ownerSlug,
    name: app.name,
    slug: app.slug,
    description: app.description,
    visibility: app.visibility,
    repoUrl: app.repoUrl,
    homepageUrl: app.homepageUrl,
    tags: app.tags,
    createdAt: new Date(app.createdAt),
    updatedAt: new Date(app.updatedAt)
  }))).onConflictDoNothing();
  await db.insert(docs).values(seedData.docs.map((doc) => ({
    id: doc.id,
    appId: doc.appId,
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    content: doc.content,
    published: doc.published,
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt)
  }))).onConflictDoNothing();
  console.log('Seeded AgentMD Hub database');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

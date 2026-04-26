import { NextResponse } from 'next/server';
import { listPublicApps } from '@/lib/store';

export async function GET() {
  const apps = await listPublicApps();
  const docs = apps.flatMap((app) => app.docs.map((doc) => ({
    ...doc,
    app: { name: app.name, slug: app.slug, ownerSlug: app.ownerSlug },
    rawUrl: `/md/${app.ownerSlug}/${app.slug}/${doc.slug}.md`,
    previewUrl: `/a/${app.ownerSlug}/${app.slug}/${doc.slug}`
  })));
  return NextResponse.json({ docs });
}

import { redirect } from 'next/navigation';
import { createApp, createDoc, isDemoReadonly } from '@/lib/store';

export async function POST(request: Request) {
  if (isDemoReadonly()) {
    redirect('/studio?readonly=1');
  }

  const form = await request.formData();
  const ownerSlug = String(form.get('ownerSlug') || 'demo');
  const appName = String(form.get('appName') || 'Untitled App');
  const description = String(form.get('description') || '');
  const docTitle = String(form.get('docTitle') || 'SKILL');
  const content = String(form.get('content') || '');

  const app = await createApp({ ownerSlug, name: appName, description });
  const doc = await createDoc({ appId: app.id, title: docTitle, content, description });

  redirect(`/a/${app.ownerSlug}/${app.slug}/${doc.slug}`);
}

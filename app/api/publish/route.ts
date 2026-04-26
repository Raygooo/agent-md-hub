import { redirect } from 'next/navigation';
import { isAdminAuthorized } from '@/lib/config';
import { createAppWithDoc, isDemoReadonly } from '@/lib/store';

export async function POST(request: Request) {
  if (isDemoReadonly()) {
    redirect('/studio?readonly=1');
  }

  const form = await request.formData();
  if (!isAdminAuthorized(form.get('adminToken'))) {
    redirect('/studio?unauthorized=1');
  }

  const ownerSlug = String(form.get('ownerSlug') || 'demo');
  const appName = String(form.get('appName') || 'Untitled App');
  const description = String(form.get('description') || '');
  const docTitle = String(form.get('docTitle') || 'SKILL');
  const content = String(form.get('content') || '');

  const { app, doc } = await createAppWithDoc({ ownerSlug, appName, description, docTitle, content });

  redirect(`/a/${app.ownerSlug}/${app.slug}/${doc.slug}`);
}

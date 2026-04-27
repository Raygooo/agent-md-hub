import { redirect } from 'next/navigation';
import { getWritableNamespaces, checkQuota, requireActiveUser } from '@/lib/auth/permissions';
import { isAdminAuthorized, isAuthWritesEnabled } from '@/lib/config';
import { createAppWithDoc, isDemoReadonly } from '@/lib/store';

export async function POST(request: Request) {
  if (isDemoReadonly()) {
    redirect('/studio?readonly=1');
  }

  const form = await request.formData();
  const appName = String(form.get('appName') || 'Untitled App');
  const description = String(form.get('description') || '');
  const docTitle = String(form.get('docTitle') || 'SKILL');
  const content = String(form.get('content') || '');

  if (isAuthWritesEnabled()) {
    const user = await requireActiveUser();
    const writableNamespaces = await getWritableNamespaces(user);
    const requestedNamespaceId = String(form.get('namespaceId') || '');
    const namespace = writableNamespaces.find((item) => item.id === requestedNamespaceId) ?? writableNamespaces[0];
    if (!namespace) redirect('/studio?access=no_namespace');

    const quota = await checkQuota(user, { namespaceId: namespace.id, docBytes: Buffer.byteLength(content, 'utf8') });
    if (!quota.ok) redirect(`/studio?quota=${quota.reason}`);

    const { app, doc } = await createAppWithDoc({
      ownerSlug: namespace.slug,
      namespaceId: namespace.id,
      actorUserId: user.id,
      appName,
      description,
      docTitle,
      content
    });

    redirect(`/a/${app.ownerSlug}/${app.slug}/${doc.slug}`);
  }

  if (!isAdminAuthorized(form.get('adminToken'))) {
    redirect('/studio?unauthorized=1');
  }

  const ownerSlug = String(form.get('ownerSlug') || 'demo');
  const { app, doc } = await createAppWithDoc({ ownerSlug, appName, description, docTitle, content });

  redirect(`/a/${app.ownerSlug}/${app.slug}/${doc.slug}`);
}

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { and, count, eq } from 'drizzle-orm';
import { authOptions } from '@/lib/auth/options';
import { getDb } from '@/lib/db/client';
import { apps, docs, namespaces, profiles, quotaOverrides } from '@/lib/db/schema';

export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  handle: string | null;
  role: string;
  status: string;
};

export type WritableNamespace = {
  id: string;
  slug: string;
  kind: string;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;
  if (!id) return null;

  const db = getDb();
  if (!db) {
    return {
      id,
      email: session.user?.email ?? null,
      name: session.user?.name ?? null,
      image: session.user?.image ?? null,
      handle: session.user?.handle ?? null,
      role: session.user?.role ?? 'user',
      status: session.user?.status ?? 'pending'
    };
  }

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
  return {
    id,
    email: session.user?.email ?? null,
    name: session.user?.name ?? null,
    image: session.user?.image ?? null,
    handle: profile?.handle ?? session.user?.handle ?? null,
    role: profile?.role ?? session.user?.role ?? 'user',
    status: profile?.status ?? session.user?.status ?? 'pending'
  };
}

export async function requireActiveUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/api/auth/signin?callbackUrl=/studio');
  if (user.status !== 'active') redirect('/studio?access=pending');
  return user;
}

export function isAdmin(user: AuthUser | null) {
  return user?.role === 'admin';
}

export async function getAuthStatus() {
  const user = await getCurrentUser();
  return {
    isSignedIn: Boolean(user),
    isActive: user?.status === 'active',
    isAdmin: isAdmin(user),
    user
  };
}

export async function getWritableNamespaces(user: AuthUser | null): Promise<WritableNamespace[]> {
  if (!user || user.status !== 'active') return [];
  const db = getDb();
  if (!db) return user.handle ? [{ id: user.id, slug: user.handle, kind: 'user' }] : [];

  const rows = await db.select().from(namespaces).where(eq(namespaces.userId, user.id));
  return rows.map((row) => ({ id: row.id, slug: row.slug, kind: row.kind }));
}

const starterQuota = {
  maxApps: 3,
  maxDocsPerApp: 10,
  maxTotalDocs: 30,
  maxDocBytes: 128 * 1024,
  maxWriteRequestsPerDay: 100
};

export async function checkQuota(user: AuthUser, input: { namespaceId?: string | null; appId?: string | null; docBytes?: number }) {
  const db = getDb();
  const requestedBytes = input.docBytes ?? 0;
  if (requestedBytes > starterQuota.maxDocBytes) {
    return { ok: false, reason: 'doc_too_large', limit: starterQuota.maxDocBytes } as const;
  }
  if (!db) return { ok: true, quota: starterQuota } as const;

  const [override] = await db.select().from(quotaOverrides).where(and(eq(quotaOverrides.subjectType, 'user'), eq(quotaOverrides.subjectId, user.id))).limit(1);
  const quota = {
    maxApps: override?.maxApps ?? starterQuota.maxApps,
    maxDocsPerApp: override?.maxDocsPerApp ?? starterQuota.maxDocsPerApp,
    maxTotalDocs: override?.maxTotalDocs ?? starterQuota.maxTotalDocs,
    maxDocBytes: override?.maxDocBytes ?? starterQuota.maxDocBytes,
    maxWriteRequestsPerDay: override?.maxWriteRequestsPerDay ?? starterQuota.maxWriteRequestsPerDay
  };

  if (requestedBytes > quota.maxDocBytes) {
    return { ok: false, reason: 'doc_too_large', limit: quota.maxDocBytes } as const;
  }

  const [appCount] = await db.select({ value: count() }).from(apps).where(eq(apps.createdByUserId, user.id));
  if (!input.appId && appCount.value >= quota.maxApps) {
    return { ok: false, reason: 'max_apps', limit: quota.maxApps } as const;
  }

  const [totalDocCount] = await db.select({ value: count() }).from(docs).where(eq(docs.createdByUserId, user.id));
  if (totalDocCount.value >= quota.maxTotalDocs) {
    return { ok: false, reason: 'max_total_docs', limit: quota.maxTotalDocs } as const;
  }

  if (input.appId) {
    const [appDocCount] = await db.select({ value: count() }).from(docs).where(eq(docs.appId, input.appId));
    if (appDocCount.value >= quota.maxDocsPerApp) {
      return { ok: false, reason: 'max_docs_per_app', limit: quota.maxDocsPerApp } as const;
    }
  }

  return { ok: true, quota } as const;
}

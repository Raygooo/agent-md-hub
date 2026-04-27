import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { eq, or } from 'drizzle-orm';
import type { NextAuthOptions, User } from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import GitHubProvider from 'next-auth/providers/github';
import { getDb } from '@/lib/db/client';
import { accounts, invitations, namespaces, profiles, sessions, users, verificationTokens } from '@/lib/db/schema';
import { slugify } from '@/lib/slug';

const db = getDb();

function getGitHubLogin(profile: unknown) {
  if (profile && typeof profile === 'object' && 'login' in profile) {
    const login = (profile as { login?: unknown }).login;
    return typeof login === 'string' ? login.toLowerCase() : null;
  }
  return null;
}

function getUserEmail(user: User) {
  return user.email?.toLowerCase() ?? null;
}

async function findInvitation(email: string | null, githubLogin: string | null) {
  if (!db || (!email && !githubLogin)) return null;
  const conditions = [
    email ? eq(invitations.email, email) : undefined,
    githubLogin ? eq(invitations.githubLogin, githubLogin) : undefined
  ].filter(Boolean) as Parameters<typeof or>;
  if (conditions.length === 0) return null;
  const now = new Date();
  const candidates = await db.select().from(invitations).where(or(...conditions)).limit(5);
  return candidates.find((invite) => {
    if (invite.revokedAt || invite.acceptedAt) return false;
    if (invite.expiresAt && invite.expiresAt < now) return false;
    return true;
  }) ?? null;
}

async function uniqueHandle(base: string, userId: string) {
  if (!db) return base;
  const existing = await db.select().from(profiles).where(eq(profiles.handle, base)).limit(1);
  if (!existing[0] || existing[0].id === userId) return base;
  return slugify(`${base}-${userId.slice(0, 8)}`);
}

async function syncProfile(user: User, rawProfile?: unknown) {
  if (!db || !user.id) return;
  const githubLogin = getGitHubLogin(rawProfile);
  const email = getUserEmail(user);
  const invite = await findInvitation(email, githubLogin);
  const status = invite ? 'active' : 'pending';
  const role = invite?.roleGrant ?? 'user';
  const baseHandle = slugify(githubLogin ?? user.name ?? email?.split('@')[0] ?? user.id);
  const handle = await uniqueHandle(baseHandle, user.id);
  const now = new Date();

  await db.insert(profiles).values({
    id: user.id,
    handle,
    githubLogin,
    displayName: user.name ?? handle,
    avatarUrl: user.image ?? null,
    role,
    status,
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now
  }).onConflictDoUpdate({
    target: profiles.id,
    set: {
      githubLogin,
      displayName: user.name ?? handle,
      avatarUrl: user.image ?? null,
      role,
      status,
      lastLoginAt: now,
      updatedAt: now
    }
  });

  if (status === 'active') {
    await db.insert(namespaces).values({
      slug: handle,
      kind: 'user',
      userId: user.id,
      createdAt: now
    }).onConflictDoNothing();

    if (invite) {
      await db.update(invitations).set({ acceptedByUserId: user.id, acceptedAt: now }).where(eq(invitations.id, invite.id));
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: db ? DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens
  }) as Adapter : undefined,
  session: { strategy: db ? 'database' : 'jwt' },
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID || process.env.GITHUB_ID || '',
      clientSecret: process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_SECRET || ''
    })
  ],
  callbacks: {
    async session({ session, user, token }) {
      const userId = user?.id ?? token?.sub;
      if (session.user && userId) {
        session.user.id = userId;
      }
      if (db && session.user?.id) {
        const [profile] = await db.select().from(profiles).where(eq(profiles.id, session.user.id)).limit(1);
        session.user.handle = profile?.handle;
        session.user.role = profile?.role;
        session.user.status = profile?.status;
      }
      return session;
    }
  },
  events: {
    async signIn({ user, profile }) {
      await syncProfile(user, profile);
    }
  }
};

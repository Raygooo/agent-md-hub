import { boolean, integer, jsonb, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { mode: 'date', withTimezone: true }),
  image: text('image')
});

export const accounts = pgTable('accounts', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state')
}, (table) => [
  primaryKey({ columns: [table.provider, table.providerAccountId] })
]);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull()
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull()
}, (table) => [
  primaryKey({ columns: [table.identifier, table.token] })
]);

export const profiles = pgTable('profiles', {
  id: text('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  handle: text('handle').notNull().unique(),
  githubLogin: text('github_login').unique(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  role: text('role').notNull().default('user'),
  status: text('status').notNull().default('pending'),
  planId: text('plan_id').notNull().default('starter'),
  defaultOrgId: text('default_org_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true })
});

export const invitations = pgTable('invitations', {
  id: text('id').primaryKey().$defaultFn(() => `inv_${crypto.randomUUID()}`),
  email: text('email'),
  githubLogin: text('github_login'),
  codeHash: text('code_hash'),
  roleGrant: text('role_grant').notNull().default('user'),
  quotaApps: integer('quota_apps'),
  quotaDocsPerApp: integer('quota_docs_per_app'),
  quotaTotalDocs: integer('quota_total_docs'),
  invitedByUserId: text('invited_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  acceptedByUserId: text('accepted_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('invitations_email_idx').on(table.email),
  uniqueIndex('invitations_github_login_idx').on(table.githubLogin)
]);

export const namespaces = pgTable('namespaces', {
  id: text('id').primaryKey().$defaultFn(() => `ns_${crypto.randomUUID()}`),
  slug: text('slug').notNull().unique(),
  kind: text('kind').notNull().default('user'),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  orgId: text('org_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const apps = pgTable('apps', {
  id: text('id').primaryKey(),
  ownerSlug: text('owner_slug').notNull(),
  namespaceId: text('namespace_id').references(() => namespaces.id, { onDelete: 'restrict' }),
  createdByUserId: text('created_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  updatedByUserId: text('updated_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description').notNull().default(''),
  visibility: text('visibility').notNull().default('public'),
  status: text('status').notNull().default('active'),
  repoUrl: text('repo_url'),
  homepageUrl: text('homepage_url'),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull()
}, (table) => [
  uniqueIndex('apps_owner_slug_slug_idx').on(table.ownerSlug, table.slug),
  uniqueIndex('apps_namespace_slug_idx').on(table.namespaceId, table.slug)
]);

export const docs = pgTable('docs', {
  id: text('id').primaryKey(),
  appId: text('app_id').notNull().references(() => apps.id, { onDelete: 'cascade' }),
  createdByUserId: text('created_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  updatedByUserId: text('updated_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  description: text('description').notNull().default(''),
  content: text('content').notNull(),
  contentHash: text('content_hash'),
  byteSize: integer('byte_size'),
  version: integer('version').notNull().default(1),
  visibility: text('visibility').notNull().default('public'),
  status: text('status').notNull().default('active'),
  published: boolean('published').notNull().default(true),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull()
}, (table) => [
  uniqueIndex('docs_app_id_slug_idx').on(table.appId, table.slug)
]);

export const plans = pgTable('plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  maxApps: integer('max_apps').notNull(),
  maxDocsPerApp: integer('max_docs_per_app').notNull(),
  maxTotalDocs: integer('max_total_docs').notNull(),
  maxDocBytes: integer('max_doc_bytes').notNull(),
  maxWriteRequestsPerDay: integer('max_write_requests_per_day').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const quotaOverrides = pgTable('quota_overrides', {
  id: text('id').primaryKey().$defaultFn(() => `quota_${crypto.randomUUID()}`),
  subjectType: text('subject_type').notNull(),
  subjectId: text('subject_id').notNull(),
  maxApps: integer('max_apps'),
  maxDocsPerApp: integer('max_docs_per_app'),
  maxTotalDocs: integer('max_total_docs'),
  maxDocBytes: integer('max_doc_bytes'),
  maxWriteRequestsPerDay: integer('max_write_requests_per_day'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  uniqueIndex('quota_overrides_subject_idx').on(table.subjectType, table.subjectId)
]);

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey().$defaultFn(() => `audit_${crypto.randomUUID()}`),
  actorUserId: text('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  targetType: text('target_type'),
  targetId: text('target_id'),
  ipHash: text('ip_hash'),
  userAgentHash: text('user_agent_hash'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

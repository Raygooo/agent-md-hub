import { boolean, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const apps = pgTable('apps', {
  id: text('id').primaryKey(),
  ownerSlug: text('owner_slug').notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description').notNull().default(''),
  visibility: text('visibility').notNull().default('public'),
  repoUrl: text('repo_url'),
  homepageUrl: text('homepage_url'),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull()
}, (table) => [
  uniqueIndex('apps_owner_slug_slug_idx').on(table.ownerSlug, table.slug)
]);

export const docs = pgTable('docs', {
  id: text('id').primaryKey(),
  appId: text('app_id').notNull().references(() => apps.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  description: text('description').notNull().default(''),
  content: text('content').notNull(),
  published: boolean('published').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull()
}, (table) => [
  uniqueIndex('docs_app_id_slug_idx').on(table.appId, table.slug)
]);

CREATE TABLE IF NOT EXISTS "apps" (
  "id" text PRIMARY KEY NOT NULL,
  "owner_slug" text NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "visibility" text DEFAULT 'public' NOT NULL,
  "repo_url" text,
  "homepage_url" text,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "docs" (
  "id" text PRIMARY KEY NOT NULL,
  "app_id" text NOT NULL,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "content" text NOT NULL,
  "published" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "docs_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "apps_owner_slug_slug_idx" ON "apps" USING btree ("owner_slug","slug");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "docs_app_id_slug_idx" ON "docs" USING btree ("app_id","slug");

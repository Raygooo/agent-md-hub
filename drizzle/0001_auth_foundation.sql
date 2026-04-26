CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text,
  "email" text,
  "email_verified" timestamp with time zone,
  "image" text,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
  "user_id" text NOT NULL,
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "provider_account_id" text NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text,
  CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id"),
  CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
  "session_token" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "expires" timestamp with time zone NOT NULL,
  CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" text NOT NULL,
  "token" text NOT NULL,
  "expires" timestamp with time zone NOT NULL,
  CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
  "id" text PRIMARY KEY NOT NULL,
  "handle" text NOT NULL,
  "github_login" text,
  "display_name" text,
  "avatar_url" text,
  "role" text DEFAULT 'user' NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "plan_id" text DEFAULT 'starter' NOT NULL,
  "default_org_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_login_at" timestamp with time zone,
  CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE cascade,
  CONSTRAINT "profiles_handle_unique" UNIQUE("handle"),
  CONSTRAINT "profiles_github_login_unique" UNIQUE("github_login")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invitations" (
  "id" text PRIMARY KEY NOT NULL,
  "email" text,
  "github_login" text,
  "code_hash" text,
  "role_grant" text DEFAULT 'user' NOT NULL,
  "quota_apps" integer,
  "quota_docs_per_app" integer,
  "quota_total_docs" integer,
  "invited_by_user_id" text,
  "accepted_by_user_id" text,
  "expires_at" timestamp with time zone,
  "accepted_at" timestamp with time zone,
  "revoked_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "invitations_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE set null,
  CONSTRAINT "invitations_accepted_by_user_id_users_id_fk" FOREIGN KEY ("accepted_by_user_id") REFERENCES "users"("id") ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "invitations_email_idx" ON "invitations" USING btree ("email");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "invitations_github_login_idx" ON "invitations" USING btree ("github_login");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "namespaces" (
  "id" text PRIMARY KEY NOT NULL,
  "slug" text NOT NULL,
  "kind" text DEFAULT 'user' NOT NULL,
  "user_id" text,
  "org_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "namespaces_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade,
  CONSTRAINT "namespaces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plans" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "max_apps" integer NOT NULL,
  "max_docs_per_app" integer NOT NULL,
  "max_total_docs" integer NOT NULL,
  "max_doc_bytes" integer NOT NULL,
  "max_write_requests_per_day" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quota_overrides" (
  "id" text PRIMARY KEY NOT NULL,
  "subject_type" text NOT NULL,
  "subject_id" text NOT NULL,
  "max_apps" integer,
  "max_docs_per_app" integer,
  "max_total_docs" integer,
  "max_doc_bytes" integer,
  "max_write_requests_per_day" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "quota_overrides_subject_idx" ON "quota_overrides" USING btree ("subject_type","subject_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" text PRIMARY KEY NOT NULL,
  "actor_user_id" text,
  "action" text NOT NULL,
  "target_type" text,
  "target_id" text,
  "ip_hash" text,
  "user_agent_hash" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE set null
);
--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN IF NOT EXISTS "namespace_id" text;
--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN IF NOT EXISTS "created_by_user_id" text;
--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN IF NOT EXISTS "updated_by_user_id" text;
--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active' NOT NULL;
--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "apps" ADD CONSTRAINT "apps_namespace_id_namespaces_id_fk" FOREIGN KEY ("namespace_id") REFERENCES "namespaces"("id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "apps" ADD CONSTRAINT "apps_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE set null;
--> statement-breakpoint
ALTER TABLE "apps" ADD CONSTRAINT "apps_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE set null;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "apps_namespace_slug_idx" ON "apps" USING btree ("namespace_id","slug");
--> statement-breakpoint
ALTER TABLE "docs" ADD COLUMN IF NOT EXISTS "created_by_user_id" text;
--> statement-breakpoint
ALTER TABLE "docs" ADD COLUMN IF NOT EXISTS "updated_by_user_id" text;
--> statement-breakpoint
ALTER TABLE "docs" ADD COLUMN IF NOT EXISTS "content_hash" text;
--> statement-breakpoint
ALTER TABLE "docs" ADD COLUMN IF NOT EXISTS "byte_size" integer;
--> statement-breakpoint
ALTER TABLE "docs" ADD COLUMN IF NOT EXISTS "version" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "docs" ADD COLUMN IF NOT EXISTS "visibility" text DEFAULT 'public' NOT NULL;
--> statement-breakpoint
ALTER TABLE "docs" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active' NOT NULL;
--> statement-breakpoint
ALTER TABLE "docs" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "docs" ADD CONSTRAINT "docs_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE set null;
--> statement-breakpoint
ALTER TABLE "docs" ADD CONSTRAINT "docs_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE set null;

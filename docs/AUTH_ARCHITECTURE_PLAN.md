# AgentMD Hub Auth / Account / Quota Architecture Plan

Date: 2026-04-26

## Current state observed

- Writes are gated only by `ADMIN_TOKEN` in `app/api/publish/route.ts`.
- Public reads use `listPublicApps()` / `getPublicDoc()` through `lib/store.ts`.
- Storage abstraction currently chooses Postgres first when `DATABASE_URL` exists, then Vercel Blob snapshots when `BLOB_READ_WRITE_TOKEN` exists, then local `.data/demo.json`.
- Vercel Blob mode writes whole JSON snapshots under `agent-md-hub/data/*.json`; it has no transactional uniqueness, ownership, quota enforcement, or audit trail.
- Existing Drizzle schema has only `apps` and `docs`, with unique indexes on `(owner_slug, slug)` and `(app_id, slug)`.

## Recommendation

Use **Auth.js + GitHub OAuth + Drizzle/Postgres** for the first production auth system.

Why:

- Lowest architectural mismatch: this repo already has Drizzle, Neon/Postgres wiring, and server-side route handlers.
- GitHub OAuth fits a developer/agent-instruction registry better than generic email-first signups.
- Auth.js avoids tying ownership/quota/business data to a third-party auth SaaS and keeps data portable.
- Registration can be restricted in app code with an invitation/allowlist table before creating/activating a local profile.

Options considered:

| Option | Pros | Cons | Fit |
| --- | --- | --- | --- |
| Auth.js + GitHub OAuth + Drizzle | OSS, local DB ownership, uses current stack, good for GitHub identity and future repo verification | More implementation work than Clerk; must build invite/admin UI | Best default |
| Clerk | Fastest UI/session setup, prebuilt components, organizations | Adds external user-management dependency; quota/ownership still belongs in Postgres; vendor/cost risk | Good if speed > control |
| Supabase Auth | Nice if moving all auth+DB to Supabase; SSR supported | Current stack already uses Neon/Drizzle; introducing Supabase only for auth splits control planes | Good only if replacing Neon with Supabase Postgres |
| Email magic link | Lower user friction | Needs email provider, more spam/abuse exposure, weaker registry identity than GitHub initially | Later secondary method |

## Source-of-truth decision

Postgres must become the production source of truth before real accounts/quotas go live.

Vercel Blob can remain as:

1. legacy snapshot import source,
2. optional backup/export target,
3. optional raw-content artifact storage later if docs become large.

It should not remain primary because snapshot writes cannot safely enforce quotas, app namespace ownership, per-user limits, unique slug races, invitations, roles, or audit logs.

## Proposed data model

Keep Auth.js core tables, using the Auth.js Drizzle adapter schema:

- `auth_users` or Auth.js `users`: `id`, `name`, `email`, `emailVerified`, `image`
- `accounts`: OAuth provider accounts
- `sessions` or JWT strategy; database sessions recommended for revocation/audit
- `verification_tokens` if email login is added

Application tables:

### profiles

- `id` primary key, FK to auth user id
- `handle` unique, slug-safe; default from GitHub login when available
- `display_name`, `avatar_url`
- `role`: `user | admin | suspended`
- `status`: `pending | active | suspended`
- `default_org_id` nullable
- `created_at`, `updated_at`, `last_login_at`

### invitations / allowlist

- `id`
- `email` nullable
- `github_login` nullable
- `code_hash` nullable for invite links
- `role_grant`: default `user`
- `quota_apps`, `quota_docs_per_app`, `quota_total_docs` nullable overrides
- `invited_by_user_id`
- `accepted_by_user_id` nullable
- `expires_at`, `accepted_at`, `revoked_at`
- unique active constraint on normalized `email` or `github_login`

### organizations (optional in first PR, recommended in schema if easy)

- `id`, `slug` unique, `name`, `created_by_user_id`, timestamps

### organization_memberships

- `org_id`, `user_id`
- `role`: `owner | admin | editor | viewer`
- unique `(org_id, user_id)`

### namespaces

A single table to reserve owner slugs globally.

- `id`
- `slug` unique
- `kind`: `user | org | reserved`
- `user_id` nullable
- `org_id` nullable
- `created_at`

Apps should reference a namespace, not accept arbitrary `ownerSlug` from the form.

### apps changes

- add `namespace_id` FK not null after migration
- keep `owner_slug` denormalized for route stability/read performance during migration
- add `created_by_user_id`, `updated_by_user_id`
- add `deleted_at` for soft delete / namespace protection
- add `status`: `active | hidden | blocked`
- keep unique `(owner_slug, slug)`; later also unique `(namespace_id, slug)` where `deleted_at is null`

### docs changes

- add `created_by_user_id`, `updated_by_user_id`
- add `version` integer default 1
- add `visibility`: inherit/public/private if private docs are planned; for now keep published boolean
- add `content_hash`, `byte_size`
- add `deleted_at`, `status`: `active | hidden | blocked`

### quotas

Use plan defaults plus overrides:

- `plans`: `id`, `name`, `max_apps`, `max_docs_per_app`, `max_total_docs`, `max_doc_bytes`, `max_write_requests_per_day`
- `profiles.plan_id` default `starter`
- `quota_overrides`: `subject_type`, `subject_id`, nullable override columns, timestamps

Initial defaults: invited users get 3 apps, 10 docs/app, 30 total docs, 128 KiB/doc. Admin can override.

### audit_logs

- `id`, `actor_user_id` nullable
- `action`: e.g. `auth.sign_in`, `app.create`, `doc.publish`, `admin.invite.create`, `quota.denied`
- `target_type`, `target_id`
- `ip_hash`, `user_agent_hash` or truncated UA, `metadata` JSONB
- `created_at`

Never store secrets/tokens in metadata.

## Product rules

- Public anonymous reads stay open for `/`, `/registry`, `/a/...`, `/md/...`, `/api/apps`, `/api/docs`.
- Publishing requires signed-in, active, invited/allowlisted user.
- Disable public self-registration at launch. Signup flow: sign in with GitHub -> if allowlisted/invited, create active profile; otherwise show waitlist/request-access message and do not allow writes.
- Users publish only under namespaces they own or orgs where they are `owner/admin/editor`.
- Form must no longer trust `ownerSlug`; user selects an owned namespace.
- App slug is immutable once created, except admin rename workflow with redirect/reservation later.
- Deleted/blocked apps do not release namespace/app slugs by default.
- Quotas enforced inside the same Postgres transaction as app/doc creation.
- Admins can invite users, suspend users, hide/block apps/docs, and override quotas.
- Abuse controls: auth-required writes, Zod validation, markdown byte limit, per-user/day write limits, IP/request rate limiting, reserved slugs, audit logs, admin takedown.

## Migration path

1. Add Postgres-only auth/account tables and migration. Production must set `DATABASE_URL` before enabling auth writes.
2. Write a one-time import script from latest Vercel Blob snapshot into Postgres:
   - upsert demo/legacy namespace(s), apps, docs
   - assign `created_by_user_id` to a configured admin user or `legacy_import` system marker
   - preserve existing owner/app/doc slugs and public URLs
3. Run import in staging/preview and compare `/api/apps`, `/api/docs`, and sample `/md/...` output.
4. Flip production to `DATABASE_URL` source. Keep Blob read-only fallback/backup for rollback.
5. Gate `/api/publish` with auth/session/quota. Keep `ADMIN_TOKEN` as temporary emergency bypass only for admins or remove after rollout.
6. After stable, add periodic DB-to-Blob export if snapshots are useful as disaster recovery.

## Implementation phases and acceptance criteria

### Phase 0 — harden current write path

- Add Zod validation and content byte limits to `/api/publish`.
- Ensure `ADMIN_TOKEN` is required for production writes while auth is incomplete.
- Acceptance: unauthenticated/invalid writes fail; public reads unchanged; typecheck passes.

### Phase 1 — database source of truth

- Confirm production Neon/Postgres configured.
- Add migration/import command for Blob snapshot -> Postgres.
- Acceptance: staging DB serves the same public apps/docs as Blob; stable raw URLs still work.

### Phase 2 — Auth.js GitHub login and profiles

- Add Auth.js, GitHub provider, Drizzle adapter, session helper, sign in/out UI.
- Add profiles, invitations/allowlist, roles.
- Add callback logic: active profile only when invite/allowlist matches.
- Acceptance: allowlisted GitHub account can sign in and see Studio; non-allowlisted account cannot publish; anonymous reads still work.

### Phase 3 — ownership and quotas

- Add namespaces and ownership checks.
- Change Studio to select owned namespace.
- Update `createAppWithDoc` API to take actor user and enforce quota transactionally.
- Acceptance: user cannot publish to another namespace; app/doc limits are enforced; audit log records allow/deny.

### Phase 4 — admin controls

- Admin invite management, quota override, suspend/hide/block controls.
- Acceptance: admin can invite a user, change quota, suspend writes, and hide abusive content without DB shell access.

### Phase 5 — cleanup and future API tokens

- Remove or strictly admin-scope `ADMIN_TOKEN`.
- Add API tokens for CLI/agent publishing if needed.
- Add version history/diffs and trust scanning.

## Security and operational concerns

- CSRF: prefer Server Actions or Auth.js-supported route handler patterns; verify POSTs and avoid blind form posts.
- Authorization: centralize `requireActiveUser()` and `assertCanWriteNamespace()`; do not check role ad hoc in pages only.
- Quota race conditions: enforce in a transaction and/or with DB constraints/counters, not with a pre-read only.
- Slug squatting: maintain reserved slugs (`admin`, `api`, `md`, `registry`, `studio`, `login`, `settings`, `ray`, etc.) and do not release deleted slugs automatically.
- Content abuse: byte limits, markdown-only rendering, no HTML rendering by default, abuse report/admin hide path.
- Secrets: never log OAuth secrets, invite tokens, session tokens, or `ADMIN_TOKEN`.
- Rollback: keep public read routes compatible and Blob snapshot backup until DB path is proven.
- Monitoring: audit write failures, quota denials, auth callback errors, DB migration/import counts.

## Recommended first implementation PR

Scope the first PR to foundation only, not full admin UI:

1. Add Auth.js with GitHub provider and Drizzle adapter.
2. Add migrations for Auth.js tables, `profiles`, `invitations`, `namespaces`, ownership columns on `apps/docs`, and `audit_logs`.
3. Add server helpers: `getCurrentUser()`, `requireActiveUser()`, `isAdmin()`, `getWritableNamespaces()`, `checkQuota()`.
4. Add sign-in/out UI and protect `/studio` display for writes.
5. Keep `/api/publish` behavior behind a feature flag: `AUTH_WRITES_ENABLED=false` by default, so no production behavior changes until migration/import is complete.
6. Add tests or script-level acceptance checks for allowlisted vs non-allowlisted auth decisions and quota calculations.

Non-goals for first PR: payment plans, public self-serve registration, org UI, API tokens, trust scanning, content versioning.

## References checked

- Auth.js Next.js installation and `AUTH_SECRET`: https://authjs.dev/getting-started/installation?framework=Next.js
- Auth.js Drizzle adapter: https://authjs.dev/getting-started/adapters/drizzle
- Auth.js GitHub provider callback/env shape: https://authjs.dev/getting-started/providers/github
- Clerk Next.js quickstart/middleware/components: https://clerk.com/docs/nextjs/getting-started/quickstart
- Supabase SSR auth notes: https://supabase.com/docs/guides/auth/server-side

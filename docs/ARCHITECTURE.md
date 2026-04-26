# AgentMD Hub Architecture

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vercel deploy target
- Drizzle ORM
- Neon/Postgres optional persistence

## Storage

The app uses a storage abstraction in `lib/store.ts`.

Modes:

- Local dev without `DATABASE_URL`: writes `.data/demo.json`
- Vercel without `DATABASE_URL`: read-only seed data
- Any environment with `DATABASE_URL`: Postgres via Drizzle + Neon HTTP client

The public route/UI contract stays the same across modes.

## Persistence files

- `lib/db/schema.ts` — Drizzle schema
- `lib/db/client.ts` — DB client factory
- `lib/db/store.ts` — Postgres-backed store functions
- `drizzle/0000_initial.sql` — initial migration
- `scripts/seed-db.ts` — seed sample apps/docs
- `drizzle.config.ts` — migration config

## Routes

- `/` landing
- `/registry` public registry
- `/studio` create/publish docs
- `/a/{owner}/{app}/{doc}` human preview
- `/md/{owner}/{app}/{doc}.md` raw agent-readable Markdown
- `/api/apps` public JSON apps
- `/api/docs` public JSON docs
- `/api/publish` form publish endpoint

## Data model

- App/project: owner, name, slug, description, visibility, repo/homepage, tags
- Doc: appId, title, slug, content, published flag

## Safety notes

- Rendered preview currently uses `<pre>` and does not render raw HTML.
- Raw Markdown is returned as `text/markdown`.
- Vercel demo mode disables writes unless persistent storage is configured.
- In production, set `ADMIN_TOKEN` to protect publishing until real auth exists.
- Trust scanning is not implemented yet; UI labels this clearly.

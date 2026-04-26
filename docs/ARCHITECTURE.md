# AgentMD Hub Architecture

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vercel deploy target

## Storage

The app uses a storage abstraction in `lib/store.ts`.

Current v0:

- Local dev: writes `.data/demo.json`
- Vercel without DB: read-only seed data

Future:

- Add `DbStore` backed by Vercel Postgres / Neon / Supabase
- Keep route/UI contracts unchanged

## Routes

- `/` landing
- `/registry` public registry
- `/studio` create/publish demo docs
- `/a/{owner}/{app}/{doc}` human preview
- `/md/{owner}/{app}/{doc}.md` raw agent-readable Markdown
- `/api/apps` public JSON apps
- `/api/docs` public JSON docs
- `/api/publish` form publish endpoint

## Data model

- App/project: owner, name, slug, description, visibility, metadata
- Doc: appId, title, slug, content, published flag

## Safety notes

- Rendered preview currently uses `<pre>` and does not render raw HTML.
- Raw Markdown is returned as `text/markdown`.
- Vercel demo mode disables writes unless persistent storage is configured.

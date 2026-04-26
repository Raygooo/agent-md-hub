# AgentMD Hub

A tiny registry for agent-readable Markdown: SKILL.md, install prompts, runbooks, and deployment instructions that agents can fetch directly.

## What works now

- Public registry and preview pages
- Raw Markdown endpoints at `/md/{owner}/{app}/{doc}.md`
- JSON APIs at `/api/apps` and `/api/docs`
- Studio publishing flow
- Local demo storage in `.data/demo.json`
- Vercel demo mode: read-only unless `DATABASE_URL` is configured
- Optional production write protection with `ADMIN_TOKEN`
- Optional persistent storage via Neon/Postgres + Drizzle

## Why not just GitHub raw?

GitHub raw is great for developers. AgentMD Hub adds agent-first affordances:

- stable canonical `.md` URLs designed for prompts
- app/doc metadata and discovery
- copy-ready agent instructions
- optional preview, validation, and publishing workflow
- future versioning, trust badges, analytics, and API tokens

## Development

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

## Persistent storage

Set `DATABASE_URL` to a Neon/Postgres connection string, then run:

```bash
pnpm db:migrate
pnpm db:seed
```

On Vercel, add environment variables:

```env
DATABASE_URL=postgres://...
ADMIN_TOKEN=choose-a-long-random-token
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

If `DATABASE_URL` is absent on Vercel, the app stays read-only and serves seed data.

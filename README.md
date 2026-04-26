# AgentMD Hub

A tiny registry for agent-readable Markdown: SKILL.md, install prompts, runbooks, and deployment instructions that agents can fetch directly.

MVP goals:
- Create an app/project
- Create and edit Markdown docs
- Publish docs as raw `.md` URLs
- Browse a public registry
- Run locally with demo file storage
- Deploy to Vercel with graceful demo mode, then upgrade to persistent storage

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

# AgentMD Hub Product Plan

## Positioning

AgentMD Hub is a trusted Markdown instruction registry for AI agents: discoverable by humans, readable by agents, safer and more structured than raw GitHub files.

## Why not just GitHub Raw?

GitHub raw files are good for developers but weak for agent distribution:

- no consistent metadata
- weak discovery/search
- no trust or permission summary
- no stable install/copy flow
- no agent-oriented API contract

AgentMD Hub adds registry metadata, trust badges, copy-ready instructions, `.md` endpoints, manifests, and eventually scanning/versioning.

## MVP

- Landing page with agent-first positioning
- Public registry
- Studio to create an app and Markdown doc
- Public preview page
- Raw Markdown endpoint at `/md/{owner}/{app}/{doc}.md`
- Demo/local file store
- Vercel-friendly read-only demo mode when no database exists

## Later

- GitHub OAuth
- Persistent Postgres/KV storage
- Version history and diffs
- Trust center and static permission scanning
- Collections/workflow packs
- Search and tags
- API tokens and analytics
- Custom domains

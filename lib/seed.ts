import type { StoreData } from './types';

const now = new Date().toISOString();

export const seedData: StoreData = {
  apps: [
    {
      id: 'app_openclaw_starter',
      ownerSlug: 'ray',
      name: 'OpenClaw Starter Pack',
      slug: 'openclaw-starter',
      description: 'Copy-ready instructions for agents that need to install, inspect, or run OpenClaw-adjacent tools.',
      visibility: 'public',
      repoUrl: 'https://github.com/openclaw/openclaw',
      homepageUrl: 'https://docs.openclaw.ai',
      tags: ['openclaw', 'skill', 'deployment'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'app_star_office',
      ownerSlug: 'community',
      name: 'Star Office UI Prompt',
      slug: 'star-office-ui',
      description: 'A sample agent-readable deployment prompt for a pixel office dashboard.',
      visibility: 'public',
      repoUrl: 'https://github.com/ringhyacinth/Star-Office-UI',
      tags: ['pixel-office', 'dashboard', 'agent-ui'],
      createdAt: now,
      updatedAt: now
    }
  ],
  docs: [
    {
      id: 'doc_openclaw_install',
      appId: 'app_openclaw_starter',
      title: 'Install Prompt',
      slug: 'install',
      description: 'A concise prompt an agent can follow to inspect and install safely.',
      published: true,
      createdAt: now,
      updatedAt: now,
      content: `---\ntitle: Install Prompt\nagent: openclaw\n---\n\n# Install OpenClaw-adjacent tool safely\n\nYou are helping a user install an OpenClaw-adjacent tool. Before running installation commands:\n\n1. Inspect the repository and README.\n2. Identify required credentials and network exposure.\n3. Prefer localhost-only first run.\n4. Do not publish tunnels or public URLs without user approval.\n5. Report the exact commands you ran and the rollback path.\n`
    },
    {
      id: 'doc_star_office_skill',
      appId: 'app_star_office',
      title: 'Deploy Star Office UI',
      slug: 'skill',
      description: 'Sample SKILL.md-style instructions for agents.',
      published: true,
      createdAt: now,
      updatedAt: now,
      content: `# Deploy Star Office UI\n\nIf the user asks for a pixel office dashboard:\n\n- Clone the repository.\n- Install Python dependencies in a virtual environment.\n- Run localhost-only first.\n- Do not enable Cloudflare Tunnel unless the user explicitly asks.\n- Return the local URL and a short safety summary.\n`
    }
  ]
};

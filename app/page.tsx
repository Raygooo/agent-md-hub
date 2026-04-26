import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { listPublicApps } from '@/lib/store';

export default async function HomePage() {
  const apps = await listPublicApps();
  const docsCount = apps.reduce((sum, app) => sum + app.docs.length, 0);

  return (
    <Shell>
      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
            Agent-first Markdown hosting · built for copy-pasteable instructions
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
            Give every agent a clean URL it can actually read.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Host SKILL.md files, install prompts, runbooks, and deployment recipes with stable raw Markdown URLs, registry metadata, and a tiny publishing workflow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/studio" className="rounded-full bg-white px-6 py-3 font-semibold text-slate-950">Create a doc</Link>
            <Link href="/registry" className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10">Explore registry</Link>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 text-sm text-slate-300">
            <Stat label="Public apps" value={apps.length} />
            <Stat label="Published docs" value={docsCount} />
            <Stat label="Agent URLs" value=".md" />
          </div>
        </div>

        <div className="glass rounded-[2rem] p-5">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5 font-mono text-sm text-slate-200">
            <div className="mb-4 flex gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-300" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <p className="text-cyan-200">curl https://agentmd.dev/ray/openclaw-starter/install.md</p>
            <pre className="mt-5 whitespace-pre-wrap text-slate-300">{`---\ntitle: Install Prompt\nagent: openclaw\n---\n\n# Install safely\n\n1. Inspect the repo.\n2. Prefer localhost-only.\n3. Report commands and rollback.\n`}</pre>
          </div>
        </div>
      </section>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
    </div>
  );
}

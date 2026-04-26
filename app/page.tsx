import Link from 'next/link';
import { Shell } from '@/components/Shell';

export const dynamic = 'force-dynamic';
import { DocActions } from '@/components/DocActions';
import { absoluteSiteUrl } from '@/lib/config';
import { isDemoReadonly, isPersistentStorageEnabled, listPublicApps } from '@/lib/store';

export default async function HomePage() {
  const apps = await listPublicApps();
  const docsCount = apps.reduce((sum, app) => sum + app.docs.length, 0);
  const samplePath = '/md/ray/openclaw-starter/install.md';
  const sampleUrl = absoluteSiteUrl(samplePath);
  const demoReadonly = isDemoReadonly();

  return (
    <Shell>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-8 sm:px-6 md:pb-20 md:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
            Agent-readable Markdown registry
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-7xl">
            Clean .md URLs for AI agents.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
            Publish SKILL.md files, install prompts, and runbooks as stable raw Markdown URLs with registry metadata, so agents can fetch and follow them directly.
          </p>
          <div className="mt-6 rounded-3xl border border-cyan-200/30 bg-cyan-950/40 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-100">Sample agent URL</div>
            <div className="mt-2 break-all font-mono text-sm text-white">{sampleUrl}</div>
            <div className="mt-4">
              <DocActions rawUrl={samplePath} previewUrl="/a/ray/openclaw-starter/install" compact />
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/studio" className="rounded-full bg-cyan-100 px-6 py-3 text-center font-semibold text-slate-950 shadow-sm hover:bg-white">
              {demoReadonly ? 'Try studio demo' : 'Create a doc'}
            </Link>
            <Link href="/registry" className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-center font-semibold text-white hover:bg-white/20">Explore registry</Link>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-1 gap-4 text-sm text-slate-200 sm:grid-cols-3">
            <Stat label="Public apps" value={apps.length} />
            <Stat label="Published docs" value={docsCount} />
            <Stat label="Storage" value={isPersistentStorageEnabled() ? 'DB' : 'Demo'} />
          </div>
        </div>

        <div className="glass rounded-[2rem] p-4 sm:p-5">
          <div className="rounded-[1.5rem] border border-white/15 bg-slate-950/85 p-4 font-mono text-xs text-slate-100 sm:p-5 sm:text-sm">
            <div className="mb-4 flex gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-300" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <p className="break-all text-cyan-200">curl {sampleUrl}</p>
            <pre className="mt-5 whitespace-pre-wrap text-slate-200">{`---\ntitle: Install Prompt\nagent: openclaw\n---\n\n# Install safely\n\n1. Inspect the repo.\n2. Prefer localhost-only.\n3. Report commands and rollback.\n`}</pre>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-6">
        <div className="glass grid gap-5 rounded-[2rem] p-6 md:grid-cols-3">
          <Info title="For humans" text="Browse apps, read metadata, inspect Markdown, and decide whether an instruction is worth using." />
          <Info title="For agents" text="Fetch raw text/markdown from stable URLs. No client JavaScript, no scraping, no guessing." />
          <Info title="For operators" text="Add persistence, admin gates, trust scans, versions, and collections as the registry grows." />
        </div>
      </section>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-slate-950/45 p-4">
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-300">{label}</div>
    </div>
  );
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-200">{text}</p>
    </div>
  );
}

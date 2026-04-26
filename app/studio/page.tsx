import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { isDemoReadonly, listAllApps } from '@/lib/store';

const starter = `---\ntitle: My Agent Instructions\nversion: 0.1.0\n---\n\n# What this is\n\nTell the agent what to do, what to avoid, and how to verify success.\n\n## Safety\n\n- Prefer localhost-first.\n- Ask before public writes.\n- Report exact commands and artifacts.\n`;

export default async function StudioPage() {
  const apps = await listAllApps();
  const readonly = isDemoReadonly();
  return (
    <Shell>
      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-20 pt-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-200">Studio</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Publish Markdown for agents.</h1>
          <p className="mt-4 text-slate-300">V0 uses demo storage. On Vercel without a database it is intentionally read-only; locally it writes to <code>.data/demo.json</code>.</p>
          {readonly && <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-amber-100">Demo mode on Vercel: publishing UI is visible, but writes are disabled until persistent storage is configured.</div>}
          <div className="mt-8 space-y-3">
            {apps.map((app) => (
              <div key={app.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold">{app.name}</div>
                <div className="mt-1 text-sm text-slate-400">{app.docs.length} docs · /{app.ownerSlug}/{app.slug}</div>
              </div>
            ))}
          </div>
        </div>
        <form action="/api/publish" method="post" className="glass rounded-[2rem] p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-300">Owner slug<input name="ownerSlug" defaultValue="demo" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" /></label>
            <label className="block text-sm text-slate-300">App name<input name="appName" defaultValue="My Agent App" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" /></label>
          </div>
          <label className="mt-4 block text-sm text-slate-300">Description<input name="description" defaultValue="Instructions designed for agents." className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" /></label>
          <label className="mt-4 block text-sm text-slate-300">Doc title<input name="docTitle" defaultValue="SKILL" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white" /></label>
          <label className="mt-4 block text-sm text-slate-300">Markdown<textarea name="content" defaultValue={starter} rows={15} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 font-mono text-sm text-white" /></label>
          <div className="mt-5 flex items-center justify-between gap-3">
            <Link href="/registry" className="text-sm text-slate-300 hover:text-white">View registry</Link>
            <button disabled={readonly} className="rounded-full bg-white px-6 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">Publish doc</button>
          </div>
        </form>
      </section>
    </Shell>
  );
}

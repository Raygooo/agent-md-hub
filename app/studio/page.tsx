import Link from 'next/link';
import { Shell } from '@/components/Shell';

export const dynamic = 'force-dynamic';
import { hasAdminToken } from '@/lib/config';
import { isDemoReadonly, isPersistentStorageEnabled, listAllApps } from '@/lib/store';

const starter = `---\ntitle: My Agent Instructions\nversion: 0.1.0\n---\n\n# What this is\n\nTell the agent what to do, what to avoid, and how to verify success.\n\n## Safety\n\n- Prefer localhost-first.\n- Ask before public writes.\n- Report exact commands and artifacts.\n`;

export default async function StudioPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const apps = await listAllApps();
  const readonly = isDemoReadonly();
  const protectedWrites = hasAdminToken();
  const unauthorized = params.unauthorized;
  return (
    <Shell>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-20 pt-8 sm:px-6 md:pt-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-200">Studio</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Publish Markdown for agents.</h1>
          <p className="mt-4 text-slate-200">
            Write Markdown, publish it, then share a stable raw <code>.md</code> URL. Storage mode: <strong>{isPersistentStorageEnabled() ? 'persistent database' : 'demo'}</strong>.
          </p>
          <ol className="mt-5 grid gap-3 text-sm text-slate-200 sm:grid-cols-3 lg:grid-cols-1">
            <Step n="1" text="Write SKILL.md, install prompt, or runbook." />
            <Step n="2" text="Publish with metadata and owner/app slugs." />
            <Step n="3" text="Give agents the raw text/markdown URL." />
          </ol>
          {readonly && <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-amber-100">Demo mode on Vercel: publishing is disabled until DATABASE_URL is configured.</div>}
          {unauthorized && <div className="mt-5 rounded-2xl border border-red-300/30 bg-red-300/10 p-4 text-red-100">Invalid admin token. Writes are protected in production.</div>}
          <div className="mt-8 space-y-3">
            {apps.map((app) => (
              <div key={app.id} className="rounded-2xl border border-white/15 bg-slate-950/45 p-4">
                <div className="font-semibold">{app.name}</div>
                <div className="mt-1 break-all text-sm text-slate-300">{app.docs.length} docs · /{app.ownerSlug}/{app.slug}</div>
              </div>
            ))}
          </div>
        </div>
        <form action="/api/publish" method="post" className="glass rounded-[2rem] p-5 sm:p-6">
          {protectedWrites && (
            <label className="mb-4 block text-sm text-slate-200">Admin token<input name="adminToken" type="password" placeholder="Required to publish" className="mt-2 w-full rounded-2xl border border-white/20 bg-slate-950/85 px-4 py-3 text-white shadow-inner shadow-black/20" /></label>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-200">Owner slug<input name="ownerSlug" defaultValue="demo" className="mt-2 w-full rounded-2xl border border-white/20 bg-slate-950/85 px-4 py-3 text-white shadow-inner shadow-black/20" /></label>
            <label className="block text-sm text-slate-200">App name<input name="appName" defaultValue="My Agent App" className="mt-2 w-full rounded-2xl border border-white/20 bg-slate-950/85 px-4 py-3 text-white shadow-inner shadow-black/20" /></label>
          </div>
          <label className="mt-4 block text-sm text-slate-200">Description<input name="description" defaultValue="Instructions designed for agents." className="mt-2 w-full rounded-2xl border border-white/20 bg-slate-950/85 px-4 py-3 text-white shadow-inner shadow-black/20" /></label>
          <label className="mt-4 block text-sm text-slate-200">Doc title<input name="docTitle" defaultValue="SKILL" className="mt-2 w-full rounded-2xl border border-white/20 bg-slate-950/85 px-4 py-3 text-white shadow-inner shadow-black/20" /></label>
          <label className="mt-4 block text-sm text-slate-200">Markdown<textarea name="content" defaultValue={starter} rows={15} className="mt-2 w-full rounded-2xl border border-white/20 bg-slate-950/90 px-4 py-3 font-mono text-sm text-white shadow-inner shadow-black/20" /></label>
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/registry" className="text-center text-sm font-medium text-slate-100 hover:text-white hover:underline">View registry</Link>
            <button disabled={readonly} className="rounded-full bg-cyan-100 px-6 py-3 font-semibold text-slate-950 shadow-sm hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-700">{readonly ? 'Publishing disabled' : 'Publish doc'}</button>
          </div>
        </form>
      </section>
    </Shell>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <li className="flex gap-3 rounded-2xl border border-white/15 bg-slate-950/45 p-4">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cyan-100 text-sm font-semibold text-slate-950">{n}</span>
      <span>{text}</span>
    </li>
  );
}

import Link from 'next/link';
import { Shell } from '@/components/Shell';

export const dynamic = 'force-dynamic';
import { DocActions } from '@/components/DocActions';
import { absoluteSiteUrl } from '@/lib/config';
import { listPublicApps } from '@/lib/store';

export default async function RegistryPage() {
  const apps = await listPublicApps();
  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-6 md:pt-10">
        <div className="mb-6 flex flex-col justify-between gap-4 md:mb-8 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Registry</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Public agent instructions</h1>
            <p className="mt-4 max-w-2xl text-slate-200">Discover published apps and Markdown docs that can be handed directly to an agent.</p>
          </div>
          <Link href="/studio" className="rounded-full bg-cyan-100 px-5 py-3 text-center font-semibold text-slate-950 shadow-sm hover:bg-white">Publish yours</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {apps.map((app) => (
            <article key={app.id} className="glass rounded-3xl p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">{app.name}</h2>
                  <p className="mt-2 text-slate-200">{app.description}</p>
                </div>
                <span className="w-fit rounded-full bg-emerald-300/15 px-3 py-1 text-xs text-emerald-200">public</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {app.tags.map((tag) => <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">#{tag}</span>)}
              </div>
              <div className="mt-6 space-y-3">
                {app.docs.map((doc) => {
                  const rawUrl = `/md/${app.ownerSlug}/${app.slug}/${doc.slug}.md`;
                  const previewUrl = `/a/${app.ownerSlug}/${app.slug}/${doc.slug}`;
                  return (
                    <div key={doc.id} className="rounded-2xl border border-white/15 bg-slate-950/55 p-4">
                      <Link href={previewUrl} className="block text-white hover:text-cyan-100">
                        <div className="font-medium">{doc.title}</div>
                        <div className="mt-1 break-all font-mono text-xs text-slate-300">{absoluteSiteUrl(rawUrl)}</div>
                      </Link>
                      <div className="mt-3">
                        <DocActions rawUrl={rawUrl} previewUrl={previewUrl} compact />
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>
    </Shell>
  );
}

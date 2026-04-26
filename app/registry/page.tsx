import Link from 'next/link';
import { Shell } from '@/components/Shell';
import { listPublicApps } from '@/lib/store';

export default async function RegistryPage() {
  const apps = await listPublicApps();
  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-10">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Registry</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Public agent instructions</h1>
            <p className="mt-4 max-w-2xl text-slate-300">Discover published apps and Markdown docs that can be handed directly to an agent.</p>
          </div>
          <Link href="/studio" className="rounded-full bg-white px-5 py-3 font-medium text-slate-950">Publish yours</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {apps.map((app) => (
            <article key={app.id} className="glass rounded-3xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">{app.name}</h2>
                  <p className="mt-2 text-slate-300">{app.description}</p>
                </div>
                <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs text-emerald-200">public</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {app.tags.map((tag) => <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">#{tag}</span>)}
              </div>
              <div className="mt-6 space-y-2">
                {app.docs.map((doc) => (
                  <Link key={doc.id} href={`/a/${app.ownerSlug}/${app.slug}/${doc.slug}`} className="block rounded-2xl border border-white/10 bg-slate-950/30 p-4 hover:bg-white/10">
                    <div className="font-medium">{doc.title}</div>
                    <div className="mt-1 text-sm text-slate-400">/{app.ownerSlug}/{app.slug}/{doc.slug}.md</div>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </Shell>
  );
}

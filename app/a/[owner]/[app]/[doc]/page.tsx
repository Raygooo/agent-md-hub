import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Shell } from '@/components/Shell';
import { DocActions } from '@/components/DocActions';
import { absoluteSiteUrl } from '@/lib/config';
import { getPublicDoc } from '@/lib/store';
import { stripMdSuffix } from '@/lib/slug';

type Params = { owner: string; app: string; doc: string };

export default async function DocPreviewPage({ params }: { params: Promise<Params> }) {
  const { owner, app, doc } = await params;
  const result = await getPublicDoc(owner, app, stripMdSuffix(doc));
  if (!result) notFound();
  const rawUrl = `/md/${owner}/${app}/${result.doc.slug}.md`;
  const previewUrl = `/a/${owner}/${app}/${result.doc.slug}`;
  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-6 md:pt-10">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Agent doc preview</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{result.doc.title}</h1>
            <p className="mt-3 break-all font-mono text-sm text-slate-300">{absoluteSiteUrl(rawUrl)}</p>
          </div>
          <DocActions rawUrl={rawUrl} previewUrl={previewUrl} />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <article className="glass rounded-[2rem] p-4 sm:p-6">
            <pre className="prose-md overflow-x-auto rounded-3xl bg-slate-950/70 p-4 font-mono text-sm sm:p-6">{result.doc.content}</pre>
          </article>
          <aside className="glass h-fit rounded-[2rem] p-5">
            <h2 className="text-lg font-semibold">Registry metadata</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <Meta label="App" value={result.app.name} />
              <Meta label="Owner" value={result.app.ownerSlug} />
              <Meta label="Doc slug" value={`${result.doc.slug}.md`} />
              <Meta label="Content-Type" value="text/markdown" />
              <Meta label="Updated" value={new Date(result.doc.updatedAt).toLocaleString()} />
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              {result.app.tags.map((tag) => <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">#{tag}</span>)}
            </div>
            <div className="mt-5 space-y-2 text-sm">
              {result.app.repoUrl && <Link className="block text-cyan-100 hover:underline" href={result.app.repoUrl}>Repository</Link>}
              {result.app.homepageUrl && <Link className="block text-cyan-100 hover:underline" href={result.app.homepageUrl}>Homepage</Link>}
              <Link className="block text-cyan-100 hover:underline" href="/api/docs">Registry JSON API</Link>
            </div>
            <div className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
              Trust scanning is not enabled yet. Inspect instructions before letting an agent execute shell commands or public writes.
            </div>
          </aside>
        </div>
      </section>
    </Shell>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</dt>
      <dd className="mt-1 break-all text-slate-200">{value}</dd>
    </div>
  );
}

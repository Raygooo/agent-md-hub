import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Shell } from '@/components/Shell';
import { getPublicDoc } from '@/lib/store';
import { stripMdSuffix } from '@/lib/slug';

type Params = { owner: string; app: string; doc: string };

export default async function DocPreviewPage({ params }: { params: Promise<Params> }) {
  const { owner, app, doc } = await params;
  const result = await getPublicDoc(owner, app, stripMdSuffix(doc));
  if (!result) notFound();
  const rawUrl = `/md/${owner}/${app}/${result.doc.slug}.md`;
  return (
    <Shell>
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Agent doc preview</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{result.doc.title}</h1>
            <p className="mt-3 text-slate-300">{result.app.name} · /{owner}/{app}/{result.doc.slug}.md</p>
          </div>
          <div className="flex gap-3">
            <Link href={rawUrl} className="rounded-full bg-white px-5 py-3 font-semibold text-slate-950">Raw .md</Link>
            <Link href="/registry" className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white">Registry</Link>
          </div>
        </div>
        <article className="glass rounded-[2rem] p-6">
          <pre className="prose-md overflow-x-auto rounded-3xl bg-slate-950/70 p-6 font-mono text-sm">{result.doc.content}</pre>
        </article>
      </section>
    </Shell>
  );
}

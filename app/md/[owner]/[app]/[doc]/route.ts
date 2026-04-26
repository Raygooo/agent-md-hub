import { notFound } from 'next/navigation';
import { getPublicDoc } from '@/lib/store';
import { stripMdSuffix } from '@/lib/slug';

type Params = { owner: string; app: string; doc: string };

export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  const { owner, app, doc } = await params;
  const result = await getPublicDoc(owner, app, stripMdSuffix(doc));
  if (!result) notFound();
  return new Response(result.doc.content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600'
    }
  });
}

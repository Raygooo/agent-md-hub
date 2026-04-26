import Link from 'next/link';
import type { ReactNode } from 'react';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen grid-bg">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-xl text-slate-950">✦</span>
          <span>AgentMD Hub</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm text-slate-300">
          <Link className="rounded-full px-4 py-2 hover:bg-white/10" href="/registry">Registry</Link>
          <Link className="rounded-full bg-white px-4 py-2 font-medium text-slate-950" href="/studio">Studio</Link>
        </nav>
      </header>
      {children}
    </main>
  );
}

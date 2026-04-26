import Link from 'next/link';
import type { ReactNode } from 'react';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen grid-bg">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6 sm:py-6">
        <Link href="/" className="flex min-h-11 items-center gap-3 font-semibold tracking-tight">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-xl text-slate-950">✦</span>
          <span className="text-sm sm:text-base">AgentMD Hub</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm text-slate-300">
          <Link className="min-h-11 rounded-full px-4 py-3 hover:bg-white/10" href="/registry">Registry</Link>
          <Link className="min-h-11 rounded-full bg-white px-4 py-3 font-medium text-slate-950 hover:bg-cyan-100" href="/studio">Studio</Link>
        </nav>
      </header>
      {children}
    </main>
  );
}

import Link from 'next/link';
import type { ReactNode } from 'react';
import { AuthNav } from '@/components/AuthNav';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen grid-bg">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6 sm:py-6">
        <Link href="/" className="flex min-h-11 items-center gap-3 font-semibold tracking-tight text-white">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cyan-100 text-xl text-slate-950 shadow-lg shadow-cyan-950/30">✦</span>
          <span className="text-sm sm:text-base">AgentMD Hub</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium text-slate-100">
          <Link className="min-h-11 rounded-full px-4 py-3 hover:bg-white/15" href="/registry">Registry</Link>
          <Link className="min-h-11 rounded-full bg-cyan-100 px-4 py-3 font-semibold text-slate-950 shadow-sm hover:bg-white" href="/studio">Studio</Link>
          <AuthNav />
        </nav>
      </header>
      {children}
    </main>
  );
}

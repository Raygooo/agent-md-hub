import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/permissions';

export async function AuthNav() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link className="min-h-11 rounded-full border border-white/25 px-4 py-3 hover:bg-white/15" href="/api/auth/signin">
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-40 truncate rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs text-slate-100 sm:inline">
        {user.handle ?? user.email ?? user.name ?? 'Signed in'}{user.status !== 'active' ? ' · pending' : ''}
      </span>
      <Link className="min-h-11 rounded-full border border-white/25 px-4 py-3 hover:bg-white/15" href="/api/auth/signout">
        Sign out
      </Link>
    </div>
  );
}

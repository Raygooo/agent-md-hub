'use client';

import { useState } from 'react';
import Link from 'next/link';

type Props = {
  rawUrl: string;
  previewUrl: string;
  compact?: boolean;
};

function absoluteUrl(path: string) {
  if (path.startsWith('http')) return path;
  if (typeof window !== 'undefined') return `${window.location.origin}${path}`;
  return path;
}

export function DocActions({ rawUrl, previewUrl, compact }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const fullRawUrl = absoluteUrl(rawUrl);
  const prompt = `Fetch and follow this agent-readable Markdown instruction: ${fullRawUrl}`;

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      window.prompt('Copy this text', text);
    }
  }

  const buttonClass = compact
    ? 'rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10'
    : 'rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={rawUrl} className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-100">
        Raw .md
      </Link>
      <Link href={previewUrl} className={buttonClass}>
        Preview
      </Link>
      <button type="button" onClick={() => copy(fullRawUrl, 'url')} className={buttonClass}>
        {copied === 'url' ? 'Copied URL' : 'Copy URL'}
      </button>
      <button type="button" onClick={() => copy(prompt, 'prompt')} className={buttonClass}>
        {copied === 'prompt' ? 'Copied prompt' : 'Copy prompt'}
      </button>
    </div>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgentMD Hub',
  description: 'Host agent-readable Markdown instructions, SKILL.md files, and deployment prompts.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

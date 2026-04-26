import { NextResponse } from 'next/server';
import { listPublicApps } from '@/lib/store';

export async function GET() {
  const apps = await listPublicApps();
  return NextResponse.json({ apps });
}

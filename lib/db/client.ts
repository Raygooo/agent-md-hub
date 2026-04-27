import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const globalForDb = globalThis as typeof globalThis & { agentMdPgPool?: Pool };

function isNeonHttpUrl(databaseUrl: string) {
  try {
    const url = new URL(databaseUrl);
    return url.hostname.endsWith('.neon.tech') || url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;

  if (isNeonHttpUrl(databaseUrl)) {
    const sql = neon(databaseUrl);
    return drizzleNeon(sql, { schema });
  }

  const pool = globalForDb.agentMdPgPool ?? new Pool({ connectionString: databaseUrl });
  if (process.env.NODE_ENV !== 'production') {
    globalForDb.agentMdPgPool = pool;
  }
  return drizzleNode(pool, { schema });
}

export type Db = NonNullable<ReturnType<typeof getDb>>;

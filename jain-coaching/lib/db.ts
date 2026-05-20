import { Pool } from "pg";
import { readEnv } from "@/lib/env";

let pool: Pool | null = null;

function readDatabaseUrl(): string {
  return (
    readEnv("DATABASE_URL") ||
    readEnv("SUPABASE_DATABASE_URL") ||
    readEnv("POSTGRES_URL") ||
    readEnv("DB_URL") ||
    ""
  );
}

export function getPool(): Pool {
  if (pool) return pool;
  const conn = readDatabaseUrl();
  if (!conn) {
    throw new Error("DATABASE_URL is not set");
  }
  const isLocal = /localhost|127\.0\.0\.1/i.test(conn);
  const relaxedSsl =
    readEnv("PG_SSL_REJECT_UNAUTHORIZED") === "0" ||
    readEnv("DATABASE_SSL_REJECT_UNAUTHORIZED") === "0";
  pool = new Pool({
    connectionString: conn,
    max: 10,
    ssl: isLocal ? false : relaxedSsl ? { rejectUnauthorized: false } : true,
  });
  return pool;
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<{ rows: T[]; rowCount: number }> {
  const result = await getPool().query(text, params);
  return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
}

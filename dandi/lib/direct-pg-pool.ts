import { Pool } from "pg";
import { readDirectDatabaseUrl } from "@/lib/db-url";
import { readEnv } from "@/lib/supabase/env";

let pool: Pool | null = null;

function connectionStringSuggestsRelaxedSsl(conn: string): boolean {
  return (
    /(?:[?&])sslmode=no-verify(?:&|$)/i.test(conn) ||
    /(?:[?&])sslmode=disable(?:&|$)/i.test(conn)
  );
}

function shouldUseRelaxedTls(conn: string): boolean {
  if (connectionStringSuggestsRelaxedSsl(conn)) return true;
  const v = (name: string) => {
    const x = readEnv(name);
    return x === "0" || x === "false" || x === "no";
  };
  return (
    v("PG_SSL_REJECT_UNAUTHORIZED") ||
    v("DATABASE_SSL_REJECT_UNAUTHORIZED") ||
    v("SUPABASE_DB_SSL_REJECT_UNAUTHORIZED")
  );
}

/** Shared pool for direct Postgres (`DATABASE_URL` and aliases). */
export function getDirectPgPool(): Pool {
  if (pool) return pool;
  const conn = readDirectDatabaseUrl();
  if (!conn) {
    throw new Error(
      "DATABASE_URL (or DB_URL / POSTGRES_URL / SUPABASE_DATABASE_URL) is not set.",
    );
  }
  const relaxed = shouldUseRelaxedTls(conn);
  const isLocal = /localhost|127\.0\.0\.1/i.test(conn) && !conn.includes("supabase.co");
  pool = new Pool({
    connectionString: conn,
    max: 10,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 20_000,
    ssl: isLocal ? false : relaxed ? { rejectUnauthorized: false } : true,
  });
  return pool;
}

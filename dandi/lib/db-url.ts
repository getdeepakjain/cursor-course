import { readEnv } from "@/lib/supabase/env";

/** Direct Postgres URI (Supabase: Project Settings → Database → Connection string / URI). */
export function readDirectDatabaseUrl(): string | undefined {
  return (
    readEnv("DATABASE_URL") ||
    readEnv("SUPABASE_DATABASE_URL") ||
    readEnv("POSTGRES_URL") ||
    readEnv("DB_URL")
  );
}

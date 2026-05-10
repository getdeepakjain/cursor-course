import { readDirectDatabaseUrl } from "@/lib/db-url";
import { getDirectPgPool } from "@/lib/direct-pg-pool";
import { throwFromPostgrestError } from "@/lib/supabase-postgrest-error";
import { ensureDandiEnvLoaded, readEnv } from "@/lib/supabase/env";
import { getServiceSupabase } from "@/lib/supabase/service";

function resolveSupabaseUrl(): string | undefined {
  ensureDandiEnvLoaded();
  return readEnv("NEXT_PUBLIC_SUPABASE_URL") || readEnv("SUPABASE_URL");
}

function resolveSupabaseServiceKey(): string | undefined {
  ensureDandiEnvLoaded();
  return (
    readEnv("SUPABASE_SERVICE_ROLE_KEY") ||
    readEnv("SUPABASE_SECRET_KEY") ||
    readEnv("SUPABASE_KEY")
  );
}

type SyncPath = "postgres" | "supabase_http" | "none";

function appUserSyncPath(): SyncPath {
  if (readDirectDatabaseUrl()?.trim()) return "postgres";
  const url = resolveSupabaseUrl()?.trim();
  const key = resolveSupabaseServiceKey()?.trim();
  if (url && key) return "supabase_http";
  return "none";
}

function syncPathGapMessage(path: SyncPath): string {
  if (path === "postgres") return "";
  if (path === "supabase_http") return "";
  return (
    "Set DATABASE_URL (recommended — same as API keys direct Postgres) in dandi/.env.local, " +
    "or set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY for HTTP upsert. " +
    "Then restart the dev server."
  );
}

async function upsertGoogleAppUserPostgres(input: {
  googleSub: string;
  email?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
}): Promise<void> {
  const lastLoginAt = new Date().toISOString();
  await getDirectPgPool().query(
    `insert into public.app_users (google_sub, email, full_name, avatar_url, last_login_at)
     values ($1, $2, $3, $4, $5::timestamptz)
     on conflict (google_sub) do update set
       email = excluded.email,
       full_name = excluded.full_name,
       avatar_url = excluded.avatar_url,
       last_login_at = excluded.last_login_at`,
    [
      input.googleSub,
      input.email?.trim() || null,
      input.fullName?.trim() || null,
      input.avatarUrl?.trim() || null,
      lastLoginAt,
    ],
  );
}

async function upsertGoogleAppUserSupabaseHttp(input: {
  googleSub: string;
  email?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
}): Promise<void> {
  const supabase = getServiceSupabase();
  const lastLoginAt = new Date().toISOString();
  const { error } = await supabase.from("app_users").upsert(
    {
      google_sub: input.googleSub,
      email: input.email?.trim() || null,
      full_name: input.fullName?.trim() || null,
      avatar_url: input.avatarUrl?.trim() || null,
      last_login_at: lastLoginAt,
    },
    { onConflict: "google_sub" },
  );
  if (error) throwFromPostgrestError(error);
}

/**
 * Upserts a row in `public.app_users` keyed by Google `sub`.
 * Prefers **DATABASE_URL** (Postgres) when set; otherwise uses Supabase HTTP + service role.
 * Does not throw on failure so OAuth sign-in can still complete.
 */
export async function upsertGoogleAppUserIfConfigured(input: {
  googleSub: string;
  email?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
}): Promise<void> {
  const path = appUserSyncPath();
  if (path === "none") {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[dandi] Skipping app_users upsert — ${syncPathGapMessage(path)}`);
    }
    return;
  }

  const googleSub = input.googleSub.trim();
  if (!googleSub) return;

  try {
    if (path === "postgres") {
      await upsertGoogleAppUserPostgres(input);
    } else {
      await upsertGoogleAppUserSupabaseHttp(input);
    }
  } catch (e) {
    console.error("[dandi] upsertGoogleAppUserIfConfigured failed:", e);
  }
}

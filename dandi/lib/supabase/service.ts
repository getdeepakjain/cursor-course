import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readEnv } from "@/lib/supabase/env";
import { fetchPreferIpv4 } from "@/lib/supabase/fetch-ipv4";

let client: SupabaseClient | null = null;

/**
 * Server-only Supabase client (service role). Bypasses RLS — use only in Route
 * Handlers / Server Actions, never in client components.
 */
function resolveProjectUrl(): string | undefined {
  return (
    readEnv("NEXT_PUBLIC_SUPABASE_URL") ||
    readEnv("SUPABASE_URL") ||
    undefined
  );
}

/** Legacy JWT `service_role`, or new platform secret `sb_secret_...`. */
function resolveServiceKey(): string | undefined {
  return (
    readEnv("SUPABASE_SERVICE_ROLE_KEY") ||
    readEnv("SUPABASE_SECRET_KEY") ||
    readEnv("SUPABASE_KEY") ||
    undefined
  );
}

export function getServiceSupabase(): SupabaseClient {
  if (client) return client;
  const url = resolveProjectUrl();
  const key = resolveServiceKey();
  if (!url || !key) {
    const missing: string[] = [];
    if (!url) {
      missing.push("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
    }
    if (!key) {
      missing.push(
        "SUPABASE_SECRET_KEY (sb_secret_…) or SUPABASE_SERVICE_ROLE_KEY (legacy JWT), or SUPABASE_KEY",
      );
    }
    throw new Error(
      `Missing Supabase env: ${missing.join(" and ")}. Add them to dandi/.env.local (same folder as package.json), save, then restart npm run dev. Do not use the publishable (sb_publishable_) key here — use a secret / service_role key only on the server.`,
    );
  }
  try {
    const parsed = new URL(url);
    const localHost =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "::1";
    if (parsed.protocol !== "https:" && !localHost) {
      throw new Error(
        "Supabase project URL must use https:// (http is allowed only for localhost / 127.0.0.1, e.g. local CLI)",
      );
    }
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error(
        `Invalid Supabase project URL (could not parse): ${url.slice(0, 64)}`,
      );
    }
    throw e;
  }
  const useIpv4UndiciFetch =
    readEnv("SUPABASE_SKIP_IPV4_FETCH") !== "1" &&
    readEnv("SUPABASE_SKIP_IPV4_FETCH") !== "true" &&
    readEnv("SUPABASE_USE_NATIVE_FETCH") !== "1" &&
    readEnv("SUPABASE_USE_NATIVE_FETCH") !== "true";

  client = createClient(url, key, {
    ...(useIpv4UndiciFetch
      ? {
          global: {
            fetch: fetchPreferIpv4 as unknown as typeof fetch,
          },
        }
      : {}),
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return client;
}

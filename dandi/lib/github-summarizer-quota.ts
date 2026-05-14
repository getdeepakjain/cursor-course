import { readDirectDatabaseUrl } from "@/lib/db-url";
import { getDirectPgPool } from "@/lib/direct-pg-pool";
import { throwFromPostgrestError } from "@/lib/supabase-postgrest-error";
import { getServiceSupabase } from "@/lib/supabase/service";

export type GithubSummarizerQuotaClaim =
  | { status: "ok"; usage: number }
  | { status: "invalid_secret" }
  | { status: "rate_limited" };

const DEFAULT_LIMIT = 1000;

/** Max summarizer invocations per OAuth user (or per key if the key has no user_id). Override with `GITHUB_SUMMARIZER_USAGE_LIMIT`. */
export function readGithubSummarizerUsageLimit(): number {
  const raw = process.env.GITHUB_SUMMARIZER_USAGE_LIMIT;
  if (raw === undefined || raw.trim() === "") return DEFAULT_LIMIT;
  const n = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(n)) return DEFAULT_LIMIT;
  return Math.max(0, Math.floor(n));
}

function parseClaimJson(raw: unknown): GithubSummarizerQuotaClaim {
  let v: unknown = raw;
  if (typeof raw === "string") {
    try {
      v = JSON.parse(raw) as unknown;
    } catch {
      return { status: "invalid_secret" };
    }
  }
  if (!v || typeof v !== "object") return { status: "invalid_secret" };
  const o = v as Record<string, unknown>;
  if (o.ok === true && typeof o.usage === "number" && Number.isFinite(o.usage)) {
    return { status: "ok", usage: o.usage };
  }
  if (o.error === "rate_limited") return { status: "rate_limited" };
  return { status: "invalid_secret" };
}

async function claimViaPostgres(secret: string, limit: number): Promise<GithubSummarizerQuotaClaim> {
  const r = await getDirectPgPool().query<{ result: unknown }>(
    `select public.claim_github_summarizer_quota($1::text, $2::int) as result`,
    [secret, limit],
  );
  const row = r.rows[0]?.result;
  return parseClaimJson(row);
}

async function claimViaSupabaseRpc(secret: string, limit: number): Promise<GithubSummarizerQuotaClaim> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.rpc("claim_github_summarizer_quota", {
    p_secret: secret,
    p_limit: limit,
  });
  if (error) throwFromPostgrestError(error);
  return parseClaimJson(data);
}

/**
 * Reserves one summarizer invocation for the API key secret when under the configured limit.
 * Call only for requests that will run the summarizer.
 */
export async function claimGithubSummarizerQuota(secret: string): Promise<GithubSummarizerQuotaClaim> {
  const limit = readGithubSummarizerUsageLimit();
  if (readDirectDatabaseUrl()) return claimViaPostgres(secret, limit);
  return claimViaSupabaseRpc(secret, limit);
}

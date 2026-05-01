/**
 * PostgREST / supabase-js often surfaces TLS/DNS/outbound failures as "fetch failed".
 * Replace with something actionable for logs and API JSON responses.
 */
export function throwFromPostgrestError(
  error: { message?: string; details?: string } | null,
): asserts error is null | never {
  if (!error) return;
  const raw = [error.message, error.details].filter(Boolean).join(" ");
  if (
    /fetch failed|Failed to fetch|ECONNREFUSED|ENOTFOUND|getaddrinfo|certificate|TLS|SSL|ETIMEDOUT|UND_ERR_CONNECT/i.test(
      raw,
    )
  ) {
    throw new Error(
      `Cannot reach Supabase (${error.message ?? raw}). Check NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL (https://… .supabase.co), outbound HTTPS, VPN/firewall/DNS. On Windows, restart dev with yarn dev (uses IPv4-first DNS) or set NODE_OPTIONS=--dns-result-order=ipv4first.`,
    );
  }
  throw new Error(error.message ?? raw);
}

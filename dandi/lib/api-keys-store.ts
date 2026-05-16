/** Domain types and masking helpers (no storage). */

export type ApiKeyRecord = {
  id: string;
  name: string;
  secret: string;
  createdAt: string;
  /** Summarizer invocations consumed (`api_keys.github_summarizer_hits`). */
  usage: number;
  /** Per-key summarizer quota (`api_keys.usage_count`). */
  usageLimit: number;
};

export type ApiKeyPublic = {
  id: string;
  name: string;
  maskedSecret: string;
  createdAt: string;
  /** Summarizer invocations consumed (`api_keys.github_summarizer_hits`). */
  usage: number;
  /** Per-key summarizer quota (`api_keys.usage_count`). */
  usageLimit: number;
};

export function maskSecret(secret: string): string {
  if (secret.length <= 10) return "••••••••";
  return `${secret.slice(0, 6)}…${secret.slice(-4)}`;
}

/** Tavily-style list mask: short prefix + asterisks (never the full secret). */
export function tableKeyMask(secret: string): string {
  const head = secret.slice(0, Math.min(6, secret.length));
  return `${head}${"*".repeat(28)}`;
}

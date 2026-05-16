import type { ApiKeyPublic } from "@/lib/api-keys-store";

/** Totals across a user’s API keys for the Overview summarizer banner. */
export type SummarizerUsageTotals = {
  consumed: number;
  allowed: number;
};

export function aggregateSummarizerUsageFromKeys(keys: Pick<ApiKeyPublic, "usage" | "usageLimit">[]): SummarizerUsageTotals {
  let consumed = 0;
  let allowed = 0;
  for (const k of keys) {
    consumed += Math.max(0, Math.floor(Number(k.usage) || 0));
    allowed += Math.max(0, Math.floor(Number(k.usageLimit) || 0));
  }
  return { consumed, allowed };
}

/** Row shape returned by `GET /api/keys` (secret never full in list). */
export type KeyRow = {
  id: string;
  name: string;
  maskedSecret: string;
  createdAt: string;
  /** GitHub README summarizer invocations for this key (`api_keys.github_summarizer_hits`). */
  usage: number;
};

/** Shipped with `GET /api/keys` for the Overview plan / usage banner. */
export type KeysDashboardPayload = {
  planName: string;
  /** Sum of `github_summarizer_hits` across the user’s keys. */
  githubSummarizerUsage: number;
  /** Sum of `usage_count` (per-key quota) across the user’s keys. */
  githubSummarizerLimit: number;
};

/** `POST /api/keys` returns the plaintext secret once for the “copy now” modal. */
export type CreateResponse = {
  id: string;
  name: string;
  secret: string;
  createdAt: string;
  usage?: number;
};

export type ToastVariant = "success" | "danger";

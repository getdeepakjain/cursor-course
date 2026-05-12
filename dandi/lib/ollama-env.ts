/**
 * Ollama server origin (no trailing slash, no `/api` suffix).
 * The `ollama` JS client appends `/api/chat` etc. to this host.
 *
 * Cloud: `https://ollama.com` — see https://docs.ollama.com/api/authentication
 * Local: `http://127.0.0.1:11434`
 */
export function readOllamaBaseUrl(): string {
  let u = process.env.OLLAMA_BASE_URL?.trim();
  if (!u) u = "https://ollama.com";
  u = u.replace(/\/$/, "");
  // If env copied from raw API docs (`…/api`), strip it so paths are not doubled (`/api/api/chat`).
  u = u.replace(/\/api\/?$/i, "");
  return u;
}

/** Model name for generate/chat (cloud tags often end with `-cloud`, e.g. gpt-oss:20b-cloud). */
export function readOllamaModel(): string {
  return process.env.OLLAMA_MODEL?.trim() || "gpt-oss:20b-cloud";
}

/** Bearer token for Ollama Cloud (`https://ollama.com/...`). Create at https://ollama.com/settings/keys */
export function readOllamaApiKey(): string | undefined {
  const k = process.env.OLLAMA_API_KEY?.trim();
  return k || undefined;
}

export function isOllamaCloudApiBaseUrl(baseUrl: string): boolean {
  try {
    const { hostname } = new URL(baseUrl);
    return hostname === "ollama.com" || hostname.endsWith(".ollama.com");
  } catch {
    return false;
  }
}

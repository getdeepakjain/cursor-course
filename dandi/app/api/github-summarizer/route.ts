import { NextResponse } from "next/server";
import { jsonDbError } from "@/lib/api-db-error";
import { secretExists } from "@/lib/api-keys-db";
import {
  fetchGitHubReadme,
  summarizeGithubReadmeContent,
} from "@/lib/github-readme-summarizer-chain";

function extractSecret(request: Request, bodySecret: string | undefined): string {
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  const headerKey = request.headers.get("x-api-key");
  if (headerKey) return headerKey.trim();
  if (bodySecret !== undefined) return bodySecret;
  return "";
}

type GithubSummarizerPostBody = {
  secret?: string;
  githubUrl?: string;
};

/** Parses JSON body on POST when `Content-Type` includes `application/json`. */
async function tryParsePostBody(request: Request): Promise<GithubSummarizerPostBody | null> {
  if (request.method !== "POST") return null;
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null) return {};
    const o = body as Record<string, unknown>;
    return {
      secret: typeof o.secret === "string" ? o.secret : undefined,
      githubUrl: typeof o.githubUrl === "string" ? o.githubUrl : undefined,
    };
  } catch {
    return null;
  }
}

function firstLine(text: string): string {
  const line = text.split("\n")[0]?.trim();
  return line || text;
}

/** Strip LangChain’s appended troubleshooting link from model errors. */
function sanitizeModelErrorMessage(message: string): string {
  const cut = message.split("\n\nTroubleshooting URL:")[0];
  return (cut ?? message).trim();
}

/** Message + `error.cause` chain (Node often puts TLS details on the cause). */
function collectErrorChainText(err: unknown): string {
  const parts: string[] = [];
  let e: unknown = err;
  for (let depth = 0; depth < 12 && e; depth++) {
    if (e instanceof Error) {
      parts.push(e.message);
      e = e.cause;
    } else if (typeof e === "string") {
      parts.push(e);
      break;
    } else {
      break;
    }
  }
  return parts.join("\n");
}

function looksTlsFailure(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("self-signed certificate") ||
    t.includes("self signed certificate") ||
    t.includes("unable to verify the first certificate") ||
    t.includes("unable to verify leaf") ||
    t.includes("certificate chain") ||
    t.includes("cert_authority_invalid") ||
    t.includes("x509") ||
    t.includes("tlsv1_alert") ||
    (t.includes("ssl") && t.includes("wrong version number")) ||
    (t.includes("openssl") && t.includes("ssl"))
  );
}

type SummarizerClientErrorBody = { status: number; error: string; detail?: string };

function formatSummarizerClientError(err: unknown): SummarizerClientErrorBody {
  const chain = collectErrorChainText(err);
  const raw = err instanceof Error ? err.message : "Summarization failed";
  const message = sanitizeModelErrorMessage(raw);
  const low = chain.toLowerCase();

  const httpStatus =
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as { status: unknown }).status === "number"
      ? (err as { status: number }).status
      : undefined;

  const looksQuotaOrRateLimit =
    httpStatus === 429 ||
    /\b429\b/.test(raw) ||
    /exceeded your current quota/i.test(raw) ||
    /rate limit/i.test(raw);

  if (looksQuotaOrRateLimit) {
    return {
      status: 429,
      error: "Too many requests to Ollama. Wait a moment and retry, or reduce concurrent calls.",
    };
  }

  if (httpStatus === 401 || /\b401\b/.test(chain) || /\b401\b/.test(raw) || /\bunauthorized\b/i.test(message)) {
    return {
      status: 503,
      error:
        "Ollama rejected the request (unauthorized). Check OLLAMA_API_KEY for Ollama Cloud, or use a valid local Ollama URL.",
    };
  }

  if (looksTlsFailure(chain)) {
    return {
      status: 503,
      error:
        "Ollama Cloud HTTPS failed TLS verification (common on corporate networks: proxies or antivirus replace certificates). " +
        "Fix: point Node at your organization root CA PEM via NODE_EXTRA_CA_CERTS before starting the dev server, or use local Ollama: " +
        "OLLAMA_BASE_URL=http://127.0.0.1:11434 and omit OLLAMA_API_KEY. See README “Ollama TLS / corporate proxy”.",
      ...(process.env.NODE_ENV === "development" ? { detail: firstLine(chain) } : {}),
    };
  }

  if (
    low.includes("econnrefused") ||
    low.includes("fetch failed") ||
    low.includes("failed to fetch") ||
    low.includes("networkerror") ||
    low.includes("socket hang up") ||
    low.includes("enotfound") ||
    low.includes("eai_again") ||
    low.includes("und_err") ||
    low.includes("connecttimeout") ||
    low.includes("etimedout")
  ) {
    const devDetail =
      process.env.NODE_ENV === "development"
        ? { detail: chain.split("\n").filter(Boolean).slice(0, 4).join(" | ").slice(0, 500) }
        : {};
    return {
      status: 503,
      error:
        "Cannot reach Ollama. For Ollama Cloud, confirm OLLAMA_BASE_URL (default https://ollama.com), firewall, and TLS (see README if you are on a corporate network). " +
        "For a local daemon, set OLLAMA_BASE_URL=http://127.0.0.1:11434, run `ollama serve`, and `ollama pull` your OLLAMA_MODEL.",
      ...devDetail,
    };
  }

  if (/model.*not found|pull model|unknown model/i.test(message)) {
    return {
      status: 503,
      error:
        firstLine(message) +
        " — For cloud, set OLLAMA_MODEL to a model enabled on your account (see Ollama Cloud docs). For local, run `ollama pull` for that tag.",
    };
  }

  if (
    /failed to parse/i.test(chain) ||
    message.includes("Summarizer returned non-JSON") ||
    message.includes("Summarizer JSON failed validation")
  ) {
    return {
      status: 502,
      error:
        "The model did not return valid JSON with keys summary (string) and cool_facts (string array). " +
        "Try another OLLAMA_MODEL on Ollama Cloud, or retry once.",
      ...(process.env.NODE_ENV === "development" ? { detail: firstLine(message).slice(0, 800) } : {}),
    };
  }

  if (message.includes("OLLAMA") || message.includes("Ollama")) {
    return { status: 503, error: firstLine(message) };
  }
  if (message.includes("Invalid GitHub repository URL") || message.includes("README.md not found")) {
    return { status: 400, error: firstLine(message) };
  }

  return { status: 502, error: firstLine(message) };
}

function summarizerErrorJson(body: SummarizerClientErrorBody): Record<string, string> {
  return body.detail ? { error: body.error, detail: body.detail } : { error: body.error };
}

/**
 * Validates a Dandi API key (same backing store as /api/keys/verify).
 *
 * Auth: `Authorization: Bearer <key>`, `X-Api-Key: <key>`, or POST JSON `secret`.
 *
 * **POST JSON** (optional): `githubUrl` — `https://github.com/owner/repo` — fetches README,
 * runs the summarizer via **Ollama Cloud** by default (`OLLAMA_API_KEY` + `OLLAMA_BASE_URL` default `https://ollama.com`), returns `{ ok, summary, cool_facts }`.
 *
 * Without `githubUrl`: `200` `{ "ok": true }`. Invalid key: `401` `{ "error": "Unauthorized" }`.
 */
async function handle(request: Request) {
  const post = await tryParsePostBody(request);
  const bodySecret = post?.secret;
  const secret = extractSecret(request, bodySecret);

  if (!secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const valid = await secretExists(secret);
    if (!valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const githubUrl = post?.githubUrl?.trim();
    if (request.method === "POST" && githubUrl) {
      try {
        const readme = await fetchGitHubReadme(githubUrl);
        const { summary, cool_facts } = await summarizeGithubReadmeContent(readme);
        return NextResponse.json({ ok: true, summary, cool_facts });
      } catch (err) {
        const body = formatSummarizerClientError(err);
        return NextResponse.json(summarizerErrorJson(body), { status: body.status });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonDbError(err);
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

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

function formatSummarizerClientError(err: unknown): { status: number; error: string } {
  const raw = err instanceof Error ? err.message : "Summarization failed";
  const message = sanitizeModelErrorMessage(raw);

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
      error:
        "OpenAI rate limit or quota exceeded (often: no billing / no credits on the API key’s organization). " +
        "Fix: https://platform.openai.com/account/billing — then retry.",
    };
  }

  if (message.includes("OPENAI_API_KEY")) {
    return { status: 503, error: message };
  }
  if (message.includes("Invalid GitHub repository URL") || message.includes("README.md not found")) {
    return { status: 400, error: firstLine(message) };
  }

  return { status: 502, error: firstLine(message) };
}

/**
 * Validates a Dandi API key (same backing store as /api/keys/verify).
 *
 * Auth: `Authorization: Bearer <key>`, `X-Api-Key: <key>`, or POST JSON `secret`.
 *
 * **POST JSON** (optional): `githubUrl` — `https://github.com/owner/repo` — fetches README,
 * runs the summarizer, returns `{ ok, summary, cool_facts }`.
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
        const { status, error } = formatSummarizerClientError(err);
        return NextResponse.json({ error }, { status });
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

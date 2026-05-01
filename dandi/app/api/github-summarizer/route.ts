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

function summarizerErrorStatus(message: string): number {
  if (message.includes("OPENAI_API_KEY")) return 503;
  if (message.includes("Invalid GitHub repository URL") || message.includes("README.md not found")) {
    return 400;
  }
  return 502;
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
        const message = err instanceof Error ? err.message : "Summarization failed";
        const status = summarizerErrorStatus(message);
        return NextResponse.json({ error: message }, { status });
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

import { NextResponse } from "next/server";
import { jsonDbError } from "@/lib/api-db-error";
import { secretExists } from "@/lib/api-keys-db";

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

async function parseBodySecret(request: Request): Promise<string | undefined> {
  if (request.method !== "POST") return undefined;
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return undefined;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return undefined;
  }
  if (
    typeof body === "object" &&
    body !== null &&
    "secret" in body &&
    typeof (body as { secret: unknown }).secret === "string"
  ) {
    return (body as { secret: string }).secret;
  }
  return undefined;
}

/**
 * Validates a Dandi API key (same backing store as /api/keys/verify).
 *
 * Send the key via `Authorization: Bearer <key>`, `X-Api-Key: <key>`, or
 * POST JSON `{ "secret": "<key>" }` (optional when headers are set).
 *
 * Success: `200` `{ "ok": true }`. Invalid or missing key: `401` `{ "error": "Unauthorized" }`.
 */
async function handle(request: Request) {
  const bodySecret = await parseBodySecret(request);
  const secret = extractSecret(request, bodySecret);

  if (!secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const valid = await secretExists(secret);
    if (!valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
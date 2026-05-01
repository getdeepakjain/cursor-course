import { NextResponse } from "next/server";
import { jsonDbError } from "@/lib/api-db-error";
import { secretExists } from "@/lib/api-keys-db";

/**
 * POST body: `{ "secret": "<full api key>" }`.
 * Response: `{ "valid": true | false }` — same shape on mismatch vs empty secret (no extra leak).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const secret =
    typeof body === "object" &&
    body !== null &&
    "secret" in body &&
    typeof (body as { secret: unknown }).secret === "string"
      ? (body as { secret: string }).secret
      : "";

  try {
    const valid = await secretExists(secret);
    return NextResponse.json({ valid });
  } catch (err) {
    return jsonDbError(err);
  }
}

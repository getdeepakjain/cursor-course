import { NextResponse } from "next/server";
import { requireKeysApiUser } from "@/lib/auth-keys-api";
import { handleGithubSummarizer } from "@/lib/github-summarizer-handler";

/**
 * Playground-only summarizer: requires a signed-in user and an API key owned by that user.
 * Other users’ keys return `401` `{ "error": "Unauthorized" }` without consuming quota.
 */
export async function POST(request: Request) {
  const auth = await requireKeysApiUser(request);
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return handleGithubSummarizer(request, { restrictToUserId: auth.userUuid });
}

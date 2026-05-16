import { NextResponse } from "next/server";
import { jsonDbError } from "@/lib/api-db-error";
import { createKey, listKeys } from "@/lib/api-keys-db";
import { getAppUserDashboardProfile } from "@/lib/app-users-db";
import { requireKeysApiUser } from "@/lib/auth-keys-api";
import { aggregateSummarizerUsageFromKeys } from "@/lib/summarizer-usage-aggregate";

export async function GET(request: Request) {
  const auth = await requireKeysApiUser(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const [keys, profile] = await Promise.all([
      listKeys(auth.userUuid),
      getAppUserDashboardProfile(auth.userUuid),
    ]);
    const { consumed, allowed } = aggregateSummarizerUsageFromKeys(keys);
    const planName = (profile?.planName ?? "Free").trim() || "Free";
    return NextResponse.json({
      keys,
      dashboard: {
        planName,
        githubSummarizerUsage: consumed,
        githubSummarizerLimit: allowed,
      },
    });
  } catch (err) {
    return jsonDbError(err);
  }
}

export async function POST(request: Request) {
  const auth = await requireKeysApiUser(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const name =
    typeof body === "object" &&
    body !== null &&
    "name" in body &&
    typeof (body as { name: unknown }).name === "string"
      ? (body as { name: string }).name
      : "";

  try {
    const record = await createKey(auth.userUuid, name);
    return NextResponse.json(
      {
        id: record.id,
        name: record.name,
        secret: record.secret,
        createdAt: record.createdAt,
        usage: record.usage,
        message:
          "Copy this secret now. It will not be shown again in full.",
      },
      { status: 201 },
    );
  } catch (err) {
    return jsonDbError(err);
  }
}

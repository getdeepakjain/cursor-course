import { NextResponse } from "next/server";
import { jsonDbError } from "@/lib/api-db-error";
import { getKey } from "@/lib/api-keys-db";
import { requireKeysApiUser } from "@/lib/auth-keys-api";

type RouteContext = { params: Promise<{ id: string }> };

/** Returns full secret for dashboard reveal/copy (demo app only). */
export async function GET(request: Request, context: RouteContext) {
  const auth = await requireKeysApiUser(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const { id } = await context.params;
    const record = await getKey(auth.userUuid, id);
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ secret: record.secret });
  } catch (err) {
    return jsonDbError(err);
  }
}

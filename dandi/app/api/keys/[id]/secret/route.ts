import { NextResponse } from "next/server";
import { jsonDbError } from "@/lib/api-db-error";
import { getKey } from "@/lib/api-keys-db";

type RouteContext = { params: Promise<{ id: string }> };

/** Returns full secret for dashboard reveal/copy (demo app only). */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const record = await getKey(id);
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ secret: record.secret });
  } catch (err) {
    return jsonDbError(err);
  }
}

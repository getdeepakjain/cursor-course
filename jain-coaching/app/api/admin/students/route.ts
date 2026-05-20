import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { listStudentsForAdmin } from "@/lib/users-db";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const students = await listStudentsForAdmin(searchParams.get("q") ?? undefined);
    return NextResponse.json({ students });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

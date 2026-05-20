import { NextResponse } from "next/server";
import { requireCompleteProfile } from "@/lib/session";
import { getTestById, getTestQuestions } from "@/lib/tests-db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireCompleteProfile();
    const { id } = await params;
    const test = await getTestById(id);
    if (!test) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const questions = await getTestQuestions(id);
    return NextResponse.json({ test, questions });
  } catch (e) {
    if (e instanceof Error && e.message === "PROFILE_INCOMPLETE") {
      return NextResponse.json({ error: "Complete profile first" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

import { NextResponse } from "next/server";
import { requireCompleteProfile } from "@/lib/session";
import { finalizeAttempt, getAttemptById } from "@/lib/attempts-db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireCompleteProfile();
    const { id } = await params;
    const attempt = await getAttemptById(id);
    if (!attempt || attempt.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const { score, maxScore } = await finalizeAttempt(id, "submitted");
    return NextResponse.json({ attemptId: id, score, maxScore });
  } catch {
    return NextResponse.json({ error: "Submit failed" }, { status: 500 });
  }
}

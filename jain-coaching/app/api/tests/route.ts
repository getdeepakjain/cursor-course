import { NextResponse } from "next/server";
import { requireCompleteProfile } from "@/lib/session";
import { listTests } from "@/lib/tests-db";
import type { TestTrack } from "@/lib/types";

export async function GET(req: Request) {
  try {
    await requireCompleteProfile();
    const { searchParams } = new URL(req.url);
    const track = searchParams.get("track") as TestTrack | null;
    const classLevel = searchParams.get("classLevel");
    const subject = searchParams.get("subject");
    const difficulty = searchParams.get("difficulty");
    const tests = await listTests({
      track: track ?? undefined,
      classLevel: classLevel ? Number(classLevel) : undefined,
      subject: subject ?? undefined,
      difficulty:
        difficulty === "low" || difficulty === "medium" || difficulty === "high"
          ? difficulty
          : undefined,
    });
    return NextResponse.json({ tests });
  } catch (e) {
    if (e instanceof Error && e.message === "PROFILE_INCOMPLETE") {
      return NextResponse.json({ error: "Complete your profile first" }, { status: 403 });
    }
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load tests" }, { status: 500 });
  }
}

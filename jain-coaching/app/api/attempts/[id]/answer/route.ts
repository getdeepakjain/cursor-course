import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCompleteProfile } from "@/lib/session";
import {
  getAttemptById,
  saveAnswer,
  validateSessionLock,
} from "@/lib/attempts-db";

const schema = z.object({
  questionId: z.string().uuid(),
  selectedAnswer: z.unknown().nullable(),
  markedForReview: z.boolean().optional(),
  deviceFingerprint: z.string(),
  sessionToken: z.string().uuid(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireCompleteProfile();
    const { id } = await params;
    const body = schema.parse(await req.json());
    const attempt = await getAttemptById(id);
    if (!attempt || attempt.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const lock = await validateSessionLock(
      attempt,
      body.deviceFingerprint,
      body.sessionToken,
    );
    if (!lock.ok) {
      return NextResponse.json({ error: lock.reason }, { status: 409 });
    }

    await saveAnswer({
      attemptId: id,
      questionId: body.questionId,
      selectedAnswer: body.selectedAnswer,
      markedForReview: body.markedForReview,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save answer" }, { status: 500 });
  }
}

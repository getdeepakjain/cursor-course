import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCompleteProfile } from "@/lib/session";
import {
  finalizeAttempt,
  getAttemptById,
  heartbeat,
  validateSessionLock,
} from "@/lib/attempts-db";

const schema = z.object({
  sessionToken: z.string().uuid(),
  deviceFingerprint: z.string(),
});

export async function POST(
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

    if (new Date() >= new Date(attempt.ends_at) && attempt.status === "in_progress") {
      const { score, maxScore } = await finalizeAttempt(id, "auto_submitted");
      return NextResponse.json({ expired: true, score, maxScore });
    }

    const lock = await validateSessionLock(
      attempt,
      body.deviceFingerprint,
      body.sessionToken,
    );
    if (!lock.ok) {
      return NextResponse.json({ error: lock.reason }, { status: 409 });
    }

    await heartbeat(id, body.sessionToken);
    return NextResponse.json({
      ok: true,
      endsAt: attempt.ends_at,
      violationCount: attempt.violation_count,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Heartbeat failed" }, { status: 500 });
  }
}

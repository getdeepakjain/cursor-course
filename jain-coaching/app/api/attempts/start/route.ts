import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCompleteProfile } from "@/lib/session";
import { createAttempt, getActiveAttemptForUser, supersedeSession } from "@/lib/attempts-db";
import { hasApprovedEnrollmentForTest } from "@/lib/enrollments-db";
import { getTestById } from "@/lib/tests-db";

const schema = z.object({
  testId: z.string().uuid(),
  deviceFingerprint: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const user = await requireCompleteProfile();
    const body = schema.parse(await req.json());
    const test = await getTestById(body.testId);
    if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

    const approved = await hasApprovedEnrollmentForTest(user.id, test);
    if (!approved) {
      return NextResponse.json(
        {
          error:
            "Enrollment not approved. Request enrollment for this class, subject, and difficulty first.",
        },
        { status: 403 },
      );
    }

    const existing = await getActiveAttemptForUser(user.id, body.testId);
    if (existing) {
      if (existing.device_fingerprint === body.deviceFingerprint) {
        const sessionToken = await supersedeSession(existing.id);
        return NextResponse.json({
          attemptId: existing.id,
          sessionToken,
          endsAt: existing.ends_at,
          resumed: true,
        });
      }
      return NextResponse.json(
        { error: "Active session on another device" },
        { status: 409 },
      );
    }

    const attempt = await createAttempt({
      userId: user.id,
      testId: body.testId,
      durationMinutes: test.durationMinutes,
      deviceFingerprint: body.deviceFingerprint,
    });

    return NextResponse.json({
      attemptId: attempt.id,
      sessionToken: attempt.session_token,
      endsAt: attempt.ends_at,
      resumed: false,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    if (e instanceof Error && e.message === "PROFILE_INCOMPLETE") {
      return NextResponse.json({ error: "Complete your profile first" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to start attempt" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCompleteProfile } from "@/lib/session";
import { getAttemptById, recordViolation } from "@/lib/attempts-db";
import type { ViolationType } from "@/lib/types";

const schema = z.object({
  type: z.enum([
    "tab_switch",
    "window_blur",
    "copy_paste",
    "fullscreen_exit",
    "other",
  ]),
  metadata: z.record(z.unknown()).optional(),
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
    if (attempt.status !== "in_progress") {
      return NextResponse.json({ terminated: true, violationCount: attempt.violation_count });
    }

    const result = await recordViolation({
      attemptId: id,
      type: body.type as ViolationType,
      metadata: body.metadata,
    });

    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to record violation" }, { status: 500 });
  }
}

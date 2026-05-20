import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getEnrollmentById,
  listEnrollmentsForAdmin,
  updateEnrollmentStatus,
} from "@/lib/enrollments-db";
import {
  difficultyLabel,
  subjectLabel,
  trackLabel,
} from "@/lib/catalog";
import { notifyEnrollmentDecision } from "@/lib/notifications";
import { requireAdmin } from "@/lib/session";
import { findUserById } from "@/lib/users-db";
import type { DifficultyLevel, EnrollmentStatus, TestTrack } from "@/lib/types";

function formatDetails(input: {
  track: TestTrack;
  classLevel: number | null;
  subject: string | null;
  difficulty: DifficultyLevel;
}) {
  const parts = [trackLabel(input.track)];
  if (input.classLevel) parts.push(`Class ${input.classLevel}`);
  if (input.subject) parts.push(subjectLabel(input.subject));
  parts.push(difficultyLabel(input.difficulty));
  return parts.join(" · ");
}

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const status = new URL(req.url).searchParams.get("status") as EnrollmentStatus | null;
    const enrollments = await listEnrollmentsForAdmin(
      status && ["pending", "approved", "rejected"].includes(status) ? status : undefined,
    );
    return NextResponse.json({ enrollments });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to load enrollments" }, { status: 500 });
  }
}

const patchSchema = z.object({
  enrollmentId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  adminNote: z.string().max(500).optional(),
});

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = patchSchema.parse(await req.json());
    const existing = await getEnrollmentById(body.enrollmentId);
    if (!existing) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    const updated = await updateEnrollmentStatus({
      enrollmentId: body.enrollmentId,
      status: body.status,
      adminId: admin.id,
      adminNote: body.adminNote,
    });

    const student = await findUserById(existing.userId);
    if (student) {
      void notifyEnrollmentDecision(
        student,
        formatDetails({
          track: existing.track,
          classLevel: existing.classLevel,
          subject: existing.subject,
          difficulty: existing.difficulty,
        }),
        body.status === "approved",
        body.adminNote,
      ).catch(console.error);
    }

    return NextResponse.json({ enrollment: updated });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update enrollment" }, { status: 500 });
  }
}

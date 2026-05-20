import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createEnrollment,
  findEnrollmentByScope,
  listEnrollmentsForUser,
} from "@/lib/enrollments-db";
import {
  difficultyLabel,
  subjectLabel,
  trackLabel,
} from "@/lib/catalog";
import { notifyEnrollmentSubmitted } from "@/lib/notifications";
import { requireCompleteProfile } from "@/lib/session";
import { findUserById } from "@/lib/users-db";
import type { DifficultyLevel, TestTrack } from "@/lib/types";

const postSchema = z.object({
  track: z.enum(["class_9_12", "jee_main", "jee_advanced"]),
  classLevel: z.number().int().min(9).max(12).optional(),
  subject: z.string().min(2).optional(),
  difficulty: z.enum(["low", "medium", "high"]),
});

function formatEnrollmentDetails(input: {
  track: TestTrack;
  classLevel?: number | null;
  subject?: string | null;
  difficulty: DifficultyLevel;
}) {
  const parts = [trackLabel(input.track)];
  if (input.classLevel) parts.push(`Class ${input.classLevel}`);
  if (input.subject) parts.push(subjectLabel(input.subject));
  parts.push(difficultyLabel(input.difficulty));
  return parts.join(" · ");
}

export async function GET() {
  try {
    const user = await requireCompleteProfile();
    const enrollments = await listEnrollmentsForUser(user.id);
    return NextResponse.json({ enrollments });
  } catch (e) {
    if (e instanceof Error && e.message === "PROFILE_INCOMPLETE") {
      return NextResponse.json({ error: "Complete your profile first" }, { status: 403 });
    }
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load enrollments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCompleteProfile();
    const body = postSchema.parse(await req.json());

    if (body.track === "class_9_12") {
      if (!body.classLevel || !body.subject) {
        return NextResponse.json(
          { error: "Class, subject, and difficulty are required for NCERT enrollment" },
          { status: 400 },
        );
      }
      if (user.classLevel && body.classLevel !== user.classLevel) {
        return NextResponse.json(
          { error: "Enrollment class must match your profile class" },
          { status: 400 },
        );
      }
    }

    const classLevel = body.track === "class_9_12" ? (body.classLevel ?? user.classLevel) : null;
    const subject = body.track === "class_9_12" ? (body.subject ?? null) : null;

    const existing = await findEnrollmentByScope({
      userId: user.id,
      track: body.track,
      classLevel,
      subject,
      difficulty: body.difficulty,
    });
    if (existing) {
      return NextResponse.json({ enrollment: existing }, { status: 200 });
    }

    const enrollment = await createEnrollment({
      userId: user.id,
      track: body.track,
      classLevel,
      subject,
      difficulty: body.difficulty,
    });

    const fullUser = await findUserById(user.id);
    if (fullUser) {
      void notifyEnrollmentSubmitted(
        fullUser,
        formatEnrollmentDetails({
          track: body.track,
          classLevel,
          subject,
          difficulty: body.difficulty,
        }),
      ).catch(console.error);
    }

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    if (e instanceof Error && e.message === "PROFILE_INCOMPLETE") {
      return NextResponse.json({ error: "Complete your profile first" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to create enrollment" }, { status: 500 });
  }
}

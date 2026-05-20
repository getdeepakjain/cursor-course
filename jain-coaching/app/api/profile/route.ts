import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/session";
import { updateUserProfile } from "@/lib/users-db";
import type { TestTrack } from "@/lib/types";

const schema = z
  .object({
    fullName: z.string().min(2),
    age: z.number().int().min(10).max(25),
    track: z.enum(["class_9_12", "jee_main", "jee_advanced"]),
    classLevel: z.number().int().min(9).max(12).optional(),
    schoolName: z.string().min(2),
    phone: z.string().min(10),
    whatsappConsent: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.track === "class_9_12" && data.classLevel == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Class level is required for NCERT track",
        path: ["classLevel"],
      });
    }
  });

export async function GET() {
  try {
    const user = await requireAuth();
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth();
    const body = schema.parse(await req.json());
    const updated = await updateUserProfile(user.id, {
      fullName: body.fullName,
      age: body.age,
      track: body.track as TestTrack,
      classLevel: body.track === "class_9_12" ? (body.classLevel ?? null) : null,
      schoolName: body.schoolName,
      phone: body.phone,
      whatsappConsent: body.whatsappConsent,
    });
    return NextResponse.json({ user: updated });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    await query(
      `insert into marketing_leads (name, email, phone) values ($1, $2, $3)`,
      [body.name, body.email.toLowerCase(), body.phone ?? null],
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

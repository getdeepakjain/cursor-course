import { NextResponse } from "next/server";

export function jsonDbError(err: unknown) {
  const message = err instanceof Error ? err.message : "Database error";
  const status =
    message.includes("Missing NEXT_PUBLIC") ||
    message.includes("Missing Supabase")
      ? 503
      : 500;
  return NextResponse.json({ error: message }, { status });
}

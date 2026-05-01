import { NextResponse } from "next/server";
import { jsonDbError } from "@/lib/api-db-error";
import { createKey, listKeys } from "@/lib/api-keys-db";

export async function GET() {
  try {
    const keys = await listKeys();
    return NextResponse.json({ keys });
  } catch (err) {
    return jsonDbError(err);
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const name =
    typeof body === "object" &&
    body !== null &&
    "name" in body &&
    typeof (body as { name: unknown }).name === "string"
      ? (body as { name: string }).name
      : "";

  try {
    const record = await createKey(name);
    return NextResponse.json(
      {
        id: record.id,
        name: record.name,
        secret: record.secret,
        createdAt: record.createdAt,
        usage: record.usage,
        message:
          "Copy this secret now. It will not be shown again in full.",
      },
      { status: 201 },
    );
  } catch (err) {
    return jsonDbError(err);
  }
}

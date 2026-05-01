import { NextResponse } from "next/server";
import { jsonDbError } from "@/lib/api-db-error";
import { deleteKey, getKey, updateKey } from "@/lib/api-keys-db";
import { tableKeyMask } from "@/lib/api-keys-store";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const record = await getKey(id);
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: record.id,
      name: record.name,
      maskedSecret: tableKeyMask(record.secret),
      createdAt: record.createdAt,
      usage: record.usage,
    });
  } catch (err) {
    return jsonDbError(err);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
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
      : undefined;

  if (name === undefined) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  try {
    const updated = await updateKey(id, name);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      maskedSecret: tableKeyMask(updated.secret),
      createdAt: updated.createdAt,
      usage: updated.usage,
    });
  } catch (err) {
    return jsonDbError(err);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const ok = await deleteKey(id);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonDbError(err);
  }
}

import { NextResponse } from "next/server";
import { jsonDbError } from "@/lib/api-db-error";
import { deleteKey, getKey, updateKey } from "@/lib/api-keys-db";
import { requireKeysApiUser } from "@/lib/auth-keys-api";
import { tableKeyMask } from "@/lib/api-keys-store";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireKeysApiUser(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const { id } = await context.params;
    const record = await getKey(auth.userUuid, id);
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
  const auth = await requireKeysApiUser(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
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
    const updated = await updateKey(auth.userUuid, id, name);
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

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireKeysApiUser(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const { id } = await context.params;
    const ok = await deleteKey(auth.userUuid, id);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return jsonDbError(err);
  }
}

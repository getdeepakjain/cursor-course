import { randomBytes } from "crypto";
import type { ApiKeyPublic, ApiKeyRecord } from "@/lib/api-keys-store";
import { tableKeyMask } from "@/lib/api-keys-store";
import { throwFromPostgrestError } from "@/lib/supabase-postgrest-error";
import { getServiceSupabase } from "@/lib/supabase/service";

type ApiKeyRow = {
  id: string;
  name: string;
  secret: string;
  usage_count: number;
  created_at: string;
};

function toRecord(row: ApiKeyRow): ApiKeyRecord {
  return {
    id: row.id,
    name: row.name,
    secret: row.secret,
    createdAt: row.created_at,
    usage: row.usage_count,
  };
}

function toPublic(row: ApiKeyRow): ApiKeyPublic {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    usage: row.usage_count,
    maskedSecret: tableKeyMask(row.secret),
  };
}

export async function listKeys(): Promise<ApiKeyPublic[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, name, secret, usage_count, created_at")
    .order("created_at", { ascending: false });

  if (error) throwFromPostgrestError(error);
  return ((data ?? []) as ApiKeyRow[]).map(toPublic);
}

export async function getKey(id: string): Promise<ApiKeyRecord | null> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, name, secret, usage_count, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) throwFromPostgrestError(error);
  if (!data) return null;
  return toRecord(data as ApiKeyRow);
}

export async function createKey(name: string): Promise<ApiKeyRecord> {
  const trimmed = name.trim() || "Untitled";
  const secret = `dandi_${randomBytes(24).toString("base64url")}`;
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      name: trimmed,
      secret,
      usage_count: 0,
    })
    .select("id, name, secret, usage_count, created_at")
    .single();

  if (error) throwFromPostgrestError(error);
  return toRecord(data as ApiKeyRow);
}

export async function updateKey(
  id: string,
  name: string,
): Promise<ApiKeyRecord | null> {
  const trimmed = name.trim();
  const supabase = getServiceSupabase();
  const { data: existing, error: fetchErr } = await supabase
    .from("api_keys")
    .select("id, name, secret, usage_count, created_at")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) throwFromPostgrestError(fetchErr);
  if (!existing) return null;

  const nextName = trimmed || (existing as ApiKeyRow).name;
  const { data, error } = await supabase
    .from("api_keys")
    .update({ name: nextName })
    .eq("id", id)
    .select("id, name, secret, usage_count, created_at")
    .single();

  if (error) throwFromPostgrestError(error);
  return toRecord(data as ApiKeyRow);
}

export async function deleteKey(id: string): Promise<boolean> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throwFromPostgrestError(error);
  return Array.isArray(data) && data.length > 0;
}

/** True if a row exists with this exact secret (used by playground / verify API). */
export async function secretExists(secret: string): Promise<boolean> {
  const trimmed = secret.trim();
  if (!trimmed) return false;
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id")
    .eq("secret", trimmed)
    .limit(1);

  if (error) throwFromPostgrestError(error);
  return Array.isArray(data) && data.length > 0;
}

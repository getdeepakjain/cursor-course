import { randomBytes } from "crypto";
import type { ApiKeyPublic, ApiKeyRecord } from "@/lib/api-keys-store";
import { tableKeyMask } from "@/lib/api-keys-store";
import { getDirectPgPool } from "@/lib/direct-pg-pool";
import { readGithubSummarizerUsageLimit } from "@/lib/github-summarizer-quota";

type ApiKeyRow = {
  id: string;
  name: string;
  secret: string;
  usage_count: number;
  github_summarizer_hits: number;
  created_at: Date | string;
};

function asIso(d: Date | string): string {
  if (d instanceof Date) return d.toISOString();
  return String(d);
}

function toRecord(row: ApiKeyRow): ApiKeyRecord {
  return {
    id: row.id,
    name: row.name,
    secret: row.secret,
    createdAt: asIso(row.created_at),
    usage: Number(row.github_summarizer_hits),
    usageLimit: Number(row.usage_count),
  };
}

function toPublic(row: ApiKeyRow): ApiKeyPublic {
  return {
    id: row.id,
    name: row.name,
    createdAt: asIso(row.created_at),
    usage: Number(row.github_summarizer_hits),
    usageLimit: Number(row.usage_count),
    maskedSecret: tableKeyMask(row.secret),
  };
}

function pgError(err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err);
  const certProblem =
    /self-signed certificate|unable to verify the first certificate|UNABLE_TO_VERIFY_LEAF_SIGNATURE|certificate chain/i.test(
      msg,
    );
  const hint = certProblem
    ? " TLS interception or a custom CA: add PG_SSL_REJECT_UNAUTHORIZED=0 to dandi/.env.local (dev only), or append &sslmode=no-verify to DATABASE_URL, then restart yarn dev. Prefer fixing trust (import your corporate root CA via NODE_EXTRA_CA_CERTS) for production."
    : " Check DATABASE_URL (Supabase → Project Settings → Database → URI). Prefer Session pool (5432) or Direct; transaction pooler (6543) can need ?pgbouncer=true for some tools.";
  throw new Error(`Postgres error: ${msg}.${hint}`);
}

export async function listKeys(userId: string): Promise<ApiKeyPublic[]> {
  try {
    const r = await getDirectPgPool().query<ApiKeyRow>(
      `select id, name, secret, usage_count, github_summarizer_hits, created_at
       from public.api_keys
       where user_id = $1::uuid
       order by created_at desc`,
      [userId],
    );
    return r.rows.map(toPublic);
  } catch (e) {
    pgError(e);
  }
}

export async function getKey(userId: string, id: string): Promise<ApiKeyRecord | null> {
  try {
    const r = await getDirectPgPool().query<ApiKeyRow>(
      `select id, name, secret, usage_count, github_summarizer_hits, created_at
       from public.api_keys
       where id = $1::uuid and user_id = $2::uuid`,
      [id, userId],
    );
    if (r.rows.length === 0) return null;
    return toRecord(r.rows[0]!);
  } catch (e) {
    pgError(e);
  }
}

export async function createKey(userId: string, name: string): Promise<ApiKeyRecord> {
  const trimmed = name.trim() || "Untitled";
  const secret = `dandi_${randomBytes(24).toString("base64url")}`;
  const perKeyLimit = readGithubSummarizerUsageLimit();
  try {
    const r = await getDirectPgPool().query<ApiKeyRow>(
      `insert into public.api_keys (user_id, name, secret, usage_count, github_summarizer_hits)
       values ($1::uuid, $2, $3, $4, 0)
       returning id, name, secret, usage_count, github_summarizer_hits, created_at`,
      [userId, trimmed, secret, perKeyLimit],
    );
    return toRecord(r.rows[0]!);
  } catch (e) {
    pgError(e);
  }
}

export async function updateKey(
  userId: string,
  id: string,
  name: string,
): Promise<ApiKeyRecord | null> {
  const trimmed = name.trim();
  try {
    const cur = await getDirectPgPool().query<{ name: string }>(
      `select name from public.api_keys where id = $1::uuid and user_id = $2::uuid`,
      [id, userId],
    );
    if (cur.rows.length === 0) return null;
    const nextName = trimmed || cur.rows[0]!.name;
    const r = await getDirectPgPool().query<ApiKeyRow>(
      `update public.api_keys
       set name = $1
       where id = $2::uuid and user_id = $3::uuid
       returning id, name, secret, usage_count, github_summarizer_hits, created_at`,
      [nextName, id, userId],
    );
    return toRecord(r.rows[0]!);
  } catch (e) {
    pgError(e);
  }
}

export async function deleteKey(userId: string, id: string): Promise<boolean> {
  try {
    const r = await getDirectPgPool().query(
      `delete from public.api_keys where id = $1::uuid and user_id = $2::uuid returning id`,
      [id, userId],
    );
    return (r.rowCount ?? 0) > 0;
  } catch (e) {
    pgError(e);
  }
}

/** True if the secret belongs to the given OAuth user (`api_keys.user_id`). */
export async function apiKeyOwnedByUser(userId: string, secret: string): Promise<boolean> {
  const trimmed = secret.trim();
  if (!trimmed) return false;
  try {
    const r = await getDirectPgPool().query<{ one: number }>(
      `select 1 as one from public.api_keys where secret = $1 and user_id = $2::uuid limit 1`,
      [trimmed, userId],
    );
    return r.rows.length > 0;
  } catch (e) {
    pgError(e);
  }
}

/** True if a row exists with this exact secret (used by playground / verify API). */
export async function secretExists(secret: string): Promise<boolean> {
  const trimmed = secret.trim();
  if (!trimmed) return false;
  try {
    const r = await getDirectPgPool().query<{ one: number }>(
      `select 1 as one from public.api_keys where secret = $1 limit 1`,
      [trimmed],
    );
    return r.rows.length > 0;
  } catch (e) {
    pgError(e);
  }
}

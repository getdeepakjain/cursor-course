import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";

let dandiEnvLoaded = false;

/** `dandi/` root (this file lives at `dandi/lib/supabase/env.ts`). */
const dandiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * Loads `.env*` from several locations once (merged into `process.env`).
 * - `process.cwd()` — normal `cd dandi && yarn dev`
 * - `dandi/` next to this file — correct even if cwd is wrong
 * - `cwd/dandi` — monorepo: `yarn dev` from repo root with env in `dandi/.env.local`
 */
export function ensureDandiEnvLoaded(): void {
  if (dandiEnvLoaded) return;
  dandiEnvLoaded = true;
  const cwd = process.cwd();
  loadEnvConfig(cwd);
  loadEnvConfig(dandiRoot);
  loadEnvConfig(path.join(cwd, "dandi"));
}

/** Normalize env values copied from dashboards (trim + strip wrapping quotes). */
export function readEnv(name: string): string | undefined {
  ensureDandiEnvLoaded();
  const raw = process.env[name];
  if (raw === undefined || raw === "") return undefined;
  let v = raw.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v || undefined;
}

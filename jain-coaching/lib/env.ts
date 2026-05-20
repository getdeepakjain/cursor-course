import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";

let envLoaded = false;

/** Project root (`jain-coaching/`). */
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Loads `.env*` from cwd and project root into `process.env`.
 * Next.js does this automatically for `next dev`; standalone scripts (e.g. db:seed) need this.
 */
export function ensureEnvLoaded(): void {
  if (envLoaded) return;
  envLoaded = true;
  loadEnvConfig(process.cwd());
  loadEnvConfig(projectRoot);
}

/** Trim env values and strip wrapping quotes from dashboard copies. */
export function readEnv(name: string): string | undefined {
  ensureEnvLoaded();
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

export function requiredEnv(name: string): string {
  const v = readEnv(name);
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

import { loadEnvConfig } from "@next/env";

let loaded = false;

/** Normalize env values copied from dashboards (trim + strip wrapping quotes). */
export function readEnv(name: string): string | undefined {
  if (!loaded) {
    loaded = true;
    loadEnvConfig(process.cwd());
  }
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

import { readDirectDatabaseUrl } from "@/lib/db-url";
import * as http from "@/lib/api-keys-db-http";
import * as pg from "@/lib/api-keys-db-pg";

function useDirectPostgres(): boolean {
  return !!readDirectDatabaseUrl();
}

export async function listKeys() {
  if (useDirectPostgres()) return pg.listKeys();
  return http.listKeys();
}

export async function getKey(id: string) {
  if (useDirectPostgres()) return pg.getKey(id);
  return http.getKey(id);
}

export async function createKey(name: string) {
  if (useDirectPostgres()) return pg.createKey(name);
  return http.createKey(name);
}

export async function updateKey(id: string, name: string) {
  if (useDirectPostgres()) return pg.updateKey(id, name);
  return http.updateKey(id, name);
}

export async function deleteKey(id: string) {
  if (useDirectPostgres()) return pg.deleteKey(id);
  return http.deleteKey(id);
}

/** Whether the given string matches a stored API key secret (server-only). */
export async function secretExists(secret: string) {
  if (useDirectPostgres()) return pg.secretExists(secret);
  return http.secretExists(secret);
}

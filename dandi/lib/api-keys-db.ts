import { readDirectDatabaseUrl } from "@/lib/db-url";
import * as http from "@/lib/api-keys-db-http";
import * as pg from "@/lib/api-keys-db-pg";

function isDirectPostgresConfigured(): boolean {
  return !!readDirectDatabaseUrl();
}

export async function listKeys(userId: string) {
  if (isDirectPostgresConfigured()) return pg.listKeys(userId);
  return http.listKeys(userId);
}

export async function getKey(userId: string, id: string) {
  if (isDirectPostgresConfigured()) return pg.getKey(userId, id);
  return http.getKey(userId, id);
}

export async function createKey(userId: string, name: string) {
  if (isDirectPostgresConfigured()) return pg.createKey(userId, name);
  return http.createKey(userId, name);
}

export async function updateKey(userId: string, id: string, name: string) {
  if (isDirectPostgresConfigured()) return pg.updateKey(userId, id, name);
  return http.updateKey(userId, id, name);
}

export async function deleteKey(userId: string, id: string) {
  if (isDirectPostgresConfigured()) return pg.deleteKey(userId, id);
  return http.deleteKey(userId, id);
}

/** Whether the given string matches a stored API key secret (server-only). */
export async function secretExists(secret: string) {
  if (isDirectPostgresConfigured()) return pg.secretExists(secret);
  return http.secretExists(secret);
}

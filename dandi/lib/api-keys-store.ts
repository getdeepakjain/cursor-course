/** Domain types and masking helpers (no storage). */

export type ApiKeyRecord = {
  id: string;
  name: string;
  secret: string;
  createdAt: string;
  usage: number;
};

export type ApiKeyPublic = {
  id: string;
  name: string;
  maskedSecret: string;
  createdAt: string;
  usage: number;
};

export function maskSecret(secret: string): string {
  if (secret.length <= 10) return "••••••••";
  return `${secret.slice(0, 6)}…${secret.slice(-4)}`;
}

/** Tavily-style list mask: short prefix + asterisks (never the full secret). */
export function tableKeyMask(secret: string): string {
  const head = secret.slice(0, Math.min(6, secret.length));
  return `${head}${"*".repeat(28)}`;
}

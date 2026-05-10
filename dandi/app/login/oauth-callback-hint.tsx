/** Server-only: derives the exact redirect URI NextAuth sends to Google (from NEXTAUTH_URL). */

export function getGoogleOAuthCallbackUri(): string | null {
  const raw = process.env.NEXTAUTH_URL?.trim();
  if (!raw) return null;
  const base = raw.replace(/\/$/, "");
  return `${base}/api/auth/callback/google`;
}

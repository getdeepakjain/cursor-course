import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";
import { getAuthOptions } from "@/lib/auth";
import { findAppUserUuidByEmail } from "@/lib/app-users-db";

type Fail = { ok: false; status: 401 | 403; error: string };
type Ok = { ok: true; userUuid: string; email: string };

/**
 * Resolves the signed-in user for `/api/keys/*`.
 * Uses the NextAuth JWT (encrypted session token): either the session cookie
 * (sent automatically by the browser with same-origin fetch) or
 * `Authorization: Bearer <session-token>` when the caller supplies it.
 */
export async function requireKeysApiUser(request: Request): Promise<Ok | Fail> {
  const secret =
    getAuthOptions().secret ??
    process.env.NEXTAUTH_SECRET ??
    process.env.AUTH_SECRET;
  if (!secret?.trim()) {
    return { ok: false, status: 401, error: "Server auth is not configured (NEXTAUTH_SECRET)." };
  }

  const cookieStore = await cookies();
  const cookieObj = Object.fromEntries(cookieStore.getAll().map((c) => [c.name, c.value]));
  const headersObj: Record<string, string> = {};
  request.headers.forEach((v, k) => {
    headersObj[k] = v;
  });

  const token = await getToken({
    req: {
      headers: headersObj,
      cookies: cookieObj,
    } as Parameters<typeof getToken>[0]["req"],
    secret,
  });

  const emailRaw = token?.email;
  const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";
  if (!email) {
    return { ok: false, status: 401, error: "Sign in required." };
  }

  const userUuid = await findAppUserUuidByEmail(email);
  if (!userUuid) {
    return {
      ok: false,
      status: 403,
      error:
        "No matching user in the database for this account. Try signing out and signing in again after the database is configured.",
    };
  }

  return { ok: true, userUuid, email };
}

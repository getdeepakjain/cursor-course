import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { upsertGoogleAppUserIfConfigured } from "@/lib/app-users-db";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) throw new Error(`${name} is not set`);
  return value;
}

/**
 * Returns NextAuth config.
 *
 * Intentionally lazy so `next build` doesn't fail when OAuth env vars aren't set.
 * The first auth request will throw a clear error instead.
 */
export function getAuthOptions(): NextAuthOptions {
  return {
    providers: [
      GoogleProvider({
        clientId: requiredEnv("GOOGLE_CLIENT_ID"),
        clientSecret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      }),
    ],
    session: {
      strategy: "jwt",
    },
    pages: {
      signIn: "/login",
    },
    /**
     * Runs after a successful OAuth callback (with normalized `user` from Google).
     * Prefer this over `jwt` for DB writes: `user.id` is always Google's `sub` here.
     */
    events: {
      async signIn({ user, account }) {
        if (account?.provider !== "google") return;
        const googleSub =
          user?.id != null && String(user.id).trim()
            ? String(user.id).trim()
            : typeof account?.providerAccountId === "string"
              ? account.providerAccountId.trim()
              : "";
        if (!googleSub) return;
        await upsertGoogleAppUserIfConfigured({
          googleSub,
          email: typeof user?.email === "string" ? user.email.trim() || null : null,
          fullName: typeof user?.name === "string" ? user.name.trim() || null : null,
          avatarUrl: typeof user?.image === "string" && user.image.trim() ? user.image.trim() : null,
        });
      },
    },
    callbacks: {
      async jwt({ token, account, profile, user }) {
        if (account?.provider === "google" && profile) {
          const googleSub =
            "sub" in profile && typeof profile.sub === "string" && profile.sub.trim()
              ? profile.sub.trim()
              : user?.id != null && String(user.id).trim()
                ? String(user.id).trim()
                : typeof account?.providerAccountId === "string"
                  ? account.providerAccountId.trim()
                  : null;
          if (googleSub) token.googleSub = googleSub;

          let avatarUrl: string | null = null;
          if ("picture" in profile && typeof profile.picture === "string" && profile.picture.trim()) {
            avatarUrl = profile.picture.trim();
          } else if (typeof user?.image === "string" && user.image.trim()) {
            avatarUrl = user.image.trim();
          }
          if (avatarUrl) token.picture = avatarUrl;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          (session.user as { googleSub?: string }).googleSub =
            typeof token.googleSub === "string" ? token.googleSub : undefined;
          if (typeof token.picture === "string" && token.picture.trim()) {
            session.user.image = token.picture.trim();
          }
        }
        return session;
      },
    },
  };
}


import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
    callbacks: {
      async jwt({ token, account, profile }) {
        if (account?.provider === "google" && profile) {
          if ("sub" in profile && profile.sub) token.googleSub = String(profile.sub);
          // Google returns `picture`; persist on JWT so `session.user.image` stays available.
          if ("picture" in profile && typeof profile.picture === "string" && profile.picture.trim()) {
            token.picture = profile.picture.trim();
          }
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


import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { readEnv, requiredEnv } from "@/lib/env";
import {
  createUserWithPassword,
  findUserByEmail,
  findUserById,
  upsertGoogleUser,
  verifyPassword,
} from "@/lib/users-db";

export function getAuthOptions(): NextAuthOptions {
  const providers: NextAuthOptions["providers"] = [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        mode: { label: "Mode", type: "text" },
        fullName: { label: "Full Name", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        const mode = credentials?.mode ?? "login";
        if (!email || !password) return null;

        if (mode === "register") {
          const existing = await findUserByEmail(email);
          if (existing) return null;
          const user = await createUserWithPassword(
            email,
            password,
            credentials?.fullName,
          );
          return { id: user.id, email: user.email, name: user.fullName ?? undefined };
        }

        const user = await findUserByEmail(email);
        if (!user?.passwordHash) return null;
        const valid = await verifyPassword(user.passwordHash, password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.fullName ?? undefined };
      },
    }),
  ];

  const googleId = readEnv("GOOGLE_CLIENT_ID");
  const googleSecret = readEnv("GOOGLE_CLIENT_SECRET");
  if (googleId && googleSecret) {
    providers.push(
      GoogleProvider({
        clientId: googleId,
        clientSecret: googleSecret,
      }),
    );
  }

  return {
    providers,
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    events: {
      async signIn({ user, account }) {
        if (account?.provider !== "google") return;
        const googleSub =
          account.providerAccountId ||
          (typeof user.id === "string" ? user.id : "");
        if (!googleSub || !user.email) return;
        await upsertGoogleUser({
          googleSub,
          email: user.email,
          fullName: user.name,
        });
      },
    },
    callbacks: {
      async jwt({ token, user, account, trigger }) {
        if (user?.id) token.userId = user.id;
        if (account?.provider === "google" && user?.email) {
          const dbUser = await findUserByEmail(user.email);
          if (dbUser) token.userId = dbUser.id;
          token.role = dbUser?.role;
          token.profileComplete = dbUser?.profileComplete;
        }
        if (user?.id && account?.provider === "credentials") {
          const dbUser = await findUserById(user.id);
          if (dbUser) {
            token.role = dbUser.role;
            token.profileComplete = dbUser.profileComplete;
          }
        }
        if (trigger === "update" && token.userId) {
          const dbUser = await findUserById(String(token.userId));
          if (dbUser) {
            token.role = dbUser.role;
            token.profileComplete = dbUser.profileComplete;
          }
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user && token.userId) {
          (session.user as { id?: string }).id = String(token.userId);
          (session.user as { role?: string }).role =
            typeof token.role === "string" ? token.role : "student";
          (session.user as { profileComplete?: boolean }).profileComplete =
            Boolean(token.profileComplete);
        }
        return session;
      },
    },
    secret: readEnv("NEXTAUTH_SECRET") || readEnv("AUTH_SECRET"),
  };
}

export function getGoogleEnvStatus() {
  return Boolean(readEnv("GOOGLE_CLIENT_ID") && readEnv("GOOGLE_CLIENT_SECRET"));
}

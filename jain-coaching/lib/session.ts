import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import { findUserByEmail, findUserById } from "@/lib/users-db";
import type { UserProfile } from "@/lib/types";

export async function getSessionUser(): Promise<UserProfile | null> {
  const session = await getServerSession(getAuthOptions());
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (userId) return findUserById(userId);
  const email = session?.user?.email;
  if (!email) return null;
  const user = await findUserByEmail(email);
  if (!user) return null;
  const { passwordHash: _, ...profile } = user;
  return profile;
}

export async function requireAuth(): Promise<UserProfile> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireCompleteProfile(): Promise<UserProfile> {
  const user = await requireAuth();
  if (!user.profileComplete) throw new Error("PROFILE_INCOMPLETE");
  return user;
}

export async function requireAdmin(): Promise<UserProfile> {
  const user = await requireAuth();
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}

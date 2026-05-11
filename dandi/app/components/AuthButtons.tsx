"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { UserAvatar } from "./UserAvatar";

export function AuthButtons({
  className,
  callbackUrl,
  variant,
}: {
  className?: string;
  callbackUrl?: string;
  variant?: "default" | "compact";
}) {
  const { data, status } = useSession();
  const user = data?.user;
  const v = variant ?? "default";

  if (status === "loading") {
    return (
      <div className={className}>
        <span
          className={`inline-flex animate-pulse rounded-full bg-black/[.04] dark:bg-white/[.08] ${
            v === "compact" ? "h-9 w-28" : "h-10 w-40"
          }`}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: callbackUrl || "/dashboard" })}
          className={
            v === "compact"
              ? "inline-flex h-9 items-center justify-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              : "flex h-12 w-full items-center justify-center rounded-full bg-zinc-900 px-5 text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white md:w-[220px]"
          }
        >
          Continue with Google
        </button>
      </div>
    );
  }

  if (v === "compact") {
    return (
      <div className={`flex min-w-0 max-w-full items-center gap-1.5 sm:gap-2 ${className ?? ""}`}>
        <UserAvatar src={user.image} name={user.name} email={user.email} size={32} />
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="inline-flex h-9 max-w-[min(100%,7.5rem)] shrink-0 touch-manipulation items-center justify-center rounded-full border border-black/[.08] px-2.5 text-[11px] font-medium leading-tight text-zinc-900 transition-colors hover:bg-black/[.04] dark:border-white/[.16] dark:text-zinc-50 dark:hover:bg-white/[.08] sm:max-w-none sm:px-4 sm:text-sm"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <UserAvatar src={user.image} name={user.name} email={user.email} size={40} />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Signed in as{" "}
            <span className="font-medium text-zinc-950 dark:text-zinc-50">
              {user.name || user.email || "User"}
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="inline-flex h-10 items-center justify-center rounded-full border border-black/[.08] px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-black/[.04] dark:border-white/[.16] dark:text-zinc-50 dark:hover:bg-white/[.08]"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}


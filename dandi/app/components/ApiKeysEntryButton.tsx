"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

const DASHBOARD = "/dashboard";

const buttonClassName =
  "flex h-12 w-full items-center justify-center rounded-full bg-zinc-900 px-5 text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white md:w-[158px]";

/**
 * Primary CTA for the API keys app. When signed out, uses `signIn` so the OAuth flow
 * always starts (avoiding client navigations that redirect back to `/` and feel like a no-op).
 */
export function ApiKeysEntryButton() {
  const { data, status } = useSession();

  if (status === "loading") {
    return (
      <div
        className={`${buttonClassName} cursor-wait opacity-70`}
        aria-busy="true"
        aria-label="Loading"
      >
        API keys
      </div>
    );
  }

  if (data?.user) {
    return (
      <Link className={buttonClassName} href={DASHBOARD}>
        API keys
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={() => void signIn("google", { callbackUrl: DASHBOARD })}
    >
      API keys
    </button>
  );
}

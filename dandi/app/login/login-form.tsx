"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

function safeCallbackUrl(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/dashboard";
}

export function LoginForm({
  googleOAuthCallbackUri,
}: {
  /** Exact URL to paste into Google Cloud Console → OAuth client → Authorized redirect URIs */
  googleOAuthCallbackUri: string | null;
}) {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = useMemo(
    () => safeCallbackUrl(searchParams.get("callbackUrl")),
    [searchParams],
  );

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border border-neutral-200 bg-white px-8 py-12 shadow-sm">
        <p className="text-sm text-neutral-500">Checking your session…</p>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border border-neutral-200 bg-white px-8 py-12 shadow-sm">
        <p className="text-sm text-neutral-500">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white px-8 py-10 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Sign in</h1>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">
        Use your Google account to access the API keys dashboard and authenticated routes.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => void signIn("google", { callbackUrl })}
          className="flex h-12 w-full items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Continue with Google
        </button>
        <Link
          href="/"
          className="text-center text-sm font-medium text-neutral-600 underline-offset-4 hover:text-neutral-900 hover:underline"
        >
          Back to home
        </Link>
      </div>

      {googleOAuthCallbackUri ? (
        <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs leading-relaxed text-neutral-600">
          <p className="font-medium text-neutral-800">If Google shows “redirect_uri_mismatch”</p>
          <p className="mt-2">
            Google Cloud Console → APIs &amp; Services → Credentials → your OAuth 2.0 Client ID → Authorized
            redirect URIs → add this URL exactly (same host, port, and http/https as{" "}
            <code className="rounded bg-white px-1 py-0.5 text-[11px]">NEXTAUTH_URL</code>):
          </p>
          <code className="mt-2 block break-all rounded border border-neutral-200 bg-white px-2 py-2 text-[11px] text-neutral-900">
            {googleOAuthCallbackUri}
          </code>
          <p className="mt-2 text-neutral-500">
            Opening the app via <code className="text-[11px]">localhost</code> vs{" "}
            <code className="text-[11px]">127.0.0.1</code> counts as different redirect URIs. Use one consistently, or
            register both callback URLs in Google Console.
          </p>
        </div>
      ) : (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-900">
          Set <code className="rounded bg-amber-100/80 px-1 py-0.5">NEXTAUTH_URL</code> in{" "}
          <code className="rounded bg-amber-100/80 px-1 py-0.5">.env.local</code> to the origin you use in the browser
          (for example <code className="rounded bg-amber-100/80 px-1 py-0.5">http://127.0.0.1:3333</code>), then add{" "}
          <code className="break-all rounded bg-amber-100/80 px-1 py-0.5">
            {`{NEXTAUTH_URL}/api/auth/callback/google`}
          </code>{" "}
          to Authorized redirect URIs.
        </p>
      )}
    </div>
  );
}

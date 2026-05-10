import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { getGoogleOAuthCallbackUri } from "./oauth-callback-hint";

export default function LoginPage() {
  const googleOAuthCallbackUri = getGoogleOAuthCallbackUri();

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-16">
      <Suspense
        fallback={
          <div className="flex min-h-[280px] w-full max-w-md flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white px-8 py-12 shadow-sm">
            <p className="text-sm text-neutral-500">Loading…</p>
          </div>
        }
      >
        <LoginForm googleOAuthCallbackUri={googleOAuthCallbackUri} />
      </Suspense>
    </div>
  );
}

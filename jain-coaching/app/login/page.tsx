"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { SiteHeader } from "@/app/components/SiteHeader";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      mode: "login",
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(params.get("callbackUrl") ?? "/onboarding");
    router.refresh();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="card">
          <h1 className="text-xl font-semibold">Sign in</h1>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <input className="input-field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="input-field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" className="btn-primary w-full">Sign in</button>
          </form>
          <button
            type="button"
            className="btn-secondary mt-4 w-full"
            onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
          >
            Continue with Google
          </button>
          <p className="mt-4 text-center text-sm text-gray-400">
            No account? <Link href="/register" className="text-[var(--accent)]">Register</Link>
          </p>
        </div>
      </main>
    </>
  );
}

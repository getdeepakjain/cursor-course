"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SiteHeader } from "@/app/components/SiteHeader";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      fullName,
      mode: "register",
      redirect: false,
    });
    if (res?.error) {
      setError("Could not create account — email may already exist");
      return;
    }
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="card">
          <h1 className="text-xl font-semibold">Create account</h1>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <input className="input-field" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <input className="input-field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="input-field" type="password" placeholder="Password (min 8)" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" className="btn-primary w-full">Register</button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-400">
            Already have an account? <Link href="/login" className="text-[var(--accent)]">Sign in</Link>
          </p>
        </div>
      </main>
    </>
  );
}

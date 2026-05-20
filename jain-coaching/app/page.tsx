"use client";

import { useState } from "react";
import { SiteHeader } from "@/app/components/SiteHeader";

export default function LandingPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone }),
    });
    setStatus(res.ok ? "ok" : "err");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <section className="text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            NCERT & JEE Focus-Mode Testing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            Class-wise NCERT tests (Low / Medium / High), JEE Main & Advanced full mocks,
            admin-approved enrollments, and email + WhatsApp notifications.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a href="/register" className="btn-primary">
              Get started
            </a>
            <a href="/login" className="btn-secondary">
              Sign in
            </a>
          </div>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-3">
          {[
            { title: "300+ NCERT Tests", desc: "10 tests per class, subject & difficulty (9–12)" },
            { title: "JEE Main & Advanced", desc: "Official exam patterns · 3 difficulty levels each" },
            { title: "Admin enrollment", desc: "Approve requests · email & WhatsApp alerts" },
          ].map((f) => (
            <div key={f.title} className="card">
              <h3 className="font-semibold text-[var(--accent)]">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="card mx-auto mt-20 max-w-md">
          <h2 className="text-lg font-semibold">Request a callback</h2>
          <form onSubmit={submitLead} className="mt-4 space-y-3">
            <input className="input-field" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input className="input-field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="input-field" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button type="submit" className="btn-primary w-full">
              Submit
            </button>
            {status === "ok" && <p className="text-sm text-green-400">Thanks — we&apos;ll be in touch.</p>}
            {status === "err" && <p className="text-sm text-red-400">Something went wrong.</p>}
          </form>
        </section>
      </main>
      <footer className="mt-16 border-t border-[var(--border)] py-8 text-center text-sm text-gray-500">
        © Jain Coaching
      </footer>
    </>
  );
}

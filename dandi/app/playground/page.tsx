"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NotificationToast } from "@/app/dashboard/components/overview/NotificationToast";
import type { ToastVariant } from "@/app/dashboard/components/overview/types";

const TOAST_MS = 4500;

export default function PlaygroundPage() {
  const [secret, setSecret] = useState("");
  const [githubUrl, setGithubUrl] = useState("https://github.com/assafelovic/gpt-researcher");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);
  const [response, setResponse] = useState<{ status: number; bodyText: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback((message: string, variant: ToastVariant) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, variant });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, TOAST_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const key = secret.trim();
    const url = githubUrl.trim();
    if (!key) {
      showToast("Enter your API key.", "danger");
      return;
    }
    if (!url) {
      showToast("Enter a GitHub repository URL (for example https://github.com/owner/repo).", "danger");
      return;
    }

    setBusy(true);
    setResponse(null);
    try {
      const res = await fetch("/api/playground/github-summarizer", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: key, githubUrl: url }),
      });
      const raw = await res.text();
      let bodyText = raw;
      try {
        const parsed: unknown = JSON.parse(raw);
        bodyText = JSON.stringify(parsed, null, 2);
      } catch {
        /* keep raw */
      }
      setResponse({ status: res.status, bodyText });
    } catch {
      showToast("Could not reach the server. Check your connection and try again.", "danger");
    } finally {
      setBusy(false);
    }
  }

  const statusOk = response !== null && response.status >= 200 && response.status < 300;

  return (
    <div className="min-h-screen pb-10">
      <div className="pointer-events-none fixed left-1/2 top-6 z-[100] flex -translate-x-1/2 justify-center px-4">
        {toast ? (
          <NotificationToast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />
        ) : null}
      </div>

      <div className="px-4 pt-6 sm:px-6 sm:pt-8 md:px-8">
        <p className="text-xs font-medium text-neutral-500">
          Pages <span className="text-neutral-400">/</span> API Playground
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">API Playground</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
          Send a request to the GitHub README summarizer using one of your own API keys (from Overview). Keys belonging to
          other accounts are rejected with <code className="text-xs text-neutral-800">Unauthorized</code> and do not
          count toward usage. The response body appears below after each call.
        </p>
      </div>

      <div className="mt-6 px-4 sm:mt-8 sm:px-6 md:px-8">
        <div className="max-w-3xl space-y-6">
          <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm font-medium text-neutral-800">
                API key
                <input
                  type="password"
                  autoComplete="off"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="dandi_…"
                  className="mt-1.5 block w-full rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-sm text-neutral-900 outline-none ring-[#7C3AED]/30 focus:border-[#7C3AED] focus:ring-2"
                />
              </label>
              <label className="block text-sm font-medium text-neutral-800">
                GitHub repository URL
                <input
                  type="url"
                  autoComplete="off"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/assafelovic/gpt-researcher"
                  className="mt-1.5 block w-full rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-sm text-neutral-900 outline-none ring-[#7C3AED]/30 focus:border-[#7C3AED] focus:ring-2"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="w-full touch-manipulation rounded-lg bg-[#7C3AED] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#6d28d9] disabled:opacity-50 sm:w-auto"
              >
                {busy ? "Sending…" : "Send request"}
              </button>
            </form>
          </div>

          {response ? (
            <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-4 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold text-neutral-900">Response</h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusOk ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  HTTP {response.status}
                </span>
              </div>
              <pre className="mt-3 max-h-[min(480px,55vh)] overflow-auto rounded-lg border border-neutral-200 bg-white p-3 text-xs leading-relaxed text-neutral-800 sm:text-sm">
                {response.bodyText}
              </pre>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NotificationToast } from "@/app/dashboard/components/overview/NotificationToast";
import type { ToastVariant } from "@/app/dashboard/components/overview/types";

const TOAST_MS = 4500;

export default function PlaygroundPage() {
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);
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
    setBusy(true);
    try {
      const res = await fetch("/api/keys/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      const payload: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof (payload as { error: unknown }).error === "string"
            ? (payload as { error: string }).error
            : `Verification failed (${res.status})`;
        showToast(msg, "danger");
        return;
      }
      const valid =
        typeof payload === "object" &&
        payload !== null &&
        "valid" in payload &&
        (payload as { valid: unknown }).valid === true;
      if (valid) {
        showToast("This API key is valid and registered in your workspace.", "success");
      } else {
        showToast("This API key is not valid for your workspace.", "danger");
      }
    } catch {
      showToast("Could not reach the server. Check your connection and try again.", "danger");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen pb-10">
      <div className="pointer-events-none fixed left-1/2 top-6 z-[100] flex -translate-x-1/2 justify-center px-4">
        {toast ? (
          <NotificationToast message={toast.message} variant={toast.variant} onDismiss={dismissToast} />
        ) : null}
      </div>

      <div className="px-8 pt-8">
        <p className="text-xs font-medium text-neutral-500">
          Pages <span className="text-neutral-400">/</span> API Playground
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900">API Playground</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600">
          Paste a full API key to check whether it exists in this app&apos;s database. Invalid or unknown keys show a
          red notice; matches show green.
        </p>
      </div>

      <div className="mt-8 px-8">
        <div className="max-w-xl rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm">
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
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[#7C3AED] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#6d28d9] disabled:opacity-50"
            >
              {busy ? "Checking…" : "Validate key"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { getSession, useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import type { CreateResponse, KeyRow, ToastVariant } from "./types";

const TOAST_MS = 4500;
const PLAN_LIMIT = 1000;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/**
 * NextAuth stores the session as an encrypted JWT (httpOnly cookie on same-origin requests).
 * `credentials: "include"` sends that cookie automatically. If the cookie is readable (rare),
 * you can also send `Authorization: Bearer <token>` for tools that do not attach cookies.
 */
async function keysRequestInit(base?: RequestInit): Promise<RequestInit> {
  await getSession();
  const headers = new Headers(base?.headers);
  if (!headers.has("Content-Type") && base?.body != null) {
    headers.set("Content-Type", "application/json");
  }
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const cookieName = secure ? "__Secure-next-auth.session-token" : "next-auth.session-token";
  const bearer = readCookie(cookieName);
  if (bearer && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${bearer}`);
  }
  return {
    ...base,
    credentials: "include",
    headers,
  };
}

/**
 * All client state and API calls for the Overview / API keys screen.
 * Keeps `page.tsx` as a thin composition layer.
 */
export function useDashboardKeys() {
  const { status } = useSession();
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newSecretModal, setNewSecretModal] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [renameModalId, setRenameModalId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [revealLoading, setRevealLoading] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
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

  /** Loads table rows from the Next route (which talks to DB/Supabase). */
  const loadKeys = useCallback(async () => {
    setError(null);
    let receivedHttpResponse = false;
    try {
      const session = await getSession();
      if (!session?.user) {
        setKeys([]);
        throw new Error("Sign in to manage API keys.");
      }
      const res = await fetch("/api/keys", await keysRequestInit());
      receivedHttpResponse = true;
      const payload: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof (payload as { error: unknown }).error === "string"
            ? (payload as { error: string }).error
            : `Request failed (${res.status})`;
        throw new Error(msg);
      }
      const data = payload as { keys?: unknown };
      if (!Array.isArray(data.keys)) throw new Error("Invalid response from server.");
      setKeys(data.keys as KeyRow[]);
    } catch (e) {
      let msg = e instanceof Error ? e.message : "Could not load API keys.";
      const low = msg.toLowerCase();
      if (
        !receivedHttpResponse &&
        (low.includes("fetch failed") ||
          low.includes("failed to fetch") ||
          low.includes("networkerror") ||
          low.includes("load failed"))
      ) {
        msg = `${msg} — The browser did not get an HTTP response from your Next app. Confirm yarn dev is running in the dandi folder and try http://127.0.0.1:3000/dashboard on Windows (localhost IPv6 quirk).`;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setLoading(false);
      setKeys([]);
      setError("Sign in to manage API keys.");
      return;
    }
    setLoading(true);
    queueMicrotask(() => {
      void loadKeys();
    });
  }, [loadKeys, status]);

  const totalUsage = keys.reduce((acc, k) => acc + k.usage, 0);
  const usageDisplay = Math.min(totalUsage, PLAN_LIMIT);
  const usagePct = PLAN_LIMIT ? Math.min(100, (usageDisplay / PLAN_LIMIT) * 100) : 0;

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/keys", await keysRequestInit({
        method: "POST",
        body: JSON.stringify({ name: newName }),
      }));
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(typeof err.error === "string" ? err.error : "Create failed");
      }
      const created = (await res.json()) as CreateResponse;
      setNewSecretModal(created.secret);
      setNewName("");
      setShowCreateModal(false);
      await loadKeys();
      showToast("API key created successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function saveRename() {
    if (!renameModalId) return;
    setSavingId(renameModalId);
    setError(null);
    try {
      const res = await fetch(`/api/keys/${renameModalId}`, await keysRequestInit({
        method: "PUT",
        body: JSON.stringify({ name: renameValue }),
      }));
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(typeof err.error === "string" ? err.error : "Update failed");
      }
      setRenameModalId(null);
      await loadKeys();
      showToast("API key updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingId(null);
    }
  }

  async function executeDelete() {
    const id = deleteConfirmId;
    if (!id) return;
    setDeleteBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/keys/${id}`, await keysRequestInit({ method: "DELETE" }));
      if (!res.ok) throw new Error("Delete failed");
      setDeleteConfirmId(null);
      setRevealed((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await loadKeys();
      showToast("API key deleted successfully", "danger");
    } catch {
      setError("Could not delete key.");
    } finally {
      setDeleteBusy(false);
    }
  }

  async function toggleReveal(id: string) {
    if (revealed[id]) {
      setRevealed((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }
    setRevealLoading(id);
    setError(null);
    try {
      const res = await fetch(`/api/keys/${id}/secret`, await keysRequestInit());
      if (!res.ok) throw new Error("Reveal failed");
      const data = (await res.json()) as { secret: string };
      setRevealed((prev) => ({ ...prev, [id]: data.secret }));
    } catch {
      setError("Could not load secret.");
    } finally {
      setRevealLoading(null);
    }
  }

  async function copyKey(row: KeyRow) {
    const text = revealed[row.id] ?? row.maskedSecret;
    try {
      await navigator.clipboard.writeText(text);
      showToast("API key copied successfully");
    } catch {
      setError("Clipboard not available.");
    }
  }

  function openRename(row: KeyRow) {
    setRenameModalId(row.id);
    setRenameValue(row.name);
  }

  return {
    keys,
    loading,
    error,
    newName,
    setNewName,
    creating,
    newSecretModal,
    setNewSecretModal,
    showCreateModal,
    setShowCreateModal,
    renameModalId,
    setRenameModalId,
    renameValue,
    setRenameValue,
    savingId,
    revealed,
    revealLoading,
    toast,
    dismissToast,
    deleteConfirmId,
    setDeleteConfirmId,
    deleteBusy,
    handleCreate,
    saveRename,
    executeDelete,
    toggleReveal,
    copyKey,
    openRename,
    showToast,
    planLimit: PLAN_LIMIT,
    usageDisplay,
    usagePct,
  };
}

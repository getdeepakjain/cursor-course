"use client";

import { useEffect, useRef } from "react";

type ViolationPayload = {
  type: "tab_switch" | "window_blur" | "copy_paste" | "fullscreen_exit";
  metadata?: Record<string, unknown>;
};

export function useProctoring(
  attemptId: string | null,
  sessionToken: string | null,
  deviceFingerprint: string | null,
  onTerminated: () => void,
) {
  const countRef = useRef(0);

  useEffect(() => {
    if (!attemptId || !sessionToken || !deviceFingerprint) return;

    async function report(payload: ViolationPayload) {
      const res = await fetch(`/api/attempts/${attemptId}/violation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          sessionToken,
          deviceFingerprint,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      countRef.current = data.violationCount ?? countRef.current;
      if (data.terminated) onTerminated();
    }

    function onVisibility() {
      if (document.hidden) report({ type: "tab_switch" });
    }
    function onBlur() {
      report({ type: "window_blur" });
    }
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && ["c", "v", "x"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        report({ type: "copy_paste", metadata: { key: e.key } });
      }
    }
    function onFullscreenChange() {
      if (!document.fullscreenElement) {
        report({ type: "fullscreen_exit" });
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [attemptId, sessionToken, deviceFingerprint, onTerminated]);
}

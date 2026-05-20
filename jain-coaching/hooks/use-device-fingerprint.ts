"use client";

import { useEffect, useState } from "react";

export function useDeviceFingerprint() {
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const FingerprintJS = await import("@fingerprintjs/fingerprintjs");
        const agent = await FingerprintJS.load();
        const result = await agent.get();
        if (!cancelled) setFingerprint(result.visitorId);
      } catch {
        const fallback = [
          navigator.userAgent,
          navigator.language,
          screen.width,
          screen.height,
        ].join("|");
        if (!cancelled) setFingerprint(btoa(fallback).slice(0, 32));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return fingerprint;
}

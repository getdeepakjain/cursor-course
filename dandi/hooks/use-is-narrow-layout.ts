"use client";

import { useSyncExternalStore } from "react";

/** Viewport max-width aligned with Tailwind `md` (768px). */
const QUERY = "(max-width: 767px)";

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * True when the viewport is narrow (typically mobile / small tablet).
 * Server snapshot is `false` so SSR matches a desktop rail until hydrated.
 */
export function useIsNarrowLayout() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

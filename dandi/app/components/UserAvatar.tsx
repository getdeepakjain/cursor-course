"use client";

import { useCallback, useState } from "react";

type Props = {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  /** Pixel size (width and height). */
  size?: number;
  className?: string;
};

function initialsFrom(name: string | null | undefined, email: string | null | undefined): string {
  const n = (name ?? "").trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  }
  const e = (email ?? "").trim();
  if (e) return e.slice(0, 2).toUpperCase();
  return "?";
}

/**
 * Google (and other) profile photo, with gradient + initials fallback if missing or failed to load.
 */
export function UserAvatar({ src, name, email, size = 36, className = "" }: Props) {
  /** When set, avatar image failed for this exact `src` string; changing `src` clears the failure. */
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const trimmed = src?.trim() ?? "";
  const showImage = Boolean(trimmed) && failedSrc !== trimmed;
  const dim = `${size}px`;
  const initials = initialsFrom(name, email);

  const onImgError = useCallback(() => {
    setFailedSrc(trimmed);
  }, [trimmed]);

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-white shadow-sm ${
        showImage ? "bg-neutral-100" : "bg-gradient-to-br from-violet-600 to-blue-600 text-white"
      } ${className}`}
      style={{ width: dim, height: dim }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- external OAuth avatars; avoids remotePatterns for every CDN host
        <img
          key={trimmed}
          src={trimmed}
          alt=""
          width={size}
          height={size}
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          onError={onImgError}
        />
      ) : (
        <span className="font-semibold" style={{ fontSize: Math.max(10, Math.round(size * 0.36)) }}>
          {initials}
        </span>
      )}
    </span>
  );
}

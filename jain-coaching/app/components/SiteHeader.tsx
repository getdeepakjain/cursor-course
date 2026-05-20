"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function SiteHeader() {
  const { data: session } = useSession();
  const user = session?.user as { role?: string; profileComplete?: boolean } | undefined;

  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-[var(--accent)]">
          Jain Coaching
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {session ? (
            <>
              {user?.profileComplete && (
                <>
                  <Link href="/enrollments" className="hover:text-[var(--accent)]">
                    Enrollments
                  </Link>
                  <Link href="/tests" className="hover:text-[var(--accent)]">
                    Tests
                  </Link>
                </>
              )}
              {user?.role === "admin" && (
                <Link href="/admin" className="hover:text-[var(--accent)]">
                  Admin
                </Link>
              )}
              <button type="button" onClick={() => signOut()} className="btn-secondary text-sm">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-[var(--accent)]">
                Login
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

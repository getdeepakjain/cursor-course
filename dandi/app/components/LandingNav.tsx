"use client";

import Link from "next/link";
import { GitBranch, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { landingBtnPrimarySm, landingBtnSecondary } from "@/lib/landing-buttons";
import { AuthButtons } from "./AuthButtons";

const navLink =
  "hidden text-sm font-medium text-zinc-600 transition-colors hover:text-violet-700 dark:text-zinc-400 dark:hover:text-violet-300 md:inline";

export function LandingNav() {
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-[#fafaf9]/90 backdrop-blur-lg dark:border-white/5 dark:bg-[#0c0a12]/90">
      <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-x-2 gap-y-2 px-3 py-2 sm:h-16 sm:min-h-0 sm:flex-nowrap sm:gap-3 sm:px-6 sm:py-0">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 font-semibold tracking-tight text-zinc-900 dark:text-white"
        >
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25"
            aria-hidden
          >
            <GitBranch className="size-[1.125rem] sm:size-5" />
          </span>
          <span className="truncate text-sm sm:text-base">
            <span className="hidden sm:inline">Dandi</span>
            <span className="text-zinc-500 dark:text-zinc-500 sm:font-normal">
              <span className="hidden sm:inline"> · GitHub Analyzer</span>
              <span className="sm:hidden"> Dandi</span>
            </span>
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link href="#features" className={navLink}>
            Features
          </Link>
          <Link href="#api-demo" className={navLink}>
            API demo
          </Link>
          <Link href="/playground" className={navLink}>
            Playground
          </Link>
          <Link href="#pricing" className={navLink}>
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              "inline-flex items-center gap-1.5",
              status === "authenticated"
                ? landingBtnPrimarySm
                : cn(landingBtnSecondary, "h-9 border-zinc-200 px-3.5 text-sm dark:border-white/15"),
            )}
          >
            <LayoutDashboard className="size-3.5 opacity-85" aria-hidden />
            Dashboard
          </Link>
          {status === "authenticated" ? (
            <AuthButtons variant="compact" callbackUrl="/dashboard" />
          ) : status === "loading" ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-zinc-200/80 dark:bg-zinc-800" />
          ) : (
            <>
              <Link
                href="/login"
                className={cn(landingBtnSecondary, "h-9 border-zinc-200 px-3.5 text-sm dark:border-white/15")}
              >
                Log in
              </Link>
              <Link href="/login" className={landingBtnPrimarySm}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

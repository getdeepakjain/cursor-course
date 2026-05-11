"use client";

import Link from "next/link";
import { GitBranch, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { landingBtnPrimarySm, landingBtnSecondary } from "@/lib/landing-buttons";
import { AuthButtons } from "./AuthButtons";

export function LandingNav() {
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/90 bg-[#f3f3f1]/85 backdrop-blur-md supports-[backdrop-filter]:bg-[#f3f3f1]/75 dark:border-border/80 dark:bg-background/85 dark:supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-x-2 gap-y-2 px-3 py-2 sm:h-16 sm:min-h-0 sm:flex-nowrap sm:gap-3 sm:px-6 sm:py-0">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 font-semibold tracking-tight text-zinc-900 dark:text-foreground"
        >
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f5d148] text-zinc-900 shadow-md shadow-amber-950/15 ring-2 ring-amber-300/60 dark:bg-amber-400 dark:ring-amber-200/40"
            aria-hidden
          >
            <GitBranch className="size-[1.125rem] sm:size-5" />
          </span>
          <span className="truncate text-sm sm:text-base">
            <span className="hidden sm:inline">Dandi GitHub Analyzer</span>
            <span className="sm:hidden">Dandi</span>
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link
            href="#features"
            className="hidden text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-muted-foreground dark:hover:text-foreground md:inline"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="hidden text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-muted-foreground dark:hover:text-foreground md:inline"
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              "inline-flex items-center gap-1.5",
              status === "authenticated"
                ? landingBtnPrimarySm
                : cn(landingBtnSecondary, "h-9 px-3.5 text-sm dark:border-zinc-600"),
            )}
          >
            <LayoutDashboard className="size-3.5 opacity-85" aria-hidden />
            Dashboard
          </Link>
          {status === "authenticated" ? (
            <AuthButtons variant="compact" callbackUrl="/dashboard" />
          ) : status === "loading" ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-200/80 sm:h-9 sm:w-28 dark:bg-muted" />
          ) : (
            <>
              <Link href="/login" className={cn(landingBtnSecondary, "h-9 px-3.5 text-sm dark:border-zinc-600")}>
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

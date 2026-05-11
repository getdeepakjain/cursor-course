"use client";

import Link from "next/link";
import { GitBranch } from "lucide-react";
import { useSession } from "next-auth/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthButtons } from "./AuthButtons";

export function LandingNav() {
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <GitBranch className="size-6 shrink-0 sm:size-7" aria-hidden />
          <span className="truncate text-sm sm:text-base">
            <span className="hidden sm:inline">Dandi GitHub Analyzer</span>
            <span className="sm:hidden">Dandi</span>
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link
            href="#features"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline"
          >
            Pricing
          </Link>
          {status === "authenticated" ? (
            <>
              <Link href="/dashboard" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
                Dashboard
              </Link>
              <AuthButtons variant="compact" callbackUrl="/dashboard" />
            </>
          ) : status === "loading" ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-muted sm:h-9 sm:w-28" />
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                Log in
              </Link>
              <Link href="/login" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

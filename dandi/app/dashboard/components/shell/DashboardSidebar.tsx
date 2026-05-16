"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AuthButtons } from "@/app/components/AuthButtons";
import { UserAvatar } from "@/app/components/UserAvatar";
import { cn } from "@/lib/utils";
import { navActive, navDisabled, navInactive } from "./nav-styles";
import {
  ChevronLeftIcon,
  CodeBracketsIcon,
  CogIcon,
  ExternalLinkIcon,
  FileLinesIcon,
  HouseIcon,
  InvoiceIcon,
} from "./sidebar-icons";

type Props = {
  /** When false, parent collapses width; inner column stays readable at fixed width. */
  sidebarOpen: boolean;
  onCollapse: () => void;
  /** `drawer`: fixed overlay for small screens. `rail`: inline sticky column for md+. */
  layout: "rail" | "drawer";
};

/**
 * Left rail: brand, primary nav, docs link, profile stub.
 */
export function DashboardSidebar({ sidebarOpen, onCollapse, layout }: Props) {
  const drawer = layout === "drawer";
  const pathname = usePathname() ?? "";
  const { data: session } = useSession();
  const user = session?.user;
  const displayName = user?.name?.trim() || user?.email?.trim() || "Account";
  const subtitle = user?.name?.trim() && user?.email?.trim() ? user.email : "Signed in with Google";
  const overviewActive = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const playgroundActive = pathname === "/playground" || pathname.startsWith("/playground/");

  return (
    <aside
      className={cn(
        "flex flex-col overflow-hidden border-neutral-200/90 bg-white",
        drawer
          ? cn(
              "fixed left-0 top-0 z-[36] h-dvh w-[min(300px,88vw)] max-w-[320px] border-r shadow-2xl shadow-black/10 transition-transform duration-200 ease-out",
              sidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none",
            )
          : cn(
              "sticky top-0 z-30 h-screen shrink-0 shadow-[2px_0_12px_-4px_rgba(0,0,0,0.06)] transition-[width,opacity,border-color] duration-200 ease-out",
              sidebarOpen
                ? "w-[260px] border-r opacity-100"
                : "w-0 min-w-0 border-0 opacity-0 shadow-none pointer-events-none",
            ),
      )}
      aria-hidden={!sidebarOpen}
    >
      <div className="flex min-w-[260px] flex-1 flex-col">
        <div className="flex items-start justify-between gap-2 px-5 pb-2 pt-7">
          <Link href="/" className="min-w-0 flex-1">
            <span className="text-[17px] font-bold tracking-tight text-neutral-900">Dandi</span>
            <span className="text-[17px] font-bold tracking-tight text-neutral-900"> AI</span>
          </Link>
          <button
            type="button"
            onClick={onCollapse}
            className="shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Hide sidebar"
          >
            <ChevronLeftIcon />
          </button>
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-0.5 px-3">
          <Link href="/dashboard" className={overviewActive ? navActive : navInactive}>
            <HouseIcon />
            Overview
          </Link>
          <Link href="/playground" className={playgroundActive ? navActive : navInactive}>
            <CodeBracketsIcon />
            API Playground
          </Link>
          <span className={navDisabled} title="Coming soon">
            <InvoiceIcon />
            Invoices
          </span>
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className={`${navInactive} group`}
          >
            <FileLinesIcon />
            <span className="min-w-0 flex-1">Documentation</span>
            <ExternalLinkIcon className="size-3.5 shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-500" />
          </a>
        </nav>

        <div className="mt-auto border-t border-neutral-100 px-4 py-4">
          <div className="px-2 pb-3">
            <AuthButtons variant="compact" callbackUrl="/dashboard" />
          </div>
          <div className="flex items-center gap-3 rounded-lg px-2 py-1">
            <UserAvatar src={user?.image} name={user?.name} email={user?.email} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-neutral-900">{displayName}</p>
              <p className="truncate text-xs text-neutral-500">{subtitle}</p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              aria-label="Settings"
            >
              <CogIcon className="size-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

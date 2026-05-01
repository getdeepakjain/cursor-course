"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navActive, navDisabled, navInactive } from "./nav-styles";
import {
  ChevronLeftIcon,
  CodeBracketsIcon,
  CogIcon,
  ExternalLinkIcon,
  FileLinesIcon,
  FolderIcon,
  HouseIcon,
  InvoiceIcon,
  SparklesIcon,
} from "./sidebar-icons";

type Props = {
  /** When false, parent collapses width; inner column stays readable at fixed width. */
  sidebarOpen: boolean;
  onCollapse: () => void;
};

/**
 * Left rail: brand, primary nav, docs link, profile stub.
 */
export function DashboardSidebar({ sidebarOpen, onCollapse }: Props) {
  const pathname = usePathname() ?? "";
  const overviewActive = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const playgroundActive = pathname === "/playground" || pathname.startsWith("/playground/");

  return (
    <aside
      className={`sticky top-0 z-30 flex h-screen shrink-0 flex-col overflow-hidden border-neutral-200/90 bg-white shadow-[2px_0_12px_-4px_rgba(0,0,0,0.06)] transition-[width,opacity,border-color] duration-200 ease-out ${
        sidebarOpen
          ? "w-[260px] border-r opacity-100"
          : "w-0 min-w-0 border-0 opacity-0 shadow-none"
      }`}
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
          <span className={navDisabled} title="Coming soon">
            <SparklesIcon />
            Research Assistant
          </span>
          <span className={navDisabled} title="Coming soon">
            <FolderIcon />
            Research Reports
          </span>
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
          <div className="flex items-center gap-3 rounded-lg px-2 py-1">
            <div
              className="size-9 shrink-0 rounded-full bg-cover bg-center ring-2 ring-white shadow-sm"
              style={{
                backgroundImage: "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)",
              }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-neutral-900">Account</p>
              <p className="truncate text-xs text-neutral-500">Workspace</p>
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

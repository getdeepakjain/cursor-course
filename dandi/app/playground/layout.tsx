import type { ReactNode } from "react";
import { DashboardShell } from "@/app/dashboard/components/shell/DashboardShell";

/** Same chrome as `/dashboard` so sidebar navigation stays consistent. */
export default function PlaygroundLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}

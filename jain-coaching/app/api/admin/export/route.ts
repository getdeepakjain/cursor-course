import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import {
  exportMarketingLeads,
  exportStudentHistories,
  exportViolations,
} from "@/lib/attempts-db";
import { rowsToCsv } from "@/lib/csv";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const type = new URL(req.url).searchParams.get("type") ?? "histories";
    let rows: Record<string, unknown>[] = [];
    let filename = "export.csv";

    if (type === "violations") {
      rows = await exportViolations();
      filename = "violations.csv";
    } else if (type === "leads") {
      rows = await exportMarketingLeads();
      filename = "marketing-leads.csv";
    } else {
      rows = await exportStudentHistories();
      filename = "student-histories.csv";
    }

    return new NextResponse(rowsToCsv(rows), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

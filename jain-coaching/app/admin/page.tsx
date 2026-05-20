"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/app/components/SiteHeader";
import { difficultyLabel, subjectLabel, trackLabel } from "@/lib/catalog";
import type { Enrollment, EnrollmentStatus, UserProfile } from "@/lib/types";

type StudentRow = UserProfile & { attemptCount: number; violationTotal: number };

export default function AdminPage() {
  const [tab, setTab] = useState<"enrollments" | "students">("enrollments");
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | "all">("pending");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  function loadEnrollments() {
    setLoading(true);
    const q = statusFilter === "all" ? "" : `?status=${statusFilter}`;
    fetch(`/api/admin/enrollments${q}`)
      .then((r) => r.json())
      .then((d) => setEnrollments(d.enrollments ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (tab === "enrollments") loadEnrollments();
    else {
      setLoading(true);
      const q = search ? `?q=${encodeURIComponent(search)}` : "";
      fetch(`/api/admin/students${q}`)
        .then((r) => r.json())
        .then((d) => setStudents(d.students ?? []))
        .finally(() => setLoading(false));
    }
  }, [tab, statusFilter, search]);

  async function reviewEnrollment(id: string, status: "approved" | "rejected") {
    setActionId(id);
    await fetch("/api/admin/enrollments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrollmentId: id, status }),
    });
    setActionId(null);
    loadEnrollments();
  }

  function download(type: string) {
    window.location.href = `/api/admin/export?type=${type}`;
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold">Admin portal</h1>
        <p className="mt-1 text-sm text-gray-400">
          Approve enrollments, manage students, and export data
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm ${tab === "enrollments" ? "bg-[var(--accent)] text-black" : "btn-secondary"}`}
            onClick={() => setTab("enrollments")}
          >
            Enrollments
          </button>
          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm ${tab === "students" ? "bg-[var(--accent)] text-black" : "btn-secondary"}`}
            onClick={() => setTab("students")}
          >
            Students
          </button>
        </div>

        {tab === "enrollments" ? (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["all", "pending", "approved", "rejected"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`rounded-lg px-3 py-1.5 text-sm capitalize ${statusFilter === s ? "bg-[var(--accent)] text-black" : "btn-secondary"}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            {loading ? (
              <p className="mt-8 text-gray-400">Loading…</p>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--border)]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--card)] text-gray-400">
                    <tr>
                      <th className="p-3">Student</th>
                      <th className="p-3">Scope</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((e) => (
                      <tr key={e.id} className="border-t border-[var(--border)]">
                        <td className="p-3">
                          <div>{e.studentName ?? "—"}</div>
                          <div className="text-xs text-gray-500">{e.studentEmail}</div>
                        </td>
                        <td className="p-3">
                          {trackLabel(e.track)}
                          {e.classLevel ? ` · Class ${e.classLevel}` : ""}
                          {e.subject ? ` · ${subjectLabel(e.subject)}` : ""}
                          {` · ${difficultyLabel(e.difficulty)}`}
                        </td>
                        <td className="p-3 capitalize">{e.status}</td>
                        <td className="p-3">
                          {e.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="btn-primary text-xs"
                                disabled={actionId === e.id}
                                onClick={() => reviewEnrollment(e.id, "approved")}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                className="btn-secondary text-xs"
                                disabled={actionId === e.id}
                                onClick={() => reviewEnrollment(e.id, "rejected")}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" className="btn-secondary text-sm" onClick={() => download("histories")}>
                Export test histories (CSV)
              </button>
              <button type="button" className="btn-secondary text-sm" onClick={() => download("violations")}>
                Export violations (CSV)
              </button>
              <button type="button" className="btn-secondary text-sm" onClick={() => download("leads")}>
                Export marketing leads (CSV)
              </button>
            </div>
            <input
              className="input-field mt-6 max-w-md"
              placeholder="Search students…"
              value={search}
              onChange={(ev) => setSearch(ev.target.value)}
            />
            {loading ? (
              <p className="mt-8 text-gray-400">Loading…</p>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--border)]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--card)] text-gray-400">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Track</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Attempts</th>
                      <th className="p-3">Violations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id} className="border-t border-[var(--border)]">
                        <td className="p-3">{s.fullName ?? "—"}</td>
                        <td className="p-3">{s.email}</td>
                        <td className="p-3">{s.track ?? "—"}</td>
                        <td className="p-3">{s.classLevel ?? "—"}</td>
                        <td className="p-3">{s.attemptCount}</td>
                        <td className="p-3">{s.violationTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

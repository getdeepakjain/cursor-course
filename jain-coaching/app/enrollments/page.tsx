"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/app/components/SiteHeader";
import { difficultyLabel, subjectLabel, trackLabel } from "@/lib/catalog";
import type { DifficultyLevel, Enrollment, TestTrack } from "@/lib/types";

const DIFFICULTIES: DifficultyLevel[] = ["low", "medium", "high"];

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [track, setTrack] = useState<TestTrack>("class_9_12");
  const [classLevel, setClassLevel] = useState("10");
  const [subject, setSubject] = useState("mathematics");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium");
  const [profileClass, setProfileClass] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/enrollments").then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
    ])
      .then(([enr, prof]) => {
        setEnrollments(enr.enrollments ?? []);
        const cl = prof.user?.classLevel;
        if (cl) {
          setProfileClass(cl);
          setClassLevel(String(cl));
        }
        if (prof.user?.track) setTrack(prof.user.track);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function submitEnrollment(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    const body: Record<string, unknown> = { track, difficulty };
    if (track === "class_9_12") {
      body.classLevel = Number(classLevel);
      body.subject = subject;
    }
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSubmitting(false);
    if (!res.ok) {
      const d = await res.json();
      setMessage(d.error ?? "Enrollment failed");
      return;
    }
    setMessage("Enrollment request submitted. You will be notified when admin reviews it.");
    load();
  }

  const classSubjects =
    Number(classLevel) <= 10
      ? ["mathematics", "science"]
      : ["mathematics", "physics", "chemistry"];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold">Exam enrollments</h1>
        <p className="mt-1 text-sm text-gray-400">
          Enroll for your class, subject, and difficulty. Tests unlock after admin approval.
        </p>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <form onSubmit={submitEnrollment} className="card space-y-4">
            <h2 className="font-medium">New enrollment request</h2>
            <label className="block text-sm text-gray-400">Track</label>
            <select
              className="input-field"
              value={track}
              onChange={(e) => setTrack(e.target.value as TestTrack)}
            >
              <option value="class_9_12">Class 9–12 (NCERT)</option>
              <option value="jee_main">JEE Main</option>
              <option value="jee_advanced">JEE Advanced</option>
            </select>

            {track === "class_9_12" && (
              <>
                <label className="block text-sm text-gray-400">Class</label>
                <select
                  className="input-field"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  disabled={profileClass != null}
                >
                  {[9, 10, 11, 12].map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </select>
                <label className="block text-sm text-gray-400">Subject</label>
                <select
                  className="input-field"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  {classSubjects.map((s) => (
                    <option key={s} value={s}>
                      {subjectLabel(s)}
                    </option>
                  ))}
                </select>
              </>
            )}

            <label className="block text-sm text-gray-400">Difficulty</label>
            <select
              className="input-field"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {difficultyLabel(d)}
                </option>
              ))}
            </select>

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? "Submitting…" : "Request enrollment"}
            </button>
            {message && <p className="text-sm text-[var(--accent)]">{message}</p>}
          </form>

          <div>
            <h2 className="font-medium">Your enrollments</h2>
            {loading ? (
              <p className="mt-4 text-gray-400">Loading…</p>
            ) : enrollments.length === 0 ? (
              <p className="mt-4 text-sm text-gray-400">No enrollments yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {enrollments.map((e) => (
                  <li key={e.id} className="card text-sm">
                    <p className="font-medium">
                      {trackLabel(e.track)}
                      {e.classLevel ? ` · Class ${e.classLevel}` : ""}
                      {e.subject ? ` · ${subjectLabel(e.subject)}` : ""}
                      {` · ${difficultyLabel(e.difficulty)}`}
                    </p>
                    <p className="mt-1 capitalize text-gray-400">Status: {e.status}</p>
                    {e.adminNote && (
                      <p className="mt-1 text-xs text-gray-500">Note: {e.adminNote}</p>
                    )}
                    {e.status === "approved" && (
                      <Link href="/tests" className="mt-2 inline-block text-[var(--accent)]">
                        Browse tests →
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

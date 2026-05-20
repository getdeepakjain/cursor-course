"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/app/components/SiteHeader";
import { difficultyLabel, subjectLabel } from "@/lib/catalog";
import type { DifficultyLevel, Enrollment, TestSummary, TestTrack } from "@/lib/types";

const TRACKS: { id: TestTrack; label: string }[] = [
  { id: "class_9_12", label: "Class 9–12" },
  { id: "jee_main", label: "JEE Main" },
  { id: "jee_advanced", label: "JEE Advanced" },
];

export default function TestsPage() {
  const [track, setTrack] = useState<TestTrack>("class_9_12");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium");
  const [classLevel, setClassLevel] = useState<number | null>(null);
  const [subject, setSubject] = useState<string>("");
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.track) setTrack(d.user.track);
        if (d.user?.classLevel) {
          setClassLevel(d.user.classLevel);
          const subs =
            d.user.classLevel <= 10
              ? ["mathematics", "science"]
              : ["mathematics", "physics", "chemistry"];
          setSubject(subs[0]);
        }
      });
    fetch("/api/enrollments")
      .then((r) => r.json())
      .then((d) => setEnrollments(d.enrollments ?? []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ track, difficulty });
    if (track === "class_9_12" && classLevel) {
      params.set("classLevel", String(classLevel));
      if (subject) params.set("subject", subject);
    }
    fetch(`/api/tests?${params}`)
      .then((r) => r.json())
      .then((d) => setTests(d.tests ?? []))
      .finally(() => setLoading(false));
  }, [track, difficulty, classLevel, subject]);

  const approved = enrollments.filter((e) => e.status === "approved");
  const canTake = (test: TestSummary) =>
    approved.some(
      (e) =>
        e.track === test.track &&
        e.difficulty === test.difficulty &&
        (test.track !== "class_9_12" ||
          (e.classLevel === test.classLevel && e.subject === test.subject)),
    );

  const classSubjects =
    classLevel && classLevel <= 10
      ? ["mathematics", "science"]
      : classLevel
        ? ["mathematics", "physics", "chemistry"]
        : [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold">Test catalog</h1>
        <p className="mt-1 text-sm text-gray-400">
          Only tests matching an approved enrollment can be started.{" "}
          <Link href="/enrollments" className="text-[var(--accent)]">
            Manage enrollments
          </Link>
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {TRACKS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTrack(t.id)}
              className={`rounded-lg px-4 py-2 text-sm ${track === t.id ? "bg-[var(--accent)] text-black" : "btn-secondary"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {(["low", "medium", "high"] as DifficultyLevel[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`rounded-lg px-3 py-1.5 text-sm ${difficulty === d ? "bg-[var(--accent)] text-black" : "btn-secondary"}`}
            >
              {difficultyLabel(d)}
            </button>
          ))}
        </div>

        {track === "class_9_12" && classLevel && (
          <div className="mt-4 flex flex-wrap gap-2">
            {classSubjects.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSubject(s)}
                className={`rounded-lg px-3 py-1.5 text-sm ${subject === s ? "bg-[var(--accent)] text-black" : "btn-secondary"}`}
              >
                {subjectLabel(s)}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="mt-8 text-gray-400">Loading…</p>
        ) : tests.length === 0 ? (
          <p className="mt-8 text-gray-400">No tests found for these filters.</p>
        ) : (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => {
              const allowed = canTake(test);
              return (
                <li key={test.id} className="card flex flex-col justify-between">
                  <div>
                    <h2 className="font-medium">{test.title}</h2>
                    <p className="mt-1 text-xs text-gray-400">
                      {test.totalQuestions} questions · {test.durationMinutes} min
                      {test.maxMarks ? ` · ${test.maxMarks} marks` : ""}
                    </p>
                    {!allowed && (
                      <p className="mt-2 text-xs text-amber-400">
                        Requires approved enrollment
                      </p>
                    )}
                  </div>
                  {allowed ? (
                    <Link
                      href={`/attempt/${test.id}`}
                      className="btn-primary mt-4 inline-block text-center text-sm"
                    >
                      Start test
                    </Link>
                  ) : (
                    <Link
                      href="/enrollments"
                      className="btn-secondary mt-4 inline-block text-center text-sm"
                    >
                      Enroll first
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}

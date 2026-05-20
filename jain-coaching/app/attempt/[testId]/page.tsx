"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDeviceFingerprint } from "@/hooks/use-device-fingerprint";
import { useProctoring } from "@/hooks/use-proctoring";
import type { QuestionPublic } from "@/lib/types";

export default function AttemptPage() {
  const { testId } = useParams<{ testId: string }>();
  const router = useRouter();
  const fingerprint = useDeviceFingerprint();

  const [questions, setQuestions] = useState<QuestionPublic[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [endsAt, setEndsAt] = useState<Date | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [remainingSec, setRemainingSec] = useState(0);
  const [terminated, setTerminated] = useState(false);
  const [loading, setLoading] = useState(true);

  const onTerminated = useCallback(() => {
    setTerminated(true);
    router.replace(`/attempt/${testId}/violation`);
  }, [router, testId]);

  useProctoring(attemptId, sessionToken, fingerprint, onTerminated);

  useEffect(() => {
    if (!testId || !fingerprint) return;
    (async () => {
      const startRes = await fetch("/api/attempts/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId, deviceFingerprint: fingerprint }),
      });
      if (!startRes.ok) {
        setLoading(false);
        return;
      }
      const start = await startRes.json();
      setAttemptId(start.attemptId);
      setSessionToken(start.sessionToken);
      setEndsAt(new Date(start.endsAt));

      const qRes = await fetch(`/api/tests/${testId}/questions`);
      if (qRes.ok) {
        const data = await qRes.json();
        setQuestions(data.questions);
      }
      setLoading(false);
    })();
  }, [testId, fingerprint]);

  const current = questions[currentIndex];

  const saveAnswer = useCallback(
    async (questionId: string, value: unknown) => {
      if (!attemptId || !sessionToken || !fingerprint) return;
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      await fetch(`/api/attempts/${attemptId}/answer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          selectedAnswer: value,
          sessionToken,
          deviceFingerprint: fingerprint,
        }),
      });
    },
    [attemptId, sessionToken, fingerprint],
  );

  useEffect(() => {
    if (!endsAt || !attemptId || !sessionToken || !fingerprint) return;

    const tick = setInterval(async () => {
      const sec = Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000));
      setRemainingSec(sec);

      if (sec === 0) {
        await fetch(`/api/attempts/${attemptId}/submit`, { method: "POST" });
        router.replace(`/results/${attemptId}`);
        return;
      }

      const hb = await fetch(`/api/attempts/${attemptId}/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, deviceFingerprint: fingerprint }),
      });
      const data = await hb.json();
      if (data.expired) {
        router.replace(`/results/${attemptId}`);
      }
      if (data.error === "session_superseded" || data.error === "device_mismatch") {
        router.replace(`/attempt/${testId}/violation`);
      }
    }, 5000);

    return () => clearInterval(tick);
  }, [endsAt, attemptId, sessionToken, fingerprint, router, testId]);

  const timerLabel = useMemo(() => {
    const m = Math.floor(remainingSec / 60);
    const s = remainingSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, [remainingSec]);

  async function submitManual() {
    if (!attemptId) return;
    await fetch(`/api/attempts/${attemptId}/submit`, { method: "POST" });
    router.replace(`/results/${attemptId}`);
  }

  if (loading) {
    return <div className="focus-mode flex items-center justify-center p-8">Loading test…</div>;
  }

  if (terminated) return null;

  return (
    <div className="focus-mode flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <span className="text-sm font-medium text-[var(--accent)]">Focus Mode</span>
        <span className="font-mono text-lg">{timerLabel}</span>
        <button type="button" className="btn-secondary text-sm" onClick={submitManual}>
          Submit
        </button>
      </header>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[1fr_280px]">
        <section className="border-r border-[var(--border)] p-6">
          {current && (
            <>
              <p className="text-xs text-gray-500">
                Q{current.questionIndex} · {current.format}
                {current.subject ? ` · ${current.subject}` : ""}
              </p>
              <h2 className="mt-2 text-lg">{current.stem}</h2>
              <div className="mt-6 space-y-2">
                {current.format === "numerical" ? (
                  <input
                    type="number"
                    className="input-field max-w-xs"
                    value={(answers[current.id] as number) ?? ""}
                    onChange={(e) => saveAnswer(current.id, Number(e.target.value))}
                  />
                ) : (
                  current.options?.map((opt) => (
                    <label
                      key={opt}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] p-3 hover:border-[var(--accent)]"
                    >
                      <input
                        type={current.format === "mcq_multi" ? "checkbox" : "radio"}
                        name={current.id}
                        checked={
                          current.format === "mcq_multi"
                            ? Array.isArray(answers[current.id]) &&
                              (answers[current.id] as string[]).includes(opt)
                            : answers[current.id] === opt
                        }
                        onChange={() => {
                          if (current.format === "mcq_multi") {
                            const prev = (answers[current.id] as string[]) ?? [];
                            const next = prev.includes(opt)
                              ? prev.filter((x) => x !== opt)
                              : [...prev, opt];
                            saveAnswer(current.id, next);
                          } else {
                            saveAnswer(current.id, opt);
                          }
                        }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))
                )}
              </div>
              <div className="mt-8 flex gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((i) => i - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={currentIndex >= questions.length - 1}
                  onClick={() => setCurrentIndex((i) => i + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>

        <aside className="p-4">
          <p className="mb-3 text-xs font-medium uppercase text-gray-500">Question palette</p>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const answered = answers[q.id] != null && answers[q.id] !== "";
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`aspect-square rounded text-xs font-medium ${
                    idx === currentIndex
                      ? "bg-[var(--accent)] text-black"
                      : answered
                        ? "bg-green-900/50 text-green-200"
                        : "bg-[var(--card)] border border-[var(--border)]"
                  }`}
                >
                  {q.questionIndex}
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

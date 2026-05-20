import { query } from "@/lib/db";
import type { AttemptStatus, ViolationType } from "@/lib/types";
import { getQuestionAnswers } from "@/lib/tests-db";

const VIOLATION_THRESHOLD = 5;
const HEARTBEAT_STALE_MS = 30_000;

type AttemptRow = {
  id: string;
  user_id: string;
  test_id: string;
  status: AttemptStatus;
  started_at: Date;
  ends_at: Date;
  submitted_at: Date | null;
  device_fingerprint: string;
  session_token: string;
  last_heartbeat_at: Date;
  violation_count: number;
  score: string | null;
  max_score: string | null;
  time_spent_seconds: number | null;
};

export { VIOLATION_THRESHOLD };

export async function createAttempt(input: {
  userId: string;
  testId: string;
  durationMinutes: number;
  deviceFingerprint: string;
}): Promise<AttemptRow> {
  const endsAt = new Date(Date.now() + input.durationMinutes * 60_000);
  const { rows } = await query<AttemptRow>(
    `insert into test_attempts (user_id, test_id, ends_at, device_fingerprint)
     values ($1, $2, $3, $4)
     returning *`,
    [input.userId, input.testId, endsAt.toISOString(), input.deviceFingerprint],
  );
  return rows[0];
}

export async function getActiveAttemptForUser(
  userId: string,
  testId: string,
): Promise<AttemptRow | null> {
  const { rows } = await query<AttemptRow>(
    `select * from test_attempts
     where user_id = $1 and test_id = $2 and status = 'in_progress'
     order by started_at desc limit 1`,
    [userId, testId],
  );
  return rows[0] ?? null;
}

export async function getAttemptById(attemptId: string): Promise<AttemptRow | null> {
  const { rows } = await query<AttemptRow>(`select * from test_attempts where id = $1`, [attemptId]);
  return rows[0] ?? null;
}

export async function validateSessionLock(
  attempt: AttemptRow,
  deviceFingerprint: string,
  sessionToken: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (attempt.status !== "in_progress") {
    return { ok: false, reason: "attempt_not_active" };
  }
  if (attempt.device_fingerprint !== deviceFingerprint) {
    return { ok: false, reason: "device_mismatch" };
  }
  if (attempt.session_token !== sessionToken) {
    return { ok: false, reason: "session_superseded" };
  }
  const stale = Date.now() - new Date(attempt.last_heartbeat_at).getTime() > HEARTBEAT_STALE_MS;
  if (stale) {
    return { ok: false, reason: "heartbeat_stale" };
  }
  if (new Date() >= new Date(attempt.ends_at)) {
    return { ok: false, reason: "time_expired" };
  }
  return { ok: true };
}

export async function heartbeat(attemptId: string, sessionToken: string): Promise<boolean> {
  const { rowCount } = await query(
    `update test_attempts set last_heartbeat_at = now()
     where id = $1 and session_token = $2 and status = 'in_progress'`,
    [attemptId, sessionToken],
  );
  return rowCount > 0;
}

export async function supersedeSession(attemptId: string): Promise<string> {
  const newToken = crypto.randomUUID();
  await query(
    `update test_attempts set session_token = $2, last_heartbeat_at = now()
     where id = $1 and status = 'in_progress'`,
    [attemptId, newToken],
  );
  return newToken;
}

export async function saveAnswer(input: {
  attemptId: string;
  questionId: string;
  selectedAnswer: unknown;
  markedForReview?: boolean;
}) {
  await query(
    `insert into attempt_answers (attempt_id, question_id, selected_answer, is_marked_for_review, updated_at)
     values ($1, $2, $3::jsonb, $4, now())
     on conflict (attempt_id, question_id) do update set
       selected_answer = excluded.selected_answer,
       is_marked_for_review = excluded.is_marked_for_review,
       updated_at = now()`,
    [
      input.attemptId,
      input.questionId,
      JSON.stringify(input.selectedAnswer ?? null),
      input.markedForReview ?? false,
    ],
  );
}

export async function getAttemptAnswers(attemptId: string) {
  const { rows } = await query<{
    question_id: string;
    selected_answer: unknown;
    is_marked_for_review: boolean;
  }>(`select question_id, selected_answer, is_marked_for_review from attempt_answers where attempt_id = $1`, [
    attemptId,
  ]);
  return rows;
}

export async function recordViolation(input: {
  attemptId: string;
  type: ViolationType;
  metadata?: Record<string, unknown>;
}): Promise<{ violationCount: number; terminated: boolean }> {
  await query(
    `insert into attempt_violations (attempt_id, violation_type, metadata)
     values ($1, $2, $3::jsonb)`,
    [input.attemptId, input.type, JSON.stringify(input.metadata ?? {})],
  );
  const { rows } = await query<{ violation_count: number }>(
    `update test_attempts set violation_count = violation_count + 1
     where id = $1 returning violation_count`,
    [input.attemptId],
  );
  const count = rows[0]?.violation_count ?? 0;
  if (count >= VIOLATION_THRESHOLD) {
    await finalizeAttempt(input.attemptId, "terminated");
    return { violationCount: count, terminated: true };
  }
  return { violationCount: count, terminated: false };
}

function scoreAnswer(
  format: string,
  correct: unknown,
  selected: unknown,
  pos: number,
  neg: number,
): number {
  if (selected == null) return 0;
  if (format === "mcq_multi") {
    const c = Array.isArray(correct) ? [...correct].sort() : [];
    const s = Array.isArray(selected) ? [...selected].sort() : [];
    return JSON.stringify(c) === JSON.stringify(s) ? pos : -neg;
  }
  if (format === "numerical") {
    const cn = Number(correct);
    const sn = Number(selected);
    if (Number.isNaN(cn) || Number.isNaN(sn)) return 0;
    return Math.abs(cn - sn) < 0.001 ? pos : 0;
  }
  return JSON.stringify(correct) === JSON.stringify(selected) ? pos : -neg;
}

export async function finalizeAttempt(
  attemptId: string,
  status: "submitted" | "auto_submitted" | "terminated" | "expired",
): Promise<{ score: number; maxScore: number }> {
  const attempt = await getAttemptById(attemptId);
  if (!attempt || attempt.status !== "in_progress") {
    const score = Number(attempt?.score ?? 0);
    const maxScore = Number(attempt?.max_score ?? 0);
    return { score, maxScore };
  }

  const questions = await getQuestionAnswers(attempt.test_id);
  const answers = await getAttemptAnswers(attemptId);
  const answerMap = new Map(answers.map((a) => [a.question_id, a.selected_answer]));

  let score = 0;
  let maxScore = 0;
  for (const q of questions) {
    maxScore += Number(q.marks_positive);
    const selected = answerMap.get(q.id);
    score += scoreAnswer(q.format, q.correct_answer, selected, Number(q.marks_positive), Number(q.marks_negative));
  }

  const timeSpent = Math.floor(
    (Date.now() - new Date(attempt.started_at).getTime()) / 1000,
  );

  await query(
    `update test_attempts set
       status = $2,
       submitted_at = now(),
       score = $3,
       max_score = $4,
       time_spent_seconds = $5
     where id = $1`,
    [attemptId, status, score, maxScore, timeSpent],
  );

  return { score, maxScore };
}

export async function getAttemptResult(attemptId: string, userId: string) {
  const attempt = await getAttemptById(attemptId);
  if (!attempt || attempt.user_id !== userId) return null;

  const { rows: bench } = await query<{
    avg_score: string;
    avg_time_seconds: number;
    subject_accuracy: Record<string, number>;
  }>(`select avg_score, avg_time_seconds, subject_accuracy from test_benchmarks where test_id = $1`, [
    attempt.test_id,
  ]);

  const questions = await getQuestionAnswers(attempt.test_id);
  const answers = await getAttemptAnswers(attemptId);
  const answerMap = new Map(answers.map((a) => [a.question_id, a.selected_answer]));

  const bySubject: Record<string, { correct: number; total: number }> = {};
  for (const q of questions) {
    const subj = q.subject ?? "general";
    if (!bySubject[subj]) bySubject[subj] = { correct: 0, total: 0 };
    bySubject[subj].total += 1;
    const selected = answerMap.get(q.id);
    const pts = scoreAnswer(q.format, q.correct_answer, selected, Number(q.marks_positive), Number(q.marks_negative));
    if (pts > 0) bySubject[subj].correct += 1;
  }

  return {
    attemptId,
    testId: attempt.test_id,
    status: attempt.status,
    score: Number(attempt.score ?? 0),
    maxScore: Number(attempt.max_score ?? 0),
    timeSpentSeconds: attempt.time_spent_seconds ?? 0,
    violationCount: attempt.violation_count,
    subjectAccuracy: Object.fromEntries(
      Object.entries(bySubject).map(([k, v]) => [k, v.total ? v.correct / v.total : 0]),
    ),
    benchmark: bench[0]
      ? {
          avgScore: Number(bench[0].avg_score),
          avgTimeSeconds: bench[0].avg_time_seconds,
          subjectAccuracy: bench[0].subject_accuracy,
        }
      : null,
  };
}

export async function exportStudentHistories() {
  const { rows } = await query<Record<string, unknown>>(
    `select u.email, u.full_name, t.title as test_title, ta.status, ta.score, ta.max_score,
            ta.time_spent_seconds, ta.violation_count, ta.started_at, ta.submitted_at
     from test_attempts ta
     join users u on u.id = ta.user_id
     join tests t on t.id = ta.test_id
     order by ta.started_at desc`,
  );
  return rows;
}

export async function exportViolations() {
  const { rows } = await query<Record<string, unknown>>(
    `select u.email, u.full_name, t.title as test_title, av.violation_type, av.metadata, av.created_at
     from attempt_violations av
     join test_attempts ta on ta.id = av.attempt_id
     join users u on u.id = ta.user_id
     join tests t on t.id = ta.test_id
     order by av.created_at desc`,
  );
  return rows;
}

export async function exportMarketingLeads() {
  const { rows } = await query<Record<string, unknown>>(
    `select name, email, phone, source, created_at from marketing_leads order by created_at desc`,
  );
  return rows;
}

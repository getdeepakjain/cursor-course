import { query } from "@/lib/db";
import type { DifficultyLevel, QuestionPublic, TestSummary, TestTrack } from "@/lib/types";

type TestRow = {
  id: string;
  slug: string;
  title: string;
  track: TestTrack;
  class_level: number | null;
  subject: string | null;
  difficulty: DifficultyLevel;
  paper_number: number | null;
  series_index: number;
  duration_minutes: number;
  total_questions: number;
  max_marks: number | null;
};

function mapTest(row: TestRow): TestSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    track: row.track,
    classLevel: row.class_level,
    subject: row.subject,
    difficulty: row.difficulty,
    paperNumber: row.paper_number,
    seriesIndex: row.series_index,
    durationMinutes: row.duration_minutes,
    totalQuestions: row.total_questions,
    maxMarks: row.max_marks,
  };
}

export async function listTests(filters?: {
  track?: TestTrack;
  classLevel?: number;
  subject?: string;
  difficulty?: DifficultyLevel;
}): Promise<TestSummary[]> {
  const clauses: string[] = ["is_active = true"];
  const params: unknown[] = [];
  if (filters?.track) {
    params.push(filters.track);
    clauses.push(`track = $${params.length}`);
  }
  if (filters?.classLevel) {
    params.push(filters.classLevel);
    clauses.push(`class_level = $${params.length}`);
  }
  if (filters?.subject) {
    params.push(filters.subject);
    clauses.push(`subject = $${params.length}`);
  }
  if (filters?.difficulty) {
    params.push(filters.difficulty);
    clauses.push(`difficulty = $${params.length}`);
  }
  const { rows } = await query<TestRow>(
    `select * from tests where ${clauses.join(" and ")}
     order by track, class_level, subject, difficulty, series_index`,
    params,
  );
  return rows.map(mapTest);
}

export async function getTestById(id: string): Promise<TestSummary | null> {
  const { rows } = await query<TestRow>(`select * from tests where id = $1`, [id]);
  return rows[0] ? mapTest(rows[0]) : null;
}

export async function getTestQuestions(testId: string): Promise<QuestionPublic[]> {
  const { rows } = await query<{
    id: string;
    question_index: number;
    subject: string | null;
    format: QuestionPublic["format"];
    stem: string;
    options: string[] | null;
    marks_positive: string;
    marks_negative: string;
  }>(
    `select id, question_index, subject, format, stem, options, marks_positive, marks_negative
     from test_questions where test_id = $1 order by question_index`,
    [testId],
  );
  return rows.map((r) => ({
    id: r.id,
    questionIndex: r.question_index,
    subject: r.subject,
    format: r.format,
    stem: r.stem,
    options: r.options,
    marksPositive: Number(r.marks_positive),
    marksNegative: Number(r.marks_negative),
  }));
}

export async function getQuestionAnswers(testId: string) {
  const { rows } = await query<{
    id: string;
    subject: string | null;
    correct_answer: unknown;
    marks_positive: string;
    marks_negative: string;
    format: string;
  }>(
    `select id, subject, correct_answer, marks_positive, marks_negative, format
     from test_questions where test_id = $1`,
    [testId],
  );
  return rows;
}

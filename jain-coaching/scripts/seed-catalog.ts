/**
 * Seeds catalog:
 * - Class 9–10: mathematics, science × 3 difficulties × 10 tests
 * - Class 11–12: mathematics, physics, chemistry × 3 difficulties × 10 tests
 * - JEE Main: 3 difficulties × 10 mocks (75 Q, exam pattern)
 * - JEE Advanced: 3 difficulties × 10 exams × 2 papers (54 Q each)
 *
 * Run: yarn db:seed
 * Force re-seed: yarn db:seed -- --force
 */
import type { PoolClient } from "pg";
import {
  CLASS_DURATION_MINUTES,
  CLASS_LEVELS,
  CLASS_QUESTIONS_PER_TEST,
  DIFFICULTIES,
  JEE_ADVANCED_DURATION,
  JEE_ADVANCED_QUESTIONS,
  JEE_MAIN_DURATION,
  JEE_MAIN_MAX_MARKS,
  JEE_MAIN_QUESTIONS,
  TESTS_PER_BUCKET,
  subjectsForClass,
} from "../lib/catalog";
import { getPool } from "../lib/db";
import type { DifficultyLevel } from "../lib/types";

function mcqOptions(i: number) {
  return ["Option A", "Option B", "Option C", "Option D"].map(
    (o, idx) => `${o} (Q${i + 1})`,
  );
}

async function insertClassQuestions(
  client: PoolClient,
  testId: string,
  count: number,
  subject: string,
  difficulty: DifficultyLevel,
) {
  for (let i = 0; i < count; i++) {
    const correct = mcqOptions(i)[0];
    await client.query(
      `insert into test_questions (test_id, question_index, subject, format, stem, options, correct_answer, marks_positive, marks_negative)
       values ($1, $2, $3, 'mcq_single', $4, $5::jsonb, $6::jsonb, 4, 1)`,
      [
        testId,
        i + 1,
        subject,
        `[${difficulty}] Class ${subject} MCQ ${i + 1}: NCERT-aligned conceptual question.`,
        JSON.stringify(mcqOptions(i)),
        JSON.stringify(correct),
      ],
    );
  }
}

async function insertJeeMainQuestions(client: PoolClient, testId: string) {
  for (let i = 0; i < JEE_MAIN_QUESTIONS; i++) {
    const subjIdx = Math.floor(i / 25);
    const subject = ["physics", "chemistry", "mathematics"][subjIdx];
    const inSubject = i % 25;
    const format = inSubject < 20 ? "mcq_single" : "numerical";
    const neg = inSubject < 20 ? 1 : 0;
    const correct =
      format === "numerical" ? (i % 10) + 1 : mcqOptions(i)[0];
    await client.query(
      `insert into test_questions (test_id, question_index, subject, format, stem, options, correct_answer, marks_positive, marks_negative)
       values ($1, $2, $3, $4::question_format, $5, $6::jsonb, $7::jsonb, 4, $8)`,
      [
        testId,
        i + 1,
        subject,
        format,
        `JEE Main pattern Q${i + 1} (${subject}, ${format}).`,
        format.startsWith("mcq") ? JSON.stringify(mcqOptions(i)) : null,
        JSON.stringify(correct),
        neg,
      ],
    );
  }
}

async function insertJeeAdvancedQuestions(client: PoolClient, testId: string) {
  for (let i = 0; i < JEE_ADVANCED_QUESTIONS; i++) {
    const subjIdx = Math.floor(i / 18);
    const subject = ["physics", "chemistry", "mathematics"][subjIdx];
    const mod = i % 6;
    let format = "mcq_single";
    if (mod === 1) format = "mcq_multi";
    else if (mod === 2) format = "numerical";
    else if (mod === 3) format = "match";
    const pos = format === "mcq_multi" ? 4 : format === "numerical" ? 3 : 2;
    const neg = format === "numerical" ? 0 : 1;
    const correct =
      format === "mcq_multi"
        ? [mcqOptions(i)[0], mcqOptions(i)[1]]
        : format === "numerical"
          ? (i % 7) + 0.5
          : format === "match"
            ? { pairs: ["A-1", "B-2"] }
            : mcqOptions(i)[0];
    await client.query(
      `insert into test_questions (test_id, question_index, subject, format, stem, options, correct_answer, marks_positive, marks_negative)
       values ($1, $2, $3, $4::question_format, $5, $6::jsonb, $7::jsonb, $8, $9)`,
      [
        testId,
        i + 1,
        subject,
        format,
        `JEE Advanced pattern Q${i + 1} (${subject}, ${format}).`,
        format.startsWith("mcq") ? JSON.stringify(mcqOptions(i)) : null,
        JSON.stringify(correct),
        pos,
        neg,
      ],
    );
  }
}

async function clearCatalog(client: PoolClient) {
  await client.query(`
    truncate notification_logs, attempt_violations, attempt_answers, test_attempts,
      test_benchmarks, test_questions, enrollments, tests cascade
  `);
}

async function main() {
  const force = process.argv.includes("--force");
  const pool = getPool();
  const client = await pool.connect();
  try {
    const { rows: existing } = await client.query(`select count(*)::int as c from tests`);
    if (existing[0].c > 0 && !force) {
      console.log("Catalog already seeded (%d tests). Use --force to re-seed.", existing[0].c);
      return;
    }
    if (existing[0].c > 0) {
      console.log("Clearing existing catalog…");
      await clearCatalog(client);
    }

    for (const level of CLASS_LEVELS) {
      for (const subject of subjectsForClass(level)) {
        for (const difficulty of DIFFICULTIES) {
          for (let series = 1; series <= TESTS_PER_BUCKET; series++) {
            const slug = `class-${level}-${subject}-${difficulty}-${series}`;
            const { rows } = await client.query(
              `insert into tests (slug, title, track, class_level, subject, difficulty, series_index, duration_minutes, total_questions)
               values ($1, $2, 'class_9_12', $3, $4, $5, $6, $7, $8)
               returning id`,
              [
                slug,
                `Class ${level} ${subject} (${difficulty}) — Test ${series}`,
                level,
                subject,
                difficulty,
                series,
                CLASS_DURATION_MINUTES,
                CLASS_QUESTIONS_PER_TEST,
              ],
            );
            await insertClassQuestions(
              client,
              rows[0].id,
              CLASS_QUESTIONS_PER_TEST,
              subject,
              difficulty,
            );
          }
        }
      }
    }

    for (const difficulty of DIFFICULTIES) {
      for (let series = 1; series <= TESTS_PER_BUCKET; series++) {
        const slug = `jee-main-${difficulty}-${series}`;
        const { rows } = await client.query(
          `insert into tests (slug, title, track, difficulty, series_index, duration_minutes, total_questions, max_marks, marking_schema)
           values ($1, $2, 'jee_main', $3, $4, $5, $6, $7, $8::jsonb)
           returning id`,
          [
            slug,
            `JEE Main Full Mock (${difficulty}) ${series}`,
            difficulty,
            series,
            JEE_MAIN_DURATION,
            JEE_MAIN_QUESTIONS,
            JEE_MAIN_MAX_MARKS,
            JSON.stringify({ mcq: { correct: 4, wrong: -1 }, numerical: { correct: 4, wrong: 0 } }),
          ],
        );
        await insertJeeMainQuestions(client, rows[0].id);
      }
    }

    for (const difficulty of DIFFICULTIES) {
      for (let exam = 1; exam <= TESTS_PER_BUCKET; exam++) {
        for (const paper of [1, 2] as const) {
          const slug = `jee-advanced-${difficulty}-${exam}-paper-${paper}`;
          const { rows } = await client.query(
            `insert into tests (slug, title, track, difficulty, series_index, paper_number, duration_minutes, total_questions, marking_schema)
             values ($1, $2, 'jee_advanced', $3, $4, $5, $6, $7, $8::jsonb)
             returning id`,
            [
              slug,
              `JEE Advanced (${difficulty}) ${exam} — Paper ${paper}`,
              difficulty,
              exam,
              paper,
              JEE_ADVANCED_DURATION,
              JEE_ADVANCED_QUESTIONS,
              JSON.stringify({
                mcq_single: { correct: 3, wrong: -1 },
                mcq_multi: { correct: 4, wrong: -2, partial: 1 },
                numerical: { correct: 3, wrong: 0 },
                match: { correct: 2, wrong: -0.5 },
              }),
            ],
          );
          await insertJeeAdvancedQuestions(client, rows[0].id);
        }
      }
    }

    await client.query(
      `insert into test_benchmarks (test_id, avg_score, avg_time_seconds, subject_accuracy)
       select id, 65, 2400, '{"physics":0.62,"chemistry":0.58,"mathematics":0.64}'::jsonb from tests
       on conflict (test_id) do nothing`,
    );

    const { rows: final } = await client.query(`select count(*)::int as c from tests`);
    console.log("Seeded %d tests.", final[0].c);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import type { DifficultyLevel, TestSubject, TestTrack } from "@/lib/types";

/** Subjects offered per class (NCERT track). */
export function subjectsForClass(classLevel: number): TestSubject[] {
  if (classLevel === 9 || classLevel === 10) {
    return ["mathematics", "science"];
  }
  if (classLevel === 11 || classLevel === 12) {
    return ["mathematics", "physics", "chemistry"];
  }
  return [];
}

export const DIFFICULTIES: DifficultyLevel[] = ["low", "medium", "high"];

export const CLASS_LEVELS = [9, 10, 11, 12] as const;

export const CLASS_QUESTIONS_PER_TEST = 30;
export const CLASS_DURATION_MINUTES = 60;

export const JEE_MAIN_QUESTIONS = 75;
export const JEE_MAIN_DURATION = 180;
export const JEE_MAIN_MAX_MARKS = 300;

export const JEE_ADVANCED_QUESTIONS = 54;
export const JEE_ADVANCED_DURATION = 180;

export const TESTS_PER_BUCKET = 10;

export function difficultyLabel(d: DifficultyLevel): string {
  return d.charAt(0).toUpperCase() + d.slice(1);
}

export function subjectLabel(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function trackLabel(track: TestTrack): string {
  if (track === "class_9_12") return "Class 9–12";
  if (track === "jee_main") return "JEE Main";
  return "JEE Advanced";
}

export function enrollmentScopeKey(input: {
  track: TestTrack;
  classLevel: number | null;
  subject: string | null;
  difficulty: DifficultyLevel;
}): string {
  return `${input.track}:${input.classLevel ?? "na"}:${input.subject ?? "all"}:${input.difficulty}`;
}

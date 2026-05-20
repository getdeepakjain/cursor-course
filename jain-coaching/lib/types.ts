export type UserRole = "student" | "admin";
export type TestTrack = "class_9_12" | "jee_main" | "jee_advanced";
export type DifficultyLevel = "low" | "medium" | "high";
export type EnrollmentStatus = "pending" | "approved" | "rejected";
export type TestSubject =
  | "mathematics"
  | "science"
  | "physics"
  | "chemistry"
  | "english";

export type QuestionFormat = "mcq_single" | "mcq_multi" | "numerical" | "match";
export type AttemptStatus =
  | "in_progress"
  | "submitted"
  | "auto_submitted"
  | "terminated"
  | "expired";
export type ViolationType =
  | "tab_switch"
  | "window_blur"
  | "copy_paste"
  | "fullscreen_exit"
  | "other";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string | null;
  age: number | null;
  track: TestTrack | null;
  classLevel: number | null;
  schoolName: string | null;
  phone: string | null;
  whatsappConsent: boolean;
  profileComplete: boolean;
  isActive: boolean;
}

export interface TestSummary {
  id: string;
  slug: string;
  title: string;
  track: TestTrack;
  classLevel: number | null;
  subject: string | null;
  difficulty: DifficultyLevel;
  paperNumber: number | null;
  seriesIndex: number;
  durationMinutes: number;
  totalQuestions: number;
  maxMarks: number | null;
}

export interface Enrollment {
  id: string;
  userId: string;
  track: TestTrack;
  classLevel: number | null;
  subject: string | null;
  difficulty: DifficultyLevel;
  status: EnrollmentStatus;
  adminNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  studentName?: string | null;
  studentEmail?: string | null;
}

export interface QuestionPublic {
  id: string;
  questionIndex: number;
  subject: string | null;
  format: QuestionFormat;
  stem: string;
  options: string[] | null;
  marksPositive: number;
  marksNegative: number;
}

export interface AttemptSummary {
  id: string;
  testId: string;
  status: AttemptStatus;
  startedAt: string;
  endsAt: string;
  violationCount: number;
  score: number | null;
}

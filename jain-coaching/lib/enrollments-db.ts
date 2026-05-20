import { query } from "@/lib/db";
import type {
  DifficultyLevel,
  Enrollment,
  EnrollmentStatus,
  TestTrack,
} from "@/lib/types";

type EnrollmentRow = {
  id: string;
  user_id: string;
  track: TestTrack;
  class_level: number | null;
  subject: string | null;
  difficulty: DifficultyLevel;
  status: EnrollmentStatus;
  admin_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  full_name?: string | null;
  email?: string | null;
};

function mapEnrollment(row: EnrollmentRow): Enrollment {
  return {
    id: row.id,
    userId: row.user_id,
    track: row.track,
    classLevel: row.class_level,
    subject: row.subject,
    difficulty: row.difficulty,
    status: row.status,
    adminNote: row.admin_note,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    studentName: row.full_name ?? null,
    studentEmail: row.email ?? null,
  };
}

export async function createEnrollment(input: {
  userId: string;
  track: TestTrack;
  classLevel: number | null;
  subject: string | null;
  difficulty: DifficultyLevel;
}): Promise<Enrollment> {
  const { rows } = await query<EnrollmentRow>(
    `insert into enrollments (user_id, track, class_level, subject, difficulty)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [input.userId, input.track, input.classLevel, input.subject, input.difficulty],
  );
  return mapEnrollment(rows[0]);
}

export async function findEnrollmentByScope(input: {
  userId: string;
  track: TestTrack;
  classLevel: number | null;
  subject: string | null;
  difficulty: DifficultyLevel;
}): Promise<Enrollment | null> {
  const { rows } = await query<EnrollmentRow>(
    `select * from enrollments
     where user_id = $1 and track = $2
       and coalesce(class_level, -1) = coalesce($3::int, -1)
       and coalesce(subject, '') = coalesce($4, '')
       and difficulty = $5
     limit 1`,
    [input.userId, input.track, input.classLevel, input.subject, input.difficulty],
  );
  return rows[0] ? mapEnrollment(rows[0]) : null;
}

export async function listEnrollmentsForUser(userId: string): Promise<Enrollment[]> {
  const { rows } = await query<EnrollmentRow>(
    `select * from enrollments where user_id = $1 order by created_at desc`,
    [userId],
  );
  return rows.map(mapEnrollment);
}

export async function listEnrollmentsForAdmin(status?: EnrollmentStatus): Promise<Enrollment[]> {
  const { rows } = await query<EnrollmentRow>(
    status
      ? `select e.*, u.full_name, u.email
         from enrollments e
         join users u on u.id = e.user_id
         where e.status = $1
         order by e.created_at desc
         limit 500`
      : `select e.*, u.full_name, u.email
         from enrollments e
         join users u on u.id = e.user_id
         order by e.created_at desc
         limit 500`,
    status ? [status] : [],
  );
  return rows.map(mapEnrollment);
}

export async function updateEnrollmentStatus(input: {
  enrollmentId: string;
  status: EnrollmentStatus;
  adminId: string;
  adminNote?: string | null;
}): Promise<Enrollment | null> {
  const { rows } = await query<EnrollmentRow>(
    `update enrollments set
       status = $2,
       admin_note = $3,
       reviewed_by = $4,
       reviewed_at = now(),
       updated_at = now()
     where id = $1
     returning *`,
    [input.enrollmentId, input.status, input.adminNote ?? null, input.adminId],
  );
  return rows[0] ? mapEnrollment(rows[0]) : null;
}

export async function getEnrollmentById(id: string): Promise<Enrollment | null> {
  const { rows } = await query<EnrollmentRow>(
    `select e.*, u.full_name, u.email
     from enrollments e
     join users u on u.id = e.user_id
     where e.id = $1`,
    [id],
  );
  return rows[0] ? mapEnrollment(rows[0]) : null;
}

/** Approved enrollment must match the test's track, class, subject, and difficulty. */
export async function hasApprovedEnrollmentForTest(
  userId: string,
  test: {
    track: TestTrack;
    classLevel: number | null;
    subject: string | null;
    difficulty: DifficultyLevel;
  },
): Promise<boolean> {
  const subject = test.track === "class_9_12" ? test.subject : null;
  const classLevel = test.track === "class_9_12" ? test.classLevel : null;

  const { rows } = await query<{ ok: boolean }>(
    `select true as ok from enrollments
     where user_id = $1 and track = $2 and difficulty = $3
       and status = 'approved'
       and coalesce(class_level, -1) = coalesce($4::int, -1)
       and coalesce(subject, '') = coalesce($5, '')
     limit 1`,
    [userId, test.track, test.difficulty, classLevel, subject],
  );
  return Boolean(rows[0]?.ok);
}

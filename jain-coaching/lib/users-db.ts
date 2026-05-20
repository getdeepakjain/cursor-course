import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import type { TestTrack, UserProfile, UserRole } from "@/lib/types";
import { isProfileComplete } from "@/lib/utils";

type UserRow = {
  id: string;
  email: string;
  password_hash: string | null;
  google_sub: string | null;
  role: UserRole;
  full_name: string | null;
  age: number | null;
  track: TestTrack | null;
  class_level: number | null;
  school_name: string | null;
  phone: string | null;
  whatsapp_consent: boolean;
  profile_complete: boolean;
  is_active: boolean;
};

function mapUser(row: UserRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    fullName: row.full_name,
    age: row.age,
    track: row.track,
    classLevel: row.class_level,
    schoolName: row.school_name,
    phone: row.phone,
    whatsappConsent: row.whatsapp_consent,
    profileComplete: row.profile_complete,
    isActive: row.is_active,
  };
}

export async function findUserByEmail(email: string): Promise<(UserProfile & { passwordHash: string | null }) | null> {
  const { rows } = await query<UserRow>(
    `select * from users where lower(email) = lower($1) limit 1`,
    [email.trim()],
  );
  if (!rows[0]) return null;
  return { ...mapUser(rows[0]), passwordHash: rows[0].password_hash };
}

export async function findUserById(id: string): Promise<UserProfile | null> {
  const { rows } = await query<UserRow>(`select * from users where id = $1`, [id]);
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function createUserWithPassword(
  email: string,
  password: string,
  fullName?: string,
): Promise<UserProfile> {
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await query<UserRow>(
    `insert into users (email, password_hash, full_name)
     values ($1, $2, $3)
     returning *`,
    [email.trim().toLowerCase(), hash, fullName?.trim() || null],
  );
  const user = mapUser(rows[0]);
  const { notifyRegistration } = await import("@/lib/notifications");
  void notifyRegistration(user).catch(console.error);
  return user;
}

export async function upsertGoogleUser(input: {
  googleSub: string;
  email: string;
  fullName?: string | null;
}): Promise<UserProfile> {
  const { rows } = await query<UserRow>(
    `insert into users (email, google_sub, full_name)
     values ($1, $2, $3)
     on conflict (google_sub) do update set
       email = excluded.email,
       full_name = coalesce(excluded.full_name, users.full_name),
       updated_at = now()
     returning *`,
    [input.email.trim().toLowerCase(), input.googleSub, input.fullName?.trim() || null],
  );
  return mapUser(rows[0]);
}

export async function verifyPassword(hash: string | null, password: string): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export async function updateUserProfile(
  userId: string,
  data: {
    fullName: string;
    age: number;
    track: TestTrack;
    classLevel: number | null;
    schoolName: string;
    phone: string;
    whatsappConsent: boolean;
  },
): Promise<UserProfile> {
  const complete = isProfileComplete({
    fullName: data.fullName,
    age: data.age,
    track: data.track,
    classLevel: data.classLevel,
    schoolName: data.schoolName,
    phone: data.phone,
  });
  const { rows } = await query<UserRow>(
    `update users set
       full_name = $2,
       age = $3,
       track = $4,
       class_level = $5,
       school_name = $6,
       phone = $7,
       whatsapp_consent = $8,
       profile_complete = $9,
       updated_at = now()
     where id = $1
     returning *`,
    [
      userId,
      data.fullName.trim(),
      data.age,
      data.track,
      data.classLevel,
      data.schoolName.trim(),
      data.phone.trim(),
      data.whatsappConsent,
      complete,
    ],
  );
  return mapUser(rows[0]);
}

export async function findUserByIdWithContact(id: string): Promise<UserProfile | null> {
  return findUserById(id);
}

export async function listStudentsForAdmin(search?: string) {
  const term = search?.trim();
  const { rows } = await query<UserRow & { attempt_count: string; violation_total: string }>(
    term
      ? `select u.*,
           coalesce((select count(*)::text from test_attempts ta where ta.user_id = u.id), '0') as attempt_count,
           coalesce((select sum(violation_count)::text from test_attempts ta where ta.user_id = u.id), '0') as violation_total
         from users u
         where u.role = 'student'
           and (u.full_name ilike $1 or u.email ilike $1 or u.school_name ilike $1)
         order by u.created_at desc
         limit 200`
      : `select u.*,
           coalesce((select count(*)::text from test_attempts ta where ta.user_id = u.id), '0') as attempt_count,
           coalesce((select sum(violation_count)::text from test_attempts ta where ta.user_id = u.id), '0') as violation_total
         from users u
         where u.role = 'student'
         order by u.created_at desc
         limit 200`,
    term ? [`%${term}%`] : [],
  );
  return rows.map((r) => ({
    ...mapUser(r),
    attemptCount: Number(r.attempt_count),
    violationTotal: Number(r.violation_total),
  }));
}

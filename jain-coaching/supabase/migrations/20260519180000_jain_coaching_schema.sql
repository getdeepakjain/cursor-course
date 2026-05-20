-- Jain Coaching platform schema
-- Apply via Supabase SQL editor or: supabase db push

create extension if not exists "pgcrypto";

-- Users & profiles
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text,
  google_sub text unique,
  role text not null default 'student' check (role in ('student', 'admin')),
  full_name text,
  age int check (age is null or (age >= 10 and age <= 25)),
  track text check (track is null or track in ('class_9_12', 'jee_main', 'jee_advanced')),
  school_name text,
  phone text,
  whatsapp_consent boolean not null default false,
  profile_complete boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (email);
create index if not exists users_google_sub_idx on public.users (google_sub);

-- Marketing leads (landing page)
create table if not exists public.marketing_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  source text default 'landing',
  created_at timestamptz not null default now()
);

-- Test catalog
create type public.test_track as enum ('class_9_12', 'jee_main', 'jee_advanced');

create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  track public.test_track not null,
  class_level smallint check (class_level is null or class_level between 9 and 12),
  subject text,
  paper_number smallint check (paper_number is null or paper_number in (1, 2)),
  series_index smallint not null default 1,
  duration_minutes int not null default 60,
  total_questions int not null,
  max_marks int,
  marking_schema jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists tests_track_idx on public.tests (track, class_level, subject);

create type public.question_format as enum (
  'mcq_single',
  'mcq_multi',
  'numerical',
  'match'
);

create table if not exists public.test_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests (id) on delete cascade,
  question_index int not null,
  subject text,
  format public.question_format not null default 'mcq_single',
  stem text not null,
  options jsonb,
  correct_answer jsonb not null,
  marks_positive numeric(6,2) not null default 4,
  marks_negative numeric(6,2) not null default 1,
  unique (test_id, question_index)
);

create index if not exists test_questions_test_idx on public.test_questions (test_id);

-- Attempts
create type public.attempt_status as enum (
  'in_progress',
  'submitted',
  'auto_submitted',
  'terminated',
  'expired'
);

create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  test_id uuid not null references public.tests (id) on delete restrict,
  status public.attempt_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  submitted_at timestamptz,
  device_fingerprint text not null,
  session_token uuid not null default gen_random_uuid(),
  last_heartbeat_at timestamptz not null default now(),
  violation_count int not null default 0,
  score numeric(10,2),
  max_score numeric(10,2),
  time_spent_seconds int,
  unique (user_id, test_id, started_at)
);

create index if not exists test_attempts_user_idx on public.test_attempts (user_id);
create index if not exists test_attempts_status_idx on public.test_attempts (status);

create table if not exists public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.test_attempts (id) on delete cascade,
  question_id uuid not null references public.test_questions (id) on delete cascade,
  selected_answer jsonb,
  is_marked_for_review boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create type public.violation_type as enum (
  'tab_switch',
  'window_blur',
  'copy_paste',
  'fullscreen_exit',
  'other'
);

create table if not exists public.attempt_violations (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.test_attempts (id) on delete cascade,
  violation_type public.violation_type not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists attempt_violations_attempt_idx on public.attempt_violations (attempt_id);

-- Global benchmarks for analytics
create table if not exists public.test_benchmarks (
  test_id uuid primary key references public.tests (id) on delete cascade,
  avg_score numeric(10,2) not null default 0,
  avg_time_seconds int not null default 0,
  subject_accuracy jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- RLS: service role access (app uses DATABASE_URL)
alter table public.users enable row level security;
alter table public.marketing_leads enable row level security;
alter table public.tests enable row level security;
alter table public.test_questions enable row level security;
alter table public.test_attempts enable row level security;
alter table public.attempt_answers enable row level security;
alter table public.attempt_violations enable row level security;
alter table public.test_benchmarks enable row level security;

grant all on all tables in schema public to service_role;
grant usage on schema public to service_role;

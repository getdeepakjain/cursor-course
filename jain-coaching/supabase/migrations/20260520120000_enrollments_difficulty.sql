-- Difficulty levels, student class, enrollments, notification log

create type public.difficulty_level as enum ('low', 'medium', 'high');

create type public.enrollment_status as enum ('pending', 'approved', 'rejected');

alter table public.users
  add column if not exists class_level smallint
    check (class_level is null or class_level between 9 and 12);

alter table public.tests
  add column if not exists difficulty public.difficulty_level not null default 'medium';

create index if not exists tests_difficulty_idx
  on public.tests (track, class_level, subject, difficulty, series_index);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  track public.test_track not null,
  class_level smallint check (class_level is null or class_level between 9 and 12),
  subject text,
  difficulty public.difficulty_level not null,
  status public.enrollment_status not null default 'pending',
  admin_note text,
  reviewed_by uuid references public.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists enrollments_user_scope_uidx
  on public.enrollments (
    user_id,
    track,
    coalesce(class_level, -1),
    coalesce(subject, ''),
    difficulty
  );

create index if not exists enrollments_status_idx on public.enrollments (status, created_at desc);
create index if not exists enrollments_user_idx on public.enrollments (user_id);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  channel text not null check (channel in ('email', 'whatsapp')),
  recipient text not null,
  subject text,
  body text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'skipped')),
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.enrollments enable row level security;
alter table public.notification_logs enable row level security;

grant all on public.enrollments to service_role;
grant all on public.notification_logs to service_role;

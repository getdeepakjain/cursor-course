-- OAuth app users (Google). Synced on first login and updated on each sign-in.
-- Run via Supabase SQL editor or: supabase db push

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  google_sub text not null unique,
  email text,
  full_name text,
  avatar_url text,
  first_seen_at timestamptz not null default now(),
  last_login_at timestamptz not null default now()
);

comment on table public.app_users is 'Google OAuth users for Dandi; synced from NextAuth on sign-in.';

create index if not exists app_users_last_login_idx on public.app_users (last_login_at desc);

alter table public.app_users enable row level security;

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.app_users to service_role;

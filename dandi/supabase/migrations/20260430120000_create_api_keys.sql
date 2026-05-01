-- Run via Supabase SQL editor or: supabase db push
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  secret text not null,
  usage_count integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.api_keys is 'API keys for Dandi; full secret stored server-side only.';

create index if not exists api_keys_created_at_idx on public.api_keys (created_at desc);

alter table public.api_keys enable row level security;

-- Let PostgREST (used by supabase-js) access rows when using the service role / secret key.
grant usage on schema public to service_role;
grant select, insert, update, delete on table public.api_keys to service_role;

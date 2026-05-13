-- Normalize stored emails for stable lookups (NextAuth session email is compared lowercased).
update public.app_users
set email = lower(trim(email))
where email is not null and email <> lower(trim(email));

-- Scope API keys to OAuth users (public.app_users). Email from NextAuth maps to app_users.id.
alter table public.api_keys
  add column if not exists user_id uuid references public.app_users (id) on delete cascade;

create index if not exists api_keys_user_id_created_at_idx
  on public.api_keys (user_id, created_at desc);

comment on column public.api_keys.user_id is 'Owner UUID from public.app_users; keys are listed only for this user.';

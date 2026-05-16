-- Billing / plan label for dashboard (default Free).
alter table public.app_users
  add column if not exists plan_name text not null default 'Free';

comment on column public.app_users.plan_name is
  'Product plan name shown in the dashboard (e.g. Free, Pro).';

-- When a key belongs to an OAuth user, increment per-key summarizer hits alongside app_users total
-- so the API keys table reflects real GitHub summarizer usage per key.
create or replace function public.claim_github_summarizer_quota(p_secret text, p_limit int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trimmed text := trim(p_secret);
  v_user_id uuid;
  v_key_id uuid;
  v_new int;
begin
  if v_trimmed = '' then
    return jsonb_build_object('ok', false, 'error', 'invalid_secret');
  end if;

  if p_limit < 1 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  select id, user_id into v_key_id, v_user_id
  from public.api_keys
  where secret = v_trimmed
  limit 1;

  if v_key_id is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_secret');
  end if;

  if v_user_id is not null then
    update public.app_users
    set github_summarizer_usage_count = github_summarizer_usage_count + 1
    where id = v_user_id
      and github_summarizer_usage_count < p_limit
    returning github_summarizer_usage_count into v_new;

    if v_new is null then
      if exists (select 1 from public.app_users where id = v_user_id) then
        return jsonb_build_object('ok', false, 'error', 'rate_limited');
      end if;
      return jsonb_build_object('ok', false, 'error', 'invalid_secret');
    end if;

    update public.api_keys
    set github_summarizer_hits = github_summarizer_hits + 1
    where id = v_key_id;

    return jsonb_build_object('ok', true, 'usage', v_new);
  end if;

  update public.api_keys
  set github_summarizer_hits = github_summarizer_hits + 1
  where id = v_key_id
    and github_summarizer_hits < p_limit
  returning github_summarizer_hits into v_new;

  if v_new is null then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  return jsonb_build_object('ok', true, 'usage', v_new);
end;
$$;

comment on column public.api_keys.github_summarizer_hits is
  'GitHub README summarizer invocations for this API key (legacy keys without user_id use this as the quota bucket; OAuth keys also increment this for per-key dashboard usage).';

-- Approximate backfill: attribute existing per-user totals to the user’s oldest key (best effort when per-key history was not tracked).
with first_key as (
  select distinct on (user_id) id, user_id
  from public.api_keys
  where user_id is not null
  order by user_id, created_at asc
)
update public.api_keys k
set github_summarizer_hits = u.github_summarizer_usage_count
from public.app_users u
join first_key fk on fk.user_id = u.id
where k.id = fk.id
  and u.github_summarizer_usage_count > 0;

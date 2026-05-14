-- Per-user GitHub README summarizer usage (OAuth users). Keys without user_id use per-key bucket.
alter table public.app_users
  add column if not exists github_summarizer_usage_count integer not null default 0;

comment on column public.app_users.github_summarizer_usage_count is
  'Total summarizer invocations attributed to this user (across all API keys).';

alter table public.api_keys
  add column if not exists github_summarizer_hits integer not null default 0;

comment on column public.api_keys.github_summarizer_hits is
  'Summarizer hits for keys with no user_id (legacy); otherwise app_users.github_summarizer_usage_count applies.';

-- Atomically increments usage when under p_limit. One round-trip from the app.
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

comment on function public.claim_github_summarizer_quota(text, int) is
  'Increments summarizer usage for the owner of p_secret when under p_limit; returns JSON ok/error.';

revoke all on function public.claim_github_summarizer_quota(text, int) from public;
grant execute on function public.claim_github_summarizer_quota(text, int) to service_role;

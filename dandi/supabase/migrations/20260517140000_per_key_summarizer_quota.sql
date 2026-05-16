-- Per-key summarizer quota lives on api_keys.usage_count; consumption on api_keys.github_summarizer_hits.

comment on column public.api_keys.usage_count is
  'Per-key GitHub summarizer quota (allocated allowance per API key).';

comment on column public.api_keys.github_summarizer_hits is
  'GitHub README summarizer invocations consumed for this API key.';

-- Legacy rows: allocate default per-key quota before dropping user-level counter.
update public.api_keys
set usage_count = 1000
where usage_count is null or usage_count < 1;

alter table public.app_users
  drop column if exists github_summarizer_usage_count;

-- Enforce and increment only on api_keys (per-key cap = usage_count, fallback p_limit for legacy rows).
create or replace function public.claim_github_summarizer_quota(p_secret text, p_limit int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trimmed text := trim(p_secret);
  v_key_id uuid;
  v_cap int;
  v_new int;
begin
  if v_trimmed = '' then
    return jsonb_build_object('ok', false, 'error', 'invalid_secret');
  end if;

  if p_limit < 1 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  select id,
         case
           when usage_count > 0 then usage_count
           else p_limit
         end
    into v_key_id, v_cap
  from public.api_keys
  where secret = v_trimmed
  limit 1;

  if v_key_id is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_secret');
  end if;

  update public.api_keys
  set github_summarizer_hits = github_summarizer_hits + 1
  where id = v_key_id
    and github_summarizer_hits < v_cap
  returning github_summarizer_hits into v_new;

  if v_new is null then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  return jsonb_build_object('ok', true, 'usage', v_new);
end;
$$;

comment on function public.claim_github_summarizer_quota(text, int) is
  'Increments github_summarizer_hits for p_secret when under api_keys.usage_count (or p_limit if usage_count unset).';

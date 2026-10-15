create table if not exists public.kf_rate_limits (
  scope text not null,
  key_hash text not null,
  window_started_at timestamptz not null default now(),
  hits integer not null default 1 check (hits > 0),
  updated_at timestamptz not null default now(),
  primary key (scope, key_hash)
);

alter table public.kf_rate_limits enable row level security;
revoke all on table public.kf_rate_limits from anon, authenticated;

create or replace function public.kf_consume_rate_limit(
  p_key_hash text,
  p_scope text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_hits integer;
begin
  if p_limit < 1 or p_window_seconds < 1 or length(p_key_hash) <> 64 then
    return false;
  end if;

  insert into public.kf_rate_limits (
    scope, key_hash, window_started_at, hits, updated_at
  ) values (
    left(p_scope, 100), p_key_hash, now(), 1, now()
  )
  on conflict (scope, key_hash) do update set
    window_started_at = case
      when public.kf_rate_limits.window_started_at
        <= now() - make_interval(secs => p_window_seconds)
      then now()
      else public.kf_rate_limits.window_started_at
    end,
    hits = case
      when public.kf_rate_limits.window_started_at
        <= now() - make_interval(secs => p_window_seconds)
      then 1
      else public.kf_rate_limits.hits + 1
    end,
    updated_at = now()
  returning hits into current_hits;

  return current_hits <= p_limit;
end;
$$;

revoke all on function public.kf_consume_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.kf_consume_rate_limit(text, text, integer, integer)
  to service_role;

create index if not exists kf_rate_limits_updated_at_idx
  on public.kf_rate_limits (updated_at);

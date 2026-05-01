-- ===========================
-- SECURITY MIGRATIONS
-- Run in Supabase SQL Editor
-- ===========================

-- 1. Rate limits table (server-side, no RLS needed)
create table if not exists public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  count int not null default 1,
  primary key (key, window_start)
);

-- Clean up old windows automatically (Supabase cron or just let it grow small)
create index if not exists rate_limits_window_idx on public.rate_limits (window_start);

-- Atomic increment function used by the rate limiter
create or replace function public.increment_rate_limit(p_key text, p_window_start timestamptz)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into public.rate_limits (key, window_start, count)
  values (p_key, p_window_start, 1)
  on conflict (key, window_start) do update
    set count = rate_limits.count + 1
  returning count into v_count;

  -- Opportunistically delete windows older than 2 hours to keep the table small
  delete from public.rate_limits
  where window_start < now() - interval '2 hours';

  return v_count;
end;
$$;

-- 2. github_token column on profiles (for persistent GitHub OAuth token)
alter table public.profiles
  add column if not exists github_token text;

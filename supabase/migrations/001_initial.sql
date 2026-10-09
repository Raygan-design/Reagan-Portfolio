-- Run once in the Supabase SQL editor. Public roles cannot read customer records.
create table if not exists public.inquiries (
 id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
 name text not null, email text not null, topic text not null, message text not null
);
create table if not exists public.bookings (
 id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
 request_id uuid not null unique, reference text not null unique, access_hash text not null,
 service text not null check (service in ('product-design','podcast-strategy','creative-clarity','pick-my-mind')),
 duration integer not null check (duration in (30,60)), amount integer not null check (amount > 0),
 currency text not null default 'GHS' check (currency = 'GHS'), name text not null, email text not null,
 phone text not null, time_zone text not null, work text not null, goal text not null,
 material text not null default '', availability jsonb not null,
 status text not null default 'pending' check (status in ('pending','paid')),
 paid_at timestamptz, checkout_url text
);
create table if not exists public.rate_limits (key text primary key, hits integer not null, reset_at timestamptz not null);
alter table public.inquiries enable row level security;
alter table public.bookings enable row level security;
alter table public.rate_limits enable row level security;
revoke all on public.inquiries, public.bookings, public.rate_limits from anon, authenticated;
grant all on public.inquiries, public.bookings, public.rate_limits to service_role;
create or replace function public.consume_rate_limit(bucket text, maximum integer, window_seconds integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare count_now integer;
begin
  insert into public.rate_limits as limits(key,hits,reset_at)
    values(bucket,1,now()+make_interval(secs=>window_seconds))
  on conflict(key) do update set
    hits=case when limits.reset_at <= now() then 1 else limits.hits+1 end,
    reset_at=case when limits.reset_at <= now() then now()+make_interval(secs=>window_seconds) else limits.reset_at end
  returning hits into count_now;
  return count_now <= maximum;
end; $$;
revoke all on function public.consume_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.consume_rate_limit(text,integer,integer) to service_role;

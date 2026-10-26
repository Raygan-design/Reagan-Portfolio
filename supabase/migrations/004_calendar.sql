-- Owner-only Google connection. Refresh tokens are encrypted before insertion.
create table if not exists public.calendar_connections (
 id text primary key check(id='consultations'), owner_email text not null,
 encrypted_refresh_token text not null, created_at timestamptz not null default now()
);
alter table public.calendar_connections enable row level security;
revoke all on public.calendar_connections from anon,authenticated;
grant all on public.calendar_connections to service_role;
alter table public.bookings add column if not exists scheduled_start timestamptz;
alter table public.bookings add column if not exists scheduled_end timestamptz;
alter table public.bookings add column if not exists calendar_event_id text;
alter table public.bookings add column if not exists meeting_url text;
alter table public.bookings add column if not exists schedule_status text;
create table if not exists public.consultation_slots (
 reference text primary key references public.bookings(reference),
 start_at timestamptz not null, end_at timestamptz not null,
 blocked_until timestamptz not null, expires_at timestamptz not null,
 status text not null check(status in ('held','confirmed','released')),
 check(end_at>start_at), check(blocked_until=end_at+interval '30 minutes'),
 exclude using gist (tstzrange(start_at,blocked_until,'[)') with &&) where(status in ('held','confirmed'))
);
alter table public.consultation_slots enable row level security;
revoke all on public.consultation_slots from anon,authenticated;
grant all on public.consultation_slots to service_role;
create or replace function public.hold_consultation_slot(booking_ref text, slot_start timestamptz, slot_end timestamptz)
returns boolean language plpgsql security definer set search_path=public as $$
begin
 update public.consultation_slots s set status='released' where s.status='held' and s.expires_at<now()
 and not exists(select 1 from public.bookings b where b.reference=s.reference and b.status='paid');
 insert into public.consultation_slots(reference,start_at,end_at,blocked_until,expires_at,status)
 values(booking_ref,slot_start,slot_end,slot_end+interval '30 minutes',now()+interval '15 minutes','held')
 on conflict(reference) do update set status='held',expires_at=now()+interval '15 minutes'
 where consultation_slots.status<>'confirmed';
 return true;
exception when exclusion_violation then return false;
end; $$;
revoke all on function public.hold_consultation_slot(text,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.hold_consultation_slot(text,timestamptz,timestamptz) to service_role;
alter table public.booking_deliveries drop constraint if exists booking_deliveries_channel_check;
alter table public.booking_deliveries add constraint booking_deliveries_channel_check check(channel in ('dashforms','email','calendar'));

-- Only server credentials can inspect or claim outgoing booking deliveries.
create table if not exists public.booking_deliveries (
 reference text not null references public.bookings(reference),
 channel text not null check (channel in ('dashforms','email')),
 status text not null default 'pending' check (status in ('pending','sending','sent')),
 lease_token uuid, lease_until timestamptz, attempts integer not null default 0,
 sent_at timestamptz, last_error text,
 primary key(reference,channel)
);
alter table public.booking_deliveries enable row level security;
revoke all on public.booking_deliveries from anon,authenticated;
grant all on public.booking_deliveries to service_role;
create or replace function public.claim_booking_delivery(booking_ref text, delivery_channel text, delivery_token uuid)
returns text language plpgsql security definer set search_path=public as $$
declare claimed text; current_status text;
begin
 if not exists(select 1 from public.bookings where reference=booking_ref and status='paid') then
  raise exception 'A verified paid booking is required';
 end if;
 insert into public.booking_deliveries(reference,channel) values(booking_ref,delivery_channel) on conflict do nothing;
 update public.booking_deliveries set status='sending',lease_token=delivery_token,lease_until=now()+interval '90 seconds',attempts=attempts+1,last_error=null
 where reference=booking_ref and channel=delivery_channel and status<>'sent' and (status<>'sending' or lease_until<now()) returning status into claimed;
 if claimed is not null then return 'claimed'; end if;
 select status into current_status from public.booking_deliveries where reference=booking_ref and channel=delivery_channel;
 if current_status='sent' then return 'sent'; end if;
 return 'busy';
end; $$;
revoke all on function public.claim_booking_delivery(text,text,uuid) from public,anon,authenticated;
grant execute on function public.claim_booking_delivery(text,text,uuid) to service_role;

-- Run after 001_initial.sql. Files stay private; no anonymous storage policies.
alter table public.bookings add column if not exists attachments jsonb not null default '[]'::jsonb;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('booking-materials','booking-materials',false,3145728,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.presentationml.presentation','text/plain','image/png','image/jpeg'])
on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

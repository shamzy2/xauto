-- Run this in Supabase SQL Editor (Dashboard → SQL) if you do not use CLI migrations.
-- Creates table for full "selg bil" submissions + private photo bucket + RLS for admins.

create table if not exists public.sell_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  intake_id uuid,

  kjennemerke text not null,
  kilometerstand text not null,
  car_model text,
  first_registration_year integer,

  price_hint text,
  additional_comment text,

  dekk jsonb,
  skade_zones jsonb,
  skade_comment text,
  steg3 jsonb,

  full_name text not null,
  email text not null,
  phone text not null,

  photo_paths text[] not null default '{}',

  vegvesen_snapshot jsonb,

  admin_opened_at timestamptz,
  admin_opened_by uuid references auth.users (id) on delete set null
);

create index if not exists sell_submissions_created_at_idx
  on public.sell_submissions (created_at desc);

create index if not exists sell_submissions_admin_opened_at_idx
  on public.sell_submissions (admin_opened_at);

alter table public.sell_submissions enable row level security;

-- Inserts only via service role (Next.js API) — no anon insert policy.

create policy "sell_submissions_select_authenticated"
  on public.sell_submissions
  for select
  to authenticated
  using (true);

create policy "sell_submissions_update_authenticated"
  on public.sell_submissions
  for update
  to authenticated
  using (true)
  with check (true);

-- Storage: private bucket for submission photos (uploads via service role).
insert into storage.buckets (id, name, public)
values ('sell-submission-photos', 'sell-submission-photos', false)
on conflict (id) do nothing;

create policy "sell_photos_select_authenticated"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'sell-submission-photos');

-- Innbytte (trade-in) submissions — same shape as sell_submissions + FINN listing.

create table if not exists public.innbytte_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  intake_id uuid,

  kjennemerke text not null,
  kilometerstand text not null,
  car_model text,
  first_registration_year integer,

  finn_listing_url text not null,

  price_hint text,
  additional_comment text,
  wants_additional_note boolean,

  dekk jsonb,
  skade_zones jsonb,
  skade_comment text,
  steg3 jsonb,

  full_name text not null,
  email text not null,
  phone text not null,

  photo_paths text[] not null default '{}',

  vegvesen_snapshot jsonb,

  submitter_ip text,
  submitter_user_agent text,

  admin_opened_at timestamptz,
  admin_opened_by uuid references auth.users (id) on delete set null
);

create index if not exists innbytte_submissions_created_at_idx
  on public.innbytte_submissions (created_at desc);

create index if not exists innbytte_submissions_admin_opened_at_idx
  on public.innbytte_submissions (admin_opened_at);

alter table public.innbytte_submissions enable row level security;

create policy "innbytte_submissions_select_authenticated"
  on public.innbytte_submissions
  for select
  to authenticated
  using (true);

create policy "innbytte_submissions_update_authenticated"
  on public.innbytte_submissions
  for update
  to authenticated
  using (true)
  with check (true);

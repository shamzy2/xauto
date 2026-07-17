-- Ephemeral intake step (regnr/km + Vegvesen payload) before full submission.
-- Written by Next.js API with service role — replaces local JSON on Vercel.

create table if not exists public.vehicle_intakes (
  id uuid primary key,
  created_at timestamptz not null default now(),

  kjennemerke text not null,
  kilometerstand text not null,
  first_registration_year integer,
  vegvesen_payload jsonb not null
);

create index if not exists vehicle_intakes_created_at_idx
  on public.vehicle_intakes (created_at desc);

alter table public.vehicle_intakes enable row level security;

-- No anon/authenticated policies: access only via service role from API routes.

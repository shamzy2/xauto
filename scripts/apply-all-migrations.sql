-- X Bilsenter / xauto — full schema from fjordauto migrations
-- Apply against a NEW empty Supabase project (SQL Editor or psql).

-- >>> supabase/migrations/20260503120000_sell_submissions.sql
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


-- >>> supabase/migrations/20260503140000_innbytte_submissions.sql
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


-- >>> supabase/migrations/20260503150000_admin_submission_notes.sql
-- Internal admin notes on submissions (not visible to customers).

alter table public.sell_submissions
  add column if not exists admin_notes text;

alter table public.innbytte_submissions
  add column if not exists admin_notes text;


-- >>> supabase/migrations/20260503160000_realtime_submissions.sql
-- Live admin list: Postgres → Supabase Realtime → browser → router.refresh().
-- If this errors with «already exists», tabellen er allerede i publikasjonen — OK.
-- Innbytte: egen migrasjon 20260503160100_realtime_innbytte_submissions.sql (rekkefølge).

alter publication supabase_realtime add table public.sell_submissions;


-- >>> supabase/migrations/20260503160100_realtime_innbytte_submissions.sql
-- Realtime for innbytte-innsendinger (samme mønster som sell_submissions).

alter publication supabase_realtime add table public.innbytte_submissions;


-- >>> supabase/migrations/20260504120000_sell_submissions_wants_note.sql
alter table public.sell_submissions
  add column if not exists wants_additional_note boolean;


-- >>> supabase/migrations/20260504200000_contact_submissions.sql
-- Kontaktskjema («Send henvendelse») — lagres for admin-innboks.

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  full_name text not null,
  email text not null,
  phone text,
  message text not null,

  submitter_ip text,
  submitter_user_agent text,

  admin_opened_at timestamptz,
  admin_opened_by uuid references auth.users (id) on delete set null,
  admin_notes text
);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

create index if not exists contact_submissions_admin_opened_at_idx
  on public.contact_submissions (admin_opened_at);

alter table public.contact_submissions enable row level security;

create policy "contact_submissions_select_authenticated"
  on public.contact_submissions
  for select
  to authenticated
  using (true);

create policy "contact_submissions_update_authenticated"
  on public.contact_submissions
  for update
  to authenticated
  using (true)
  with check (true);


-- >>> supabase/migrations/20260504210000_realtime_contact_submissions.sql
-- Realtime for kontakt-henvendelser (samme mønster som sell / innbytte).

alter publication supabase_realtime add table public.contact_submissions;


-- >>> supabase/migrations/20260505140000_sell_submissions_submitter_meta.sql
alter table public.sell_submissions
  add column if not exists submitter_ip text;

alter table public.sell_submissions
  add column if not exists submitter_user_agent text;


-- >>> supabase/migrations/20260506120000_vehicle_intakes.sql
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


-- >>> supabase/migrations/20260507120000_accounting_cars_costs.sql
-- Accounting: inventory cars, per-car costs, and general (overhead) costs.

create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  stock_number text not null,
  kjennemerke text not null,
  make_model text,
  status text not null default 'in_stock'
    check (status in ('in_stock', 'sold', 'written_off')),

  acquired_at date,
  sold_at date,
  purchase_price numeric(12, 2),
  sale_price numeric(12, 2),
  notes text,

  constraint cars_stock_number_unique unique (stock_number)
);

create index if not exists cars_status_idx on public.cars (status);
create index if not exists cars_acquired_at_idx on public.cars (acquired_at desc nulls last);

create table if not exists public.car_costs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  car_id uuid not null references public.cars (id) on delete cascade,
  cost_date date not null,
  amount numeric(12, 2) not null check (amount >= 0),
  description text not null,
  category text
);

create index if not exists car_costs_car_id_idx on public.car_costs (car_id);
create index if not exists car_costs_cost_date_idx on public.car_costs (cost_date desc);

create table if not exists public.general_costs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  cost_date date not null,
  amount numeric(12, 2) not null check (amount >= 0),
  description text not null,
  category text
);

create index if not exists general_costs_cost_date_idx
  on public.general_costs (cost_date desc);

alter table public.cars enable row level security;
alter table public.car_costs enable row level security;
alter table public.general_costs enable row level security;

create policy "cars_select_authenticated"
  on public.cars for select to authenticated using (true);

create policy "cars_insert_authenticated"
  on public.cars for insert to authenticated with check (true);

create policy "cars_update_authenticated"
  on public.cars for update to authenticated using (true) with check (true);

create policy "car_costs_select_authenticated"
  on public.car_costs for select to authenticated using (true);

create policy "car_costs_insert_authenticated"
  on public.car_costs for insert to authenticated with check (true);

create policy "car_costs_update_authenticated"
  on public.car_costs for update to authenticated using (true) with check (true);

create policy "general_costs_select_authenticated"
  on public.general_costs for select to authenticated using (true);

create policy "general_costs_insert_authenticated"
  on public.general_costs for insert to authenticated with check (true);

create policy "general_costs_update_authenticated"
  on public.general_costs for update to authenticated using (true) with check (true);


-- >>> supabase/migrations/20260507130000_cars_delete_policy.sql
-- Allow authenticated admin users to delete cars.

create policy "cars_delete_authenticated"
  on public.cars
  for delete
  to authenticated
  using (true);


-- >>> supabase/migrations/20260508120000_accounting_norwegian_compliance.sql
-- Norwegian accounting: MVA (ex. amounts in P&L), settings, bilag reference.

create table if not exists public.accounting_settings (
  id integer primary key check (id = 1),
  updated_at timestamptz not null default now(),
  company_name text,
  org_number text,
  vat_registered boolean not null default true,
  prices_ex_vat boolean not null default true,
  opening_equity numeric(12, 2) not null default 0,
  bank_balance numeric(12, 2) not null default 0,
  accounts_payable numeric(12, 2) not null default 0
);

insert into public.accounting_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.cars
  add column if not exists purchase_vat_amount numeric(12, 2),
  add column if not exists sale_vat_amount numeric(12, 2);

alter table public.car_costs
  add column if not exists vat_amount numeric(12, 2) not null default 0,
  add column if not exists receipt_ref text;

alter table public.general_costs
  add column if not exists vat_amount numeric(12, 2) not null default 0,
  add column if not exists receipt_ref text;

alter table public.accounting_settings enable row level security;

create policy "accounting_settings_select_authenticated"
  on public.accounting_settings for select to authenticated using (true);

create policy "accounting_settings_update_authenticated"
  on public.accounting_settings for update to authenticated using (true) with check (true);


-- >>> supabase/migrations/20260509120000_receipts_and_accounting_start.sql
-- Receipt file storage + optional regnskapsstart (mid-year / not yet incorporated).

alter table public.car_costs
  add column if not exists receipt_storage_path text;

alter table public.general_costs
  add column if not exists receipt_storage_path text;

alter table public.accounting_settings
  add column if not exists accounting_start_date date;

insert into storage.buckets (id, name, public)
values ('accounting-receipts', 'accounting-receipts', false)
on conflict (id) do nothing;

create policy "accounting_receipts_select_authenticated"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'accounting-receipts');


-- >>> supabase/migrations/20260510120000_company_financing.sql
-- Finansiering for bilforhandler: aksjonærlån, kassekreditt, banklån.

create table if not exists public.company_financing (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  type text not null check (type in ('shareholder_loan', 'bank_credit', 'bank_loan')),
  name text not null,
  credit_limit numeric(12, 2),
  notes text
);

create table if not exists public.financing_movements (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  financing_id uuid not null references public.company_financing (id) on delete cascade,
  movement_date date not null,
  amount numeric(12, 2) not null,
  description text
);

create index if not exists financing_movements_financing_id_idx
  on public.financing_movements (financing_id);

create index if not exists financing_movements_movement_date_idx
  on public.financing_movements (movement_date);

alter table public.company_financing enable row level security;
alter table public.financing_movements enable row level security;

create policy "company_financing_select_authenticated"
  on public.company_financing for select to authenticated using (true);

create policy "company_financing_insert_authenticated"
  on public.company_financing for insert to authenticated with check (true);

create policy "company_financing_update_authenticated"
  on public.company_financing for update to authenticated using (true) with check (true);

create policy "company_financing_delete_authenticated"
  on public.company_financing for delete to authenticated using (true);

create policy "financing_movements_select_authenticated"
  on public.financing_movements for select to authenticated using (true);

create policy "financing_movements_insert_authenticated"
  on public.financing_movements for insert to authenticated with check (true);

create policy "financing_movements_delete_authenticated"
  on public.financing_movements for delete to authenticated using (true);



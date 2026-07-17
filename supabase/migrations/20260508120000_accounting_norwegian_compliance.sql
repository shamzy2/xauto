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

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

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

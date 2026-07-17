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

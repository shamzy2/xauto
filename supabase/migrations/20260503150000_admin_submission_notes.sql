-- Internal admin notes on submissions (not visible to customers).

alter table public.sell_submissions
  add column if not exists admin_notes text;

alter table public.innbytte_submissions
  add column if not exists admin_notes text;

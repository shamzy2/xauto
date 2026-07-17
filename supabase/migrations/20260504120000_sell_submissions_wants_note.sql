alter table public.sell_submissions
  add column if not exists wants_additional_note boolean;

alter table public.sell_submissions
  add column if not exists submitter_ip text;

alter table public.sell_submissions
  add column if not exists submitter_user_agent text;

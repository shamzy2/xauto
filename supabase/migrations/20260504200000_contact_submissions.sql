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

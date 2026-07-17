-- Realtime for innbytte-innsendinger (samme mønster som sell_submissions).

alter publication supabase_realtime add table public.innbytte_submissions;

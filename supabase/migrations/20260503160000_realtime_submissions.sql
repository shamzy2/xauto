-- Live admin list: Postgres → Supabase Realtime → browser → router.refresh().
-- If this errors with «already exists», tabellen er allerede i publikasjonen — OK.
-- Innbytte: egen migrasjon 20260503160100_realtime_innbytte_submissions.sql (rekkefølge).

alter publication supabase_realtime add table public.sell_submissions;

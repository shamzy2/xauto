import "server-only";

/** PostgREST / Postgres-feil fra `.insert()` — brukes til hint + debug. */
export type SubmissionInsertError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

/** Kort operatør-hint basert på typiske Supabase-feil (norsk). */
export function hintForSubmissionInsertError(
  err: SubmissionInsertError,
): string | null {
  const m = (err.message ?? "").toLowerCase();
  if (m.includes("does not exist") || m.includes("finnes ikke")) {
    return "Tabell eller kolonne mangler sannsynligvis. Kjør migrasjonene i supabase/migrations mot Supabase-prosjektet (SQL Editor eller supabase db push), og sjekk at SUPABASE_SERVICE_ROLE_KEY og URL er satt.";
  }
  if (m.includes("jwt") || m.includes("invalid api key")) {
    return "Supabase-nøkkel eller URL ser ut til å være ugyldig. Sjekk SUPABASE_SERVICE_ROLE_KEY og NEXT_PUBLIC_SUPABASE_URL i miljøvariabler.";
  }
  if (
    m.includes("row-level security") ||
    m.includes("rls") ||
    m.includes("violates row-level security")
  ) {
    return "Databasen avviste lagring (RLS). Serveren må bruke SUPABASE_SERVICE_ROLE_KEY (service role), ikke anon/publishable-nøkkel.";
  }
  if (m.includes("permission denied")) {
    return "Tilgang mot Supabase ble nektet. Sjekk service role-nøkkel og at migrasjoner er kjørt.";
  }
  return null;
}

export function submissionInsertDebugPayload(
  err: SubmissionInsertError,
): Record<string, string | undefined> {
  return {
    message: err.message,
    code: err.code,
    details: err.details,
    hint: err.hint,
  };
}

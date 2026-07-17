import "server-only";

import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdmin() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !key) {
    throw new Error(
      "Mangler Supabase service role (SUPABASE_SERVICE_ROLE_KEY og URL).",
    );
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

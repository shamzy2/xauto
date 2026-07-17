import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublicEnv } from "./public-env";

export async function createClient() {
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error(
      "Supabase er ikke konfigurert (mangler NEXT_PUBLIC_SUPABASE_URL og anon/publishable key).",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* Server Component — middleware oppdaterer sesjon */
        }
      },
    },
  });
}

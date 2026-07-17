/** URL + anon/publishable key for browser, middleware, and cookie-based server client. */
export function getSupabasePublicEnv(): { url: string; anonKey: string } | null {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    "";
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

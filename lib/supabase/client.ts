"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicEnv } from "./public-env";

export function createClient() {
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error("Supabase miljøvariabler mangler.");
  }
  return createBrowserClient(env.url, env.anonKey);
}

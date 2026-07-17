import "server-only";

import { loadEnvConfig } from "@next/env";

/**
 * Central place for server-side configuration and secrets.
 * Import only from Route Handlers, Server Components, Server Actions, or other `server-only` modules.
 * Never import from client components — use Route Handlers as a BFF instead.
 */

/** Names of env vars that hold secrets or private config (document each in `.env.example`). */
export const secretEnvNames = [
  "EXTERNAL_API_KEY",
  "CRM_WEBHOOK_SECRET",
  /** HMAC for HttpOnly cookie on /selg/steg-2 (session-bound intake view). */
  "INTAKE_VIEW_SECRET",
] as const;

/**
 * `vercel dev` can inject env vars from the linked project before Next merges `.env.local`.
 * An empty string counts as "set", so file-based values never apply. Drop empties so
 * `loadEnvConfig` can fill from `.env.local`.
 */
for (const name of secretEnvNames) {
  const raw = process.env[name];
  if (raw !== undefined && raw.trim() === "") {
    delete process.env[name];
  }
}

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production", {
  info: () => {},
  error: () => {},
}, true);

export type SecretEnvName = (typeof secretEnvNames)[number];

function readEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (raw == null || raw === "") return undefined;
  const trimmed = raw.trim();
  return trimmed === "" ? undefined : trimmed;
}

/** Safe optional read — returns undefined if unset. */
export function getSecret(name: SecretEnvName): string | undefined {
  return readEnv(name);
}

/**
 * Use when a code path cannot run without the value (e.g. calling a paid API).
 * Throws in development so misconfiguration is obvious.
 */
export function requireSecret(name: SecretEnvName): string {
  const value = readEnv(name);
  if (!value) {
    throw new Error(`[env] Missing required secret: ${name}`);
  }
  return value;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextResponse } from "next/server";

import { requireSecret } from "./env";

/** HttpOnly cookie — proves this browser completed POST /api/sell/intake (not shareable). */
export const INTAKE_VIEW_COOKIE = "fjord_intake_view";

/** Egen cookie for innbytte-flyten, slik at den ikke blandes med /selg (samme nettleser). */
export const INTAKE_VIEW_COOKIE_INNBYTTE = "fjord_innbytte_intake_view";

/** Token levetid (uavhengig av nettleser-session for sikkerhet). */
const MAX_AGE_SEC = 60 * 60; // 1 hour

function key(): string {
  return requireSecret("INTAKE_VIEW_SECRET");
}

export function signIntakeViewToken(intakeId: string): string {
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const payload = Buffer.from(
    JSON.stringify({ id: intakeId, exp }),
    "utf8",
  ).toString("base64url");
  const sig = createHmac("sha256", key()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyIntakeViewToken(
  token: string | undefined,
): { id: string } | null {
  if (!token?.includes(".")) return null;
  const dot = token.lastIndexOf(".");
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", key()).update(payload).digest("hex");
  if (sig.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  let parsed: { id?: string; exp?: number };
  try {
    parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { id?: string; exp?: number };
  } catch {
    return null;
  }
  if (typeof parsed.id !== "string" || typeof parsed.exp !== "number")
    return null;
  if (Date.now() > parsed.exp) return null;
  return { id: parsed.id };
}

/** HttpOnly session-cookie (ingen maxAge) — slettes når nettleseren lukkes. */
export function intakeViewCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

/** Etter fullført innsending — ny «Selg bilen» skal starte på regnr/km, ikke gammel oppsummering. */
export function expireIntakeViewCookie(res: NextResponse): void {
  res.cookies.set(INTAKE_VIEW_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** Etter fullført innbytte-innsending — tømmer kun innbytte-intake. */
export function expireInnbytteIntakeViewCookie(res: NextResponse): void {
  res.cookies.set(INTAKE_VIEW_COOKIE_INNBYTTE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

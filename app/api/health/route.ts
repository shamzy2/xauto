import { NextResponse } from "next/server";

/** Public health check — no secrets. Use for uptime monitors. */
export async function GET() {
  return NextResponse.json({ ok: true, service: "xauto" });
}

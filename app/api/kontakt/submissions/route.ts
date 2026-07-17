import { NextResponse } from "next/server";

import {
  hintForSubmissionInsertError,
  submissionInsertDebugPayload,
} from "@/lib/server/submissionInsertError";
import { createSupabaseAdmin } from "@/lib/server/supabaseAdmin";
import {
  clientIpFromRequest,
  userAgentFromRequest,
} from "@/lib/server/submitterClientMeta";

export const runtime = "nodejs";

const MAX_NAME = 200;
const MAX_EMAIL = 320;
const MAX_PHONE = 40;
const MAX_MESSAGE = 10_000;

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  const submitterIp = clientIpFromRequest(req);
  const submitterUserAgent = userAgentFromRequest(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const fullName = typeof o.name === "string" ? o.name.trim() : "";
  const email = typeof o.email === "string" ? o.email.trim() : "";
  const phone =
    typeof o.phone === "string" ? o.phone.trim().slice(0, MAX_PHONE) : "";
  const message = typeof o.message === "string" ? o.message.trim() : "";

  if (!fullName || fullName.length > MAX_NAME) {
    return NextResponse.json({ error: "Navn mangler eller er for langt." }, { status: 400 });
  }
  if (!email || email.length > MAX_EMAIL || !isValidEmail(email)) {
    return NextResponse.json({ error: "Ugyldig e-post." }, { status: 400 });
  }
  if (!message || message.length > MAX_MESSAGE) {
    return NextResponse.json(
      { error: "Melding mangler eller er for lang." },
      { status: 400 },
    );
  }

  let admin: ReturnType<typeof createSupabaseAdmin>;
  try {
    admin = createSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "Serveren er ikke konfigurert for lagring." },
      { status: 503 },
    );
  }

  const { data, error } = await admin
    .from("contact_submissions")
    .insert({
      full_name: fullName,
      email,
      phone: phone.length > 0 ? phone : null,
      message,
      submitter_ip: submitterIp,
      submitter_user_agent: submitterUserAgent,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("contact_submissions insert", submissionInsertDebugPayload(error));
    const hint = hintForSubmissionInsertError(error);
    return NextResponse.json(
      {
        error: "Kunne ikke sende henvendelsen. Prøv igjen om litt.",
        hint: hint ?? undefined,
      },
      { status: 500 },
    );
  }

  if (!data?.id) {
    return NextResponse.json(
      { error: "Kunne ikke sende henvendelsen." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id: data.id });
}

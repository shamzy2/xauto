import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_NOTES_LEN = 20_000;

function normalizeNotes(raw: string): string | null {
  const t = raw.trim();
  return t.length === 0 ? null : t.slice(0, MAX_NOTES_LEN);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Ugyldig id." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig JSON." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || !("notes" in body)) {
    return NextResponse.json(
      { error: "Feltet «notes» mangler (streng eller null)." },
      { status: 400 },
    );
  }

  const notesVal = (body as { notes: unknown }).notes;
  if (notesVal !== null && typeof notesVal !== "string") {
    return NextResponse.json(
      { error: "«notes» må være en streng eller null." },
      { status: 400 },
    );
  }

  if (typeof notesVal === "string" && notesVal.length > MAX_NOTES_LEN) {
    return NextResponse.json(
      { error: `Notatet kan maks være ${MAX_NOTES_LEN} tegn.` },
      { status: 400 },
    );
  }

  const notes =
    notesVal === null ? null : normalizeNotes(notesVal);

  const { data: sellRow, error: sellErr } = await supabase
    .from("sell_submissions")
    .update({ admin_notes: notes })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (sellErr) {
    console.error(sellErr);
    return NextResponse.json(
      { error: "Kunne ikke lagre notat." },
      { status: 500 },
    );
  }
  if (sellRow) {
    return NextResponse.json({ ok: true, table: "sell_submissions" });
  }

  const { data: innRow, error: innErr } = await supabase
    .from("innbytte_submissions")
    .update({ admin_notes: notes })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (innErr) {
    console.error(innErr);
    return NextResponse.json(
      { error: "Kunne ikke lagre notat." },
      { status: 500 },
    );
  }
  if (innRow) {
    return NextResponse.json({ ok: true, table: "innbytte_submissions" });
  }

  const { data: contactRow, error: contactErr } = await supabase
    .from("contact_submissions")
    .update({ admin_notes: notes })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (contactErr) {
    console.error(contactErr);
    return NextResponse.json(
      { error: "Kunne ikke lagre notat." },
      { status: 500 },
    );
  }
  if (contactRow) {
    return NextResponse.json({ ok: true, table: "contact_submissions" });
  }

  return NextResponse.json({ error: "Innsending ikke funnet." }, { status: 404 });
}

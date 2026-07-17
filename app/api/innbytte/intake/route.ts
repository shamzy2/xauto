import { NextResponse } from "next/server";

import {
  INTAKE_VIEW_COOKIE_INNBYTTE,
  intakeViewCookieOptions,
  signIntakeViewToken,
} from "@/lib/server/intakeViewCookie";
import {
  fetchKjoretoydata,
  firstRegistrationYearFromVegvesenPayload,
  SELL_INTAKE_LOOKUP_USER_MESSAGE,
} from "@/lib/server/vegvesen";
import {
  saveVehicleIntake,
  VEHICLE_INTAKE_SAVE_USER_MESSAGE,
  type VehicleIntakeRecord,
} from "@/lib/server/vehicleIntakeStore";

export const runtime = "nodejs";

function normalizeKjennemerke(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const regnrRaw = (body as { regnr?: unknown }).regnr;
  const kmRaw = (body as { kilometer?: unknown }).kilometer;

  if (typeof regnrRaw !== "string" || typeof kmRaw !== "string") {
    return NextResponse.json(
      { error: "regnr og kilometer må være tekst." },
      { status: 400 },
    );
  }

  const kjennemerke = normalizeKjennemerke(regnrRaw);
  const kilometerstand = kmRaw.trim();

  if (kjennemerke.length < 2 || kjennemerke.length > 7) {
    return NextResponse.json(
      { error: "Oppgi et gyldig kjennemerke (2–7 tegn)." },
      { status: 400 },
    );
  }
  if (!kilometerstand || !/^\d[\d\s.,]*$/.test(kilometerstand.replace(/\s/g, ""))) {
    return NextResponse.json(
      { error: "Oppgi kilometerstand med tall." },
      { status: 400 },
    );
  }

  let payload: unknown;
  try {
    payload = await fetchKjoretoydata(kjennemerke);
  } catch {
    return NextResponse.json(
      { error: SELL_INTAKE_LOOKUP_USER_MESSAGE },
      { status: 502 },
    );
  }

  const firstRegistrationYear = firstRegistrationYearFromVegvesenPayload(payload);

  let record: VehicleIntakeRecord;
  try {
    record = await saveVehicleIntake({
      kjennemerke,
      kilometerstand,
      firstRegistrationYear,
      vegvesenPayload: payload,
    });
  } catch {
    return NextResponse.json(
      { error: VEHICLE_INTAKE_SAVE_USER_MESSAGE },
      { status: 500 },
    );
  }

  const res = NextResponse.json({
    firstRegistrationYear,
  });
  res.cookies.set(
    INTAKE_VIEW_COOKIE_INNBYTTE,
    signIntakeViewToken(record.id),
    intakeViewCookieOptions(),
  );
  return res;
}

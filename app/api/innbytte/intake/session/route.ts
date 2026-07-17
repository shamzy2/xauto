import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  INTAKE_VIEW_COOKIE_INNBYTTE,
  verifyIntakeViewToken,
} from "@/lib/server/intakeViewCookie";
import {
  carModelFromVegvesenPayload,
  firstRegistrationYearFromVegvesenPayload,
} from "@/lib/server/vegvesen";
import { vehicleFlowSummaryFromPayload } from "@/lib/server/vehicleFlowSummary";
import { getVehicleIntakeById } from "@/lib/server/vehicleIntakeStore";

export const runtime = "nodejs";

function displayKjennemerke(normalized: string): string {
  const s = normalized.replace(/\s/g, "").toUpperCase();
  const m = /^([A-ZÆØÅ]{2})([A-Z0-9]+)$/.exec(s);
  if (m) return `${m[1]} ${m[2]}`;
  return s;
}

/** Innbytte — samme payload som selg-session, men leser egen HttpOnly-cookie. */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(INTAKE_VIEW_COOKIE_INNBYTTE)?.value;
  const verified = verifyIntakeViewToken(token);
  if (!verified) {
    return NextResponse.json(
      { error: "Ingen tilgang. Start med skjemaet på forrige steg." },
      { status: 403 },
    );
  }

  const record = await getVehicleIntakeById(verified.id);
  if (!record) {
    return NextResponse.json({ error: "Ikke funnet." }, { status: 404 });
  }

  const firstRegistrationYear =
    record.firstRegistrationYear ??
    firstRegistrationYearFromVegvesenPayload(record.vegvesenPayload);

  const carModel =
    carModelFromVegvesenPayload(record.vegvesenPayload) ?? "Kjøretøy";

  const kjennemerke = displayKjennemerke(record.kjennemerke);

  return NextResponse.json({
    carModel,
    firstRegistrationYear,
    kjennemerke,
    kilometerstand: record.kilometerstand,
    vehicleSummary: vehicleFlowSummaryFromPayload(record.vegvesenPayload),
  });
}

import { randomUUID } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  INTAKE_VIEW_COOKIE_INNBYTTE,
  expireInnbytteIntakeViewCookie,
  verifyIntakeViewToken,
} from "@/lib/server/intakeViewCookie";
import {
  hintForSubmissionInsertError,
  submissionInsertDebugPayload,
} from "@/lib/server/submissionInsertError";
import { createSupabaseAdmin } from "@/lib/server/supabaseAdmin";
import {
  clientIpFromRequest,
  userAgentFromRequest,
} from "@/lib/server/submitterClientMeta";
import { getVehicleIntakeById } from "@/lib/server/vehicleIntakeStore";
import {
  SUBMISSION_MAX_PHOTO_EACH_BYTES,
  SUBMISSION_MAX_PHOTOS_COUNT,
  SUBMISSION_MAX_PHOTOS_TOTAL_BYTES,
  SUBMISSION_PER_PHOTO_TOO_LARGE_MESSAGE,
  SUBMISSION_UPLOAD_TOO_LARGE_MESSAGE,
} from "@/lib/submissionUploadLimits";
import { carModelFromVegvesenPayload } from "@/lib/server/vegvesen";

export const runtime = "nodejs";

function normalizeKjennemerke(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

function parsePayload(raw: string | null): Record<string, unknown> | null {
  if (raw == null || raw === "") return null;
  try {
    const o = JSON.parse(raw) as unknown;
    return o && typeof o === "object" && !Array.isArray(o)
      ? (o as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const submitterIp = clientIpFromRequest(req);
  const submitterUserAgent = userAgentFromRequest(req);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Ugyldig skjema." }, { status: 400 });
  }

  const fullName = String(form.get("fullName") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const finnListingUrl = String(form.get("finnListingUrl") ?? "").trim();

  if (!fullName) {
    return NextResponse.json({ error: "Navn mangler." }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Ugyldig e-post." }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ error: "Telefon mangler." }, { status: 400 });
  }
  if (!finnListingUrl || finnListingUrl.length < 3) {
    return NextResponse.json(
      { error: "FINN-kode eller lenke til annonse mangler." },
      { status: 400 },
    );
  }

  const payload = parsePayload(String(form.get("payload") ?? ""));
  if (!payload) {
    return NextResponse.json({ error: "Ugyldig nyttedata." }, { status: 400 });
  }

  const priceHint =
    typeof payload.priceHint === "string" ? payload.priceHint.trim() : "";
  const additionalComment =
    typeof payload.additionalComment === "string"
      ? payload.additionalComment.trim()
      : "";
  const wantsAdditionalNote =
    typeof payload.wantsAdditionalNote === "boolean"
      ? payload.wantsAdditionalNote
      : null;

  const dekk = payload.dekk ?? null;
  const skadeZones = payload.skadeZones ?? null;
  const skadeComment =
    typeof payload.skadeComment === "string" ? payload.skadeComment.trim() : "";
  const steg3 = payload.steg3 ?? null;

  let kjennemerke = "";
  let kilometerstand = "";
  let carModel: string | null = null;
  let firstRegistrationYear: number | null = null;
  let intakeId: string | null = null;
  let vegvesenSnapshot: unknown = null;

  const cookieStore = await cookies();
  const verified = verifyIntakeViewToken(
    cookieStore.get(INTAKE_VIEW_COOKIE_INNBYTTE)?.value,
  );

  if (verified) {
    const record = await getVehicleIntakeById(verified.id);
    if (record) {
      intakeId = record.id;
      kjennemerke = normalizeKjennemerke(record.kjennemerke);
      kilometerstand = record.kilometerstand.trim();
      carModel = carModelFromVegvesenPayload(record.vegvesenPayload);
      firstRegistrationYear = record.firstRegistrationYear;
      vegvesenSnapshot = record.vegvesenPayload;
    }
  }

  if (!kjennemerke || !kilometerstand) {
    const fallback = payload.intakeSummary as Record<string, unknown> | undefined;
    if (
      fallback &&
      typeof fallback.kjennemerke === "string" &&
      typeof fallback.kilometerstand === "string"
    ) {
      kjennemerke = normalizeKjennemerke(fallback.kjennemerke);
      kilometerstand = fallback.kilometerstand.trim();
      if (typeof fallback.carModel === "string") {
        carModel = fallback.carModel;
      }
      if (typeof fallback.firstRegistrationYear === "number") {
        firstRegistrationYear = fallback.firstRegistrationYear;
      }
    }
  }

  if (!kjennemerke || kjennemerke.length < 2 || !kilometerstand) {
    return NextResponse.json(
      { error: "Kunne ikke koble til kjøretøy (start på nytt på /innbytte)." },
      { status: 400 },
    );
  }

  const photoFiles: File[] = [];
  for (const [key, value] of form.entries()) {
    if (!key.startsWith("photo_")) continue;
    if (typeof value === "string") continue;
    const blob = value as Blob;
    if (blob.size <= 0) continue;
    const fallbackName = `${key}.jpg`;
    const file =
      blob instanceof File
        ? blob
        : new File([blob], fallbackName, {
            type: blob.type || "image/jpeg",
          });
    photoFiles.push(file);
  }

  if (photoFiles.length > SUBMISSION_MAX_PHOTOS_COUNT) {
    return NextResponse.json(
      { error: `Maks ${SUBMISSION_MAX_PHOTOS_COUNT} bilder.` },
      { status: 400 },
    );
  }

  let photoBytesTotal = 0;
  for (const f of photoFiles) {
    if (f.size > SUBMISSION_MAX_PHOTO_EACH_BYTES) {
      return NextResponse.json(
        { error: SUBMISSION_PER_PHOTO_TOO_LARGE_MESSAGE },
        { status: 400 },
      );
    }
    photoBytesTotal += f.size;
    if (f.type && !f.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Bare bildefiler er tillatt." },
        { status: 400 },
      );
    }
  }
  if (photoBytesTotal > SUBMISSION_MAX_PHOTOS_TOTAL_BYTES) {
    return NextResponse.json(
      { error: SUBMISSION_UPLOAD_TOO_LARGE_MESSAGE },
      { status: 400 },
    );
  }

  const id = randomUUID();
  const admin = createSupabaseAdmin();
  const photoPaths: string[] = [];

  for (let i = 0; i < photoFiles.length; i++) {
    const file = photoFiles[i]!;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);
    const objectPath = `innbytte/${id}/${i}-${safeName || "photo"}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await admin.storage
      .from("sell-submission-photos")
      .upload(objectPath, buf, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (upErr) {
      console.error(upErr);
      return NextResponse.json(
        { error: "Kunne ikke laste opp bilder. Prøv igjen." },
        { status: 502 },
      );
    }
    photoPaths.push(objectPath);
  }

  const { error: insErr } = await admin.from("innbytte_submissions").insert({
    id,
    intake_id: intakeId,
    kjennemerke,
    kilometerstand,
    car_model: carModel,
    first_registration_year: firstRegistrationYear,
    finn_listing_url: finnListingUrl,
    price_hint: priceHint || null,
    additional_comment: additionalComment || null,
    wants_additional_note: wantsAdditionalNote,
    dekk: dekk as object | null,
    skade_zones: skadeZones as object | null,
    skade_comment: skadeComment || null,
    steg3: steg3 as object | null,
    full_name: fullName,
    email,
    phone,
    photo_paths: photoPaths,
    vegvesen_snapshot: vegvesenSnapshot as object | null,
    submitter_ip: submitterIp,
    submitter_user_agent: submitterUserAgent,
  });

  if (insErr) {
    console.error("[innbytte_submissions insert]", insErr);
    const hint = hintForSubmissionInsertError(insErr);
    return NextResponse.json(
      {
        error: "Kunne ikke lagre innsending. Sjekk at databasen er satt opp.",
        ...(hint ? { hint } : {}),
        ...(process.env.NODE_ENV === "development"
          ? { debug: submissionInsertDebugPayload(insErr) }
          : {}),
      },
      { status: 502 },
    );
  }

  const okRes = NextResponse.json({ ok: true, id });
  expireInnbytteIntakeViewCookie(okRes);
  return okRes;
}

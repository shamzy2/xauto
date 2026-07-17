import "server-only";

import { randomUUID } from "node:crypto";

import {
  hintForSubmissionInsertError,
  type SubmissionInsertError,
} from "@/lib/server/submissionInsertError";
import { createSupabaseAdmin } from "@/lib/server/supabaseAdmin";

/** Shown when Vegvesen succeeded but persisting the intake row failed (e.g. DB / migration). */
export const VEHICLE_INTAKE_SAVE_USER_MESSAGE =
  "Noe gikk galt ved lagring. Prøv igjen om litt.";

export type VehicleIntakeRecord = {
  id: string;
  createdAt: string;
  kjennemerke: string;
  kilometerstand: string;
  firstRegistrationYear: number | null;
  /** Full Vegvesen JSON (server-side only — never send raw to client). */
  vegvesenPayload: unknown;
};

type VehicleIntakeRow = {
  id: string;
  created_at: string;
  kjennemerke: string;
  kilometerstand: string;
  first_registration_year: number | null;
  vegvesen_payload: unknown;
};

function rowToRecord(row: VehicleIntakeRow): VehicleIntakeRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    kjennemerke: row.kjennemerke,
    kilometerstand: row.kilometerstand,
    firstRegistrationYear: row.first_registration_year,
    vegvesenPayload: row.vegvesen_payload,
  };
}

/** Plain JSON for `jsonb` (drops non-JSON values PostgREST would reject). */
function vegvesenPayloadToJsonb(payload: unknown): object {
  try {
    const v = JSON.parse(JSON.stringify(payload)) as unknown;
    if (v !== null && typeof v === "object") return v as object;
    return { value: v } as object;
  } catch {
    throw new Error("Vegvesen-data kunne ikke serialiseres");
  }
}

export async function saveVehicleIntake(input: {
  kjennemerke: string;
  kilometerstand: string;
  firstRegistrationYear: number | null;
  vegvesenPayload: unknown;
}): Promise<VehicleIntakeRecord> {
  const admin = createSupabaseAdmin();
  const id = randomUUID();
  const { data, error } = await admin
    .from("vehicle_intakes")
    .insert({
      id,
      kjennemerke: input.kjennemerke,
      kilometerstand: input.kilometerstand,
      first_registration_year: input.firstRegistrationYear,
      vegvesen_payload: vegvesenPayloadToJsonb(input.vegvesenPayload),
    })
    .select(
      "id, created_at, kjennemerke, kilometerstand, first_registration_year, vegvesen_payload",
    )
    .single();

  if (error) {
    const e = error as SubmissionInsertError;
    const hint = hintForSubmissionInsertError(e);
    throw new Error(
      hint
        ? `${e.message ?? "insert failed"}\n${hint}`
        : (e.message ?? "insert failed"),
    );
  }
  if (!data) {
    throw new Error("vehicle_intakes insert returned no row");
  }
  return rowToRecord(data as VehicleIntakeRow);
}

export async function getVehicleIntakeById(
  id: string,
): Promise<VehicleIntakeRecord | null> {
  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from("vehicle_intakes")
    .select(
      "id, created_at, kjennemerke, kilometerstand, first_registration_year, vegvesen_payload",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;
  return rowToRecord(data as VehicleIntakeRow);
}

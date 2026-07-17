import "server-only";

import type { SkadeKartZonesState } from "@/app/lib/sellSkadeStorage";

import { formatNbLongDateFull, type VegvesenAdminSummary } from "./vegvesenAdminSummary";

export type AdminSubmissionRow = {
  id: string;
  created_at: string;
  kjennemerke: string;
  kilometerstand: string;
  car_model: string | null;
  first_registration_year: number | null;
  price_hint: string | null;
  additional_comment: string | null;
  wants_additional_note: boolean | null;
  dekk: unknown;
  skade_zones: unknown;
  skade_comment: string | null;
  steg3: unknown;
  full_name: string;
  email: string;
  phone: string;
  photo_paths: string[] | null;
  vegvesen_snapshot: unknown;
  admin_opened_at: string | null;
  admin_opened_by?: string | null;
  /** Fra proxy ved innsending (kan være upresis). */
  submitter_ip: string | null;
  /** User-Agent (nettleser / enhet). */
  submitter_user_agent: string | null;
  /** Internt notat (kun admin). */
  admin_notes: string | null;
  /** Kun innbytte — FINN-kode eller annonselenke. */
  finn_listing_url?: string | null;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export const SKADE_ZONE_LABELS: Record<string, string> = {
  frontLeft: "Foran, venstre",
  frontRight: "Foran, høyre",
  left: "Venstre side",
  right: "Høyre side",
  rearLeft: "Bak, venstre",
  rearRight: "Bak, høyre",
};

export function dekkVerdiTekst(v: unknown): string {
  if (v === "good") return "Bra / OK";
  if (v === "poor") return "Slitt / bør byttes";
  if (v === "" || v == null) return "Ikke oppgitt";
  return String(v);
}

export function formatDekkLines(dekk: unknown): string[] {
  if (!isRecord(dekk)) return ["Sommerdekk: Ikke oppgitt", "Vinterdekk: Ikke oppgitt"];
  return [
    `Sommerdekk: ${dekkVerdiTekst(dekk.summer)}`,
    `Vinterdekk: ${dekkVerdiTekst(dekk.winter)}`,
  ];
}

export function skadeMerkedeSonenavn(zones: SkadeKartZonesState): string[] {
  const out: string[] = [];
  for (const id of Object.keys(zones) as (keyof SkadeKartZonesState)[]) {
    if (zones[id]) {
      out.push(SKADE_ZONE_LABELS[id] ?? id);
    }
  }
  return out;
}

const SERVICE_HIST: Record<string, string> = {
  full: "Full servicehistorikk",
  partial: "Delvis / noe dokumentert",
  none: "Ukjent / ikke oppgitt",
};

export function formatSteg3Lines(steg3: unknown): string[] {
  if (!isRecord(steg3)) {
    return ["Ingen data lagret for service og utstyr."];
  }
  const lines: string[] = [];
  const sh = steg3.serviceHistory;
  if (typeof sh === "string") {
    lines.push(
      `Servicehistorikk: ${SERVICE_HIST[sh] ?? sh}`,
    );
  } else {
    lines.push("Servicehistorikk: Ikke oppgitt");
  }
  const last = steg3.lastServiceDate;
  if (typeof last === "string" && last.trim()) {
    lines.push(`Siste service (dato oppgitt): ${formatNbLongDateFull(last)}`);
  } else {
    lines.push("Siste service (dato): Ikke oppgitt");
  }
  const keys = steg3.equipmentTrueKeys;
  if (Array.isArray(keys) && keys.length) {
    lines.push(`Utstyr valgt: ${keys.join(", ")}`);
  } else {
    lines.push("Utstyr valgt: Ingen avkrysset");
  }
  const extraOpen = steg3.extraEquipmentOpen;
  lines.push(
    `Ekstra utstyr (seksjon åpnet): ${extraOpen ? "Ja" : "Nei"}`,
  );
  const note = steg3.extraEquipmentNote;
  if (typeof note === "string" && note.trim()) {
    lines.push(`Ekstra utstyr / merknad: ${note.trim()}`);
  }
  const part = steg3.part;
  if (part === 1 || part === 2) {
    lines.push(`Steg 3 del (kladd): ${part}`);
  }
  return lines;
}

export function vegvesenSummaryLines(vv: VegvesenAdminSummary): string[] {
  return [
    `Førstegangsregistrering (dato): ${formatNbLongDateFull(vv.forstegangsregistreringDato)}`,
    `Typegodkjenning: ${vv.typegodkjenningTekst ?? "-"}`,
    `Teknisk godkjenning fra: ${formatNbLongDateFull(vv.tekniskGodkjenningGyldigFra)}`,
    `EU-kontroll sist: ${formatNbLongDateFull(vv.periodiskSistGodkjent)}`,
    `Neste kontrollfrist: ${formatNbLongDateFull(vv.periodiskKontrollfrist)}`,
    `Understellsnummer: ${vv.understellsnummer ?? "-"}`,
    `Euro-klasse: ${vv.euroKlasse ?? "-"}`,
  ];
}

import "server-only";

import type { VegvesenKjoretoyResponse } from "./vegvesen";
import { extractFirstRegistrationRaw } from "./vegvesen";

/** Lang norsk dato for admin (YYYY-MM-DD eller ISO). */
export function formatNbLongDate(raw: string | null | undefined): string {
  if (!raw || typeof raw !== "string") return "-";
  const s = raw.trim();
  const d = /\d{4}-\d{2}-\d{2}/.test(s)
    ? new Date(`${s.slice(0, 10)}T12:00:00`)
    : new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Full verbal dato (tirsdag 17. juni 2020 …). */
export function formatNbLongDateFull(raw: string | null | undefined): string {
  if (!raw || typeof raw !== "string") return "-";
  const s = raw.trim();
  const d = /\d{4}-\d{2}-\d{2}/.test(s)
    ? new Date(`${s.slice(0, 10)}T12:00:00`)
    : new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function firstKjoretoy(payload: unknown): Record<string, unknown> | null {
  const data = payload as VegvesenKjoretoyResponse;
  const first = data.kjoretoydataListe?.[0];
  return isRecord(first) ? first : null;
}

export type VegvesenAdminSummary = {
  /** F.eks. norsk førstegangsreg. dato */
  forstegangsregistreringDato: string | null;
  /** EU / COC typegodkjenning nummer */
  typegodkjenningTekst: string | null;
  /** Når teknisk godkjenning er gyldig fra */
  tekniskGodkjenningGyldigFra: string | null;
  /** Siste EU-kontroll (periodisk kjøretøykontroll) */
  periodiskSistGodkjent: string | null;
  /** Neste frist EU-kontroll */
  periodiskKontrollfrist: string | null;
  understellsnummer: string | null;
  /** Euro-klasse beskrivelse fra miljødata */
  euroKlasse: string | null;
};

export function vegvesenAdminSummaryFromPayload(
  payload: unknown,
): VegvesenAdminSummary {
  const item = firstKjoretoy(payload);
  if (!item) {
    return {
      forstegangsregistreringDato: null,
      typegodkjenningTekst: null,
      tekniskGodkjenningGyldigFra: null,
      periodiskSistGodkjent: null,
      periodiskKontrollfrist: null,
      understellsnummer: null,
      euroKlasse: null,
    };
  }

  const rawFg = extractFirstRegistrationRaw(item);

  const godkjenning = isRecord(item.godkjenning) ? item.godkjenning : null;
  const teknisk = godkjenning?.tekniskGodkjenning;
  const tekniskRec = isRecord(teknisk) ? teknisk : null;

  let tekniskGodkjenningGyldigFra: string | null = null;
  if (tekniskRec) {
    const g =
      typeof tekniskRec.gyldigFraDato === "string"
        ? tekniskRec.gyldigFraDato
        : typeof tekniskRec.gyldigFraDatoTid === "string"
          ? tekniskRec.gyldigFraDatoTid.slice(0, 10)
          : null;
    tekniskGodkjenningGyldigFra = g;
  }

  let typegodkjenningTekst: string | null = null;
  const klass = tekniskRec?.kjoretoyklassifisering;
  if (isRecord(klass)) {
    const ef = klass.efTypegodkjenning;
    if (isRecord(ef)) {
      const t = ef.typegodkjenningNrTekst;
      if (typeof t === "string" && t.trim()) typegodkjenningTekst = t.trim();
    }
  }

  let periodiskSistGodkjent: string | null = null;
  let periodiskKontrollfrist: string | null = null;
  const pk = item.periodiskKjoretoyKontroll;
  if (isRecord(pk)) {
    if (typeof pk.sistGodkjent === "string") {
      periodiskSistGodkjent = pk.sistGodkjent;
    }
    if (typeof pk.kontrollfrist === "string") {
      periodiskKontrollfrist = pk.kontrollfrist;
    }
  }

  let understellsnummer: string | null = null;
  const kid = item.kjoretoyId;
  if (isRecord(kid) && typeof kid.understellsnummer === "string") {
    understellsnummer = kid.understellsnummer.trim() || null;
  }

  let euroKlasse: string | null = null;
  const tekniskeData = tekniskRec?.tekniskeData;
  if (isRecord(tekniskeData)) {
    const miljo = tekniskeData.miljodata;
    if (isRecord(miljo)) {
      const ek = miljo.euroKlasse;
      if (isRecord(ek)) {
        const desc =
          typeof ek.kodeBeskrivelse === "string"
            ? ek.kodeBeskrivelse
            : typeof ek.kodeNavn === "string"
              ? ek.kodeNavn
              : null;
        if (desc?.trim()) euroKlasse = desc.trim();
      }
    }
  }

  return {
    forstegangsregistreringDato: rawFg,
    typegodkjenningTekst,
    tekniskGodkjenningGyldigFra,
    periodiskSistGodkjent,
    periodiskKontrollfrist,
    understellsnummer,
    euroKlasse,
  };
}

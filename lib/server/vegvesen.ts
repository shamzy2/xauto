import "server-only";

import { requireSecret } from "./env";

const VEGVESEN_ENKELTOPPSLAG_URL =
  "https://akfell-datautlevering.atlas.vegvesen.no/enkeltoppslag/kjoretoydata";

/**
 * Én brukervennlig melding for alle feil under Vegvesen-oppslag i salgsintak
 * (feil format, personlig skilt, tomt svar, teknisk feil m.m.).
 */
export const SELL_INTAKE_LOOKUP_USER_MESSAGE =
  "Bilregnr-format er feil (ex. AB12345), eller personlig skilt.";

export type VegvesenKjoretoyResponse = {
  kjoretoydataListe?: unknown[];
};

export function normalizeKjennemerke(raw: string): string {
  return raw.replace(/\s+/g, "").toUpperCase();
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isOrdinærKategori(kategori: string): boolean {
  const u = kategori.toUpperCase();
  return (
    u.includes("ORDIN") ||
    u === "VANLIG" ||
    u.includes("STANDARD") ||
    u.includes("NORMAL")
  );
}

function isPersonligKategori(kategori: string): boolean {
  const u = kategori.toUpperCase();
  return u.includes("PERSON") || u.includes("PERSO");
}

function collectTegnkombinasjonerUnderRegistrering(
  node: unknown,
  acc: Set<string>,
  depth: number,
): void {
  if (depth > 14 || node == null) return;
  if (typeof node === "object" && !Array.isArray(node)) {
    const r = node as Record<string, unknown>;
    const tk = r.tegnkombinasjon;
    if (typeof tk === "string") {
      const n = normalizeKjennemerke(tk);
      if (n.length >= 2 && n.length <= 8) acc.add(n);
    }
    const kmStr = r.kjennemerke;
    if (typeof kmStr === "string") {
      const n = normalizeKjennemerke(kmStr);
      if (n.length >= 2 && n.length <= 8) acc.add(n);
    }
  }
  if (Array.isArray(node)) {
    for (const x of node) collectTegnkombinasjonerUnderRegistrering(x, acc, depth + 1);
    return;
  }
  if (typeof node === "object" && node !== null) {
    for (const v of Object.values(node as Record<string, unknown>)) {
      collectTegnkombinasjonerUnderRegistrering(v, acc, depth + 1);
    }
  }
}

/**
 * Ordinært «AB12345»-kjennemerke når kunden oppgir personlig skilt (f.eks. «WA»).
 * Leser `registrering.kjennemerke[]` m.m. fra Vegvesen enkeltoppslag.
 */
export function ordinartKjennemerkeFromVegvesenPayload(
  payload: unknown,
  oppslagKjennemerkeNormalisert: string,
): string | null {
  const oppslag = oppslagKjennemerkeNormalisert.trim();
  if (!oppslag) return null;

  const data = payload as VegvesenKjoretoyResponse;
  const item = data.kjoretoydataListe?.[0];
  if (!isRecord(item)) return null;

  const registrering = isRecord(item.registrering) ? item.registrering : null;
  const kmRaw = registrering?.kjennemerke;

  if (Array.isArray(kmRaw)) {
    const rows: { kategori: string; tegn: string }[] = [];
    for (const el of kmRaw) {
      if (!isRecord(el)) continue;
      const tegn =
        typeof el.tegnkombinasjon === "string"
          ? normalizeKjennemerke(el.tegnkombinasjon)
          : "";
      if (!tegn) continue;
      const kategori =
        typeof el.kjennemerkeKategori === "string"
          ? el.kjennemerkeKategori
          : typeof el.kjennemerkekategori === "string"
            ? el.kjennemerkekategori
            : "";
      rows.push({ kategori, tegn });
    }

    for (const { kategori, tegn } of rows) {
      if (kategori && isOrdinærKategori(kategori) && tegn !== oppslag) {
        return tegn;
      }
    }
    for (const { kategori, tegn } of rows) {
      if (kategori && isOrdinærKategori(kategori)) {
        return tegn === oppslag ? null : tegn;
      }
    }

    const personligTegn = rows
      .filter((r) => r.kategori && isPersonligKategori(r.kategori))
      .map((r) => r.tegn);
    const andreTegn = rows
      .filter((r) => !r.kategori || !isPersonligKategori(r.kategori))
      .map((r) => r.tegn);

    if (
      personligTegn.includes(oppslag) &&
      andreTegn.length === 1 &&
      andreTegn[0] !== oppslag
    ) {
      return andreTegn[0]!;
    }

    const alle = [...new Set(rows.map((r) => r.tegn))];
    if (alle.length === 2) {
      const annen = alle.find((t) => t !== oppslag);
      if (annen) return annen;
    }
  } else if (typeof kmRaw === "string") {
    const tegn = normalizeKjennemerke(kmRaw);
    if (tegn.length >= 2 && tegn !== oppslag) return tegn;
  } else if (isRecord(kmRaw)) {
    const tegn =
      typeof kmRaw.tegnkombinasjon === "string"
        ? normalizeKjennemerke(kmRaw.tegnkombinasjon)
        : "";
    if (tegn && tegn !== oppslag) return tegn;
  }

  if (typeof item.kjennemerke === "string") {
    const tegn = normalizeKjennemerke(item.kjennemerke);
    if (tegn.length >= 2 && tegn !== oppslag) return tegn;
  }

  if (registrering) {
    const fraTre = new Set<string>();
    collectTegnkombinasjonerUnderRegistrering(registrering, fraTre, 0);
    const liste = [...fraTre];
    if (liste.length >= 2) {
      const annen = liste.find((t) => t !== oppslag);
      if (annen) return annen;
    }
    if (liste.length === 1 && liste[0] !== oppslag) {
      return liste[0]!;
    }
  }

  return null;
}

/** Fetch raw kjøretøy JSON from Statens vegvesen (enkeltoppslag). */
export async function fetchKjoretoydata(kjennemerke: string): Promise<unknown> {
  const key = requireSecret("EXTERNAL_API_KEY");
  const km = normalizeKjennemerke(kjennemerke);
  const url = `${VEGVESEN_ENKELTOPPSLAG_URL}?kjennemerke=${encodeURIComponent(km)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "SVV-Authorization": `Apikey ${key}` },
    cache: "no-store",
  });

  if (res.status === 403 || res.status === 401) {
    throw new Error(SELL_INTAKE_LOOKUP_USER_MESSAGE);
  }
  if (res.status === 429) {
    throw new Error(SELL_INTAKE_LOOKUP_USER_MESSAGE);
  }
  if (!res.ok) {
    await res.text().catch(() => "");
    throw new Error(SELL_INTAKE_LOOKUP_USER_MESSAGE);
  }

  const rawOk = await res.text();
  let payload: unknown;
  try {
    payload = rawOk.trim() ? JSON.parse(rawOk) : null;
  } catch {
    throw new Error(SELL_INTAKE_LOOKUP_USER_MESSAGE);
  }
  if (!isRecord(payload)) {
    throw new Error(SELL_INTAKE_LOOKUP_USER_MESSAGE);
  }
  const liste = (payload as VegvesenKjoretoyResponse).kjoretoydataListe;
  if (!Array.isArray(liste) || liste.length === 0) {
    throw new Error(SELL_INTAKE_LOOKUP_USER_MESSAGE);
  }
  return payload;
}

/**
 * Pull førstegangsregistrering date-ish value from one kjøretøy node (defensive paths).
 * Exported for admin views that need full dato, not just år.
 */
export function extractFirstRegistrationRaw(item: unknown): string | null {
  if (!isRecord(item)) return null;

  const registrering = isRecord(item.registrering) ? item.registrering : undefined;
  const candidates: unknown[] = [
    registrering?.forstegangsregistrering,
    registrering?.førstegangsregistrering,
    item.forstegangsregistrering,
    item.førstegangsregistrering,
  ];

  for (const c of candidates) {
    if (c == null) continue;
    if (typeof c === "string") return c;
    if (isRecord(c)) {
      const d =
        c.registrertForstegangNorgeDato ??
        c.registreringsdato ??
        c.dato ??
        c.forstegangRegistrertDato ??
        c.førstegangRegistrertDato;
      if (typeof d === "string") return d;
    }
  }

  const godkjenning = isRecord(item.godkjenning) ? item.godkjenning : undefined;
  const fgGodkjenning = godkjenning
    ? godkjenning.forstegangsGodkjenning
    : undefined;
  if (isRecord(fgGodkjenning)) {
    const d =
      fgGodkjenning.forstegangRegistrertDato ?? fgGodkjenning.gyldigFraDato;
    if (typeof d === "string") return d;
  }

  return null;
}

/** Year only for UI — from ISO-like or Norwegian date strings. */
export function yearFromFirstRegistration(raw: string | null): number | null {
  if (!raw) return null;
  const s = raw.trim();
  const iso = /^(\d{4})-\d{2}-\d{2}/.exec(s);
  if (iso) return Number.parseInt(iso[1], 10);
  const dmy = /^(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(s);
  if (dmy) return Number.parseInt(dmy[3], 10);
  const yOnly = /^(\d{4})$/.exec(s);
  if (yOnly) return Number.parseInt(yOnly[1], 10);
  const y = Number.parseInt(s.slice(0, 4), 10);
  return Number.isFinite(y) && y >= 1900 && y <= 2100 ? y : null;
}

export function firstRegistrationYearFromVegvesenPayload(
  payload: unknown,
): number | null {
  const data = payload as VegvesenKjoretoyResponse;
  const first = data.kjoretoydataListe?.[0];
  return yearFromFirstRegistration(extractFirstRegistrationRaw(first));
}

/**
 * Merke + modell (handelsbetegnelse) from teknisk godkjenning, e.g. "Audi e-tron" or "AUDI Q5".
 */
export function carModelFromVegvesenPayload(payload: unknown): string | null {
  const data = payload as VegvesenKjoretoyResponse;
  const item = data.kjoretoydataListe?.[0];
  if (!isRecord(item)) return null;

  const godkjenning = isRecord(item.godkjenning) ? item.godkjenning : undefined;
  const teknisk = godkjenning?.tekniskGodkjenning;
  if (!isRecord(teknisk)) return null;
  const tekniskeData = teknisk.tekniskeData;
  if (!isRecord(tekniskeData)) return null;
  const generelt = tekniskeData.generelt;
  if (!isRecord(generelt)) return null;

  const merkeArr = generelt.merke;
  const handelsArr = generelt.handelsbetegnelse;

  let merkeName = "";
  if (Array.isArray(merkeArr) && merkeArr[0] && isRecord(merkeArr[0])) {
    const m = merkeArr[0].merke;
    if (typeof m === "string") merkeName = m.trim();
  }

  let modelName = "";
  if (Array.isArray(handelsArr) && typeof handelsArr[0] === "string") {
    modelName = handelsArr[0].trim();
  }

  if (modelName && merkeName) {
    const lowModel = modelName.toLowerCase();
    const lowMerke = merkeName.toLowerCase();
    if (lowModel.startsWith(lowMerke)) return modelName;
    return `${merkeName} ${modelName}`.trim();
  }
  if (modelName) return modelName;
  if (merkeName) return merkeName;
  return null;
}

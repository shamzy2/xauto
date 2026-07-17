import "server-only";

import type { VegvesenKjoretoyResponse } from "./vegvesen";
import {
  extractFirstRegistrationRaw,
  firstRegistrationYearFromVegvesenPayload,
  yearFromFirstRegistration,
} from "./vegvesen";
import { vegvesenAdminSummaryFromPayload } from "./vegvesenAdminSummary";

export type VehicleFlowSummary = {
  make: string;
  model: string;
  variant: string | null;
  year: number | null;
  firstRegistered: string;
  fuel: string;
  bodyType: string;
  powerHp: string;
  color: string;
  driveType: string;
  euControl: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function kodeLabel(node: unknown): string | null {
  if (!isRecord(node)) return null;
  const desc =
    typeof node.kodeNavn === "string"
      ? node.kodeNavn
      : typeof node.kodeBeskrivelse === "string"
        ? node.kodeBeskrivelse
        : typeof node.beskrivelse === "string"
          ? node.beskrivelse
          : null;
  return desc?.trim() || null;
}

function formatNbDate(raw: string | null | undefined): string {
  if (!raw || typeof raw !== "string") return "-";
  const s = raw.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) return `${iso[3]}.${iso[2]}.${iso[1]}`;
  const dmy = /^(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(s);
  if (dmy) return s;
  return s;
}

function simplifyKarosseriLabel(raw: string): string {
  const trimmed = raw.trim();
  const shortNavn = trimmed.split("(")[0]?.split(" ISO")[0]?.trim();
  if (shortNavn && shortNavn.length <= 24) return shortNavn;
  if (/stasjonsvogn/i.test(trimmed)) return "Stasjonsvogn";
  if (/sedan|limousin/i.test(trimmed)) return "Sedan";
  if (/suv|flerbruks/i.test(trimmed)) return "SUV";
  if (/kombi|stasjons/i.test(trimmed)) return "Stasjonsvogn";
  if (/coupe|kupé/i.test(trimmed)) return "Kupé";
  if (/cabriolet|kabriolet/i.test(trimmed)) return "Cabriolet";
  if (/varebil|van/i.test(trimmed)) return "Varebil";
  return trimmed.length > 32 ? `${trimmed.slice(0, 29)}…` : trimmed;
}

function tekniskeDataFromItem(
  item: Record<string, unknown>,
): Record<string, unknown> | null {
  const godkjenning = isRecord(item.godkjenning) ? item.godkjenning : null;
  const teknisk = godkjenning?.tekniskGodkjenning;
  const tekniskRec = isRecord(teknisk) ? teknisk : null;
  const tekniskeData = tekniskRec?.tekniskeData;
  return isRecord(tekniskeData) ? tekniskeData : null;
}

function makeModelVariantFromTekniskeData(
  tekniskeData: Record<string, unknown>,
): { make: string; model: string; variant: string | null } {
  let make = "";
  let model = "";
  let variant: string | null = null;

  const generelt = tekniskeData.generelt;
  if (isRecord(generelt)) {
    const merkeArr = generelt.merke;
    if (Array.isArray(merkeArr) && isRecord(merkeArr[0])) {
      const m = merkeArr[0].merke;
      if (typeof m === "string") make = m.trim();
    }

    const handels = generelt.handelsbetegnelse;
    if (Array.isArray(handels)) {
      const names = handels
        .map((h) => (typeof h === "string" ? h.trim() : kodeLabel(h)))
        .filter((h): h is string => Boolean(h));
      if (names[0]) model = names[0];
      if (names.length > 1) variant = names.slice(1).join(" ");
    }
  }

  return { make, model, variant };
}

function bodyAndColorFromTekniskeData(
  tekniskeData: Record<string, unknown>,
): { bodyType: string; color: string } {
  let bodyType = "-";
  let color = "-";

  const kol = tekniskeData.karosseriOgLasteplan;
  if (isRecord(kol)) {
    const karosseriLabel = kodeLabel(kol.karosseritype);
    if (karosseriLabel) bodyType = simplifyKarosseriLabel(karosseriLabel);

    const rfarge = kol.rFarge;
    if (Array.isArray(rfarge)) {
      const labels = rfarge
        .map((f) => kodeLabel(f))
        .filter((f): f is string => Boolean(f));
      if (labels.length) color = labels.join(" / ");
    }
  }

  // Eldre/alternativ struktur
  if (bodyType === "-" || color === "-") {
    const karosseri = tekniskeData.karosseri;
    if (isRecord(karosseri)) {
      if (bodyType === "-") {
        const label = kodeLabel(karosseri.karosseritype ?? karosseri.karosseri);
        if (label) bodyType = simplifyKarosseriLabel(label);
      }
      if (color === "-") {
        color =
          kodeLabel(karosseri.rfarge) ??
          kodeLabel(karosseri.rFarge) ??
          kodeLabel(karosseri.farge) ??
          "-";
      }
    }
  }

  if (color === "-") {
    color = kodeLabel(tekniskeData.farge) ?? "-";
  }

  return { bodyType, color };
}

function fuelFromTekniskeData(
  tekniskeData: Record<string, unknown>,
): string {
  const miljo = tekniskeData.miljodata;
  if (isRecord(miljo)) {
    const grupper = miljo.miljoOgdrivstoffGruppe;
    if (Array.isArray(grupper)) {
      const labels: string[] = [];
      for (const g of grupper) {
        if (!isRecord(g)) continue;
        const label = kodeLabel(g.drivstoffKodeMiljodata);
        if (label && !labels.includes(label)) labels.push(label);
      }
      if (labels.length === 1) {
        const only = labels[0]!;
        if (/^elektrisk$/i.test(only)) return "Elektrisk";
        if (/^hybrid/i.test(only)) return only;
        return only;
      }
      if (labels.length > 1) {
        const hasElectric = labels.some((l) => /elektr/i.test(l));
        const hasFossil = labels.some((l) => /bensin|diesel/i.test(l));
        if (hasElectric && hasFossil) return "Hybrid";
        return labels.join(" / ");
      }
    }
  }

  const motorOg = tekniskeData.motorOgDrivverk;
  if (!isRecord(motorOg)) return "-";

  const hybrid = kodeLabel(motorOg.hybridKategori);
  if (hybrid && !/^ingen$/i.test(hybrid)) return hybrid;

  const fuelLabels: string[] = [];
  const motors = motorOg.motor;
  if (Array.isArray(motors)) {
    for (const motor of motors) {
      if (!isRecord(motor)) continue;
      const drivstoff = motor.drivstoff;
      if (!Array.isArray(drivstoff)) continue;
      for (const d of drivstoff) {
        if (!isRecord(d)) continue;
        const label = kodeLabel(d.drivstoffKode ?? d.drivstoff);
        if (label && !fuelLabels.includes(label)) fuelLabels.push(label);
      }
    }
  }

  if (fuelLabels.length === 1) return fuelLabels[0]!;
  if (fuelLabels.length > 1) return fuelLabels.join(" / ");
  return "-";
}

function powerHpFromTekniskeData(
  tekniskeData: Record<string, unknown>,
): string {
  const motorOg = tekniskeData.motorOgDrivverk;
  if (!isRecord(motorOg)) return "-";

  let totalKw = 0;
  const motors = motorOg.motor;
  if (Array.isArray(motors)) {
    for (const motor of motors) {
      if (!isRecord(motor)) continue;
      let motorKw = 0;
      const drivstoff = motor.drivstoff;
      if (Array.isArray(drivstoff)) {
        for (const d of drivstoff) {
          if (!isRecord(d)) continue;
          if (typeof d.maksNettoEffekt === "number") {
            motorKw = Math.max(motorKw, d.maksNettoEffekt);
          }
          if (typeof d.maksEffekt === "number" && d.maksEffekt > 20) {
            return `${Math.round(d.maksEffekt)} HK`;
          }
        }
      }
      if (typeof motor.maksNettoEffekt === "number") {
        motorKw = Math.max(motorKw, motor.maksNettoEffekt);
      }
      totalKw += motorKw;
    }
  }

  if (totalKw > 0) return `${Math.round(totalKw * 1.36)} HK`;
  return "-";
}

function driveTypeFromTekniskeData(
  tekniskeData: Record<string, unknown>,
): string {
  const akslinger = tekniskeData.akslinger;
  if (isRecord(akslinger)) {
    let drivenWheels = 0;
    let frontDriven = false;
    let rearDriven = false;

    const grupper = akslinger.akselGruppe;
    if (Array.isArray(grupper)) {
      for (const g of grupper) {
        if (!isRecord(g)) continue;
        const liste = g.akselListe;
        if (!isRecord(liste)) continue;
        const aksler = liste.aksel;
        if (!Array.isArray(aksler)) continue;
        for (const aksel of aksler) {
          if (!isRecord(aksel) || aksel.drivAksel !== true) continue;
          const hjul = typeof aksel.antallHjul === "number" ? aksel.antallHjul : 2;
          drivenWheels += hjul;
          const plassering = String(aksel.plasseringAksel ?? "");
          if (plassering === "1") frontDriven = true;
          if (plassering === "2") rearDriven = true;
        }
      }
    }

    if (drivenWheels >= 4 || (frontDriven && rearDriven)) {
      return "Firehjulsdrift";
    }
    if (frontDriven) return "Forhjulsdrift";
    if (rearDriven) return "Bakhjulsdrift";
    if (drivenWheels === 2) return "Tohjulsdrift";
  }

  const motorOg = tekniskeData.motorOgDrivverk;
  if (isRecord(motorOg)) {
    for (const key of ["traksjon", "hjuldrift", "drivhjul"]) {
      const label = kodeLabel(motorOg[key]);
      if (label) return label;
    }
  }

  return "-";
}

export function vehicleFlowSummaryFromPayload(payload: unknown): VehicleFlowSummary {
  const data = payload as VegvesenKjoretoyResponse;
  const item = data.kjoretoydataListe?.[0];
  const itemRec = isRecord(item) ? item : null;

  const admin = vegvesenAdminSummaryFromPayload(payload);
  const rawFg = itemRec ? extractFirstRegistrationRaw(itemRec) : null;
  const year =
    firstRegistrationYearFromVegvesenPayload(payload) ??
    yearFromFirstRegistration(rawFg);

  let make = "";
  let model = "";
  let variant: string | null = null;
  let bodyType = "-";
  let color = "-";
  let fuel = "-";
  let powerHp = "-";
  let driveType = "-";

  if (itemRec) {
    const tekniskeData = tekniskeDataFromItem(itemRec);
    if (tekniskeData) {
      const mmv = makeModelVariantFromTekniskeData(tekniskeData);
      make = mmv.make;
      model = mmv.model;
      variant = mmv.variant;

      const bc = bodyAndColorFromTekniskeData(tekniskeData);
      bodyType = bc.bodyType;
      color = bc.color;

      fuel = fuelFromTekniskeData(tekniskeData);
      powerHp = powerHpFromTekniskeData(tekniskeData);
      driveType = driveTypeFromTekniskeData(tekniskeData);
    }
  }

  return {
    make: make || "Kjøretøy",
    model,
    variant,
    year,
    firstRegistered: formatNbDate(rawFg),
    fuel,
    bodyType,
    powerHp,
    color,
    driveType,
    euControl: formatNbDate(admin.periodiskKontrollfrist),
  };
}

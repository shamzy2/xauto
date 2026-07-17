import { sellStorageGet, sellStorageRemove, sellStorageSet } from "./sellClientStorage";

/** Skademerknad fra steg-2c — localStorage, overlever lukket fane. */
export const SELL_SKADE_KART_COMMENT_KEY = "xauto:sell:skadeKartKommentar";

/** Valgte skade-soner på bilkartet (steg-2c). */
export const SELL_SKADE_KART_ZONES_KEY = "xauto:sell:skadeKartZones";

export type SkadeKartZoneId =
  | "frontLeft"
  | "frontRight"
  | "left"
  | "right"
  | "rearLeft"
  | "rearRight";

export type SkadeKartZonesState = Record<SkadeKartZoneId, boolean>;

const EMPTY_ZONES: SkadeKartZonesState = {
  frontLeft: false,
  frontRight: false,
  left: false,
  right: false,
  rearLeft: false,
  rearRight: false,
};

function parseZones(raw: string): SkadeKartZonesState {
  let o: Record<string, boolean>;
  try {
    o = JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return { ...EMPTY_ZONES };
  }

  if (
    "leftFront" in o ||
    "leftRear" in o ||
    "rightFront" in o ||
    "rightRear" in o
  ) {
    return {
      frontLeft: Boolean(o.frontLeft),
      frontRight: Boolean(o.frontRight),
      left:
        Boolean(o.left) || Boolean(o.leftFront) || Boolean(o.leftRear),
      right:
        Boolean(o.right) ||
        Boolean(o.rightFront) ||
        Boolean(o.rightRear),
      rearLeft: Boolean(o.rearLeft),
      rearRight: Boolean(o.rearRight),
    };
  }

  if (
    ("front" in o || "rear" in o || "left" in o || "right" in o) &&
    !("frontLeft" in o) &&
    !("rearLeft" in o)
  ) {
    const front = Boolean(o.front);
    const rear = Boolean(o.rear);
    return {
      frontLeft: front,
      frontRight: front,
      left: Boolean(o.left),
      right: Boolean(o.right),
      rearLeft: rear,
      rearRight: rear,
    };
  }

  return {
    frontLeft: Boolean(o.frontLeft),
    frontRight: Boolean(o.frontRight),
    left: Boolean(o.left),
    right: Boolean(o.right),
    rearLeft: Boolean(o.rearLeft),
    rearRight: Boolean(o.rearRight),
  };
}

/** Normaliser lagret skadekart (DB/JSON) — admin og PDF. */
export function skadeZonesFromSubmission(value: unknown): SkadeKartZonesState {
  if (value == null) return { ...EMPTY_ZONES };
  if (typeof value === "string") {
    return parseZones(value);
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    try {
      return parseZones(JSON.stringify(value));
    } catch {
      return { ...EMPTY_ZONES };
    }
  }
  return { ...EMPTY_ZONES };
}

export function persistSkadeZones(zones: SkadeKartZonesState): void {
  sellStorageSet(SELL_SKADE_KART_ZONES_KEY, JSON.stringify(zones));
}

/** Sann hvis minst én rute på bilkartet er markert (krever da bilder på steg-4b). */
export function readSkadeZonesMarked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = sellStorageGet(SELL_SKADE_KART_ZONES_KEY);
    if (!raw) return false;
    const z = parseZones(raw);
    return Object.values(z).some(Boolean);
  } catch {
    return false;
  }
}

export function readSkadeKartComment(): string {
  if (typeof window === "undefined") return "";
  try {
    return sellStorageGet(SELL_SKADE_KART_COMMENT_KEY) ?? "";
  } catch {
    return "";
  }
}

export function readSkadeZonesSnapshot(): SkadeKartZonesState {
  if (typeof window === "undefined") return { ...EMPTY_ZONES };
  try {
    const raw = sellStorageGet(SELL_SKADE_KART_ZONES_KEY);
    if (!raw) return { ...EMPTY_ZONES };
    return parseZones(raw);
  } catch {
    return { ...EMPTY_ZONES };
  }
}

export function persistSkadeKartComment(value: string): void {
  sellStorageSet(SELL_SKADE_KART_COMMENT_KEY, value);
}

/** Ny inntak — tøm skade-data fra forrige økt. */
export function clearSellSkadeSessionStorage(): void {
  sellStorageRemove(SELL_SKADE_KART_ZONES_KEY);
  sellStorageRemove(SELL_SKADE_KART_COMMENT_KEY);
}

import { sellStorageGet, sellStorageRemove, sellStorageSet } from "./sellClientStorage";

/**
 * Service / utstyr (steg-3) — localStorage, overlever lukket fane.
 * Utstyr-listen må matche `EQUIPMENT_ITEMS` i SellCarStep3.tsx.
 */
export const SELL_STEG3_DRAFT_KEY = "xauto:sell:steg3Draft";

const ALLOWED_SERVICE = new Set(["full", "partial", "none"]);

const ALLOWED_EQUIPMENT = new Set([
  "Navigasjon",
  "Hengerfeste",
  "DAB-radio",
  "Bluetooth",
  "Ryggekamera",
  "360-kamera",
  "Parkeringssensor",
  "Webasto/parkeringsvarmer",
  "Adaptive Cruise Control ACC",
  "Skinnseter",
  "Delskinn",
  "Stoffseter",
  "Panorama/soltak",
  "Oppvarmet ratt",
  "Oppvarmede forseter",
  "Oppvarmede bakseter",
  "Keyless GO",
]);

export type SellSteg3Draft = {
  part: 1 | 2;
  serviceHistory: string;
  lastServiceDate: string;
  equipmentTrueKeys: string[];
  extraEquipmentOpen: boolean;
  extraEquipmentNote: string;
};

export function readSellSteg3Draft(): SellSteg3Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sellStorageGet(SELL_STEG3_DRAFT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<SellSteg3Draft>;
    const part = o.part === 2 ? 2 : 1;
    const serviceHistory =
      typeof o.serviceHistory === "string" &&
      ALLOWED_SERVICE.has(o.serviceHistory)
        ? o.serviceHistory
        : "";
    const lastServiceDate =
      typeof o.lastServiceDate === "string" ? o.lastServiceDate : "";
    const keysIn = Array.isArray(o.equipmentTrueKeys) ? o.equipmentTrueKeys : [];
    const equipmentTrueKeys = keysIn.filter(
      (k): k is string => typeof k === "string" && ALLOWED_EQUIPMENT.has(k),
    );
    const extraEquipmentOpen = Boolean(o.extraEquipmentOpen);
    const extraEquipmentNote =
      typeof o.extraEquipmentNote === "string" ? o.extraEquipmentNote : "";
    const hasAny =
      serviceHistory ||
      lastServiceDate.trim() ||
      equipmentTrueKeys.length > 0 ||
      extraEquipmentNote.trim() ||
      extraEquipmentOpen ||
      part === 2;
    if (!hasAny) return null;
    return {
      part,
      serviceHistory,
      lastServiceDate,
      equipmentTrueKeys,
      extraEquipmentOpen,
      extraEquipmentNote,
    };
  } catch {
    return null;
  }
}

export function persistSellSteg3Draft(draft: SellSteg3Draft): void {
  try {
    const hasAny =
      draft.serviceHistory ||
      draft.lastServiceDate.trim() ||
      draft.equipmentTrueKeys.length > 0 ||
      draft.extraEquipmentNote.trim() ||
      draft.extraEquipmentOpen ||
      draft.part === 2;
    if (!hasAny) {
      sellStorageRemove(SELL_STEG3_DRAFT_KEY);
      return;
    }
    sellStorageSet(SELL_STEG3_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

export function clearSellSteg3Draft(): void {
  sellStorageRemove(SELL_STEG3_DRAFT_KEY);
}

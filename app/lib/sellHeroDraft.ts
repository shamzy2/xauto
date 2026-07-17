import { sellStorageGet, sellStorageRemove, sellStorageSet } from "./sellClientStorage";

/** Kladd for /selg-hero (regnr. + km) — localStorage, overlever lukket fane. */
export const SELL_HERO_DRAFT_KEY = "xauto:sell:heroDraft";

export type SellHeroDraft = {
  regnr: string;
  kilometer: string;
};

export function readSellHeroDraft(): SellHeroDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sellStorageGet(SELL_HERO_DRAFT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<SellHeroDraft>;
    if (typeof o.regnr !== "string" || typeof o.kilometer !== "string") {
      return null;
    }
    return { regnr: o.regnr, kilometer: o.kilometer };
  } catch {
    return null;
  }
}

export function persistSellHeroDraft(draft: SellHeroDraft): void {
  sellStorageSet(SELL_HERO_DRAFT_KEY, JSON.stringify(draft));
}

export function clearSellHeroDraft(): void {
  sellStorageRemove(SELL_HERO_DRAFT_KEY);
}

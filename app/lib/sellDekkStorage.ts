import { sellStorageGet, sellStorageRemove, sellStorageSet } from "./sellClientStorage";

/** Dekkvalg steg-2b — localStorage, overlever lukket fane. */
export const SELL_DEKK_DRAFT_KEY = "xauto:sell:dekkTread";

export type SellDekkTreadValue = "good" | "poor" | "";

export type SellDekkDraft = {
  summer: SellDekkTreadValue;
  winter: SellDekkTreadValue;
};

function isTread(v: unknown): v is "good" | "poor" {
  return v === "good" || v === "poor";
}

export function readSellDekkDraft(): SellDekkDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sellStorageGet(SELL_DEKK_DRAFT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<SellDekkDraft>;
    const summer = isTread(o.summer) ? o.summer : "";
    const winter = isTread(o.winter) ? o.winter : "";
    if (!summer && !winter) return null;
    return { summer, winter };
  } catch {
    return null;
  }
}

export function persistSellDekkDraft(draft: SellDekkDraft): void {
  sellStorageSet(SELL_DEKK_DRAFT_KEY, JSON.stringify(draft));
}

export function clearSellDekkDraft(): void {
  sellStorageRemove(SELL_DEKK_DRAFT_KEY);
}

import { sellStorageGet, sellStorageRemove, sellStorageSet } from "./sellClientStorage";

/** Kladd for avslutningssteg (/selg steg-4–4d) — localStorage, overlever lukket fane. */
export const SELL_FINALIZE_DRAFT_KEY = "xauto:sell:finalizeDraft";

export type SellFinalizeDraft = {
  priceHint: string;
  additionalComment: string;
  wantsAdditionalNote: boolean;
  fullName: string;
  email: string;
  phone: string;
};

export function readSellFinalizeDraft(): SellFinalizeDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sellStorageGet(SELL_FINALIZE_DRAFT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<SellFinalizeDraft>;
    if (
      typeof o.priceHint !== "string" ||
      typeof o.additionalComment !== "string" ||
      typeof o.wantsAdditionalNote !== "boolean" ||
      typeof o.fullName !== "string" ||
      typeof o.email !== "string" ||
      typeof o.phone !== "string"
    ) {
      return null;
    }
    return {
      priceHint: o.priceHint,
      additionalComment: o.additionalComment,
      wantsAdditionalNote: o.wantsAdditionalNote,
      fullName: o.fullName,
      email: o.email,
      phone: o.phone,
    };
  } catch {
    return null;
  }
}

export function persistSellFinalizeDraft(draft: SellFinalizeDraft): void {
  sellStorageSet(SELL_FINALIZE_DRAFT_KEY, JSON.stringify(draft));
}

export function clearSellFinalizeDraft(): void {
  sellStorageRemove(SELL_FINALIZE_DRAFT_KEY);
}

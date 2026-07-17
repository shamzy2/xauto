import {
  sellStorageGet,
  sellStorageRemove,
  sellStorageSet,
} from "./sellClientStorage";

export const INNBYTTE_FINALIZE_DRAFT_KEY = "xauto:innbytte:finalizeDraft";

export type InnbytteFinalizeDraft = {
  priceHint: string;
  additionalComment: string;
  wantsAdditionalNote: boolean;
  /** FINN-kode / lenke — før kontakt (steg-4d). */
  finnListing: string;
  fullName: string;
  email: string;
  phone: string;
};

export function readInnbytteFinalizeDraft(): InnbytteFinalizeDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sellStorageGet(INNBYTTE_FINALIZE_DRAFT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<InnbytteFinalizeDraft>;
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
      finnListing: typeof o.finnListing === "string" ? o.finnListing : "",
      fullName: o.fullName,
      email: o.email,
      phone: o.phone,
    };
  } catch {
    return null;
  }
}

export function persistInnbytteFinalizeDraft(draft: InnbytteFinalizeDraft): void {
  sellStorageSet(INNBYTTE_FINALIZE_DRAFT_KEY, JSON.stringify(draft));
}

export function clearInnbytteFinalizeDraft(): void {
  sellStorageRemove(INNBYTTE_FINALIZE_DRAFT_KEY);
}

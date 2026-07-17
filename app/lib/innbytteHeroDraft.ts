import {
  sellStorageGet,
  sellStorageRemove,
  sellStorageSet,
} from "./sellClientStorage";

export const INNBYTTE_HERO_DRAFT_KEY = "xauto:innbytte:heroDraft";

export type InnbytteHeroDraft = {
  regnr: string;
  kilometer: string;
};

export function readInnbytteHeroDraft(): InnbytteHeroDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sellStorageGet(INNBYTTE_HERO_DRAFT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<InnbytteHeroDraft>;
    if (typeof o.regnr !== "string" || typeof o.kilometer !== "string") {
      return null;
    }
    return { regnr: o.regnr, kilometer: o.kilometer };
  } catch {
    return null;
  }
}

export function persistInnbytteHeroDraft(draft: InnbytteHeroDraft): void {
  sellStorageSet(INNBYTTE_HERO_DRAFT_KEY, JSON.stringify(draft));
}

export function clearInnbytteHeroDraft(): void {
  sellStorageRemove(INNBYTTE_HERO_DRAFT_KEY);
}

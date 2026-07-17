/** Siste besøkte steg under /selg (kun denne fanen — sessionStorage). */
export const SELL_FLOW_LAST_PATH_KEY = "xauto:sell:lastPath";

/** Steg etter kjøretøyoppslag — resume innen samme fane med gyldig intake-cookie. */
export function isResumableSellPath(path: string | null): path is string {
  if (!path) return false;
  if (path === "/selg" || path === "/selg/takk") return false;
  if (!path.startsWith("/selg/")) return false;
  return path.startsWith("/selg/steg-");
}

export function persistSellFlowLastPath(pathname: string): void {
  if (typeof window === "undefined") return;
  if (!pathname.startsWith("/selg")) return;
  if (pathname === "/selg/takk") {
    clearSellFlowLastPath();
    return;
  }
  try {
    sessionStorage.setItem(SELL_FLOW_LAST_PATH_KEY, pathname);
  } catch {
    /* ignore */
  }
}

export function readSellFlowLastPath(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const p = sessionStorage.getItem(SELL_FLOW_LAST_PATH_KEY);
    if (!p || !isResumableSellPath(p)) return null;
    return p;
  } catch {
    return null;
  }
}

export function clearSellFlowLastPath(): void {
  try {
    sessionStorage.removeItem(SELL_FLOW_LAST_PATH_KEY);
  } catch {
    /* ignore */
  }
}

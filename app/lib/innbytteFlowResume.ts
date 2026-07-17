/** Siste besøkte steg under /innbytte (kun denne fanen — sessionStorage). */
export const INNBYTTE_FLOW_LAST_PATH_KEY = "xauto:innbytte:lastPath";

export function isResumableInnbyttePath(path: string | null): path is string {
  if (!path) return false;
  if (path === "/innbytte" || path === "/innbytte/takk") return false;
  if (!path.startsWith("/innbytte/")) return false;
  return path.startsWith("/innbytte/steg-");
}

export function persistInnbytteFlowLastPath(pathname: string): void {
  if (typeof window === "undefined") return;
  if (!pathname.startsWith("/innbytte")) return;
  if (pathname === "/innbytte/takk") {
    clearInnbytteFlowLastPath();
    return;
  }
  try {
    sessionStorage.setItem(INNBYTTE_FLOW_LAST_PATH_KEY, pathname);
  } catch {
    /* ignore */
  }
}

export function readInnbytteFlowLastPath(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const p = sessionStorage.getItem(INNBYTTE_FLOW_LAST_PATH_KEY);
    if (!p || !isResumableInnbyttePath(p)) return null;
    return p;
  } catch {
    return null;
  }
}

export function clearInnbytteFlowLastPath(): void {
  try {
    sessionStorage.removeItem(INNBYTTE_FLOW_LAST_PATH_KEY);
  } catch {
    /* ignore */
  }
}

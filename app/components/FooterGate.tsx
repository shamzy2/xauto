"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { useSellSelgFooterBridge } from "./SellSelgFooterBridge";

/**
 * Footer skjult på `/selg/steg-…`, `/innbytte/steg-…` og på rotsidene etter «Fortsett» (oppsummering).
 * Synlig på `/selg` og `/innbytte` med hero-skjema.
 */
export function FooterGate() {
  const pathname = usePathname();
  const { showFooterOnSelgRoot } = useSellSelgFooterBridge();

  if (pathname.startsWith("/selg/") || pathname.startsWith("/innbytte/")) {
    return null;
  }
  if (
    (pathname === "/selg" || pathname === "/innbytte") &&
    !showFooterOnSelgRoot
  ) {
    return null;
  }
  return <Footer />;
}

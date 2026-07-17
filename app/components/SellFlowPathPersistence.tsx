"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { persistSellFlowLastPath } from "@/app/lib/sellFlowResume";

/** Lagrer siste /selg-steg i localStorage for gjenopptak etter lukket fane. */
export function SellFlowPathPersistence() {
  const pathname = usePathname();
  useEffect(() => {
    persistSellFlowLastPath(pathname);
  }, [pathname]);
  return null;
}

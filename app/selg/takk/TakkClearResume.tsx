"use client";

import { useEffect } from "react";

import { clearSellFlowLastPath } from "@/app/lib/sellFlowResume";

/** Sletter lagret siste /selg-steg (fullført flyt). */
export function TakkClearResume() {
  useEffect(() => {
    clearSellFlowLastPath();
  }, []);
  return null;
}

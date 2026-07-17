"use client";

import { useEffect } from "react";

import { clearInnbytteFlowLastPath } from "@/app/lib/innbytteFlowResume";

/** Sletter lagret siste /innbytte-steg (fullført flyt). */
export function InnbytteTakkClearResume() {
  useEffect(() => {
    clearInnbytteFlowLastPath();
  }, []);
  return null;
}

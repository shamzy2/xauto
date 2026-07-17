"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { persistInnbytteFlowLastPath } from "@/app/lib/innbytteFlowResume";

export function InnbytteFlowPathPersistence() {
  const pathname = usePathname();
  useEffect(() => {
    persistInnbytteFlowLastPath(pathname);
  }, [pathname]);
  return null;
}

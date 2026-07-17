"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import styles from "./RouteTransition.module.css";

/** Rekkefølge i salgsskjema — brukes til forover / tilbake-animasjon */
const SELL_STEP_ORDER: Record<string, number> = {
  "/selg": 0,
  "/selg/steg-2a": 1,
  "/selg/steg-2b": 2,
  "/selg/steg-3": 3,
  "/selg/steg-4": 4,
  "/selg/steg-4c": 5,
  "/selg/steg-4d": 6,
  "/selg/takk": 7,
};

const INNBYTTE_STEP_ORDER: Record<string, number> = {
  "/innbytte": 0,
  "/innbytte/steg-2a": 1,
  "/innbytte/steg-2b": 2,
  "/innbytte/steg-3": 3,
  "/innbytte/steg-4": 4,
  "/innbytte/steg-4c": 5,
  "/innbytte/steg-4d": 6,
  "/innbytte/takk": 7,
};

function sellOrder(path: string): number | null {
  const n = SELL_STEP_ORDER[path];
  return n === undefined ? null : n;
}

function innbytteOrder(path: string): number | null {
  const n = INNBYTTE_STEP_ORDER[path];
  return n === undefined ? null : n;
}

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPathRef = useRef<string | undefined>(undefined);

  let enterClass = styles.enter;

  if (pathname.startsWith("/selg")) {
    const prev = prevPathRef.current;
    const currIdx = sellOrder(pathname);
    const prevIdx =
      prev && prev.startsWith("/selg") ? sellOrder(prev) : null;

    if (
      currIdx !== null &&
      prevIdx !== null &&
      prev !== undefined &&
      prev !== pathname
    ) {
      enterClass =
        currIdx > prevIdx ? styles.sellEnterForward : styles.sellEnterBack;
    } else {
      enterClass = styles.sellEnterNeutral;
    }
  } else if (pathname.startsWith("/innbytte")) {
    const prev = prevPathRef.current;
    const currIdx = innbytteOrder(pathname);
    const prevIdx =
      prev && prev.startsWith("/innbytte") ? innbytteOrder(prev) : null;

    if (
      currIdx !== null &&
      prevIdx !== null &&
      prev !== undefined &&
      prev !== pathname
    ) {
      enterClass =
        currIdx > prevIdx ? styles.sellEnterForward : styles.sellEnterBack;
    } else {
      enterClass = styles.sellEnterNeutral;
    }
  } else if (
    pathname === "/" ||
    pathname === "/om-oss" ||
    pathname.startsWith("/om-oss/")
  ) {
    /* Kun opacity — transform på wrapper bryter sticky/fixed på menyen */
    enterClass = styles.enterTjenester;
  }

  prevPathRef.current = pathname;

  return (
    <div key={pathname} className={enterClass}>
      {children}
    </div>
  );
}

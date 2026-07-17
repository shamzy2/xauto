"use client";

import { useEffect, type RefObject } from "react";

function reducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scrolls the ref target into view when `trigger` becomes truthy (e.g. validation error).
 * Uses `block: "nearest"` so the page only moves as much as needed to reveal the element.
 * rAF waits until layout (including portaled bars) is ready.
 */
export function useScrollIntoViewWhen<T extends HTMLElement>(
  trigger: unknown,
  ref: RefObject<T | null>,
) {
  useEffect(() => {
    if (trigger == null || trigger === false || trigger === "") return;
    const el = ref.current;
    if (!el) return;
    const id = window.requestAnimationFrame(() => {
      el.scrollIntoView({
        behavior: reducedMotion() ? "auto" : "smooth",
        block: "nearest",
        inline: "nearest",
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [trigger]);
}

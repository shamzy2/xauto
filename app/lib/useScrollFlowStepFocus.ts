"use client";

import { useEffect, useRef } from "react";

function reducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readHeaderOffset(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--site-header-offset",
  );
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 94;
}

/** Sentrer skjemakortet i synlig område under sticky header. */
export function scrollFlowCardIntoFrame(anchor: HTMLElement) {
  const card =
    anchor.closest<HTMLElement>("[data-sell-flow-form-card]") ?? anchor;

  const headerOffset = readHeaderOffset();
  const topPad = 14;
  const bottomPad = 18;
  const visibleTop = headerOffset + topPad;
  const visibleBottom = window.innerHeight - bottomPad;
  const visibleHeight = Math.max(120, visibleBottom - visibleTop);

  const rect = card.getBoundingClientRect();
  const cardHeight = rect.height;

  let scrollDelta: number;

  if (cardHeight >= visibleHeight * 0.92) {
    /* Langt steg — hold toppen av kortet like under header */
    scrollDelta = rect.top - visibleTop;
  } else {
    /* Sentrer kortet vertikalt i rammen */
    const cardCenterY = rect.top + cardHeight / 2;
    const frameCenterY = visibleTop + visibleHeight * 0.46;
    scrollDelta = cardCenterY - frameCenterY;
  }

  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  const targetY = Math.max(0, Math.min(window.scrollY + scrollDelta, maxScroll));

  window.scrollTo({
    top: targetY,
    behavior: reducedMotion() ? "auto" : "smooth",
  });
}

/**
 * Scrolls the form card into a centered frame when `scrollKey` changes.
 * Step 1 passes `enabled: false` so car info stays visible at the top.
 */
export function useScrollFlowStepFocus(scrollKey: string, enabled = true) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        scrollFlowCardIntoFrame(el);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [scrollKey, enabled]);

  return ref;
}

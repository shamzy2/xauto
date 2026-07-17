"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const MOBILE_MQ = "(max-width: 767px)";

type Props = {
  children: React.ReactNode;
  /** Step CSS module class for the bar (includes @media fixed rules on small screens). */
  className: string;
};

/**
 * On narrow viewports, renders the CTA row as a direct child of `document.body`
 * so `position: fixed` is tied to the viewport — not clipped or offset by
 * animated ancestors (`clip-path`, `transform`, etc.).
 */
export function SellMobileCtaDock({ children, className }: Props) {
  const [mounted, setMounted] = useState(false);
  const [usePortal, setUsePortal] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setUsePortal(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  if (usePortal) {
    return createPortal(
      <div className={className} data-sell-mobile-dock>
        {children}
      </div>,
      document.body,
    );
  }

  return <div className={className}>{children}</div>;
}

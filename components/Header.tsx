"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/content";

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className={`site-header ${solid ? "solid" : ""}`}>
        <Link href="/" className="logo">
          X Bilsenter
        </Link>

        <nav className="nav" aria-label="Hovedmeny">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <a href={site.phoneHref} className="header-cta">
          {site.phone}
        </a>

        <button
          type="button"
          className="menu-btn"
          onClick={() => setOpen(true)}
          aria-label="Åpne meny"
        >
          Meny
        </button>
      </header>

      <nav className={`mobile-nav ${open ? "open" : ""}`} aria-hidden={!open}>
        <button type="button" className="mobile-nav-close" onClick={() => setOpen(false)}>
          Lukk
        </button>
        {nav.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
        <a href={site.phoneHref} onClick={() => setOpen(false)}>
          {site.phone}
        </a>
      </nav>
    </>
  );
}

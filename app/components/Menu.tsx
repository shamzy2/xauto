"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { site } from "@/lib/siteContent";
import { BrandLogo } from "./BrandLogo";
import styles from "./Menu.module.css";

const navItems = [
  { href: "/", label: "Hjem" },
  { href: "/biler", label: "Våre biler" },
  { href: "/innbytte", label: "Innbytte" },
  { href: "/om-oss", label: "Om oss" },
] as const;

const utilityLinks = [
  { href: "/kontakt", label: "Kontakt" },
  { href: "/selg", label: "Selg bilen" },
] as const;

const MOBILE_MQ = "(max-width: 900px)";
const MENU_PORTAL_DOM_ID = "__fjord_menu_portal";
const SCROLL_SOLID_Y = 24;

function navLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Skjematrinn etter inngang — ikke /selg eller /innbytte hero. */
function isSellInnbytteFlowStep(pathname: string): boolean {
  return pathname.startsWith("/selg/") || pathname.startsWith("/innbytte/");
}

type MenuTone = "default" | "onDark" | "auto";

type MenuProps = {
  /** `auto` = mørk på forsiden, /om-oss og /biler. */
  tone?: MenuTone;
};

export function Menu({ tone = "auto" }: MenuProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelId = useId().replace(/:/g, "");
  const logoClipId = `${useId().replace(/:/g, "")}-xauto-logo-clip`;
  const mobileMenuLogoClipId = `${useId().replace(/:/g, "")}-mnav-logo-clip`;

  const resolvedTone =
    tone === "auto"
      ? pathname === "/" || pathname === "/om-oss" || pathname === "/biler"
        ? "onDark"
        : "default"
      : tone;

  const onDark = resolvedTone === "onDark";
  const solidBar = scrolled || isSellInnbytteFlowStep(pathname);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const mobileNavRef = useRef<HTMLElement>(null);
  const [menuPortalEl, setMenuPortalEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.createElement("div");
    el.id = MENU_PORTAL_DOM_ID;
    document.body.appendChild(el);
    setMenuPortalEl(el);
    return () => {
      el.remove();
      setMenuPortalEl(null);
    };
  }, []);

  useEffect(() => {
    const read = () => {
      const y = window.scrollY;
      setScrolled((prev) => {
        if (y > SCROLL_SOLID_Y) return true;
        if (y < SCROLL_SOLID_Y / 2) return false;
        return prev;
      });
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    return () => window.removeEventListener("scroll", read);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);

    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
    };
  }, [menuOpen, closeMenu]);

  useLayoutEffect(() => {
    if (menuOpen && mobileNavRef.current) {
      mobileNavRef.current.scrollTop = 0;
    }
  }, [menuOpen]);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const onChange = () => {
      if (!mq.matches) closeMenu();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [closeMenu]);

  const isHeroUnderNav =
    pathname === "/" || pathname === "/biler" || pathname === "/om-oss";
  const useTransparentMain = onDark && !solidBar && isHeroUnderNav;

  const mainBarClass = [
    styles.main,
    useTransparentMain ? styles.mainDark : "",
    !useTransparentMain && onDark ? styles.mainDarkSolid : "",
    !useTransparentMain && !onDark ? styles.mainSolid : "",
  ]
    .filter(Boolean)
    .join(" ");

  const mobileMenuPortal =
    menuOpen && menuPortalEl
      ? createPortal(
          <div
            id={panelId}
            className={styles.mobileOverlay}
            role="dialog"
            aria-modal="true"
            aria-label="Meny"
            onClick={closeMenu}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <div className={styles.mobileTop}>
                <Link
                  href="/"
                  className={styles.mobileLogo}
                  onClick={closeMenu}
                  aria-label="X Auto, hjem"
                >
                  <BrandLogo clipPathId={mobileMenuLogoClipId} variant="onDark" />
                </Link>
                <button
                  type="button"
                  className={styles.mobileClose}
                  onClick={closeMenu}
                  aria-label="Lukk meny"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <nav ref={mobileNavRef} className={styles.mobileNav} aria-label="Hovedlenker">
                <ul className={styles.mobileList}>
                  {navItems.map((item) => {
                    const active = navLinkActive(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`${styles.mobileLink} ${active ? styles.mobileLinkActive : ""}`}
                          aria-current={active ? "page" : undefined}
                          onClick={closeMenu}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                  <li>
                    <Link
                      href="/kontakt"
                      className={`${styles.mobileLink} ${navLinkActive(pathname, "/kontakt") ? styles.mobileLinkActive : ""}`}
                      aria-current={navLinkActive(pathname, "/kontakt") ? "page" : undefined}
                      onClick={closeMenu}
                    >
                      Kontakt oss
                    </Link>
                  </li>
                </ul>
              </nav>

              <div className={styles.mobileFooter}>
                <div className={styles.mobileCtaStack}>
                  <Link href="/selg" className={styles.mobileCtaSolid} onClick={closeMenu}>
                    <span>Selg bilen din</span>
                    <span className={styles.mobileCtaArrow} aria-hidden>
                      ›
                    </span>
                  </Link>
                  <Link href="/biler" className={styles.mobileCtaGhost} onClick={closeMenu}>
                    <span>Våre biler</span>
                    <span className={styles.mobileCtaArrow} aria-hidden>
                      ›
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>,
          menuPortalEl,
        )
      : null;

  return (
    <>
      <header className={`${styles.shell} ${styles.shellSticky}`}>
        <div className={styles.utility} aria-label="Kontakt og snarveier">
          <div className={styles.utilityInner}>
            <div className={styles.utilityLeft}>
              <span className={styles.utilityLocation}>{site.address.label}</span>
              <a className={styles.utilityPhone} href={`mailto:${site.email}`}>
                {site.email.toUpperCase()}
              </a>
            </div>
            <nav className={styles.utilityNav}>
              {utilityLinks.map((link, i) => (
                <span key={link.href}>
                  {i > 0 ? (
                    <span className={styles.utilitySep} aria-hidden>
                      |
                    </span>
                  ) : null}
                  <Link href={link.href} className={styles.utilityLink}>
                    {link.label}
                  </Link>
                </span>
              ))}
            </nav>
          </div>
        </div>

        <div className={mainBarClass}>
          <div className={styles.mainInner}>
            <Link href="/" className={styles.logo} aria-label="X Auto, hjem">
              <BrandLogo clipPathId={logoClipId} variant="onDark" />
            </Link>

            <nav className={styles.desktopNav} aria-label="Hovedmeny">
              {navItems.map((item) => {
                const active = navLinkActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navLink} ${onDark ? styles.navLinkDark : ""} ${active ? styles.navLinkActive : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className={styles.actions}>
              <a
                className={`${styles.mobilePhone} ${onDark ? styles.mobilePhoneDark : ""}`}
                href={`mailto:${site.email}`}
              >
                {site.email.toUpperCase()}
              </a>
              <Link
                href="/kontakt"
                className={`${styles.navLink} ${styles.desktopOnly} ${onDark ? styles.navLinkDark : ""} ${navLinkActive(pathname, "/kontakt") ? styles.navLinkActive : ""}`}
                aria-current={navLinkActive(pathname, "/kontakt") ? "page" : undefined}
              >
                Kontakt
              </Link>
              <Link
                href="/selg"
                className={`${styles.cta} ${onDark && !solidBar ? styles.ctaDark : ""}`}
              >
                Selg bilen din
              </Link>
              <button
                type="button"
                className={`${styles.menuToggle} ${onDark ? styles.menuToggleDark : ""}`}
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-controls={panelId}
                aria-label={menuOpen ? "Lukk meny" : "Åpne meny"}
              >
                {menuOpen ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M5 7h14M5 12h14M5 17h14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      {mobileMenuPortal}
    </>
  );
}

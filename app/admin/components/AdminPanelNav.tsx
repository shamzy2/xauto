"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "../admin.module.css";

const HREF_DASHBOARD = "/admin/dashboard";
const HREF_ANNUAL_REPORT = "/admin/reports/annual";
const HREF_SELG = "/admin/innsendinger";
const HREF_INNBYTTE = "/admin/innsendinger/innbytte";
const HREF_KONTAKT = "/admin/innsendinger/kontakt";
const HREF_CARS = "/admin/cars";
const HREF_GENERAL_COSTS = "/admin/costs/general";
const HREF_FINANCING = "/admin/financing";
const HREF_SETTINGS = "/admin/accounting/settings";

function navLinkClass(active: boolean) {
  return active
    ? `${styles.adminNavLink} ${styles.adminNavLinkActive}`
    : styles.adminNavLink;
}

export function AdminPanelNav() {
  const pathname = usePathname();
  const dashboardActive =
    pathname === HREF_DASHBOARD ||
    pathname.startsWith(`${HREF_DASHBOARD}/`);
  const annualReportActive =
    pathname === HREF_ANNUAL_REPORT ||
    pathname.startsWith(`${HREF_ANNUAL_REPORT}/`);
  const selgActive = pathname === HREF_SELG;
  const innbytteActive = pathname === HREF_INNBYTTE;
  const kontaktActive =
    pathname === HREF_KONTAKT || pathname.startsWith(`${HREF_KONTAKT}/`);
  const carsActive =
    pathname === HREF_CARS || pathname.startsWith(`${HREF_CARS}/`);
  const generalCostsActive =
    pathname === HREF_GENERAL_COSTS ||
    pathname.startsWith(`${HREF_GENERAL_COSTS}/`);
  const financingActive =
    pathname === HREF_FINANCING ||
    pathname.startsWith(`${HREF_FINANCING}/`);
  const settingsActive =
    pathname === HREF_SETTINGS || pathname.startsWith(`${HREF_SETTINGS}/`);

  return (
    <nav className={styles.adminNav} aria-label="Admin">
      <Link
        href={HREF_DASHBOARD}
        className={navLinkClass(dashboardActive)}
        aria-current={dashboardActive ? "page" : undefined}
      >
        Dashboard
      </Link>
      <Link
        href={HREF_ANNUAL_REPORT}
        className={navLinkClass(annualReportActive)}
        aria-current={annualReportActive ? "page" : undefined}
      >
        Årsregnskap
      </Link>
      <Link
        href={HREF_SELG}
        className={navLinkClass(selgActive)}
        aria-current={selgActive ? "page" : undefined}
      >
        Selg bilen
      </Link>
      <Link
        href={HREF_INNBYTTE}
        className={navLinkClass(innbytteActive)}
        aria-current={innbytteActive ? "page" : undefined}
      >
        Innbytte
      </Link>
      <Link
        href={HREF_KONTAKT}
        className={navLinkClass(kontaktActive)}
        aria-current={kontaktActive ? "page" : undefined}
      >
        Kontakt
      </Link>
      <Link
        href={HREF_CARS}
        className={navLinkClass(carsActive)}
        aria-current={carsActive ? "page" : undefined}
      >
        Biler
      </Link>
      <Link
        href={HREF_GENERAL_COSTS}
        className={navLinkClass(generalCostsActive)}
        aria-current={generalCostsActive ? "page" : undefined}
      >
        Driftskostnader
      </Link>
      <Link
        href={HREF_FINANCING}
        className={navLinkClass(financingActive)}
        aria-current={financingActive ? "page" : undefined}
      >
        Finansiering
      </Link>
      <Link
        href={HREF_SETTINGS}
        className={navLinkClass(settingsActive)}
        aria-current={settingsActive ? "page" : undefined}
      >
        Innstillinger
      </Link>
    </nav>
  );
}

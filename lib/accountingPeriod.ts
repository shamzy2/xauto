import type { AccountingSettings } from "@/types/accounting";

export function yearFromDate(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const y = Number.parseInt(dateStr.slice(0, 4), 10);
  return Number.isFinite(y) ? y : null;
}

/** Earliest regnskapsår based on start date, or current calendar year. */
export function resolveMinReportYear(settings: AccountingSettings): number {
  const fromStart = yearFromDate(settings.accountingStartDate);
  if (fromStart !== null) return fromStart;
  return new Date().getFullYear();
}

export function getDefaultReportYear(settings: AccountingSettings): number {
  const current = new Date().getFullYear();
  return Math.max(current, resolveMinReportYear(settings));
}

/** ISO date (YYYY-MM-DD) on or after regnskapsstart. Missing date fails when start is set. */
export function isOnOrAfterAccountingStart(
  dateStr: string | null | undefined,
  startDate: string | null,
): boolean {
  if (!startDate) return true;
  if (!dateStr) return false;
  return dateStr.slice(0, 10) >= startDate.slice(0, 10);
}

export function isPartialFirstAccountingYear(
  year: number,
  startDate: string | null,
): boolean {
  if (!startDate) return false;
  const startYear = yearFromDate(startDate);
  if (startYear !== year) return false;
  return startDate.slice(5, 10) !== "01-01";
}

export function formatAccountingStartNote(startDate: string | null): string | null {
  if (!startDate) {
    return "Regnskapsstart er ikke satt — alt registrert data inkluderes. Sett startdato under Innstillinger når du vet når selskapet starter.";
  }
  const formatted = new Date(`${startDate}T12:00:00`).toLocaleDateString("nb-NO", {
    timeZone: "Europe/Oslo",
  });
  return `Regnskapsføring fra ${formatted}. Poster før denne datoen telles ikke med.`;
}

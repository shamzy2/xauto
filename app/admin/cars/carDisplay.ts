import { SITE_TIME_ZONE } from "@/lib/formatOslo";

import type { CarStatus } from "@/types/accounting";

export const CAR_STATUS_LABELS: Record<CarStatus, string> = {
  in_stock: "På lager",
  sold: "Solgt",
  written_off: "Avskrevet",
};

const priceFormatter = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("nb-NO", {
  dateStyle: "medium",
});

export function formatCarPrice(value: number | null): string {
  if (value === null) return "-";
  return priceFormatter.format(value);
}

export function formatCarDate(value: string | null): string {
  if (!value) return "-";
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return dateFormatter.format(d);
}

/** `YYYY-MM-DD` for HTML date inputs. */
export function carDateInputValue(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

/** Today's date as `YYYY-MM-DD` in Europe/Oslo. */
export function todayDateInputValue(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TIME_ZONE,
  }).format(new Date());
}

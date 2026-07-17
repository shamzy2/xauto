/**
 * All customer-facing / admin timestamps for this site use Europe/Oslo
 * so server rendering on Vercel (UTC) matches Norwegian wall clock time.
 */
export const SITE_TIME_ZONE = "Europe/Oslo";

const shortDateTime = new Intl.DateTimeFormat("nb-NO", {
  timeZone: SITE_TIME_ZONE,
  dateStyle: "short",
  timeStyle: "short",
});

const longDateTime = new Intl.DateTimeFormat("nb-NO", {
  timeZone: SITE_TIME_ZONE,
  dateStyle: "long",
  timeStyle: "short",
});

export function formatOsloDateTimeShort(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return shortDateTime.format(d);
}

export function formatOsloDateTimeLong(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return longDateTime.format(d);
}

/** Vanlige driftskostnad-kategorier for bruktbilforhandler. */
export const DEALERSHIP_COST_CATEGORIES = [
  "Husleie",
  "Strøm",
  "Internett / telefon",
  "Forsikring",
  "Markedsføring",
  "Reklame",
  "Regnskap / revisjon",
  "Programvare",
  "Transport / frakt",
  "Reparasjon",
  "Vask / detailing",
  "Kontorrekvisita",
  "Bank / gebyrer",
  "Lønn",
  "Annet",
] as const;

export const FINANCING_TYPE_LABELS: Record<
  import("@/types/accounting").FinancingType,
  string
> = {
  shareholder_loan: "Aksjonærlån",
  bank_credit: "Kassekreditt",
  bank_loan: "Banklån",
} as const;

export type { FinancingType } from "@/types/accounting";

export const FINANCING_TYPE_OPTIONS: {
  value: import("@/types/accounting").FinancingType;
  label: string;
}[] = [
    { value: "shareholder_loan", label: FINANCING_TYPE_LABELS.shareholder_loan },
    { value: "bank_credit", label: FINANCING_TYPE_LABELS.bank_credit },
    { value: "bank_loan", label: FINANCING_TYPE_LABELS.bank_loan },
  ];

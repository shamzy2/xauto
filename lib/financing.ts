import { isOnOrAfterAccountingStart } from "@/lib/accountingPeriod";
import type {
  CompanyFinancing,
  FinancingMovement,
  FinancingType,
} from "@/types/accounting";

export type FinancingBalances = {
  shareholderLoans: number;
  bankCredit: number;
  bankLoans: number;
  totalFinancingDebt: number;
};

export type FinancingItemBalance = {
  financing: CompanyFinancing;
  balance: number;
  availableCredit: number | null;
};

/** Positive movement = mer gjeld (uttak / lån inn til selskapet). Negative = nedbetaling. */
export function calculateFinancingItemBalance(
  financingId: string,
  movements: FinancingMovement[],
  asOfDate: string,
  accountingStartDate: string | null,
): number {
  return movements
    .filter(
      (m) =>
        m.financingId === financingId &&
        m.movementDate <= asOfDate &&
        isOnOrAfterAccountingStart(m.movementDate, accountingStartDate),
    )
    .reduce((sum, m) => sum + m.amount, 0);
}

export function calculateFinancingBalancesAtDate(
  items: CompanyFinancing[],
  movements: FinancingMovement[],
  asOfDate: string,
  accountingStartDate: string | null,
): FinancingBalances {
  let shareholderLoans = 0;
  let bankCredit = 0;
  let bankLoans = 0;

  for (const item of items) {
    const balance = calculateFinancingItemBalance(
      item.id,
      movements,
      asOfDate,
      accountingStartDate,
    );
    if (balance <= 0) continue;

    switch (item.type) {
      case "shareholder_loan":
        shareholderLoans += balance;
        break;
      case "bank_credit":
        bankCredit += balance;
        break;
      case "bank_loan":
        bankLoans += balance;
        break;
    }
  }

  return {
    shareholderLoans,
    bankCredit,
    bankLoans,
    totalFinancingDebt: shareholderLoans + bankCredit + bankLoans,
  };
}

export function calculateFinancingItemBalances(
  items: CompanyFinancing[],
  movements: FinancingMovement[],
  asOfDate: string,
  accountingStartDate: string | null,
): FinancingItemBalance[] {
  return items.map((financing) => {
    const balance = calculateFinancingItemBalance(
      financing.id,
      movements,
      asOfDate,
      accountingStartDate,
    );
    const availableCredit =
      financing.type === "bank_credit" && financing.creditLimit !== null
        ? Math.max(0, financing.creditLimit - Math.max(0, balance))
        : null;

    return { financing, balance, availableCredit };
  });
}

export function sumMovementsByType(
  balances: FinancingBalances,
  type: FinancingType,
): number {
  switch (type) {
    case "shareholder_loan":
      return balances.shareholderLoans;
    case "bank_credit":
      return balances.bankCredit;
    case "bank_loan":
      return balances.bankLoans;
  }
}

export function yearEndDate(year: number): string {
  return `${year}-12-31`;
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

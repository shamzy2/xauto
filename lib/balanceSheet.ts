import type { CarCost, GeneralCost } from "@/types/accounting";

type VatCostRow = Pick<CarCost, "vatAmount"> | Pick<GeneralCost, "vatAmount">;

function calculateInputVatTotal(rows: VatCostRow[]): number {
  return rows.reduce(
    (sum, c) => sum + (Number.isFinite(c.vatAmount) ? c.vatAmount : 0),
    0,
  );
}

export type VatPosition = {
  inngaaendeMva: number;
  utgaaendeMva: number;
  /** Positive = skyldig MVA (gjeld), negative = til gode (fordring). */
  nettoMva: number;
  mvaFordring: number;
  mvaGjeld: number;
};

/** MVA-posisjon fra driftskostnader og bilkostnader (reparasjon m.m.) — ikke bilpriser. */
export function calculateVatPosition(
  carCosts: CarCost[],
  generalCosts: GeneralCost[],
  vatRegistered: boolean,
): VatPosition {
  const inngaaendeMva = vatRegistered
    ? calculateInputVatTotal(carCosts) + calculateInputVatTotal(generalCosts)
    : 0;
  const utgaaendeMva = 0;
  const nettoMva = utgaaendeMva - inngaaendeMva;

  return {
    inngaaendeMva,
    utgaaendeMva,
    nettoMva,
    mvaFordring: nettoMva < 0 ? Math.abs(nettoMva) : 0,
    mvaGjeld: nettoMva > 0 ? nettoMva : 0,
  };
}

import type { FinancingBalances } from "@/lib/financing";

export type BalanceSheetInput = {
  varelager: number;
  bankBalance: number;
  vatPosition: VatPosition;
  openingEquity: number;
  accumulatedPriorResult: number;
  aarsresultat: number;
  accountsPayable: number;
  financing: FinancingBalances;
};

export type BalanceSheetResult = {
  varelager: number;
  bankBalance: number;
  mvaFordring: number;
  sumOmlopsmidler: number;
  sumEiendeler: number;
  accountsPayable: number;
  shareholderLoans: number;
  bankCredit: number;
  bankLoans: number;
  mvaGjeld: number;
  sumGjeld: number;
  inngaaendeEgenkapital: number;
  aarsresultat: number;
  sumEgenkapital: number;
  sumEgenkapitalOgGjeld: number;
  balanseBalanced: boolean;
  balanseDifference: number;
};

const BALANCE_TOLERANCE = 0.01;

export function buildBalanceSheet(input: BalanceSheetInput): BalanceSheetResult {
  const mvaFordring = input.vatPosition.mvaFordring;
  const sumOmlopsmidler =
    input.varelager + input.bankBalance + mvaFordring;
  const sumEiendeler = sumOmlopsmidler;

  const mvaGjeld = input.vatPosition.mvaGjeld;
  const { shareholderLoans, bankCredit, bankLoans, totalFinancingDebt } =
    input.financing;
  const sumGjeld =
    input.accountsPayable +
    shareholderLoans +
    bankCredit +
    bankLoans +
    mvaGjeld;

  const inngaaendeEgenkapital =
    input.openingEquity + input.accumulatedPriorResult;
  const sumEgenkapital = inngaaendeEgenkapital + input.aarsresultat;
  const sumEgenkapitalOgGjeld = sumEgenkapital + sumGjeld;

  const balanseDifference = Math.abs(sumEiendeler - sumEgenkapitalOgGjeld);

  return {
    varelager: input.varelager,
    bankBalance: input.bankBalance,
    mvaFordring,
    sumOmlopsmidler,
    sumEiendeler,
    accountsPayable: input.accountsPayable,
    shareholderLoans,
    bankCredit,
    bankLoans,
    mvaGjeld,
    sumGjeld,
    inngaaendeEgenkapital,
    aarsresultat: input.aarsresultat,
    sumEgenkapital,
    sumEgenkapitalOgGjeld,
    balanseBalanced: balanseDifference <= BALANCE_TOLERANCE,
    balanseDifference,
  };
}

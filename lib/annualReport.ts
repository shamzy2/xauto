import { buildBalanceSheet, calculateVatPosition } from "@/lib/balanceSheet";
import {
  getDefaultReportYear,
  isOnOrAfterAccountingStart,
  isPartialFirstAccountingYear,
  formatAccountingStartNote,
  resolveMinReportYear,
  yearFromDate,
} from "@/lib/accountingPeriod";
import {
  calculateCarCostTotal,
  calculateGeneralCostTotal,
  calculateInventoryValue,
  calculateOperatingResult,
  calculateRevenue,
  calculateVarekostnad,
} from "@/lib/finance";
import {
  assertOperatingResultIsCanonical,
  devRecordReportingEbit,
  filterCarCostsLinkedToSoldCars,
} from "@/lib/financeReporting";
import type {
  AccountingSettings,
  Car,
  CarCost,
  CompanyFinancing,
  FinancingMovement,
  GeneralCost,
} from "@/types/accounting";
import type { BalanceSheetResult } from "@/lib/balanceSheet";
import type { FinancingBalances } from "@/lib/financing";
import { calculateFinancingBalancesAtDate, yearEndDate } from "@/lib/financing";

export { yearFromDate, getDefaultReportYear, resolveMinReportYear };

const VALIDATION_TOLERANCE_NOK = 0.01;

export type AnnualReportValidation = {
  revenueConsistent: boolean;
  carCostsInYearTotal: number;
  carCostsInYearOnSoldCars: number;
  carCostsCapitalizedToInventory: number;
  carCostsUnallocatedInYear: number;
  carCostsInVarekostnadTotal: number;
  generalCostsTotal: number;
  derivedEbit: number;
  computedEbit: number;
  ebitDifference: number;
  warnings: string[];
};

export type AnnualFinancialReport = {
  metadata: {
    year: number;
    generatedAt: string;
    validation: AnnualReportValidation;
    complianceNotes: string[];
    companyName: string | null;
    orgNumber: string | null;
    vatRegistered: boolean;
    pricesExVat: boolean;
    accountingStartDate: string | null;
    partialFirstYear: boolean;
  };
  resultatregnskap: {
    salgsinntekter: number;
    varekostnad: number;
    andreDriftskostnader: number;
    driftsresultat: number;
    aarsresultat: number;
    utgaaendeMva: number;
    inngaaendeMva: number;
  };
  balanse: BalanceSheetResult & {
    /** Alias for bankBalance (legacy UI key). */
    kontanter: number;
    /** Alias for sumGjeld (legacy UI key). */
    gjeld: number;
    /** Alias for sumEgenkapital (legacy UI key). */
    egenkapital: number;
  };
};

/** All inputs for one regnskapsår, filtered before any finance call. */
export type YearScopedReportData = {
  year: number;
  carsSoldInYear: Car[];
  /** All `car_costs` rows linked to cars sold in `year` (COGS, any cost_date). */
  carCostsForVarekostnad: CarCost[];
  /** `car_costs` with `cost_date` in `year` (period slice). */
  carCostsInYear: CarCost[];
  carCostsInYearOnSoldCars: CarCost[];
  /** `car_costs` in `year` on cars not sold in `year` → balanse, not P&L. */
  carCostsInYearCapitalized: CarCost[];
  carCostsInYearUnallocated: CarCost[];
  generalCostsInYear: GeneralCost[];
  inventoryCarsAtYearEnd: Car[];
  inventoryCarCostsAtYearEnd: CarCost[];
};

function filterCarsForAccountingPeriod(
  cars: Car[],
  startDate: string | null,
): Car[] {
  if (!startDate) return cars;
  return cars.filter((car) => {
    if (car.status === "sold") {
      return isOnOrAfterAccountingStart(car.soldAt, startDate);
    }
    return isOnOrAfterAccountingStart(car.acquiredAt, startDate);
  });
}

function filterCostsForAccountingPeriod<T extends { costDate: string }>(
  costs: T[],
  startDate: string | null,
): T[] {
  if (!startDate) return costs;
  return costs.filter((cost) =>
    isOnOrAfterAccountingStart(cost.costDate, startDate),
  );
}

export function filterCarsSoldInYear(cars: Car[], year: number): Car[] {
  return cars.filter(
    (car) => car.status === "sold" && yearFromDate(car.soldAt) === year,
  );
}

export function filterCarCostsInYear(
  carCosts: CarCost[],
  year: number,
): CarCost[] {
  return carCosts.filter((cost) => yearFromDate(cost.costDate) === year);
}

export function filterGeneralCostsInYear(
  generalCosts: GeneralCost[],
  year: number,
): GeneralCost[] {
  return generalCosts.filter(
    (cost) => yearFromDate(cost.costDate) === year,
  );
}

export function filterCarCostsInYearOnSoldCars(
  carCostsInYear: CarCost[],
  soldCars: Car[],
): CarCost[] {
  const soldIds = new Set(soldCars.map((car) => car.id));
  return carCostsInYear.filter((cost) => soldIds.has(cost.carId));
}

/** Car costs in `year` on cars not sold in `year` (capitalized, not P&L). */
export function filterCarCostsInYearCapitalized(
  carCostsInYear: CarCost[],
  soldCars: Car[],
): CarCost[] {
  const soldIds = new Set(soldCars.map((car) => car.id));
  return carCostsInYear.filter((cost) => !soldIds.has(cost.carId));
}

/** Cars in stock at 31.12 in `year`. */
export function filterInventoryCarsAtYearEnd(
  cars: Car[],
  year: number,
): Car[] {
  return cars.filter((car) => {
    if (car.status !== "in_stock") return false;
    const acquiredYear = yearFromDate(car.acquiredAt);
    if (acquiredYear !== null && acquiredYear > year) return false;
    const soldYear = yearFromDate(car.soldAt);
    if (soldYear !== null && soldYear <= year) return false;
    return true;
  });
}

/** Car costs capitalized on inventory units at year-end (cost_date ≤ year). */
export function filterCarCostsForInventoryAtYearEnd(
  carCosts: CarCost[],
  inventoryCars: Car[],
  year: number,
): CarCost[] {
  const ids = new Set(inventoryCars.map((car) => car.id));
  return carCosts.filter((cost) => {
    if (!ids.has(cost.carId)) return false;
    const costYear = yearFromDate(cost.costDate);
    return costYear !== null && costYear <= year;
  });
}

/**
 * Filter all source data for `year` once; used by `buildAnnualFinancialReport`.
 */
export function filterYearScopedReportData(
  cars: Car[],
  carCosts: CarCost[],
  generalCosts: GeneralCost[],
  year: number,
  settings: AccountingSettings,
): YearScopedReportData {
  const startDate = settings.accountingStartDate;
  const periodCars = filterCarsForAccountingPeriod(cars, startDate);
  const periodCarCosts = filterCostsForAccountingPeriod(carCosts, startDate);
  const periodGeneralCosts = filterCostsForAccountingPeriod(
    generalCosts,
    startDate,
  );

  const carsSoldInYear = filterCarsSoldInYear(periodCars, year);
  const carCostsForVarekostnad = filterCarCostsLinkedToSoldCars(
    periodCarCosts,
    carsSoldInYear,
  );
  const carCostsInYear = filterCarCostsInYear(periodCarCosts, year);
  const carCostsInYearOnSoldCars = filterCarCostsInYearOnSoldCars(
    carCostsInYear,
    carsSoldInYear,
  );
  const carCostsInYearCapitalized = filterCarCostsInYearCapitalized(
    carCostsInYear,
    carsSoldInYear,
  );
  const allocatedIds = new Set([
    ...carCostsInYearOnSoldCars.map((c) => c.id),
    ...carCostsInYearCapitalized.map((c) => c.id),
  ]);
  const carCostsInYearUnallocated = carCostsInYear.filter(
    (cost) => !allocatedIds.has(cost.id),
  );
  const inventoryCarsAtYearEnd = filterInventoryCarsAtYearEnd(periodCars, year);

  return {
    year,
    carsSoldInYear,
    carCostsForVarekostnad,
    carCostsInYear,
    carCostsInYearOnSoldCars,
    carCostsInYearCapitalized,
    carCostsInYearUnallocated,
    generalCostsInYear: filterGeneralCostsInYear(periodGeneralCosts, year),
    inventoryCarsAtYearEnd,
    inventoryCarCostsAtYearEnd: filterCarCostsForInventoryAtYearEnd(
      periodCarCosts,
      inventoryCarsAtYearEnd,
      year,
    ),
  };
}

export function detectAvailableReportYears(
  cars: Car[],
  carCosts: CarCost[],
  generalCosts: GeneralCost[],
  settings: AccountingSettings,
): number[] {
  const minYear = resolveMinReportYear(settings);
  const years = new Set<number>([getDefaultReportYear(settings)]);
  const startDate = settings.accountingStartDate;
  const periodCars = filterCarsForAccountingPeriod(cars, startDate);
  const periodCarCosts = filterCostsForAccountingPeriod(carCosts, startDate);
  const periodGeneralCosts = filterCostsForAccountingPeriod(
    generalCosts,
    startDate,
  );

  for (const car of periodCars) {
    const acquired = yearFromDate(car.acquiredAt);
    const sold = yearFromDate(car.soldAt);
    if (acquired !== null && acquired >= minYear) years.add(acquired);
    if (sold !== null && sold >= minYear) years.add(sold);
  }
  for (const cost of periodCarCosts) {
    const y = yearFromDate(cost.costDate);
    if (y !== null && y >= minYear) years.add(y);
  }
  for (const cost of periodGeneralCosts) {
    const y = yearFromDate(cost.costDate);
    if (y !== null && y >= minYear) years.add(y);
  }

  return [...years].sort((a, b) => a - b);
}

/** Sum of operating results for all years strictly before `year`. */
export function calculateAccumulatedResultBeforeYear(
  cars: Car[],
  carCosts: CarCost[],
  generalCosts: GeneralCost[],
  year: number,
  settings: AccountingSettings,
): number {
  return detectAvailableReportYears(cars, carCosts, generalCosts, settings)
    .filter((y) => y < year)
    .reduce((sum, y) => {
      const scoped = filterYearScopedReportData(
        cars,
        carCosts,
        generalCosts,
        y,
        settings,
      );
      return (
        sum +
        calculateOperatingResult(
          scoped.carsSoldInYear,
          scoped.carCostsForVarekostnad,
          scoped.generalCostsInYear,
        )
      );
    }, 0);
}

function buildAnnualReportValidation(
  data: YearScopedReportData,
  salgsinntekter: number,
  varekostnad: number,
  andreDriftskostnader: number,
  computedEbit: number,
): AnnualReportValidation {
  const warnings: string[] = [];

  const revenueFromFinance = calculateRevenue(data.carsSoldInYear);
  const revenueConsistent =
    Math.abs(revenueFromFinance - salgsinntekter) <= VALIDATION_TOLERANCE_NOK;

  const carCostsInYearTotal = calculateCarCostTotal(data.carCostsInYear);
  const carCostsInYearOnSoldCars = calculateCarCostTotal(
    data.carCostsInYearOnSoldCars,
  );
  const carCostsCapitalizedToInventory = calculateCarCostTotal(
    data.carCostsInYearCapitalized,
  );
  const carCostsUnallocatedInYear = calculateCarCostTotal(
    data.carCostsInYearUnallocated,
  );
  const carCostsInVarekostnadTotal = calculateCarCostTotal(
    data.carCostsForVarekostnad,
  );
  const generalCostsTotal = calculateGeneralCostTotal(data.generalCostsInYear);

  const derivedEbit = salgsinntekter - varekostnad - andreDriftskostnader;
  const ebitDifference = Math.abs(derivedEbit - computedEbit);

  if (!revenueConsistent) {
    warnings.push(
      `Omsetning avviker fra calculateRevenue med ${Math.abs(revenueFromFinance - salgsinntekter).toFixed(2)} NOK.`,
    );
  }

  const yearPartitionTotal =
    carCostsInYearOnSoldCars +
    carCostsCapitalizedToInventory +
    carCostsUnallocatedInYear;
  if (
    Math.abs(yearPartitionTotal - carCostsInYearTotal) >
    VALIDATION_TOLERANCE_NOK
  ) {
    warnings.push(
      `Bilkostnader i år (${carCostsInYearTotal.toFixed(2)}) stemmer ikke med fordeling (${yearPartitionTotal.toFixed(2)}).`,
    );
  }

  if (carCostsUnallocatedInYear > VALIDATION_TOLERANCE_NOK) {
    warnings.push(
      `${carCostsUnallocatedInYear.toFixed(2)} NOK bilkostnader i år er ikke allokert (verken varekost eller lager).`,
    );
  }

  if (ebitDifference > VALIDATION_TOLERANCE_NOK) {
    warnings.push(
      `EBIT-avvik: beregnet ${computedEbit.toFixed(2)} vs. utledet ${derivedEbit.toFixed(2)} (diff ${ebitDifference.toFixed(2)} NOK).`,
    );
  }

  return {
    revenueConsistent,
    carCostsInYearTotal,
    carCostsInYearOnSoldCars,
    carCostsCapitalizedToInventory,
    carCostsUnallocatedInYear,
    carCostsInVarekostnadTotal,
    generalCostsTotal,
    derivedEbit,
    computedEbit,
    ebitDifference,
    warnings,
  };
}

/**
 * Build annual statements from pre-filtered year data via `/lib/finance.ts` only.
 */
export function buildAnnualFinancialReportFromScopedData(
  data: YearScopedReportData,
  settings: AccountingSettings,
  accumulatedPriorResult: number,
  financing: FinancingBalances,
): AnnualFinancialReport {
  const salgsinntekter = calculateRevenue(data.carsSoldInYear);
  const varekostnad = calculateVarekostnad(
    data.carsSoldInYear,
    data.carCostsForVarekostnad,
  );
  const andreDriftskostnader = calculateGeneralCostTotal(
    data.generalCostsInYear,
  );
  const driftsresultat = calculateOperatingResult(
    data.carsSoldInYear,
    data.carCostsForVarekostnad,
    data.generalCostsInYear,
  );
  const aarsresultat = driftsresultat;

  assertOperatingResultIsCanonical(
    `annual-report-${data.year}`,
    data.carsSoldInYear,
    data.carCostsForVarekostnad,
    data.generalCostsInYear,
    driftsresultat,
  );

  const validation = buildAnnualReportValidation(
    data,
    salgsinntekter,
    varekostnad,
    andreDriftskostnader,
    driftsresultat,
  );

  const varelager = calculateInventoryValue(
    data.inventoryCarsAtYearEnd,
    data.inventoryCarCostsAtYearEnd,
  );

  const vatPosition = calculateVatPosition(
    data.carCostsInYear,
    data.generalCostsInYear,
    settings.vatRegistered,
  );

  const balance = buildBalanceSheet({
    varelager,
    bankBalance: settings.bankBalance,
    vatPosition,
    openingEquity: settings.openingEquity,
    accumulatedPriorResult,
    aarsresultat,
    accountsPayable: settings.accountsPayable,
    financing,
  });

  if (!balance.balanseBalanced) {
    validation.warnings.push(
      `Balanse avviker med ${balance.balanseDifference.toFixed(2)} NOK (eiendeler ≠ egenkapital + gjeld).`,
    );
  }

  const startNote = formatAccountingStartNote(settings.accountingStartDate);
  const complianceNotes = [
    startNote,
    ...(isPartialFirstAccountingYear(data.year, settings.accountingStartDate)
      ? [
          `Første regnskapsår er delvis — kun poster fra regnskapsstart telles med i ${data.year}.`,
        ]
      : []),
    "Bilpriser (inn-/utsalg) føres inkl. MVA — ingen MVA-oppsplitting på biler.",
    settings.vatRegistered
      ? "Reparasjon, bilkostnader og øvrige driftskostnader føres ekskl. MVA med inngående MVA-fradrag."
      : "Virksomheten er ikke MVA-registrert i systemet.",
    "Inntekter og kostnader føres etter realisasjonsprinsippet (salgs-/kostnadsdato).",
    "Last opp kvitteringer (bilde/PDF) eller fyll inn bilagsreferanse for driftskostnader.",
    "Aksjonærlån, kassekreditt og banklån føres under Finansiering og vises i balansen.",
    "Dette er et internt regnskap — kontroller mot regnskapsfører før innsending til myndigheter.",
  ].filter((note): note is string => Boolean(note));

  return {
    metadata: {
      year: data.year,
      generatedAt: new Date().toISOString(),
      validation,
      complianceNotes,
      companyName: settings.companyName,
      orgNumber: settings.orgNumber,
      vatRegistered: settings.vatRegistered,
      pricesExVat: settings.pricesExVat,
      accountingStartDate: settings.accountingStartDate,
      partialFirstYear: isPartialFirstAccountingYear(
        data.year,
        settings.accountingStartDate,
      ),
    },
    resultatregnskap: {
      salgsinntekter,
      varekostnad,
      andreDriftskostnader,
      driftsresultat,
      aarsresultat,
      utgaaendeMva: vatPosition.utgaaendeMva,
      inngaaendeMva: vatPosition.inngaaendeMva,
    },
    balanse: {
      ...balance,
      kontanter: balance.bankBalance,
      gjeld: balance.sumGjeld,
      egenkapital: balance.sumEgenkapital,
    },
  };
}

export function buildAnnualFinancialReport(
  cars: Car[],
  carCosts: CarCost[],
  generalCosts: GeneralCost[],
  year: number,
  settings: AccountingSettings,
  financingItems: CompanyFinancing[],
  financingMovements: FinancingMovement[],
): AnnualFinancialReport {
  const scoped = filterYearScopedReportData(
    cars,
    carCosts,
    generalCosts,
    year,
    settings,
  );
  const accumulatedPriorResult = calculateAccumulatedResultBeforeYear(
    cars,
    carCosts,
    generalCosts,
    year,
    settings,
  );
  const financing = calculateFinancingBalancesAtDate(
    financingItems,
    financingMovements,
    yearEndDate(year),
    settings.accountingStartDate,
  );
  const report = buildAnnualFinancialReportFromScopedData(
    scoped,
    settings,
    accumulatedPriorResult,
    financing,
  );
  devRecordReportingEbit(
    "annual",
    cars,
    carCosts,
    generalCosts,
    report.resultatregnskap.driftsresultat,
  );
  return report;
}

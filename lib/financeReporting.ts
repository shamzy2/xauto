import {
  calculateGeneralCostTotal,
  calculateOperatingResult,
  calculateVarekostnad,
} from "@/lib/finance";
import type { Car, CarCost, GeneralCost } from "@/types/accounting";

const EBIT_TOLERANCE_NOK = 0.01;

/** All sold inventory units (lifetime / dashboard scope). */
export function filterSoldCars(cars: Car[]): Car[] {
  return cars.filter((car) => car.status === "sold");
}

/** Car costs linked to sold vehicles (excludes inventory — not in P&L). */
export function filterCarCostsLinkedToSoldCars(
  carCosts: CarCost[],
  soldCars: Car[],
): CarCost[] {
  const soldIds = new Set(soldCars.map((car) => car.id));
  return carCosts.filter((cost) => soldIds.has(cost.carId));
}

export type OperatingResultInputs = {
  soldCars: Car[];
  carCostsOnSoldCars: CarCost[];
  generalCosts: GeneralCost[];
};

/** Prepare inputs for `calculateOperatingResult` (single allocation rules). */
export function prepareOperatingResultInputs(
  cars: Car[],
  carCosts: CarCost[],
  generalCosts: GeneralCost[],
): OperatingResultInputs {
  const soldCars = filterSoldCars(cars);
  return {
    soldCars,
    carCostsOnSoldCars: filterCarCostsLinkedToSoldCars(carCosts, soldCars),
    generalCosts,
  };
}

/** Lifetime EBIT — dashboard and all-time reporting. */
export function computeLifetimeOperatingResult(
  cars: Car[],
  carCosts: CarCost[],
  generalCosts: GeneralCost[],
): number {
  const inputs = prepareOperatingResultInputs(cars, carCosts, generalCosts);
  return calculateOperatingResult(
    inputs.soldCars,
    inputs.carCostsOnSoldCars,
    inputs.generalCosts,
  );
}

/** Total P&L costs (varekostnad + general) for reporting — from finance.ts only. */
export function computeReportingTotalCosts(
  soldCars: Car[],
  carCostsOnSoldCars: CarCost[],
  generalCosts: GeneralCost[],
): number {
  return (
    calculateVarekostnad(soldCars, carCostsOnSoldCars) +
    calculateGeneralCostTotal(generalCosts)
  );
}

function datasetKey(
  cars: Car[],
  carCosts: CarCost[],
  generalCosts: GeneralCost[],
): string {
  return [
    ...cars.map((c) => c.id).sort(),
    ...carCosts.map((c) => c.id).sort(),
    ...generalCosts.map((c) => c.id).sort(),
  ].join("|");
}

const devEbitByDataset = new Map<
  string,
  { dashboard?: number; annual?: number }
>();

/** Dev: verify reported EBIT equals `calculateOperatingResult` for given inputs. */
export function assertOperatingResultIsCanonical(
  source: string,
  soldCars: Car[],
  carCostsOnSoldCars: CarCost[],
  generalCosts: GeneralCost[],
  reportedEbit: number,
): void {
  if (process.env.NODE_ENV !== "development") return;

  const computed = calculateOperatingResult(
    soldCars,
    carCostsOnSoldCars,
    generalCosts,
  );
  if (Math.abs(computed - reportedEbit) > EBIT_TOLERANCE_NOK) {
    console.warn(
      `[finance] ${source}: reported EBIT (${reportedEbit}) !== calculateOperatingResult (${computed})`,
    );
  }
}

/** Dev: record dashboard vs annual EBIT for the same loaded dataset. */
export function devRecordReportingEbit(
  source: "dashboard" | "annual",
  cars: Car[],
  carCosts: CarCost[],
  generalCosts: GeneralCost[],
  ebit: number,
): void {
  if (process.env.NODE_ENV !== "development") return;

  const key = datasetKey(cars, carCosts, generalCosts);
  const entry = devEbitByDataset.get(key) ?? {};
  entry[source] = ebit;
  devEbitByDataset.set(key, entry);

  const { dashboard, annual } = entry;
  if (dashboard === undefined || annual === undefined) return;

  if (Math.abs(dashboard - annual) > EBIT_TOLERANCE_NOK) {
    console.warn(
      "[finance] Dashboard EBIT !== Annual EBIT on same dataset:",
      {
        dashboardEbit: dashboard,
        annualEbit: annual,
        differenceNok: dashboard - annual,
        note:
          "Lifetime dashboard scope vs. single-year annual scope — equal only when all activity falls in one reporting year with matching filters.",
      },
    );
  }
}

/** Dev: reset cross-page EBIT cache (tests). */
export function devClearReportingEbitCache(): void {
  devEbitByDataset.clear();
}

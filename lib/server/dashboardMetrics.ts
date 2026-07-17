import "server-only";

import {
  calculateCarProfit,
  calculateInventoryValue,
  calculateRevenue,
} from "@/lib/finance";
import {
  assertOperatingResultIsCanonical,
  computeLifetimeOperatingResult,
  computeReportingTotalCosts,
  devRecordReportingEbit,
  prepareOperatingResultInputs,
} from "@/lib/financeReporting";
import type { Car, CarCost, GeneralCost } from "@/types/accounting";

export type DashboardMetrics = {
  revenue: number;
  /** EBIT — always from `calculateOperatingResult` (lifetime scope). */
  totalProfit: number;
  totalCosts: number;
  inventoryValue: number;
  carsInStock: number;
  carsSold: number;
  netProfitMarginPercent: number | null;
  bestCar: { car: Car; profit: number } | null;
};

function findBestPerformingCar(
  cars: Car[],
  carCosts: CarCost[],
): { car: Car; profit: number } | null {
  const costsByCarId = new Map<string, CarCost[]>();
  for (const cost of carCosts) {
    const list = costsByCarId.get(cost.carId) ?? [];
    list.push(cost);
    costsByCarId.set(cost.carId, list);
  }

  let best: { car: Car; profit: number } | null = null;

  for (const car of cars) {
    const costs = costsByCarId.get(car.id) ?? [];
    const profit = calculateCarProfit(car, costs);
    if (profit === null) continue;
    if (best === null || profit > best.profit) {
      best = { car, profit };
    }
  }

  return best;
}

/**
 * Assembles CEO dashboard KPIs. EBIT and costs use `/lib/finance.ts` via
 * `calculateOperatingResult` (lifetime scope).
 */
export function buildDashboardMetrics(
  cars: Car[],
  carCosts: CarCost[],
  generalCosts: GeneralCost[],
): DashboardMetrics {
  const inputs = prepareOperatingResultInputs(cars, carCosts, generalCosts);
  const revenue = calculateRevenue(inputs.soldCars);
  const totalProfit = computeLifetimeOperatingResult(
    cars,
    carCosts,
    generalCosts,
  );
  const totalCosts = computeReportingTotalCosts(
    inputs.soldCars,
    inputs.carCostsOnSoldCars,
    inputs.generalCosts,
  );
  const inventoryValue = calculateInventoryValue(cars, carCosts);

  assertOperatingResultIsCanonical(
    "dashboard",
    inputs.soldCars,
    inputs.carCostsOnSoldCars,
    inputs.generalCosts,
    totalProfit,
  );
  devRecordReportingEbit(
    "dashboard",
    cars,
    carCosts,
    generalCosts,
    totalProfit,
  );

  const netProfitMarginPercent =
    revenue > 0 ? (totalProfit / revenue) * 100 : null;

  return {
    revenue,
    totalProfit,
    totalCosts,
    inventoryValue,
    carsInStock: cars.filter((car) => car.status === "in_stock").length,
    carsSold: inputs.soldCars.length,
    netProfitMarginPercent,
    bestCar: findBestPerformingCar(cars, carCosts),
  };
}

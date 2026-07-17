import type { Car, CarCost, GeneralCost } from "@/types/accounting";

/** Treat null/undefined money fields as 0 in aggregates. */
function amountOrZero(value: number | null | undefined): number {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 0;
  }
  return value;
}

/**
 * Sum of `amount` across cost rows.
 */
export function calculateCarCostTotal(costs: CarCost[]): number {
  return costs.reduce((sum, cost) => sum + amountOrZero(cost.amount), 0);
}

/**
 * Per-car profit: sale price − purchase price − linked car costs.
 * Returns `null` when the car has no sale price (not sold / unknown revenue).
 */
export function calculateCarProfit(
  car: Car,
  costs: CarCost[],
): number | null {
  if (car.salePrice === null) {
    return null;
  }

  const revenue = amountOrZero(car.salePrice);
  const purchase = amountOrZero(car.purchasePrice);
  const extraCosts = calculateCarCostTotal(costs);

  return revenue - purchase - extraCosts;
}

/**
 * Total revenue from sold cars (`status === 'sold'`), using each car's `salePrice`.
 */
export function calculateRevenue(cars: Car[]): number {
  return cars
    .filter((car) => car.status === "sold")
    .reduce((sum, car) => sum + amountOrZero(car.salePrice), 0);
}

/**
 * Book value of inventory on hand: purchase price + linked car costs
 * for every car with `status === 'in_stock'`.
 */
export function calculateInventoryValue(
  cars: Car[],
  carCosts: CarCost[],
): number {
  const costsByCarId = new Map<string, number>();
  for (const cost of carCosts) {
    const prev = costsByCarId.get(cost.carId) ?? 0;
    costsByCarId.set(cost.carId, prev + amountOrZero(cost.amount));
  }

  return cars
    .filter((car) => car.status === "in_stock")
    .reduce((sum, car) => {
      const purchase = amountOrZero(car.purchasePrice);
      const costs = costsByCarId.get(car.id) ?? 0;
      return sum + purchase + costs;
    }, 0);
}

/** Sum of `amount` across general (overhead) cost rows. */
export function calculateGeneralCostTotal(
  generalCosts: GeneralCost[],
): number {
  return generalCosts.reduce(
    (sum, cost) => sum + amountOrZero(cost.amount),
    0,
  );
}

/**
 * Cost of goods sold: purchase price for `soldCars` plus linked `carCosts`
 * (caller filters costs by year / vehicle as needed).
 */
export function calculateVarekostnad(
  soldCars: Car[],
  carCosts: CarCost[],
): number {
  const soldIds = new Set(soldCars.map((car) => car.id));
  const costsForSold = carCosts.filter((cost) => soldIds.has(cost.carId));
  const purchaseTotal = soldCars.reduce(
    (sum, car) => sum + amountOrZero(car.purchasePrice),
    0,
  );
  return purchaseTotal + calculateCarCostTotal(costsForSold);
}

/**
 * Operating result (EBIT) for annual statements:
 * revenue − varekostnad (incl. purchase) − general costs.
 * Inventory car costs must be excluded from `carCosts` (capitalized on balanse).
 */
export function calculateOperatingResult(
  soldCars: Car[],
  carCostsOnSoldCars: CarCost[],
  generalCosts: GeneralCost[],
): number {
  return (
    calculateRevenue(soldCars) -
    calculateVarekostnad(soldCars, carCostsOnSoldCars) -
    calculateGeneralCostTotal(generalCosts)
  );
}

/**
 * Period-style result: revenue from sold cars minus all car-linked costs
 * and all general (overhead) costs (includes purchase only inside car costs
 * if recorded there — use `calculateOperatingResult` for annual COGS).
 */
export function calculateTotalProfit(
  cars: Car[],
  carCosts: CarCost[],
  generalCosts: GeneralCost[],
): number {
  const revenue = calculateRevenue(cars);
  const totalCarCosts = calculateCarCostTotal(carCosts);
  const totalGeneralCosts = calculateGeneralCostTotal(generalCosts);

  return revenue - totalCarCosts - totalGeneralCosts;
}

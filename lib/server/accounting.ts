import "server-only";

import { createClient } from "@/lib/supabase/server";
import { todayDateInputValue } from "@/app/admin/cars/carDisplay";
import type {
  AccountingSettings,
  AccountingSettingsRow,
  Car,
  CarCost,
  CarCostRow,
  CarRow,
  CarStatus,
  CompanyFinancing,
  CompanyFinancingRow,
  FinancingMovement,
  FinancingMovementRow,
  GeneralCost,
  GeneralCostRow,
  InsertCompanyFinancingInput,
  InsertFinancingMovementInput,
  UpdateAccountingSettingsInput,
} from "@/types/accounting";

export type InsertCarInput = {
  stockNumber: string;
  kjennemerke: string;
  makeModel: string | null;
  status: CarStatus;
  purchasePrice: number | null;
  acquiredAt: string | null;
};

export type UpdateCarInput = InsertCarInput & {
  id: string;
  salePrice: number | null;
  soldAt: string | null;
};

export type InsertCarCostInput = {
  carId: string;
  costDate: string;
  amount: number;
  vatAmount: number;
  description: string;
  category: string | null;
  receiptRef: string | null;
};

export type InsertGeneralCostInput = {
  costDate: string;
  amount: number;
  vatAmount: number;
  description: string;
  category: string | null;
  receiptRef: string | null;
};

const CAR_COLUMNS =
  "id, created_at, updated_at, stock_number, kjennemerke, make_model, status, acquired_at, sold_at, purchase_price, sale_price, purchase_vat_amount, sale_vat_amount, notes";

const CAR_COST_COLUMNS =
  "id, created_at, car_id, cost_date, amount, vat_amount, description, category, receipt_ref, receipt_storage_path";

const GENERAL_COST_COLUMNS =
  "id, created_at, cost_date, amount, vat_amount, description, category, receipt_ref, receipt_storage_path";

const SETTINGS_COLUMNS =
  "id, updated_at, company_name, org_number, vat_registered, prices_ex_vat, opening_equity, bank_balance, accounts_payable, accounting_start_date";

function rowToCar(row: CarRow): Car {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    stockNumber: row.stock_number,
    kjennemerke: row.kjennemerke,
    makeModel: row.make_model,
    status: row.status,
    acquiredAt: row.acquired_at,
    soldAt: row.sold_at,
    purchasePrice: row.purchase_price,
    salePrice: row.sale_price,
    purchaseVatAmount: row.purchase_vat_amount,
    saleVatAmount: row.sale_vat_amount,
    notes: row.notes,
  };
}

function rowToCarCost(row: CarCostRow): CarCost {
  return {
    id: row.id,
    createdAt: row.created_at,
    carId: row.car_id,
    costDate: row.cost_date,
    amount: row.amount,
    vatAmount: row.vat_amount,
    description: row.description,
    category: row.category,
    receiptRef: row.receipt_ref,
    receiptStoragePath: row.receipt_storage_path,
  };
}

function rowToGeneralCost(row: GeneralCostRow): GeneralCost {
  return {
    id: row.id,
    createdAt: row.created_at,
    costDate: row.cost_date,
    amount: row.amount,
    vatAmount: row.vat_amount,
    description: row.description,
    category: row.category,
    receiptRef: row.receipt_ref,
    receiptStoragePath: row.receipt_storage_path,
  };
}

function rowToSettings(row: AccountingSettingsRow): AccountingSettings {
  return {
    companyName: row.company_name,
    orgNumber: row.org_number,
    vatRegistered: row.vat_registered,
    pricesExVat: row.prices_ex_vat,
    openingEquity: row.opening_equity,
    bankBalance: row.bank_balance,
    accountsPayable: row.accounts_payable,
    accountingStartDate: row.accounting_start_date,
    updatedAt: row.updated_at,
  };
}

const DEFAULT_SETTINGS: AccountingSettings = {
  companyName: null,
  orgNumber: null,
  vatRegistered: true,
  pricesExVat: true,
  openingEquity: 0,
  bankBalance: 0,
  accountsPayable: 0,
  accountingStartDate: null,
  updatedAt: new Date(0).toISOString(),
};

export async function fetchAccountingSettings(): Promise<AccountingSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounting_settings")
    .select(SETTINGS_COLUMNS)
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return DEFAULT_SETTINGS;
  return rowToSettings(data as AccountingSettingsRow);
}

export async function updateAccountingSettings(
  input: UpdateAccountingSettingsInput,
): Promise<AccountingSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounting_settings")
    .update({
      company_name: input.companyName?.trim() || null,
      org_number: input.orgNumber?.trim() || null,
      vat_registered: input.vatRegistered,
      prices_ex_vat: input.pricesExVat,
      opening_equity: input.openingEquity,
      bank_balance: input.bankBalance,
      accounts_payable: input.accountsPayable,
      accounting_start_date: input.accountingStartDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)
    .select(SETTINGS_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("accounting_settings update returned no row");
  }
  return rowToSettings(data as AccountingSettingsRow);
}

export async function fetchCars(): Promise<Car[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cars")
    .select(CAR_COLUMNS)
    .order("acquired_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as CarRow[]).map(rowToCar);
}

export async function insertCar(input: InsertCarInput): Promise<Car> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const soldAt =
    input.status === "sold" ? todayDateInputValue() : null;

  const { data, error } = await supabase
    .from("cars")
    .insert({
      stock_number: input.stockNumber.trim(),
      kjennemerke: input.kjennemerke.trim(),
      make_model: input.makeModel?.trim() || null,
      status: input.status,
      purchase_price: input.purchasePrice,
      purchase_vat_amount: 0,
      acquired_at: input.acquiredAt,
      sold_at: soldAt,
      updated_at: now,
    })
    .select(CAR_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("cars insert returned no row");
  }
  return rowToCar(data as CarRow);
}

export async function updateCar(input: UpdateCarInput): Promise<Car> {
  const existing = await fetchCarById(input.id);
  const supabase = await createClient();
  const now = new Date().toISOString();

  let soldAt = input.soldAt;
  if (input.status === "sold") {
    soldAt = soldAt ?? existing?.soldAt ?? todayDateInputValue();
  } else if (input.status === "in_stock") {
    soldAt = null;
  } else {
    soldAt = existing?.soldAt ?? soldAt;
  }

  const { data, error } = await supabase
    .from("cars")
    .update({
      stock_number: input.stockNumber.trim(),
      kjennemerke: input.kjennemerke.trim(),
      make_model: input.makeModel?.trim() || null,
      status: input.status,
      purchase_price: input.purchasePrice,
      sale_price: input.salePrice,
      purchase_vat_amount: 0,
      sale_vat_amount: 0,
      acquired_at: input.acquiredAt,
      sold_at: soldAt,
      updated_at: now,
    })
    .eq("id", input.id)
    .select(CAR_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("cars update returned no row");
  }
  return rowToCar(data as CarRow);
}

export async function deleteCar(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("cars").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchCarById(id: string): Promise<Car | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cars")
    .select(CAR_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;
  return rowToCar(data as CarRow);
}

export async function fetchCarCosts(): Promise<CarCost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("car_costs")
    .select(CAR_COST_COLUMNS)
    .order("cost_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as CarCostRow[]).map(rowToCarCost);
}

export async function fetchCarCostsByCarId(carId: string): Promise<CarCost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("car_costs")
    .select(CAR_COST_COLUMNS)
    .eq("car_id", carId)
    .order("cost_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as CarCostRow[]).map(rowToCarCost);
}

export async function insertCarCost(input: InsertCarCostInput): Promise<CarCost> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("car_costs")
    .insert({
      car_id: input.carId,
      cost_date: input.costDate,
      amount: input.amount,
      vat_amount: input.vatAmount,
      description: input.description.trim(),
      category: input.category?.trim() || null,
      receipt_ref: input.receiptRef?.trim() || null,
    })
    .select(CAR_COST_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("car_costs insert returned no row");
  }
  return rowToCarCost(data as CarCostRow);
}

export async function fetchGeneralCosts(): Promise<GeneralCost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("general_costs")
    .select(GENERAL_COST_COLUMNS)
    .order("cost_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as GeneralCostRow[]).map(rowToGeneralCost);
}

export async function insertGeneralCost(
  input: InsertGeneralCostInput,
): Promise<GeneralCost> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("general_costs")
    .insert({
      cost_date: input.costDate,
      amount: input.amount,
      vat_amount: input.vatAmount,
      description: input.description.trim(),
      category: input.category?.trim() || null,
      receipt_ref: input.receiptRef?.trim() || null,
    })
    .select(GENERAL_COST_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("general_costs insert returned no row");
  }
  return rowToGeneralCost(data as GeneralCostRow);
}

export async function updateCarCostReceiptStoragePath(
  id: string,
  storagePath: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("car_costs")
    .update({ receipt_storage_path: storagePath })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateGeneralCostReceiptStoragePath(
  id: string,
  storagePath: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("general_costs")
    .update({ receipt_storage_path: storagePath })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

const FINANCING_COLUMNS =
  "id, created_at, updated_at, type, name, credit_limit, notes";

const MOVEMENT_COLUMNS =
  "id, created_at, financing_id, movement_date, amount, description";

function rowToFinancing(row: CompanyFinancingRow): CompanyFinancing {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    type: row.type,
    name: row.name,
    creditLimit: row.credit_limit,
    notes: row.notes,
  };
}

function rowToMovement(row: FinancingMovementRow): FinancingMovement {
  return {
    id: row.id,
    createdAt: row.created_at,
    financingId: row.financing_id,
    movementDate: row.movement_date,
    amount: row.amount,
    description: row.description,
  };
}

export async function fetchCompanyFinancing(): Promise<CompanyFinancing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_financing")
    .select(FINANCING_COLUMNS)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as CompanyFinancingRow[]).map(rowToFinancing);
}

export async function fetchFinancingMovements(): Promise<FinancingMovement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("financing_movements")
    .select(MOVEMENT_COLUMNS)
    .order("movement_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as FinancingMovementRow[]).map(rowToMovement);
}

export async function insertCompanyFinancing(
  input: InsertCompanyFinancingInput,
): Promise<CompanyFinancing> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("company_financing")
    .insert({
      type: input.type,
      name: input.name.trim(),
      credit_limit: input.creditLimit,
      notes: input.notes?.trim() || null,
      updated_at: now,
    })
    .select(FINANCING_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("company_financing insert returned no row");
  return rowToFinancing(data as CompanyFinancingRow);
}

export async function insertFinancingMovement(
  input: InsertFinancingMovementInput,
): Promise<FinancingMovement> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("financing_movements")
    .insert({
      financing_id: input.financingId,
      movement_date: input.movementDate,
      amount: input.amount,
      description: input.description?.trim() || null,
    })
    .select(MOVEMENT_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("financing_movements insert returned no row");
  return rowToMovement(data as FinancingMovementRow);
}

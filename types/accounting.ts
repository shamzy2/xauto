/** Inventory unit status stored in `cars.status`. */
export type CarStatus = "in_stock" | "sold" | "written_off";

/** Row shape for `public.cars` (snake_case, as returned by Supabase). */
export type CarRow = {
  id: string;
  created_at: string;
  updated_at: string;
  stock_number: string;
  kjennemerke: string;
  make_model: string | null;
  status: CarStatus;
  acquired_at: string | null;
  sold_at: string | null;
  purchase_price: number | null;
  sale_price: number | null;
  purchase_vat_amount: number | null;
  sale_vat_amount: number | null;
  notes: string | null;
};

/** Application model for a car. Amounts are inkl. MVA. */
export type Car = {
  id: string;
  createdAt: string;
  updatedAt: string;
  stockNumber: string;
  kjennemerke: string;
  makeModel: string | null;
  status: CarStatus;
  acquiredAt: string | null;
  soldAt: string | null;
  purchasePrice: number | null;
  salePrice: number | null;
  purchaseVatAmount: number | null;
  saleVatAmount: number | null;
  notes: string | null;
};

/** Row shape for `public.car_costs`. */
export type CarCostRow = {
  id: string;
  created_at: string;
  car_id: string;
  cost_date: string;
  amount: number;
  vat_amount: number;
  description: string;
  category: string | null;
  receipt_ref: string | null;
  receipt_storage_path: string | null;
};

/** Application model for a cost linked to a car (driftskostnad, beløp ekskl. MVA). */
export type CarCost = {
  id: string;
  createdAt: string;
  carId: string;
  costDate: string;
  amount: number;
  vatAmount: number;
  description: string;
  category: string | null;
  receiptRef: string | null;
  receiptStoragePath: string | null;
};

/** Row shape for `public.general_costs`. */
export type GeneralCostRow = {
  id: string;
  created_at: string;
  cost_date: string;
  amount: number;
  vat_amount: number;
  description: string;
  category: string | null;
  receipt_ref: string | null;
  receipt_storage_path: string | null;
};

/** Application model for overhead / non-car-specific costs (beløp ekskl. MVA). */
export type GeneralCost = {
  id: string;
  createdAt: string;
  costDate: string;
  amount: number;
  vatAmount: number;
  description: string;
  category: string | null;
  receiptRef: string | null;
  receiptStoragePath: string | null;
};

export type AccountingSettingsRow = {
  id: number;
  updated_at: string;
  company_name: string | null;
  org_number: string | null;
  vat_registered: boolean;
  prices_ex_vat: boolean;
  opening_equity: number;
  bank_balance: number;
  accounts_payable: number;
  accounting_start_date: string | null;
};

export type AccountingSettings = {
  companyName: string | null;
  orgNumber: string | null;
  vatRegistered: boolean;
  pricesExVat: boolean;
  openingEquity: number;
  bankBalance: number;
  accountsPayable: number;
  accountingStartDate: string | null;
  updatedAt: string;
};

export type FinancingType = "shareholder_loan" | "bank_credit" | "bank_loan";

export type CompanyFinancingRow = {
  id: string;
  created_at: string;
  updated_at: string;
  type: FinancingType;
  name: string;
  credit_limit: number | null;
  notes: string | null;
};

export type CompanyFinancing = {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: FinancingType;
  name: string;
  creditLimit: number | null;
  notes: string | null;
};

export type FinancingMovementRow = {
  id: string;
  created_at: string;
  financing_id: string;
  movement_date: string;
  amount: number;
  description: string | null;
};

export type FinancingMovement = {
  id: string;
  createdAt: string;
  financingId: string;
  movementDate: string;
  amount: number;
  description: string | null;
};

export type InsertCompanyFinancingInput = {
  type: FinancingType;
  name: string;
  creditLimit: number | null;
  notes: string | null;
};

export type InsertFinancingMovementInput = {
  financingId: string;
  movementDate: string;
  amount: number;
  description: string | null;
};

export type UpdateAccountingSettingsInput = {
  companyName: string | null;
  orgNumber: string | null;
  vatRegistered: boolean;
  pricesExVat: boolean;
  openingEquity: number;
  bankBalance: number;
  accountsPayable: number;
  accountingStartDate: string | null;
};

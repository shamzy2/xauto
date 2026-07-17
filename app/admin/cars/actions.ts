"use server";

import { redirect } from "next/navigation";

import {
  deleteCar,
  fetchAccountingSettings,
  insertCar,
  insertCarCost,
  updateCar,
  updateCarCostReceiptStoragePath,
} from "@/lib/server/accounting";
import { revalidateAccountingPaths } from "@/lib/server/revalidateAccounting";
import { uploadAccountingReceipt } from "@/lib/server/receiptStorage";
import { resolveVatAmount } from "@/lib/vat";
import type { CarStatus } from "@/types/accounting";

const CAR_STATUSES: CarStatus[] = ["in_stock", "sold", "written_off"];

function parseOptionalPrice(raw: string, fieldLabel: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/\s/g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Ugyldig ${fieldLabel}.`);
  }
  return value;
}

function parseRequiredAmount(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("Beløp er påkrevd.");
  }
  const normalized = trimmed.replace(/\s/g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Ugyldig beløp.");
  }
  return value;
}

export type CreateCarActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createCarAction(
  _prev: CreateCarActionResult | null,
  formData: FormData,
): Promise<CreateCarActionResult> {
  const stockNumber = String(formData.get("stock_number") ?? "").trim();
  const kjennemerke = String(formData.get("kjennemerke") ?? "").trim();
  const makeModel = String(formData.get("make_model") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "in_stock");
  const acquiredAtRaw = String(formData.get("acquired_at") ?? "").trim();
  const purchasePriceRaw = String(formData.get("purchase_price") ?? "");

  if (!stockNumber) {
    return { ok: false, error: "Lagernummer er påkrevd." };
  }
  if (!kjennemerke) {
    return { ok: false, error: "Kjennemerke er påkrevd." };
  }
  if (!CAR_STATUSES.includes(statusRaw as CarStatus)) {
    return { ok: false, error: "Ugyldig status." };
  }

  let purchasePrice: number | null;
  try {
    purchasePrice = parseOptionalPrice(purchasePriceRaw, "innkjøpspris");
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Ugyldig innkjøpspris.",
    };
  }

  const acquiredAt = acquiredAtRaw || null;

  try {
    await insertCar({
      stockNumber,
      kjennemerke,
      makeModel: makeModel || null,
      status: statusRaw as CarStatus,
      purchasePrice,
      acquiredAt,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Kunne ikke lagre bil.";
    if (message.includes("cars_stock_number_unique")) {
      return { ok: false, error: "Lagernummer finnes allerede." };
    }
    return { ok: false, error: message };
  }

  revalidateAccountingPaths();
  return { ok: true };
}

export type UpdateCarActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateCarAction(
  _prev: UpdateCarActionResult | null,
  formData: FormData,
): Promise<UpdateCarActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  const stockNumber = String(formData.get("stock_number") ?? "").trim();
  const kjennemerke = String(formData.get("kjennemerke") ?? "").trim();
  const makeModel = String(formData.get("make_model") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "in_stock");
  const acquiredAtRaw = String(formData.get("acquired_at") ?? "").trim();
  const purchasePriceRaw = String(formData.get("purchase_price") ?? "");
  const salePriceRaw = String(formData.get("sale_price") ?? "");
  const soldAtRaw = String(formData.get("sold_at") ?? "").trim();

  if (!id) {
    return { ok: false, error: "Mangler bil-ID." };
  }
  if (!stockNumber) {
    return { ok: false, error: "Lagernummer er påkrevd." };
  }
  if (!kjennemerke) {
    return { ok: false, error: "Kjennemerke er påkrevd." };
  }
  if (!CAR_STATUSES.includes(statusRaw as CarStatus)) {
    return { ok: false, error: "Ugyldig status." };
  }

  let purchasePrice: number | null;
  let salePrice: number | null;
  try {
    purchasePrice = parseOptionalPrice(purchasePriceRaw, "innkjøpspris");
    salePrice = parseOptionalPrice(salePriceRaw, "salgspris");
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Ugyldig pris.",
    };
  }

  const acquiredAt = acquiredAtRaw || null;
  const soldAt = soldAtRaw || null;

  try {
    await updateCar({
      id,
      stockNumber,
      kjennemerke,
      makeModel: makeModel || null,
      status: statusRaw as CarStatus,
      purchasePrice,
      salePrice,
      acquiredAt,
      soldAt,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Kunne ikke oppdatere bil.";
    if (message.includes("cars_stock_number_unique")) {
      return { ok: false, error: "Lagernummer finnes allerede." };
    }
    return { ok: false, error: message };
  }

  revalidateAccountingPaths(id);
  return { ok: true };
}

export type DeleteCarActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function deleteCarAction(
  id: string,
): Promise<DeleteCarActionResult> {
  const trimmed = id.trim();
  if (!trimmed) {
    return { ok: false, error: "Mangler bil-ID." };
  }

  try {
    await deleteCar(trimmed);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Kunne ikke slette bil.",
    };
  }

  revalidateAccountingPaths();
  redirect("/admin/cars");
}

export type CreateCarCostActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createCarCostAction(
  _prev: CreateCarCostActionResult | null,
  formData: FormData,
): Promise<CreateCarCostActionResult> {
  const carId = String(formData.get("car_id") ?? "").trim();
  const costDate = String(formData.get("cost_date") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const receiptRef = String(formData.get("receipt_ref") ?? "").trim();

  if (!carId) {
    return { ok: false, error: "Mangler bil-ID." };
  }
  if (!costDate) {
    return { ok: false, error: "Dato er påkrevd." };
  }
  if (!description) {
    return { ok: false, error: "Beskrivelse er påkrevd." };
  }

  let amount: number;
  try {
    amount = parseRequiredAmount(amountRaw);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Ugyldig beløp.",
    };
  }

  try {
    const settings = await fetchAccountingSettings();
    const vatAmount = resolveVatAmount(amount, null, settings.vatRegistered);
    const cost = await insertCarCost({
      carId,
      costDate,
      amount,
      vatAmount,
      description,
      category: category || null,
      receiptRef: receiptRef || null,
    });

    const receiptFile = formData.get("receipt");
    if (receiptFile instanceof File && receiptFile.size > 0) {
      const storagePath = await uploadAccountingReceipt(
        "car",
        cost.id,
        receiptFile,
      );
      await updateCarCostReceiptStoragePath(cost.id, storagePath);
    }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Kunne ikke lagre kostnad.",
    };
  }

  revalidateAccountingPaths(carId);
  return { ok: true };
}

"use server";

import {
  fetchAccountingSettings,
  insertGeneralCost,
  updateGeneralCostReceiptStoragePath,
} from "@/lib/server/accounting";
import { revalidateAccountingPaths } from "@/lib/server/revalidateAccounting";
import { uploadAccountingReceipt } from "@/lib/server/receiptStorage";
import { resolveVatAmount } from "@/lib/vat";

function parseRequiredAmount(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Beløp er påkrevd.");
  const normalized = trimmed.replace(/\s/g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) throw new Error("Ugyldig beløp.");
  return value;
}

export type CreateGeneralCostActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createGeneralCostAction(
  _prev: CreateGeneralCostActionResult | null,
  formData: FormData,
): Promise<CreateGeneralCostActionResult> {
  const costDate = String(formData.get("cost_date") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const receiptRef = String(formData.get("receipt_ref") ?? "").trim();

  if (!costDate) return { ok: false, error: "Dato er påkrevd." };
  if (!description) return { ok: false, error: "Beskrivelse er påkrevd." };

  let amount: number;
  try {
    amount = parseRequiredAmount(amountRaw);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Ugyldig beløp.",
    };
  }

  const settings = await fetchAccountingSettings();
  const vatAmount = resolveVatAmount(amount, null, settings.vatRegistered);

  try {
    const cost = await insertGeneralCost({
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
        "general",
        cost.id,
        receiptFile,
      );
      await updateGeneralCostReceiptStoragePath(cost.id, storagePath);
    }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Kunne ikke lagre kostnad.",
    };
  }

  revalidateAccountingPaths();
  return { ok: true };
}

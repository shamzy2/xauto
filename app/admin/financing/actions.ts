"use server";

import {
  insertCompanyFinancing,
  insertFinancingMovement,
} from "@/lib/server/accounting";
import { revalidateAccountingPaths } from "@/lib/server/revalidateAccounting";
import type { FinancingType } from "@/types/accounting";

const FINANCING_TYPES: FinancingType[] = [
  "shareholder_loan",
  "bank_credit",
  "bank_loan",
];

function parseMoney(raw: string, label: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/\s/g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Ugyldig ${label}.`);
  }
  return value;
}

function parseRequiredAmount(raw: string, label: string): number {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error(`${label} er påkrevd.`);
  const normalized = trimmed.replace(/\s/g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Ugyldig ${label}.`);
  }
  return value;
}

export type CreateFinancingActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createFinancingAction(
  _prev: CreateFinancingActionResult | null,
  formData: FormData,
): Promise<CreateFinancingActionResult> {
  const typeRaw = String(formData.get("type") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const creditLimitRaw = String(formData.get("credit_limit") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!FINANCING_TYPES.includes(typeRaw as FinancingType)) {
    return { ok: false, error: "Ugyldig finansieringstype." };
  }
  if (!name) {
    return { ok: false, error: "Navn er påkrevd." };
  }

  let creditLimit: number | null = null;
  try {
    creditLimit = parseMoney(creditLimitRaw, "ramme");
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Ugyldig ramme.",
    };
  }

  try {
    await insertCompanyFinancing({
      type: typeRaw as FinancingType,
      name,
      creditLimit:
        typeRaw === "bank_credit" || typeRaw === "bank_loan"
          ? creditLimit
          : null,
      notes: notes || null,
    });
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Kunne ikke lagre finansiering.",
    };
  }

  revalidateAccountingPaths();
  return { ok: true };
}

export type CreateMovementActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createMovementAction(
  _prev: CreateMovementActionResult | null,
  formData: FormData,
): Promise<CreateMovementActionResult> {
  const financingId = String(formData.get("financing_id") ?? "").trim();
  const movementDate = String(formData.get("movement_date") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "");
  const kind = String(formData.get("movement_kind") ?? "draw");
  const description = String(formData.get("description") ?? "").trim();

  if (!financingId) {
    return { ok: false, error: "Mangler finansiering." };
  }
  if (!movementDate) {
    return { ok: false, error: "Dato er påkrevd." };
  }

  let amount: number;
  try {
    amount = parseRequiredAmount(amountRaw, "beløp");
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Ugyldig beløp.",
    };
  }

  if (kind === "repayment") {
    amount = -amount;
  }

  try {
    await insertFinancingMovement({
      financingId,
      movementDate,
      amount,
      description: description || null,
    });
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Kunne ikke lagre bevegelse.",
    };
  }

  revalidateAccountingPaths();
  return { ok: true };
}

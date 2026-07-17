"use server";

import { updateAccountingSettings } from "@/lib/server/accounting";
import { revalidateAccountingPaths } from "@/lib/server/revalidateAccounting";

function parseMoney(raw: string, label: string): number {
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  const normalized = trimmed.replace(/\s/g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value)) {
    throw new Error(`Ugyldig ${label}.`);
  }
  return value;
}

export type UpdateAccountingSettingsActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateAccountingSettingsAction(
  _prev: UpdateAccountingSettingsActionResult | null,
  formData: FormData,
): Promise<UpdateAccountingSettingsActionResult> {
  const companyName = String(formData.get("company_name") ?? "").trim();
  const orgNumber = String(formData.get("org_number") ?? "").trim();
  const vatRegistered = formData.get("vat_registered") === "on";
  const pricesExVat = formData.get("prices_ex_vat") !== "off";
  const accountingStartRaw = String(
    formData.get("accounting_start_date") ?? "",
  ).trim();
  const accountingStartDate = accountingStartRaw || null;

  try {
    await updateAccountingSettings({
      companyName: companyName || null,
      orgNumber: orgNumber || null,
      vatRegistered,
      pricesExVat,
      accountingStartDate,
      openingEquity: parseMoney(
        String(formData.get("opening_equity") ?? ""),
        "inngående egenkapital",
      ),
      bankBalance: parseMoney(
        String(formData.get("bank_balance") ?? ""),
        "bankbeholdning",
      ),
      accountsPayable: parseMoney(
        String(formData.get("accounts_payable") ?? ""),
        "leverandørgjeld",
      ),
    });
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Kunne ikke lagre innstillinger.",
    };
  }

  revalidateAccountingPaths();
  return { ok: true };
}

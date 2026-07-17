/** Standard norsk MVA-sats (25 %) for registrerte foretak. */
export const DEFAULT_VAT_RATE = 0.25;

export function vatAmountFromExVat(exVatAmount: number, rate = DEFAULT_VAT_RATE): number {
  if (!Number.isFinite(exVatAmount) || exVatAmount <= 0) return 0;
  return Math.round(exVatAmount * rate * 100) / 100;
}

export function resolveVatAmount(
  exVatAmount: number,
  explicitVat: number | null | undefined,
  vatRegistered: boolean,
): number {
  if (!vatRegistered) return 0;
  if (explicitVat !== null && explicitVat !== undefined && Number.isFinite(explicitVat)) {
    return Math.max(0, explicitVat);
  }
  return vatAmountFromExVat(exVatAmount);
}

/** Total fakturabeløp (det du betaler) = ekskl. MVA + MVA. */
export function totalInklMva(exVatAmount: number, vatAmount: number): number {
  const ex = Number.isFinite(exVatAmount) ? exVatAmount : 0;
  const vat = Number.isFinite(vatAmount) ? vatAmount : 0;
  return Math.round((ex + vat) * 100) / 100;
}

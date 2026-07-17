"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  createGeneralCostAction,
  type CreateGeneralCostActionResult,
} from "@/app/admin/costs/general/actions";
import { todayDateInputValue } from "@/app/admin/cars/carDisplay";
import { DEALERSHIP_COST_CATEGORIES } from "@/lib/dealership";
import { RECEIPT_ACCEPT } from "@/lib/receiptUploadLimits";

import styles from "../../admin.module.css";

const initialState: CreateGeneralCostActionResult | null = null;

type AddGeneralCostModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AddGeneralCostModal({ open, onClose }: AddGeneralCostModalProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createGeneralCostAction,
    initialState,
  );

  useEffect(() => {
    if (state?.ok) {
      onClose();
      router.refresh();
    }
  }, [state, onClose, router]);

  if (!open) return null;

  return (
    <div
      className={styles.modalBackdrop}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-general-cost-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="add-general-cost-title" className={styles.modalTitle}>
          Legg til driftskostnad
        </h2>
        <p className={styles.muted} style={{ margin: "0 0 12px", fontSize: "0.8125rem" }}>
          Beløp ekskl. MVA. MVA beregnes automatisk (25 %).
        </p>
        <form
          className={styles.modalForm}
          action={formAction}
          encType="multipart/form-data"
        >
          <label>
            Dato
            <input
              name="cost_date"
              type="date"
              required
              defaultValue={todayDateInputValue()}
            />
          </label>
          <label>
            Beløp ekskl. MVA
            <input
              name="amount"
              type="text"
              inputMode="decimal"
              required
              placeholder="f.eks. 5000"
            />
          </label>
          <label>
            Beskrivelse
            <input name="description" required autoComplete="off" />
          </label>
          <label>
            Kategori (valgfritt)
            <input
              name="category"
              list="general-cost-categories"
              placeholder="f.eks. Husleie"
              autoComplete="off"
            />
            <datalist id="general-cost-categories">
              {DEALERSHIP_COST_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </label>
          <label>
            Kvittering / bilag (valgfritt)
            <input
              name="receipt"
              type="file"
              accept={RECEIPT_ACCEPT}
            />
          </label>
          <label>
            Bilagsreferanse (valgfritt)
            <input
              name="receipt_ref"
              placeholder="Kvittering / fakturanr."
              autoComplete="off"
            />
          </label>
          {state && !state.ok ? (
            <p className={styles.formError} role="alert">
              {state.error}
            </p>
          ) : null}
          <div className={styles.modalActions}>
            <button
              type="button"
              className={`${styles.filterBtn} ${styles.filterBtnSecondary}`}
              onClick={onClose}
              disabled={pending}
            >
              Avbryt
            </button>
            <button type="submit" className={styles.filterBtn} disabled={pending}>
              {pending ? "Lagrer…" : "Lagre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

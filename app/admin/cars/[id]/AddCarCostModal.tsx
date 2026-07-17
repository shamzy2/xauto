"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  createCarCostAction,
  type CreateCarCostActionResult,
} from "@/app/admin/cars/actions";
import { todayDateInputValue } from "@/app/admin/cars/carDisplay";
import { DEALERSHIP_COST_CATEGORIES } from "@/lib/dealership";
import { RECEIPT_ACCEPT } from "@/lib/receiptUploadLimits";

import styles from "../../admin.module.css";

const initialState: CreateCarCostActionResult | null = null;

type AddCarCostModalProps = {
  carId: string;
  open: boolean;
  onClose: () => void;
};

export function AddCarCostModal({ carId, open, onClose }: AddCarCostModalProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createCarCostAction,
    initialState,
  );

  useEffect(() => {
    if (state?.ok) {
      onClose();
      router.refresh();
    }
  }, [state, onClose, router]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.modalBackdrop} role="presentation" onClick={onClose}>
      <div className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-car-cost-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="add-car-cost-title" className={styles.modalTitle}>
          Legg til driftskostnad
        </h2>
        <p className={styles.muted} style={{ margin: "0 0 12px", fontSize: "0.8125rem" }}>
          Reparasjon og vedlikehold føres ekskl. MVA. MVA beregnes automatisk (25 %).
        </p>
        <form
          className={styles.modalForm}
          action={formAction}
          encType="multipart/form-data"
        >
          <input type="hidden" name="car_id" value={carId} />
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
              placeholder="f.eks. 2500"
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
              list="car-cost-categories"
              placeholder="f.eks. Reparasjon"
              autoComplete="off"
            />
            <datalist id="car-cost-categories">
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

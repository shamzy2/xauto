"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  createCarAction,
  type CreateCarActionResult,
} from "@/app/admin/cars/actions";

import styles from "../admin.module.css";

const initialState: CreateCarActionResult | null = null;

type AddCarModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AddCarModal({ open, onClose }: AddCarModalProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createCarAction,
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
    <div
      className={styles.modalBackdrop}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-car-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="add-car-title" className={styles.modalTitle}>
          Legg til bil
        </h2>
        <p className={styles.muted} style={{ margin: "0 0 12px", fontSize: "0.8125rem" }}>
          Priser inkl. MVA.
        </p>
        <form className={styles.modalForm} action={formAction}>
          <label>
            Lagernummer
            <input name="stock_number" required autoComplete="off" />
          </label>
          <label>
            Kjennemerke
            <input name="kjennemerke" required autoComplete="off" />
          </label>
          <label>
            Modell
            <input name="make_model" autoComplete="off" />
          </label>
          <label>
            Status
            <select name="status" defaultValue="in_stock">
              <option value="in_stock">På lager</option>
              <option value="sold">Solgt</option>
              <option value="written_off">Avskrevet</option>
            </select>
          </label>
          <label>
            Innkjøpspris inkl. MVA
            <input
              name="purchase_price"
              type="text"
              inputMode="decimal"
              placeholder="f.eks. 150000"
            />
          </label>
          <label>
            Innkjøpt dato
            <input name="acquired_at" type="date" />
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


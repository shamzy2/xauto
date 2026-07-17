"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  createMovementAction,
  type CreateMovementActionResult,
} from "@/app/admin/financing/actions";
import { todayDateInputValue } from "@/app/admin/cars/carDisplay";

import styles from "../admin.module.css";

const initialState: CreateMovementActionResult | null = null;

type AddMovementModalProps = {
  financingId: string;
  financingName: string;
  open: boolean;
  onClose: () => void;
};

export function AddMovementModal({
  financingId,
  financingName,
  open,
  onClose,
}: AddMovementModalProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createMovementAction,
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
    <div className={styles.modalBackdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-movement-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="add-movement-title" className={styles.modalTitle}>
          Registrer bevegelse
        </h2>
        <p className={styles.muted} style={{ margin: "0 0 12px", fontSize: "0.8125rem" }}>
          {financingName} — uttak øker gjeld, nedbetaling reduserer.
        </p>
        <form className={styles.modalForm} action={formAction}>
          <input type="hidden" name="financing_id" value={financingId} />
          <label>
            Type
            <select name="movement_kind" defaultValue="draw">
              <option value="draw">Uttak / lån inn til selskapet</option>
              <option value="repayment">Nedbetaling</option>
            </select>
          </label>
          <label>
            Dato
            <input
              name="movement_date"
              type="date"
              required
              defaultValue={todayDateInputValue()}
            />
          </label>
          <label>
            Beløp (NOK)
            <input
              name="amount"
              type="text"
              inputMode="decimal"
              required
              placeholder="f.eks. 100000"
            />
          </label>
          <label>
            Beskrivelse (valgfritt)
            <input
              name="description"
              placeholder="f.eks. Overføring til driftskonto"
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

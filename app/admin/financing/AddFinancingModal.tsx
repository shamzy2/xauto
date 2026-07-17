"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  createFinancingAction,
  type CreateFinancingActionResult,
} from "@/app/admin/financing/actions";
import { FINANCING_TYPE_OPTIONS } from "@/lib/dealership";

import styles from "../admin.module.css";

const initialState: CreateFinancingActionResult | null = null;

type AddFinancingModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AddFinancingModal({ open, onClose }: AddFinancingModalProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createFinancingAction,
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
        aria-labelledby="add-financing-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="add-financing-title" className={styles.modalTitle}>
          Legg til finansiering
        </h2>
        <p className={styles.muted} style={{ margin: "0 0 12px", fontSize: "0.8125rem" }}>
          Aksjonærlån, kassekreditt eller banklån. Registrer uttak og
          nedbetalinger etterpå.
        </p>
        <form className={styles.modalForm} action={formAction}>
          <label>
            Type
            <select name="type" defaultValue="shareholder_loan" required>
              {FINANCING_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Navn
            <input
              name="name"
              required
              placeholder="f.eks. Aksjonærlån Ola, DNB kassekreditt"
              autoComplete="off"
            />
          </label>
          <label>
            Ramme / lånebeløp (valgfritt)
            <input
              name="credit_limit"
              type="text"
              inputMode="decimal"
              placeholder="f.eks. 500000 — for kassekreditt/banklån"
            />
          </label>
          <label>
            Notat (valgfritt)
            <input name="notes" autoComplete="off" />
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

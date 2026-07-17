"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  deleteCarAction,
  updateCarAction,
  type UpdateCarActionResult,
} from "@/app/admin/cars/actions";
import {
  CAR_STATUS_LABELS,
  carDateInputValue,
  formatCarDate,
  formatCarPrice,
} from "@/app/admin/cars/carDisplay";
import type { Car } from "@/types/accounting";

import styles from "../../admin.module.css";

const initialState: UpdateCarActionResult | null = null;

type CarDetailPanelProps = {
  car: Car;
};

export function CarDetailPanel({ car }: CarDetailPanelProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    updateCarAction,
    initialState,
  );

  useEffect(() => {
    if (state?.ok) {
      setEditing(false);
      router.refresh();
    }
  }, [state, router]);

  const headerTitle = `${car.stockNumber} · ${car.kjennemerke}`;

  async function handleDelete() {
    const confirmed = window.confirm(
      `Slette bil ${car.stockNumber} (${car.kjennemerke})? Dette kan ikke angres.`,
    );
    if (!confirmed) return;

    setDeleteError(null);
    setDeleting(true);
    const result = await deleteCarAction(car.id);
    if (result && !result.ok) {
      setDeleteError(result.error);
      setDeleting(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.toolbar}>
        <h2 className={styles.carDetailTitle}>{headerTitle}</h2>
        {!editing ? (
          <button
            type="button"
            className={styles.filterBtn}
            onClick={() => setEditing(true)}
          >
            Rediger
          </button>
        ) : (
          <button
            type="button"
            className={`${styles.filterBtn} ${styles.filterBtnSecondary}`}
            onClick={() => setEditing(false)}
            disabled={pending}
          >
            Avbryt
          </button>
        )}
      </div>

      {!editing ? (
        <section className={styles.detailSection}>
          <dl>
            <dt>Lagernummer</dt>
            <dd>{car.stockNumber}</dd>
            <dt>Kjennemerke</dt>
            <dd>{car.kjennemerke}</dd>
            <dt>Modell</dt>
            <dd>{car.makeModel ?? "-"}</dd>
            <dt>Status</dt>
            <dd>{CAR_STATUS_LABELS[car.status]}</dd>
            <dt>Innkjøpspris inkl. MVA</dt>
            <dd>{formatCarPrice(car.purchasePrice)}</dd>
            {car.salePrice !== null ? (
              <>
                <dt>Salgspris inkl. MVA</dt>
                <dd>{formatCarPrice(car.salePrice)}</dd>
              </>
            ) : null}
            <dt>Innkjøpt</dt>
            <dd>{formatCarDate(car.acquiredAt)}</dd>
            {car.soldAt ? (
              <>
                <dt>Solgt</dt>
                <dd>{formatCarDate(car.soldAt)}</dd>
              </>
            ) : null}
          </dl>
          {deleteError ? (
            <p className={styles.formError} role="alert">
              {deleteError}
            </p>
          ) : null}
          <button
            type="button"
            className={styles.carDeleteBtn}
            onClick={() => void handleDelete()}
            disabled={deleting}
          >
            {deleting ? "Sletter…" : "Slett bil"}
          </button>
        </section>
      ) : (
        <form className={styles.modalForm} action={formAction}>
          <input type="hidden" name="id" value={car.id} />
          <label>
            Lagernummer
            <input
              name="stock_number"
              defaultValue={car.stockNumber}
              required
              autoComplete="off"
            />
          </label>
          <label>
            Kjennemerke
            <input
              name="kjennemerke"
              defaultValue={car.kjennemerke}
              required
              autoComplete="off"
            />
          </label>
          <label>
            Modell
            <input
              name="make_model"
              defaultValue={car.makeModel ?? ""}
              autoComplete="off"
            />
          </label>
          <label>
            Status
            <select name="status" defaultValue={car.status}>
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
              defaultValue={
                car.purchasePrice !== null ? String(car.purchasePrice) : ""
              }
            />
          </label>
          <label>
            Salgspris inkl. MVA
            <input
              name="sale_price"
              type="text"
              inputMode="decimal"
              defaultValue={
                car.salePrice !== null ? String(car.salePrice) : ""
              }
            />
          </label>
          <label>
            Solgt dato
            <input
              name="sold_at"
              type="date"
              defaultValue={carDateInputValue(car.soldAt)}
            />
          </label>
          <label>
            Innkjøpt dato
            <input
              name="acquired_at"
              type="date"
              defaultValue={carDateInputValue(car.acquiredAt)}
            />
          </label>
          {state && !state.ok ? (
            <p className={styles.formError} role="alert">
              {state.error}
            </p>
          ) : null}
          <div className={styles.modalActions}>
            <button type="submit" className={styles.filterBtn} disabled={pending}>
              {pending ? "Lagrer…" : "Lagre"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

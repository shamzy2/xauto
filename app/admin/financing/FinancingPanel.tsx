"use client";

import { useState } from "react";

import { AddFinancingModal } from "@/app/admin/financing/AddFinancingModal";
import { AddMovementModal } from "@/app/admin/financing/AddMovementModal";
import { formatCarDate, formatCarPrice } from "@/app/admin/cars/carDisplay";
import { FINANCING_TYPE_LABELS } from "@/lib/dealership";
import type { FinancingItemBalance } from "@/lib/financing";
import type { FinancingMovement } from "@/types/accounting";

import styles from "../admin.module.css";

type FinancingPanelProps = {
  items: FinancingItemBalance[];
  movements: FinancingMovement[];
  itemNames: Record<string, string>;
};

export function FinancingPanel({
  items,
  movements,
  itemNames,
}: FinancingPanelProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [movementTarget, setMovementTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const totalDebt = items.reduce(
    (sum, row) => sum + Math.max(0, row.balance),
    0,
  );

  return (
    <>
      <div className={styles.toolbar}>
        <p className={styles.muted} style={{ margin: 0 }}>
          Total gjeld (finansiering): {formatCarPrice(totalDebt)}
        </p>
        <button
          type="button"
          className={styles.filterBtn}
          onClick={() => setAddOpen(true)}
        >
          Legg til finansiering
        </button>
      </div>

      <div className={styles.card} style={{ padding: 0, overflow: "hidden" }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Navn</th>
              <th>Ramme</th>
              <th>Saldo</th>
              <th>Tilgjengelig</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "24px" }}>
                  Ingen finansiering registrert. Legg til aksjonærlån,
                  kassekreditt eller banklån når du trenger det.
                </td>
              </tr>
            ) : (
              items.map(({ financing, balance, availableCredit }) => (
                <tr key={financing.id}>
                  <td>{FINANCING_TYPE_LABELS[financing.type]}</td>
                  <td>{financing.name}</td>
                  <td className={styles.tableCellMuted}>
                    {financing.creditLimit !== null
                      ? formatCarPrice(financing.creditLimit)
                      : "-"}
                  </td>
                  <td>{formatCarPrice(Math.max(0, balance))}</td>
                  <td className={styles.tableCellMuted}>
                    {availableCredit !== null
                      ? formatCarPrice(availableCredit)
                      : "-"}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.filterBtn}
                      style={{ padding: "4px 10px", fontSize: "0.8125rem" }}
                      onClick={() =>
                        setMovementTarget({
                          id: financing.id,
                          name: financing.name,
                        })
                      }
                    >
                      Bevegelse
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {movements.length > 0 ? (
        <div
          className={styles.card}
          style={{ marginTop: "20px", padding: 0, overflow: "hidden" }}
        >
          <h2 className={styles.carDetailTitle} style={{ padding: "16px 16px 0" }}>
            Siste bevegelser
          </h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Dato</th>
                <th>Finansiering</th>
                <th>Beløp</th>
                <th>Beskrivelse</th>
              </tr>
            </thead>
            <tbody>
              {movements.slice(0, 20).map((m) => (
                <tr key={m.id}>
                  <td>{formatCarDate(m.movementDate)}</td>
                  <td>{itemNames[m.financingId] ?? "-"}</td>
                  <td
                    className={
                      m.amount < 0 ? styles.tableCellMuted : undefined
                    }
                  >
                    {formatCarPrice(m.amount)}
                  </td>
                  <td className={styles.tableCellMuted}>
                    {m.description ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <AddFinancingModal open={addOpen} onClose={() => setAddOpen(false)} />
      {movementTarget ? (
        <AddMovementModal
          financingId={movementTarget.id}
          financingName={movementTarget.name}
          open
          onClose={() => setMovementTarget(null)}
        />
      ) : null}
    </>
  );
}

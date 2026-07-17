"use client";

import { useState } from "react";

import { AddGeneralCostModal } from "@/app/admin/costs/general/AddGeneralCostModal";
import { ReceiptBilagCell } from "@/app/admin/components/ReceiptBilagCell";
import { formatCarDate, formatCarPrice } from "@/app/admin/cars/carDisplay";
import { totalInklMva } from "@/lib/vat";
import type { WithReceiptViewUrl } from "@/lib/server/attachReceiptUrls";
import type { GeneralCost } from "@/types/accounting";

import styles from "../../admin.module.css";

function sumAmounts(costs: GeneralCost[], pick: (c: GeneralCost) => number): number {
  return costs.reduce((sum, c) => sum + pick(c), 0);
}

export function GeneralCostsPanel({
  costs,
}: {
  costs: WithReceiptViewUrl<GeneralCost>[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const sumEkskl = sumAmounts(costs, (c) => c.amount);
  const sumMva = sumAmounts(costs, (c) => c.vatAmount);
  const sumInkl = sumAmounts(costs, (c) => totalInklMva(c.amount, c.vatAmount));

  return (
    <>
      <div className={styles.toolbar}>
        <p className={styles.muted} style={{ margin: 0 }}>
          {costs.length} {costs.length === 1 ? "post" : "poster"} · beløp ekskl. MVA
        </p>
        <button
          type="button"
          className={styles.filterBtn}
          onClick={() => setModalOpen(true)}
        >
          Legg til kostnad
        </button>
      </div>

      <div className={styles.card} style={{ padding: 0, overflow: "hidden" }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Dato</th>
              <th>Ekskl. MVA</th>
              <th>MVA (25 %)</th>
              <th>Totalt inkl. MVA</th>
              <th>Beskrivelse</th>
              <th>Kategori</th>
              <th>Bilag</th>
            </tr>
          </thead>
          <tbody>
            {costs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "24px" }}>
                  Ingen driftskostnader registrert.
                </td>
              </tr>
            ) : (
              costs.map((cost) => (
                <tr key={cost.id}>
                  <td>{formatCarDate(cost.costDate)}</td>
                  <td>{formatCarPrice(cost.amount)}</td>
                  <td className={styles.tableCellMuted}>
                    {formatCarPrice(cost.vatAmount)}
                  </td>
                  <td>{formatCarPrice(totalInklMva(cost.amount, cost.vatAmount))}</td>
                  <td>{cost.description}</td>
                  <td className={styles.tableCellMuted}>
                    {cost.category ?? "-"}
                  </td>
                  <td className={styles.tableCellMuted}>
                    <ReceiptBilagCell
                      receiptRef={cost.receiptRef}
                      receiptViewUrl={cost.receiptViewUrl}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {costs.length > 0 ? (
            <tfoot>
              <tr>
                <td>Sum</td>
                <td>{formatCarPrice(sumEkskl)}</td>
                <td className={styles.tableCellMuted}>{formatCarPrice(sumMva)}</td>
                <td>{formatCarPrice(sumInkl)}</td>
                <td colSpan={3} className={styles.tableCellMuted}>
                  Ekskl. MVA telles som kostnad · MVA er inngående fradrag
                </td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>

      <AddGeneralCostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

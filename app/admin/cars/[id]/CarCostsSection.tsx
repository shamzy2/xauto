"use client";

import { useState } from "react";

import { AddCarCostModal } from "@/app/admin/cars/[id]/AddCarCostModal";
import { ReceiptBilagCell } from "@/app/admin/components/ReceiptBilagCell";
import { formatCarDate, formatCarPrice } from "@/app/admin/cars/carDisplay";
import type { WithReceiptViewUrl } from "@/lib/server/attachReceiptUrls";
import type { CarCost } from "@/types/accounting";

import styles from "../../admin.module.css";

type CarCostsSectionProps = {
  carId: string;
  costs: WithReceiptViewUrl<CarCost>[];
};

export function CarCostsSection({ carId, costs }: CarCostsSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
  <>
    <div className={styles.card} style={{ marginTop: "20px" }}>
      <div className={styles.toolbar}>
        <h2 className={styles.carDetailTitle}>Driftskostnader (reparasjon m.m.)</h2>
        <button
          type="button"
          className={styles.filterBtn}
          onClick={() => setModalOpen(true)}
        >
          Legg til driftskostnad
        </button>
      </div>

      <div style={{ padding: 0, overflow: "hidden" }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Dato</th>
              <th>Beløp ekskl. MVA</th>
              <th>MVA</th>
              <th>Beskrivelse</th>
              <th>Kategori</th>
              <th>Bilag</th>
            </tr>
          </thead>
          <tbody>
            {costs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "24px" }}>
                  Ingen kostnader registrert.
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
        </table>
      </div>
    </div>

    <AddCarCostModal
      carId={carId}
      open={modalOpen}
      onClose={() => setModalOpen(false)}
    />
  </>
  );
}

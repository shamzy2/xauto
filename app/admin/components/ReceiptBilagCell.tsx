"use client";

import styles from "../admin.module.css";

type ReceiptBilagCellProps = {
  receiptRef: string | null;
  receiptViewUrl: string | null;
};

export function ReceiptBilagCell({
  receiptRef,
  receiptViewUrl,
}: ReceiptBilagCellProps) {
  if (receiptViewUrl) {
    return (
      <a
        href={receiptViewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.rowLink}
      >
        {receiptRef?.trim() || "Vis kvittering"}
      </a>
    );
  }
  if (receiptRef?.trim()) {
    return <span>{receiptRef}</span>;
  }
  return <span className={styles.tableCellMuted}>-</span>;
}

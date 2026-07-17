import type { Metadata } from "next";

import { FinancingPanel } from "@/app/admin/financing/FinancingPanel";
import {
  fetchAccountingSettings,
  fetchCompanyFinancing,
  fetchFinancingMovements,
} from "@/lib/server/accounting";
import {
  calculateFinancingItemBalances,
  todayIsoDate,
} from "@/lib/financing";

import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Finansiering",
};

export default async function AdminFinancingPage() {
  let errorMessage: string | null = null;
  let items: Awaited<ReturnType<typeof calculateFinancingItemBalances>> = [];
  let movements: Awaited<ReturnType<typeof fetchFinancingMovements>> = [];

  try {
    const [financing, allMovements, settings] = await Promise.all([
      fetchCompanyFinancing(),
      fetchFinancingMovements(),
      fetchAccountingSettings(),
    ]);
    movements = allMovements;
    items = calculateFinancingItemBalances(
      financing,
      allMovements,
      todayIsoDate(),
      settings.accountingStartDate,
    );
  } catch (e) {
    errorMessage =
      e instanceof Error ? e.message : "Kunne ikke hente finansiering.";
  }

  const itemNames: Record<string, string> = Object.fromEntries(
    items.map(({ financing }) => [financing.id, financing.name]),
  );

  return (
    <>
      <h1 className={styles.h1}>Finansiering</h1>
      <p className={styles.muted} style={{ marginBottom: "20px" }}>
        Aksjonærlån, kassekreditt og banklån for bilforretningen. Registrer
        uttak når du får penger inn, og nedbetaling når du betaler tilbake.
        Saldoen vises i årsregnskapets balanse.
      </p>
      {errorMessage ? (
        <div className={styles.card} style={{ marginBottom: "20px" }}>
          <p className={styles.muted}>{errorMessage}</p>
        </div>
      ) : null}
      <FinancingPanel
        items={items}
        movements={movements}
        itemNames={itemNames}
      />
    </>
  );
}

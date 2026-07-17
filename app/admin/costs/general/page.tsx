import type { Metadata } from "next";

import { GeneralCostsPanel } from "@/app/admin/costs/general/GeneralCostsPanel";
import { attachReceiptViewUrls, type WithReceiptViewUrl } from "@/lib/server/attachReceiptUrls";
import { fetchGeneralCosts } from "@/lib/server/accounting";
import type { GeneralCost } from "@/types/accounting";

import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Driftskostnader",
};

export default async function AdminGeneralCostsPage() {
  let costs: WithReceiptViewUrl<GeneralCost>[] = [];
  let errorMessage: string | null = null;

  try {
    costs = await attachReceiptViewUrls(await fetchGeneralCosts());
  } catch (e) {
    errorMessage =
      e instanceof Error ? e.message : "Kunne ikke hente driftskostnader.";
    costs = [];
  }

  return (
    <>
      <h1 className={styles.h1}>Driftskostnader</h1>
      <p className={styles.muted} style={{ marginBottom: "20px" }}>
        Generelle kostnader (husleie, strøm, lønn, reklame osv.) — føres i
        resultatregnskapet som «Andre driftskostnader». Last opp kvittering
        (bilde/PDF) eller fyll inn bilagsreferanse.
      </p>
      {errorMessage ? (
        <div className={styles.card} style={{ marginBottom: "20px" }}>
          <p className={styles.muted}>{errorMessage}</p>
        </div>
      ) : null}
      <GeneralCostsPanel costs={costs} />
    </>
  );
}

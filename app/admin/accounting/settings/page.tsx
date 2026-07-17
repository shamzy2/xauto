import type { Metadata } from "next";

import { AccountingSettingsForm } from "@/app/admin/accounting/settings/AccountingSettingsForm";
import { fetchAccountingSettings } from "@/lib/server/accounting";

import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Regnskapsinnstillinger",
};

export default async function AccountingSettingsPage() {
  const settings = await fetchAccountingSettings();

  return (
    <>
      <h1 className={styles.h1}>Regnskapsinnstillinger</h1>
      <p className={styles.muted} style={{ marginBottom: "20px" }}>
        Grunnlag for balanse og MVA. Årsregnskap oppdateres automatisk når du
        lagrer biler, kostnader eller innstillinger.
      </p>
      <AccountingSettingsForm settings={settings} />
    </>
  );
}

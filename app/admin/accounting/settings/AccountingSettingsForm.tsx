"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { updateAccountingSettingsAction } from "@/app/admin/accounting/settings/actions";
import type { AccountingSettings } from "@/types/accounting";

import styles from "../../admin.module.css";

type SettingsFormProps = {
  settings: AccountingSettings;
};

export function AccountingSettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateAccountingSettingsAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <form className={`${styles.card} ${styles.modalForm}`} action={formAction}>
      <label>
        Firmanavn (valgfritt inntil stiftelse)
        <input
          name="company_name"
          defaultValue={settings.companyName ?? ""}
          autoComplete="organization"
          placeholder="Fylles inn når selskapet er stiftet"
        />
      </label>
      <label>
        Org.nr. (valgfritt)
        <input
          name="org_number"
          defaultValue={settings.orgNumber ?? ""}
          placeholder="9 siffer — kan fylles inn senere"
        />
      </label>
      <label>
        Regnskapsstart (valgfritt)
        <input
          name="accounting_start_date"
          type="date"
          defaultValue={settings.accountingStartDate ?? ""}
        />
      </label>
      <p className={styles.muted} style={{ margin: "0 0 12px", fontSize: "0.8125rem" }}>
        Dato du starter regnskapsføring (f.eks. når selskapet stiftes midt i året).
        Poster før denne datoen telles ikke med. Kan oppdateres når du vet datoen.
      </p>
      <label style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          name="vat_registered"
          defaultChecked={settings.vatRegistered}
        />
        MVA-registrert
      </label>
      <label style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          name="prices_ex_vat"
          defaultChecked={settings.pricesExVat}
        />
        Driftskostnader føres ekskl. MVA (med MVA-fradrag)
      </label>
      <h2 className={styles.carDetailTitle} style={{ margin: "16px 0 8px" }}>
        Balanse per årsavslutning
      </h2>
      <p className={styles.muted} style={{ margin: "0 0 12px", fontSize: "0.8125rem" }}>
        Bank, leverandørgjeld og egenkapital per 31.12. Finansiering (aksjonærlån,
        kassekreditt, banklån) føres under Finansiering-menyen.
      </p>
      <label>
        Inngående egenkapital (NOK)
        <input
          name="opening_equity"
          type="text"
          inputMode="decimal"
          defaultValue={String(settings.openingEquity)}
        />
      </label>
      <label>
        Bankbeholdning per 31.12 (NOK)
        <input
          name="bank_balance"
          type="text"
          inputMode="decimal"
          defaultValue={String(settings.bankBalance)}
        />
      </label>
      <label>
        Leverandørgjeld (NOK)
        <input
          name="accounts_payable"
          type="text"
          inputMode="decimal"
          defaultValue={String(settings.accountsPayable)}
        />
      </label>
      {state && !state.ok ? (
        <p className={styles.formError} role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className={styles.muted}>Innstillinger lagret.</p>
      ) : null}
      <div className={styles.modalActions}>
        <button type="submit" className={styles.filterBtn} disabled={pending}>
          {pending ? "Lagrer…" : "Lagre innstillinger"}
        </button>
      </div>
    </form>
  );
}

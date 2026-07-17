"use client";

import type { SellFlowIntakeSession } from "@/types/vehicleFlowSummary";
import styles from "./SellFlowVehicleSummary.module.css";

type Props = {
  session: SellFlowIntakeSession;
};

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.spec}>
      <p className={styles.specLabel}>{label}</p>
      <p className={styles.specValue}>{value}</p>
    </div>
  );
}

export function SellFlowVehicleSummary({ session }: Props) {
  const { vehicleSummary: v } = session;
  const title = [v.make, v.model].filter(Boolean).join(" ");
  const km = Number.parseInt(session.kilometerstand.replace(/\D/g, ""), 10);
  const kmDisplay = Number.isFinite(km)
    ? `${km.toLocaleString("nb-NO")} km`
    : `${session.kilometerstand} km`;

  return (
    <article className={styles.vehicleCard} aria-label="Bilinformasjon">
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h2 className={styles.title}>{title}</h2>
            {v.variant ? <p className={styles.variant}>{v.variant}</p> : null}
          </div>
          <span className={styles.regBadge}>{session.kjennemerke}</span>
        </div>
        <p className={styles.source}>Hentet fra Statens vegvesen</p>
      </header>

      <div className={styles.body}>
        <div className={styles.grid}>
          <Spec
            label="Årsmodell"
            value={v.year != null ? String(v.year) : "-"}
          />
          <Spec label="Førstegangsreg." value={v.firstRegistered} />
          <Spec label="Kilometerstand" value={kmDisplay} />
          <Spec label="Drivstoff" value={v.fuel} />
          <Spec label="Karosseri" value={v.bodyType} />
          <Spec label="Effekt" value={v.powerHp} />
          <Spec label="Farge" value={v.color} />
          <Spec label="Hjuldrift" value={v.driveType} />
          <Spec label="EU-kontroll" value={v.euControl} />
        </div>

        <p className={styles.footerNote}>
          Kilometerstand er oppgitt av deg og vises sammen med offentlige
          kjøretøyopplysninger.
        </p>
      </div>
    </article>
  );
}

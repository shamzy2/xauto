import Image from "next/image";

import type { SkadeKartZonesState } from "@/app/lib/sellSkadeStorage";

import { SKADE_ZONE_LABELS } from "@/lib/server/adminSubmissionFormatting";

import styles from "./adminSkadeKart.module.css";

const ZONES: { id: keyof SkadeKartZonesState; className: string }[] = [
  { id: "frontLeft", className: styles.zoneFrontLeft },
  { id: "frontRight", className: styles.zoneFrontRight },
  { id: "left", className: styles.zoneVenstre },
  { id: "right", className: styles.zoneHoyre },
  { id: "rearLeft", className: styles.zoneRearLeft },
  { id: "rearRight", className: styles.zoneRearRight },
];

export function AdminSkadeKartReadonly({ zones }: { zones: SkadeKartZonesState }) {
  return (
    <div>
      <div className={styles.carMap} aria-label="Skadekart (som kunden markerte)">
        <Image
          src="/bilder/selgbilen/car.svg"
          alt=""
          width={299}
          height={155}
          className={styles.carMapImg}
        />
        <div className={styles.overlay}>
          {ZONES.map((z) => (
            <div
              key={z.id}
              className={`${styles.zone} ${z.className} ${zones[z.id] ? styles.zoneMarked : ""}`}
              title={SKADE_ZONE_LABELS[z.id] ?? z.id}
            />
          ))}
        </div>
      </div>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} aria-hidden /> Ikke markert
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.legendSwatchMarked}`} aria-hidden />{" "}
          Markert skade
        </span>
      </div>
    </div>
  );
}

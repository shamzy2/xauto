import Link from "next/link";

import {
  CAR_STATUS_LABELS,
  formatCarPrice,
} from "@/app/admin/cars/carDisplay";
import type { Car } from "@/types/accounting";

import styles from "../admin.module.css";

export function CarsTable({ cars }: { cars: Car[] }) {
  return (
    <div className={styles.card} style={{ padding: 0, overflow: "hidden" }}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Lagernr.</th>
            <th>Kjennemerke</th>
            <th>Modell</th>
            <th>Status</th>
            <th>Innkjøpspris</th>
          </tr>
        </thead>
        <tbody>
          {cars.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: "24px" }}>
                Ingen biler registrert ennå.
              </td>
            </tr>
          ) : (
            cars.map((car) => (
              <tr key={car.id}>
                <td>
                  <Link
                    className={styles.rowLink}
                    href={`/admin/cars/${car.id}`}
                  >
                    {car.stockNumber}
                  </Link>
                </td>
                <td>
                  <Link
                    className={styles.rowLink}
                    href={`/admin/cars/${car.id}`}
                  >
                    {car.kjennemerke}
                  </Link>
                </td>
                <td>{car.makeModel ?? "-"}</td>
                <td>{CAR_STATUS_LABELS[car.status]}</td>
                <td>{formatCarPrice(car.purchasePrice)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

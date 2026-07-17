import type { Metadata } from "next";

import { CarsAdminPanel } from "@/app/admin/cars/CarsAdminPanel";
import { fetchCars } from "@/lib/server/accounting";
import type { Car } from "@/types/accounting";

import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Biler",
};

export default async function AdminCarsPage() {
  let cars: Car[];
  let errorMessage: string | null = null;

  try {
    cars = await fetchCars();
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : "Kunne ikke hente biler.";
    cars = [];
  }

  return (
    <>
      <h1 className={styles.h1}>Biler</h1>
      {errorMessage ? (
        <div className={styles.card} style={{ marginBottom: "20px" }}>
          <p>Kunne ikke hente biler.</p>
          <p className={styles.muted}>{errorMessage}</p>
          <p className={styles.muted}>
            Har du kjørt migrasjonen{" "}
            <code>supabase/migrations/20260507120000_accounting_cars_costs.sql</code>
            ?
          </p>
        </div>
      ) : null}
      <CarsAdminPanel cars={cars} />
    </>
  );
}

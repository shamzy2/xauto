import type { Metadata } from "next";
import Link from "next/link";

import { formatCarPrice } from "@/app/admin/cars/carDisplay";
import {
  fetchCarCosts,
  fetchCars,
  fetchGeneralCosts,
} from "@/lib/server/accounting";
import { buildDashboardMetrics } from "@/lib/server/dashboardMetrics";

import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

type KpiCardProps = {
  label: string;
  value: string;
  hint?: string;
};

function KpiCard({ label, value, hint }: KpiCardProps) {
  return (
    <article className={styles.kpiCard}>
      <p className={styles.kpiLabel}>{label}</p>
      <p className={styles.kpiValue}>{value}</p>
      {hint ? <p className={styles.kpiHint}>{hint}</p> : null}
    </article>
  );
}

function formatPercent(value: number): string {
  return `${value.toFixed(1).replace(".", ",")} %`;
}

export default async function AdminDashboardPage() {
  let metrics;
  let errorMessage: string | null = null;

  try {
    const [cars, carCosts, generalCosts] = await Promise.all([
      fetchCars(),
      fetchCarCosts(),
      fetchGeneralCosts(),
    ]);
    metrics = buildDashboardMetrics(cars, carCosts, generalCosts);
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : "Kunne ikke laste dashboard.";
  }

  if (errorMessage || !metrics) {
    return (
      <>
        <h1 className={styles.h1}>Dashboard</h1>
        <div className={styles.card}>
          <p>Kunne ikke laste oversikten.</p>
          <p className={styles.muted}>{errorMessage}</p>
        </div>
      </>
    );
  }

  const best = metrics.bestCar;

  return (
    <>
      <h1 className={styles.h1}>Dashboard</h1>
      <p className={styles.muted} style={{ marginBottom: "24px" }}>
        Regnskapsoversikt for bilforretningen
      </p>

      <section className={styles.dashboardGrid} aria-label="Nøkkeltall">
        <KpiCard
          label="Total omsetning"
          value={formatCarPrice(metrics.revenue)}
        />
        <KpiCard
          label="Total resultat"
          value={formatCarPrice(metrics.totalProfit)}
        />
        {metrics.netProfitMarginPercent !== null ? (
          <KpiCard
            label="Netto margin"
            value={formatPercent(metrics.netProfitMarginPercent)}
            hint="Resultat / omsetning"
          />
        ) : null}
        <KpiCard
          label="Biler på lager"
          value={String(metrics.carsInStock)}
        />
        <KpiCard label="Biler solgt" value={String(metrics.carsSold)} />
        <KpiCard
          label="Lagerverdi"
          value={formatCarPrice(metrics.inventoryValue)}
        />
        <KpiCard
          label="Totale kostnader"
          value={formatCarPrice(metrics.totalCosts)}
          hint="Bilkostnader + generelle kostnader"
        />
      </section>

      <section className={styles.card}>
        <h2 className={styles.kpiSectionTitle}>Beste bil</h2>
        {best ? (
          <>
            <p className={styles.kpiValue} style={{ marginBottom: "8px" }}>
              {formatCarPrice(best.profit)}
            </p>
            <p className={styles.muted}>
              <Link
                className={styles.rowLink}
                href={`/admin/cars/${best.car.id}`}
              >
                {best.car.stockNumber} · {best.car.kjennemerke}
                {best.car.makeModel ? ` · ${best.car.makeModel}` : ""}
              </Link>
            </p>
          </>
        ) : (
          <p className={styles.muted}>
            Ingen solgte biler med registrert salgspris ennå.
          </p>
        )}
      </section>
    </>
  );
}

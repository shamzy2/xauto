import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CarCostsSection } from "@/app/admin/cars/[id]/CarCostsSection";
import { CarDetailPanel } from "@/app/admin/cars/[id]/CarDetailPanel";
import { attachReceiptViewUrls, type WithReceiptViewUrl } from "@/lib/server/attachReceiptUrls";
import { fetchCarById, fetchCarCostsByCarId } from "@/lib/server/accounting";
import type { CarCost } from "@/types/accounting";

import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const car = await fetchCarById(id);
  if (!car) {
    return { title: "Bil ikke funnet" };
  }
  return { title: `${car.stockNumber} · ${car.kjennemerke}` };
}

export default async function AdminCarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let car;
  let costs: WithReceiptViewUrl<CarCost>[] = [];

  try {
    car = await fetchCarById(id);
    if (car) {
      costs = await attachReceiptViewUrls(await fetchCarCostsByCarId(id));
    }
  } catch {
    notFound();
  }

  if (!car) {
    notFound();
  }

  return (
    <>
      <p className={styles.topBack}>
        <Link className={styles.backLink} href="/admin/cars">
          ← Biler
        </Link>
      </p>
      <h1 className={styles.h1}>Bil</h1>
      <CarDetailPanel car={car} />
      <CarCostsSection carId={car.id} costs={costs} />
    </>
  );
}

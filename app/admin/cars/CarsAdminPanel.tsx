"use client";

import { useState } from "react";

import type { Car } from "@/types/accounting";

import { AddCarModal } from "./AddCarModal";
import { CarsTable } from "./CarsTable";
import styles from "../admin.module.css";

export function CarsAdminPanel({ cars }: { cars: Car[] }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className={styles.toolbar}>
        <p className={styles.muted} style={{ margin: 0 }}>
          {cars.length} {cars.length === 1 ? "bil" : "biler"}
        </p>
        <button
          type="button"
          className={styles.filterBtn}
          onClick={() => setModalOpen(true)}
        >
          Legg til bil
        </button>
      </div>

      <CarsTable cars={cars} />

      <AddCarModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

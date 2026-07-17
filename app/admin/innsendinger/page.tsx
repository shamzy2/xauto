import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import styles from "../admin.module.css";
import { InnsendingerTable, type InnsendingerListRow } from "./InnsendingerTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Innsendinger, selg",
};

export default async function AdminInnsendingerPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("sell_submissions")
    .select(
      "id, created_at, kjennemerke, full_name, email, car_model, admin_opened_at, admin_notes, vegvesen_snapshot",
    )
    .order("created_at", { ascending: false });

  const status = sp.status ?? "all";
  if (status === "unread") {
    query = query.is("admin_opened_at", null);
  } else if (status === "read") {
    query = query.not("admin_opened_at", "is", null);
  }

  const qRaw = sp.q?.trim();
  if (qRaw) {
    const safe = qRaw.replace(/%/g, "\\%").replace(/_/g, "\\_");
    const pattern = `%${safe.replace(/"/g, '\\"')}%`;
    query = query.or(
      `kjennemerke.ilike."${pattern}",email.ilike."${pattern}",full_name.ilike."${pattern}"`,
    );
  }

  const { data: rows, error } = await query;

  if (error) {
    return (
      <div className={styles.card}>
        <p>Kunne ikke hente innsendinger.</p>
        <p className={styles.muted}>{error.message}</p>
        <p className={styles.muted}>
          Har du kjørt SQL-migrasjonen i Supabase? Se{" "}
          <code>supabase/migrations/20260503120000_sell_submissions.sql</code>
        </p>
      </div>
    );
  }

  const list = (rows ?? []) as InnsendingerListRow[];

  return (
    <>
      <h1 className={styles.h1}>Selg bilen</h1>
      <p className={styles.muted} style={{ marginBottom: "20px" }}>
        {list.length} treff
      </p>

      <form className={styles.filters} method="get">
        <label>
          Søk
          <input
            name="q"
            type="search"
            placeholder="Regnr, navn, e-post…"
            defaultValue={qRaw ?? ""}
          />
        </label>
        <label>
          Status
          <select name="status" defaultValue={status}>
            <option value="all">Alle</option>
            <option value="unread">Uleste</option>
            <option value="read">Åpnet</option>
          </select>
        </label>
        <div className={styles.filterActions}>
          <button type="submit" className={styles.filterBtn}>
            Filtrer
          </button>
          <Link
            href="/admin/innsendinger"
            className={`${styles.filterBtn} ${styles.filterBtnSecondary}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}
          >
            Nullstill
          </Link>
        </div>
      </form>

      <InnsendingerTable rows={list} showFinnColumn={false} />
    </>
  );
}

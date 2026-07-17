import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import styles from "../../admin.module.css";
import {
  InnsendingerTable,
  type InnsendingerListRow,
} from "../InnsendingerTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Innsendinger, innbytte",
};

export default async function AdminInnsendingerInnbyttePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("innbytte_submissions")
    .select(
      "id, created_at, kjennemerke, full_name, email, car_model, admin_opened_at, admin_notes, vegvesen_snapshot, finn_listing_url",
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
      `kjennemerke.ilike."${pattern}",email.ilike."${pattern}",full_name.ilike."${pattern}",finn_listing_url.ilike."${pattern}"`,
    );
  }

  const { data: rows, error } = await query;

  if (error) {
    return (
      <div className={styles.card}>
        <p>Kunne ikke hente innbytte-innsendinger.</p>
        <p className={styles.muted}>{error.message}</p>
        <p className={styles.muted}>
          Har du kjørt SQL-migrasjonen i Supabase? Se{" "}
          <code>supabase/migrations/20260503140000_innbytte_submissions.sql</code>
        </p>
      </div>
    );
  }

  const list = (rows ?? []) as InnsendingerListRow[];

  return (
    <>
      <h1 className={styles.h1}>Innbytte</h1>
      <p className={styles.muted} style={{ marginBottom: "20px" }}>
        {list.length} treff
      </p>

      <form className={styles.filters} method="get">
        <label>
          Søk
          <input
            name="q"
            type="search"
            placeholder="Regnr, navn, e-post, FINN…"
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
            href="/admin/innsendinger/innbytte"
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

      <InnsendingerTable rows={list} showFinnColumn />
    </>
  );
}

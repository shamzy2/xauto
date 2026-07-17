import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import styles from "../../admin.module.css";
import { KontaktInnsendingerTable, type KontaktListRow } from "./KontaktInnsendingerTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Innsendinger, kontakt",
};

export default async function AdminKontaktInnsendingerPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("contact_submissions")
    .select(
      "id, created_at, full_name, email, phone, message, admin_opened_at, admin_notes",
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
      `email.ilike."${pattern}",full_name.ilike."${pattern}",message.ilike."${pattern}",phone.ilike."${pattern}"`,
    );
  }

  const { data: rows, error } = await query;

  if (error) {
    return (
      <div className={styles.card}>
        <p>Kunne ikke hente kontakt-henvendelser.</p>
        <p className={styles.muted}>{error.message}</p>
        <p className={styles.muted}>
          Har du kjørt SQL-migrasjonen i Supabase? Se{" "}
          <code>supabase/migrations/20260504200000_contact_submissions.sql</code>
        </p>
      </div>
    );
  }

  const list = (rows ?? []) as KontaktListRow[];

  return (
    <>
      <h1 className={styles.h1}>Kontakt oss</h1>
      <p className={styles.muted} style={{ marginBottom: "20px" }}>
        {list.length} treff
      </p>

      <form className={styles.filters} method="get">
        <label>
          Søk
          <input
            name="q"
            type="search"
            placeholder="Navn, e-post, melding…"
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
            href="/admin/innsendinger/kontakt"
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

      <KontaktInnsendingerTable rows={list} />
    </>
  );
}

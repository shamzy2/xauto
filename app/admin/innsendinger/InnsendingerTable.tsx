import Link from "next/link";

import {
  normalizeKjennemerke,
  ordinartKjennemerkeFromVegvesenPayload,
} from "@/lib/server/vegvesen";
import { formatOsloDateTimeShort } from "@/lib/formatOslo";
import {
  formatNbLongDate,
  vegvesenAdminSummaryFromPayload,
} from "@/lib/server/vegvesenAdminSummary";

import styles from "../admin.module.css";

export type InnsendingerListRow = {
  id: string;
  created_at: string;
  kjennemerke: string;
  full_name: string;
  email: string;
  car_model: string | null;
  admin_opened_at: string | null;
  admin_notes: string | null;
  vegvesen_snapshot: unknown;
  finn_listing_url?: string | null;
};

function adminNotesHoverTitle(notes: string | null | undefined): string {
  const t = notes?.trim();
  if (!t) return "";
  return t.replace(/\s+/g, " ").slice(0, 1000);
}

function AdminNoteListPeek({ notes }: { notes: string | null }) {
  const title = adminNotesHoverTitle(notes);
  if (!title) {
    return <span className={styles.tableCellMuted}>-</span>;
  }
  return (
    <button
      type="button"
      className={styles.adminListNotePeek}
      title={title}
      aria-label="Har internt notat. Hold pekeren over knappen for forhåndsvisning."
    >
      <svg
        className={styles.adminListNotePeekIcon}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M8 3h10a3 3 0 013 3v9.5a1 1 0 01-.3.7L15 21H8a3 3 0 01-3-3V6a3 3 0 013-3z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M9 8h8M9 12h5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span>Notat</span>
    </button>
  );
}

function finnCellLabel(url: string | null | undefined): string {
  const t = url?.trim();
  if (!t) return "-";
  return t.length > 48 ? `${t.slice(0, 45)}…` : t;
}

export function InnsendingerTable({
  rows,
  showFinnColumn,
}: {
  rows: InnsendingerListRow[];
  showFinnColumn: boolean;
}) {
  return (
    <div className={styles.card} style={{ padding: 0, overflow: "hidden" }}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Dato</th>
            <th>Kjennemerke</th>
            <th>Bil</th>
            {showFinnColumn ? <th>FINN</th> : null}
            <th>Førsteg.reg.</th>
            <th>Navn</th>
            <th>Notat</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={showFinnColumn ? 8 : 7}
                style={{ padding: "24px" }}
              >
                Ingen innsendinger ennå.
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const fg = vegvesenAdminSummaryFromPayload(
                r.vegvesen_snapshot,
              ).forstegangsregistreringDato;
              const ordinartListe = ordinartKjennemerkeFromVegvesenPayload(
                r.vegvesen_snapshot,
                normalizeKjennemerke(r.kjennemerke),
              );
              const finn = r.finn_listing_url?.trim();
              return (
                <tr key={r.id}>
                  <td>
                    {formatOsloDateTimeShort(r.created_at)}
                  </td>
                  <td>
                    <Link
                      className={styles.rowLink}
                      href={`/admin/innsendinger/${r.id}`}
                    >
                      {r.kjennemerke}
                    </Link>
                    {ordinartListe ? (
                      <div
                        className={styles.tableCellMuted}
                        style={{ fontSize: "0.8125rem", marginTop: 4 }}
                      >
                        Ordinært: {ordinartListe}
                      </div>
                    ) : null}
                  </td>
                  <td>{r.car_model ?? "-"}</td>
                  {showFinnColumn ? (
                    <td className={styles.tableCellMuted}>
                      {finn ? (
                        <a
                          href={finn}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.rowLink}
                          style={{ fontWeight: 500 }}
                        >
                          {finnCellLabel(finn)}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  ) : null}
                  <td className={styles.tableCellMuted}>
                    {formatNbLongDate(fg)}
                  </td>
                  <td>{r.full_name}</td>
                  <td>
                    <AdminNoteListPeek notes={r.admin_notes} />
                  </td>
                  <td>
                    {r.admin_opened_at ? (
                      <span className={`${styles.badge} ${styles.badgeRead}`}>
                        Åpnet
                      </span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeNew}`}>
                        Ny
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

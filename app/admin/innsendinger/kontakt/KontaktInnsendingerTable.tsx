import Link from "next/link";

import { formatOsloDateTimeShort } from "@/lib/formatOslo";

import styles from "../../admin.module.css";

export type KontaktListRow = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  message: string;
  admin_opened_at: string | null;
  admin_notes: string | null;
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

function messagePeek(msg: string, max = 72): string {
  const t = msg.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function KontaktInnsendingerTable({ rows }: { rows: KontaktListRow[] }) {
  return (
    <div className={styles.card} style={{ padding: 0, overflow: "hidden" }}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Dato</th>
            <th>Navn</th>
            <th>E-post</th>
            <th>Telefon</th>
            <th>Melding</th>
            <th>Notat</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: "24px" }}>
                Ingen henvendelser ennå.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id}>
                <td>
                  {formatOsloDateTimeShort(r.created_at)}
                </td>
                <td>
                  <Link
                    className={styles.rowLink}
                    href={`/admin/innsendinger/kontakt/${r.id}`}
                  >
                    {r.full_name}
                  </Link>
                </td>
                <td className={styles.tableCellMuted}>{r.email}</td>
                <td className={styles.tableCellMuted}>
                  {r.phone?.trim() || "-"}
                </td>
                <td className={styles.tableCellMuted} title={r.message}>
                  {messagePeek(r.message)}
                </td>
                <td>
                  <AdminNoteListPeek notes={r.admin_notes} />
                </td>
                <td>
                  {r.admin_opened_at ? (
                    <span className={`${styles.badge} ${styles.badgeRead}`}>
                      Åpnet
                    </span>
                  ) : (
                    <span className={`${styles.badge} ${styles.badgeNew}`}>Ny</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

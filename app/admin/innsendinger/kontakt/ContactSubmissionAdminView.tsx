import { AdminSubmissionHeroChrome } from "@/app/admin/components/AdminSubmissionHeroChrome";
import { formatOsloDateTimeShort } from "@/lib/formatOslo";

import styles from "../../admin.module.css";

export type ContactSubmissionRow = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  message: string;
  admin_notes: string | null;
  admin_opened_at: string | null;
  submitter_ip?: string | null;
  submitter_user_agent?: string | null;
};

export function ContactSubmissionAdminView({ row }: { row: ContactSubmissionRow }) {
  const r = row;
  const phoneDisplay = r.phone?.trim() ?? "";

  return (
    <>
      <AdminSubmissionHeroChrome
        submissionId={r.id}
        initialNotes={r.admin_notes ?? ""}
        email={r.email}
        phone={phoneDisplay}
        showPdf={false}
      >
        <div className={styles.heroMain}>
          <p className={styles.heroKicker}>Kontakt oss</p>
          <h1 className={styles.heroTitle}>{r.full_name}</h1>
          <p className={styles.heroMeta}>
            Mottatt{" "}
            {formatOsloDateTimeShort(r.created_at)}
            {r.admin_opened_at ? (
              <>
                {" "}
                · Åpnet {formatOsloDateTimeShort(r.admin_opened_at)}
              </>
            ) : null}
          </p>
        </div>
      </AdminSubmissionHeroChrome>

      <div className={styles.panel}>
        <h2 className={styles.panelH}>Kontaktopplysninger</h2>
        <dl className={styles.compactDl}>
          <dt>Navn</dt>
          <dd>{r.full_name}</dd>
          <dt>E-post</dt>
          <dd>{r.email}</dd>
          <dt>Telefon</dt>
          <dd>{phoneDisplay || "-"}</dd>
          <dt>IP (innsending)</dt>
          <dd className={styles.monoSmall}>
            {r.submitter_ip?.trim() || "-"}
          </dd>
          <dt>Enhet / nettleser (User-Agent)</dt>
          <dd
            className={styles.monoSmall}
            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {r.submitter_user_agent?.trim() || "-"}
          </dd>
        </dl>
      </div>

      <div className={styles.panel}>
        <h2 className={styles.panelH}>Melding</h2>
        <div
          className={styles.panelMuted}
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.5,
          }}
        >
          {r.message}
        </div>
      </div>
    </>
  );
}

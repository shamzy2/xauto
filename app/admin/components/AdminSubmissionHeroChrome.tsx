"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";

import { SubmissionPdfButton } from "./SubmissionPdfButton";
import styles from "../admin.module.css";

type Props = {
  children: ReactNode;
  submissionId: string;
  initialNotes: string;
  email: string;
  phone: string;
  /** Skjul PDF-knapp (f.eks. kontakt-henvendelser uten kjøretøydata). */
  showPdf?: boolean;
};

export function AdminSubmissionHeroChrome({
  children,
  submissionId,
  initialNotes,
  email,
  phone,
  showPdf = true,
}: Props) {
  const router = useRouter();
  const formId = useId();
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState<"edit" | "saved">("edit");
  const [notes, setNotes] = useState(initialNotes);
  const [lastSaved, setLastSaved] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNotes(initialNotes);
    setLastSaved(initialNotes);
  }, [initialNotes]);

  const openPanel = useCallback(() => {
    setExpanded((e) => {
      const next = !e;
      if (next) {
        setView(lastSaved.trim() ? "saved" : "edit");
      }
      return next;
    });
  }, [lastSaved]);

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/submissions/${encodeURIComponent(submissionId)}/notes`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ notes }),
        },
      );
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Kunne ikke lagre.");
        return;
      }
      const trimmed = notes.trim();
      setLastSaved(notes);
      setView(trimmed ? "saved" : "edit");
      router.refresh();
    } catch {
      setError("Nettverksfeil.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit() {
    setNotes(lastSaved);
    setView("edit");
    setError(null);
  }

  const hasSavedContent = lastSaved.trim().length > 0;

  return (
    <section className={styles.heroStrip}>
      <div className={styles.heroStripTopRow}>
        {children}
        <div className={styles.heroActions}>
          {showPdf ? <SubmissionPdfButton submissionId={submissionId} /> : null}
          <button
            type="button"
            className={styles.ctaNotat}
            data-expanded={expanded ? "true" : "false"}
            aria-expanded={expanded}
            onClick={() => openPanel()}
          >
            Notat
          </button>
          <a className={styles.ctaOutline} href={`mailto:${email}`}>
            E-post kunde
          </a>
          {phone.trim() ? (
            <a
              className={styles.ctaOutline}
              href={`tel:${phone.replace(/\s/g, "")}`}
            >
              Ring kunde
            </a>
          ) : null}
        </div>
      </div>

      <div
        className={styles.notesReveal}
        data-open={expanded ? "true" : "false"}
        aria-hidden={!expanded}
      >
        <div className={styles.notesRevealInner}>
          <div className={styles.notesRevealPanel}>
            {view === "saved" && hasSavedContent ? (
              <div className={styles.notesSavedCard}>
                <p className={styles.notesSavedLabel}>Lagret notat</p>
                <div className={styles.notesSavedPreview}>{lastSaved}</div>
                <div className={styles.notesSavedBar}>
                  <button
                    type="button"
                    className={styles.notesEndreBtn}
                    onClick={startEdit}
                  >
                    Endre
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.notesEditCard}>
                <label
                  className={styles.srOnly}
                  htmlFor={`${formId}-admin-notes`}
                >
                  Notat
                </label>
                <textarea
                  id={`${formId}-admin-notes`}
                  className={styles.notesEditTextarea}
                  rows={6}
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setError(null);
                  }}
                  placeholder="Skriv notat …"
                />
                <div className={styles.notesEditFooter}>
                  <button
                    type="button"
                    className={styles.notesLagreBtn}
                    disabled={saving}
                    onClick={() => void save()}
                  >
                    {saving ? "Lagrer…" : "Lagre"}
                  </button>
                  {error ? (
                    <span className={styles.adminNotesErr} role="alert">
                      {error}
                    </span>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

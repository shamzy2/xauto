"use client";

import { useState } from "react";

import styles from "../admin.module.css";

export function SubmissionPdfButton({
  submissionId,
  label = "Last ned PDF",
}: {
  submissionId: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function download() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submissionId}/pdf`, {
        credentials: "include",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error ?? `Feil ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `innsending-${submissionId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Kunne ikke lage PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <button
        type="button"
        className={styles.ctaPdf}
        disabled={busy}
        onClick={() => void download()}
      >
        {busy ? "Genererer PDF…" : label}
      </button>
      {err ? (
        <span style={{ fontSize: 13, color: "rgb(234 160 56)" }}>{err}</span>
      ) : null}
    </div>
  );
}

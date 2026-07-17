import { skadeZonesFromSubmission } from "@/app/lib/sellSkadeStorage";
import { formatOsloDateTimeShort } from "@/lib/formatOslo";
import { AdminSkadeKartReadonly } from "@/app/admin/components/AdminSkadeKartReadonly";
import { AdminSubmissionHeroChrome } from "@/app/admin/components/AdminSubmissionHeroChrome";
import {
  formatDekkLines,
  formatSteg3Lines,
  skadeMerkedeSonenavn,
  type AdminSubmissionRow,
} from "@/lib/server/adminSubmissionFormatting";
import { createSupabaseAdmin } from "@/lib/server/supabaseAdmin";
import {
  normalizeKjennemerke,
  ordinartKjennemerkeFromVegvesenPayload,
} from "@/lib/server/vegvesen";
import {
  formatNbLongDateFull,
  vegvesenAdminSummaryFromPayload,
} from "@/lib/server/vegvesenAdminSummary";

import styles from "../admin.module.css";

export async function SubmissionAdminView({ row }: { row: AdminSubmissionRow }) {
  const r = row;
  const ordinartRegistrert = ordinartKjennemerkeFromVegvesenPayload(
    r.vegvesen_snapshot,
    normalizeKjennemerke(r.kjennemerke),
  );
  const vv = vegvesenAdminSummaryFromPayload(r.vegvesen_snapshot);
  const zones = skadeZonesFromSubmission(r.skade_zones);
  const skadeMerkede = skadeMerkedeSonenavn(zones);
  const dekkLines = formatDekkLines(r.dekk);
  const steg3Lines = formatSteg3Lines(r.steg3);

  const photoUrls: string[] = [];
  try {
    const admin = createSupabaseAdmin();
    for (const path of r.photo_paths ?? []) {
      if (typeof path !== "string" || !path) continue;
      const { data, error } = await admin.storage
        .from("sell-submission-photos")
        .createSignedUrl(path, 7200);
      if (!error && data?.signedUrl) {
        photoUrls.push(data.signedUrl);
      }
    }
  } catch {
    /* bucket / env */
  }

  const rawJson =
    r.vegvesen_snapshot != null
      ? JSON.stringify(r.vegvesen_snapshot, null, 2)
      : "";

  return (
    <>
      <AdminSubmissionHeroChrome
        submissionId={r.id}
        initialNotes={r.admin_notes ?? ""}
        email={r.email}
        phone={r.phone}
      >
        <div className={styles.heroMain}>
          <p className={styles.heroKicker}>
            {r.finn_listing_url?.trim() ? "Innbytte" : "Selg bilen"}
          </p>
          <h1 className={styles.heroTitle}>
            {r.kjennemerke}
            {ordinartRegistrert ? (
              <span className={styles.heroModel}>
                {" "}
                · ordinært: {ordinartRegistrert}
              </span>
            ) : null}
            {r.car_model ? (
              <span className={styles.heroModel}> · {r.car_model}</span>
            ) : null}
          </h1>
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
        <h2 className={styles.panelH}>Alt kunden har fylt ut</h2>
        <p className={styles.panelMuted} style={{ marginBottom: "16px" }}>
          Oversikt over alle felt fra innsendingsskjemaet (inkl. der bilen er
          markert på kartet).
        </p>
        <div className={styles.fullGrid}>
          <div>
            <h3 className={styles.subH}>Kontakt</h3>
            <dl className={styles.compactDl}>
              <dt>Navn</dt>
              <dd>{r.full_name}</dd>
              <dt>E-post</dt>
              <dd>{r.email}</dd>
              <dt>Telefon</dt>
              <dd>{r.phone}</dd>
              <dt>IP (innsending)</dt>
              <dd className={styles.monoSmall}>
                {r.submitter_ip?.trim() || "-"}
              </dd>
              <dt>Enhet / nettleser (User-Agent)</dt>
              <dd
                className={styles.monoSmall}
                style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
              >
                {r.submitter_user_agent?.trim() || "-"}
              </dd>
            </dl>
          </div>
          <div>
            <h3 className={styles.subH}>Bil (steg 1)</h3>
            <dl className={styles.compactDl}>
              <dt>Skilt</dt>
              <dd>
                <strong>{r.kjennemerke}</strong>
                {ordinartRegistrert ? (
                  <>
                    {" "}
                    <span className={styles.panelMuted}>· ordinært:</span>{" "}
                    <span className={styles.mono}>{ordinartRegistrert}</span>
                  </>
                ) : null}
              </dd>
              <dt>Kilometer</dt>
              <dd>{r.kilometerstand}</dd>
              <dt>Modell (fra oppslag)</dt>
              <dd>{r.car_model ?? "-"}</dd>
              <dt>Førstegangsreg. år (lagret)</dt>
              <dd>
                {r.first_registration_year != null
                  ? String(r.first_registration_year)
                  : "-"}
              </dd>
            </dl>
          </div>
          <div>
            <h3 className={styles.subH}>Pris og avslutning</h3>
            <dl className={styles.compactDl}>
              {r.finn_listing_url?.trim() ? (
                <>
                  <dt>FINN (kode / lenke)</dt>
                  <dd>
                    <a
                      href={r.finn_listing_url.trim()}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.monoSmall}
                      style={{ color: "var(--accent)", fontWeight: 600 }}
                    >
                      {r.finn_listing_url.trim()}
                    </a>
                  </dd>
                </>
              ) : null}
              <dt>Prisforventning</dt>
              <dd>{r.price_hint?.trim() || "-"}</dd>
              <dt>«Jeg vil legge til en merknad»</dt>
              <dd>
                {r.wants_additional_note == null
                  ? "-"
                  : r.wants_additional_note
                    ? "Ja"
                    : "Nei"}
              </dd>
              <dt>Tilleggskommentar</dt>
              <dd>{r.additional_comment?.trim() || "-"}</dd>
            </dl>
          </div>
          <div>
            <h3 className={styles.subH}>Dekk (steg 2b)</h3>
            <ul className={styles.simpleList}>
              {dekkLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className={styles.fullWidth}>
            <h3 className={styles.subH}>Skade, rektangelkart + merknad (steg 2c)</h3>
            <p className={styles.panelBody}>
              <strong>Merknad / alt kunden skrev:</strong>{" "}
              {r.skade_comment?.trim() || "-"}
            </p>
            <AdminSkadeKartReadonly zones={zones} />
            <p className={styles.panelMuted}>
              Markerte soner:{" "}
              {skadeMerkede.length > 0 ? skadeMerkede.join(", ") : "Ingen."}
            </p>
          </div>
          <div className={styles.fullWidth}>
            <h3 className={styles.subH}>Service og utstyr (steg 3)</h3>
            <ul className={styles.simpleList}>
              {steg3Lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className={styles.fullWidth}>
            <h3 className={styles.subH}>Bilder (steg 4b)</h3>
            {photoUrls.length > 0 ? (
              <>
                <div className={styles.photoGridLarge}>
                  {photoUrls.map((src) => (
                    <a
                      key={src}
                      className={styles.photoThumb}
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="Opplastet bilde" loading="lazy" />
                    </a>
                  ))}
                </div>
                <p className={styles.panelMuted}>
                  Signerte lenker (2 t). PDF inneholder samme bilder.
                </p>
              </>
            ) : (
              <p className={styles.panelMuted}>
                Ingen bilder
                {r.photo_paths && r.photo_paths.length > 0
                  ? " (signering feilet, sjekk storage / service role)."
                  : "."}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.quickGrid}>
        <div className={styles.kpiCard}>
          <h3 className={styles.kpiTitle}>Vegvesen, registrering</h3>
          <dl className={styles.kpiDl}>
            <div>
              <dt>Førstegangsreg. (dato)</dt>
              <dd>{formatNbLongDateFull(vv.forstegangsregistreringDato)}</dd>
            </div>
            {vv.understellsnummer ? (
              <div>
                <dt>Understellsnr.</dt>
                <dd className={styles.mono}>{vv.understellsnummer}</dd>
              </div>
            ) : null}
            {vv.euroKlasse ? (
              <div>
                <dt>Euro-klasse</dt>
                <dd>{vv.euroKlasse}</dd>
              </div>
            ) : null}
          </dl>
        </div>
        <div className={styles.kpiCard}>
          <h3 className={styles.kpiTitle}>EU / godkjenning</h3>
          <p className={styles.kpiFootnote}>
            Typegodkjenning og periodisk kjøretøykontroll.
          </p>
          <dl className={styles.kpiDl}>
            {vv.typegodkjenningTekst ? (
              <div>
                <dt>Typegodkjenning</dt>
                <dd className={styles.monoSmall}>{vv.typegodkjenningTekst}</dd>
              </div>
            ) : null}
            <div>
              <dt>Teknisk godkjenning fra</dt>
              <dd>{formatNbLongDateFull(vv.tekniskGodkjenningGyldigFra)}</dd>
            </div>
            <div>
              <dt>EU-kontroll sist</dt>
              <dd>{formatNbLongDateFull(vv.periodiskSistGodkjent)}</dd>
            </div>
            <div>
              <dt>Neste kontrollfrist</dt>
              <dd className={styles.kpiHighlight}>
                {formatNbLongDateFull(vv.periodiskKontrollfrist)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {rawJson ? (
        <details className={styles.rawDetails}>
          <summary>Vegvesen rådata (JSON)</summary>
          <pre className={styles.jsonBlock}>{rawJson}</pre>
        </details>
      ) : null}
    </>
  );
}

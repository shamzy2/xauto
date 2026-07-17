"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { readJsonResponseBody } from "@/app/lib/readJsonResponseBody";
import {
  persistSkadeKartComment,
  persistSkadeZones,
  readSkadeKartComment,
  readSkadeZonesSnapshot,
} from "@/app/lib/sellSkadeStorage";
import { useScrollIntoViewWhen } from "@/app/lib/useScrollIntoViewWhen";
import { SellMobileCtaDock } from "./SellMobileCtaDock";
import { useSellFlowRoute } from "./SellFlowRouteContext";
import styles from "./SellCarStep2c.module.css";

const ZONES = [
  {
    id: "frontLeft",
    label: "Foran, venstre",
    className: styles.zoneFrontLeft,
  },
  {
    id: "frontRight",
    label: "Foran, høyre",
    className: styles.zoneFrontRight,
  },
  { id: "left", label: "Venstre", className: styles.zoneVenstre },
  { id: "right", label: "Høyre", className: styles.zoneHoyre },
  {
    id: "rearLeft",
    label: "Bak, venstre",
    className: styles.zoneRearLeft,
  },
  {
    id: "rearRight",
    label: "Bak, høyre",
    className: styles.zoneRearRight,
  },
] as const;

type ZoneId = (typeof ZONES)[number]["id"];

/**
 * Merknad kreves alltid med minstegrense. Har du markert skader på kartet,
 * må merknaden beskrive dette (eller mer).
 */
const MERKNAD_MIN_LEN = 8;

export function SellCarStep2c() {
  const router = useRouter();
  const { basePath, intakeSessionUrl } = useSellFlowRoute();
  const damageCommentId = useId();
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [playEnter, setPlayEnter] = useState(false);
  const [zones, setZones] = useState<Record<ZoneId, boolean>>({
    frontLeft: false,
    frontRight: false,
    left: false,
    right: false,
    rearLeft: false,
    rearRight: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [damageComment, setDamageComment] = useState("");
  const fetchErrorRef = useRef<HTMLParagraphElement>(null);
  const formErrorRef = useRef<HTMLParagraphElement>(null);
  useScrollIntoViewWhen(fetchError, fetchErrorRef);
  useScrollIntoViewWhen(formError, formErrorRef);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(intakeSessionUrl, {
          cache: "no-store",
          credentials: "include",
        });
        const json = await readJsonResponseBody<{ error?: string }>(res);
        if (!res.ok) {
          throw new Error(json.error ?? "Kunne ikke hente data.");
        }
        if (!cancelled) setFetchError(null);
      } catch (e) {
        if (!cancelled) {
          setFetchError(e instanceof Error ? e.message : "Noe gikk galt.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [intakeSessionUrl]);

  const showContent = !fetchError;

  useEffect(() => {
    if (!showContent) return;
    const saved = readSkadeKartComment();
    if (saved) setDamageComment(saved);
    setZones(readSkadeZonesSnapshot());
  }, [showContent]);

  useLayoutEffect(() => {
    if (!showContent) {
      setPlayEnter(false);
      return;
    }
    setPlayEnter(false);
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setPlayEnter(true));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [showContent]);

  function toggleZone(id: ZoneId) {
    setFormError(null);
    setZones((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      persistSkadeZones(next);
      return next;
    });
  }

  function updateDamageComment(value: string) {
    setDamageComment(value);
    persistSkadeKartComment(value);
  }

  function goNext() {
    const anyZone = ZONES.some((z) => zones[z.id]);
    const note = damageComment.trim();
    if (anyZone && note.length < MERKNAD_MIN_LEN) {
      setFormError(
        "Du har markert skade på kartet, skriv da en merknad under «Merknad og opplysninger» (minst noen ord om hva som gjelder).",
      );
      return;
    }
    if (!anyZone && note.length < MERKNAD_MIN_LEN) {
      setFormError(
        "Velg områder med skade på kartet, eller skriv en merknad, for eksempel at bilen er uten skader.",
      );
      return;
    }
    setFormError(null);
    persistSkadeZones(zones);
    const go = () => router.push(`${basePath}/steg-3`);
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    if (typeof doc.startViewTransition === "function") {
      doc.startViewTransition(go);
    } else {
      go();
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        {fetchError ? (
          <p
            ref={fetchErrorRef}
            className={styles.message}
            data-form-error-anchor
          >
            {fetchError}
          </p>
        ) : null}
        {showContent ? (
          <>
          <div
            className={`${styles.stepBody} ${playEnter ? styles.stepBodyEnter : styles.stepBodyIdle}`}
          >
            <article className={styles.card} aria-labelledby="skader-title">
              <header className={styles.cardHeader}>
                <h1 id="skader-title" className={styles.cardTitle}>
                  Er det noen skader?
                </h1>
                <p className={styles.subMeta}>
                  Klikk på rutene på bildet der det er skader, hvis det er noen.
                </p>
              </header>

              <div
                className={styles.carMap}
                role="group"
                aria-labelledby="skader-title"
              >
                <Image
                  src="/bilder/selgbilen/car.svg"
                  alt=""
                  width={299}
                  height={155}
                  className={styles.carMapImg}
                  priority
                />
                <div className={styles.carMapOverlay}>
                  {ZONES.map((z) => (
                    <button
                      key={z.id}
                      type="button"
                      className={`${styles.zoneBtn} ${z.className} ${zones[z.id] ? styles.zoneBtnSelected : ""}`}
                      aria-pressed={zones[z.id]}
                      aria-label={z.label}
                      onClick={() => toggleZone(z.id)}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.damageCommentBlock}>
                <label
                  className={styles.damageCommentLabel}
                  htmlFor={damageCommentId}
                >
                  Merknad og opplysninger
                </label>
                <p className={styles.damageCommentLead} id={`${damageCommentId}-hint`}>
                  Beskriv gjerne skadene hvis du har markert dem på kartet. Det
                  trenger ikke bare å gjelde synlige karosseriskader. Nevn også
                  tidligere reparasjoner, varsellamper og andre feil du vet om.
                </p>
                <textarea
                  id={damageCommentId}
                  className={styles.damageCommentInput}
                  name="damageComment"
                  rows={4}
                  value={damageComment}
                  onChange={(e) => {
                    updateDamageComment(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="F.eks. «Ingen skader», beskriv merker på kartet, eller annet som feiler …"
                  aria-describedby={`${damageCommentId}-hint`}
                />
              </div>

              {formError ? (
                <p
                  ref={formErrorRef}
                  className={styles.formError}
                  data-form-error-anchor
                  role="alert"
                >
                  {formError}
                </p>
              ) : null}
            </article>
          </div>
          <SellMobileCtaDock className={styles.ctaRow}>
            <Link
              href={`${basePath}/steg-2b`}
              className={`${styles.backLink} sellFlowBackLink`}
            >
              Tilbake
            </Link>
            <button type="button" className={styles.cta} onClick={goNext}>
              Gå videre
            </button>
          </SellMobileCtaDock>
          </>
        ) : null}
      </div>
    </div>
  );
}

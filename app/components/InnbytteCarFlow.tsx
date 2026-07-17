"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  clearInnbytteFlowLastPath,
  isResumableInnbyttePath,
  readInnbytteFlowLastPath,
} from "@/app/lib/innbytteFlowResume";
import {
  clearInnbytteHeroDraft,
  persistInnbytteHeroDraft,
  readInnbytteHeroDraft,
} from "@/app/lib/innbytteHeroDraft";
import { readJsonResponseBody } from "@/app/lib/readJsonResponseBody";
import { clearSellDekkDraft } from "@/app/lib/sellDekkStorage";
import { clearSellSteg3Draft } from "@/app/lib/sellSteg3Storage";
import { clearSellSkadeSessionStorage } from "@/app/lib/sellSkadeStorage";
import { useScrollIntoViewWhen } from "@/app/lib/useScrollIntoViewWhen";
import { SellEnkeltOgTrygt } from "./SellEnkeltOgTrygt";
import { SellHowItWorks } from "./SellHowItWorks";
import { useSellFlowRoute } from "./SellFlowRouteContext";
import { useSellSelgFooterBridge } from "./SellSelgFooterBridge";
import styles from "./SellCarFlow.module.css";

type SessionData = {
  carModel: string;
  firstRegistrationYear: number | null;
  kjennemerke: string;
  kilometerstand: string;
};

export function InnbytteCarHero() {
  const router = useRouter();
  const { basePath, intakePostUrl, intakeSessionUrl } = useSellFlowRoute();
  const { setShowFooterOnSelgRoot } = useSellSelgFooterBridge();
  const [regnr, setRegnr] = useState("");
  const [kilometer, setKilometer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const formErrorRef = useRef<HTMLParagraphElement>(null);
  useScrollIntoViewWhen(formError, formErrorRef);

  useLayoutEffect(() => {
    const draft = readInnbytteHeroDraft();
    if (!draft) return;
    setRegnr((r) => (r.trim() ? r : draft.regnr));
    setKilometer((k) => (k.trim() ? k : draft.kilometer));
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(intakeSessionUrl, {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) {
          if (!cancelled) {
            const draft = readInnbytteHeroDraft();
            if (draft) {
              setRegnr((r) => (r.trim() ? r : draft.regnr));
              setKilometer((k) => (k.trim() ? k : draft.kilometer));
            }
          }
          return;
        }
        const json = await readJsonResponseBody<SessionData & { error?: string }>(
          res,
        );
        if (cancelled) return;
        const last = readInnbytteFlowLastPath();
        if (last && isResumableInnbyttePath(last)) {
          router.replace(last);
          return;
        }
        setRegnr(json.kjennemerke.replace(/\s/g, ""));
        setKilometer(String(json.kilometerstand).replace(/\s/g, ""));
      } catch {
        if (!cancelled) {
          const draft = readInnbytteHeroDraft();
          if (draft) {
            setRegnr((r) => (r.trim() ? r : draft.regnr));
            setKilometer((k) => (k.trim() ? k : draft.kilometer));
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, intakeSessionUrl]);

  useEffect(() => {
    persistInnbytteHeroDraft({ regnr, kilometer });
  }, [regnr, kilometer]);

  useEffect(() => {
    setShowFooterOnSelgRoot(true);
    return () => setShowFooterOnSelgRoot(true);
  }, [setShowFooterOnSelgRoot]);

  function goToDisclosure() {
    const path = `${basePath}/steg-2a`;
    const go = () => router.push(path);
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    if (typeof doc.startViewTransition === "function") {
      doc.startViewTransition(go);
    } else {
      go();
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const reg = regnr.trim();
    const km = kilometer.trim();
    if (!reg || !km) {
      setFormError("Fyll inn bilens regnr. og kilometerstand.");
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch(intakePostUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regnr: reg, kilometer: km }),
        credentials: "include",
      });
      const json = await readJsonResponseBody<{ error?: string }>(res);
      if (!res.ok) {
        throw new Error(
          typeof json.error === "string" && json.error.trim()
            ? json.error
            : "Kunne ikke hente kjøretøydata.",
        );
      }
      clearSellSkadeSessionStorage();
      clearSellDekkDraft();
      clearSellSteg3Draft();
      clearInnbytteFlowLastPath();
      clearInnbytteHeroDraft();
      goToDisclosure();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.hero} aria-label="Fortsett med innbytte">
      <div className={styles.heroInner}>
        <h1 className={styles.heroTitle}>
          Vil du bruke bilen din som innbytte?
        </h1>
        <p className={styles.heroLead}>
          Da kan du starte med å fylle ut registreringsnummer og kilometerstand på
          bilen.
        </p>

        <form className={styles.formBlock} noValidate onSubmit={handleSubmit}>
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
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <input
                className={`${styles.input} ${styles.inputReg}`}
                type="text"
                name="regnr"
                placeholder="Bilens regnr."
                autoComplete="off"
                inputMode="text"
                value={regnr}
                onChange={(ev) => setRegnr(ev.target.value)}
              />
              <span className={styles.plateIcon} aria-hidden>
                <Image
                  src="/bilder/selgbilen/n.svg"
                  alt=""
                  width={15}
                  height={31}
                />
              </span>
            </div>
            <div className={styles.field}>
              <input
                className={`${styles.input} ${styles.inputKm}`}
                type="text"
                name="kilometer"
                placeholder="Kilometerstand"
                autoComplete="off"
                inputMode="numeric"
                value={kilometer}
                onChange={(ev) => setKilometer(ev.target.value)}
              />
              <span className={styles.kmSuffix}>KM</span>
            </div>
          </div>
          <button
            type="submit"
            className={styles.primaryCta}
            disabled={submitting}
          >
            {submitting ? "Henter data…" : "Fortsett"}
          </button>
        </form>
      </div>

      <div className={styles.howItWorksBelowReg}>
        <SellHowItWorks variant="innbytte" />
      </div>
      <div className={styles.faqBelowSellSteps}>
        <SellEnkeltOgTrygt scope="innbytteHero" />
      </div>
    </section>
  );
}

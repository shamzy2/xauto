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
  clearSellHeroDraft,
  persistSellHeroDraft,
  readSellHeroDraft,
} from "@/app/lib/sellHeroDraft";
import { clearSellDekkDraft } from "@/app/lib/sellDekkStorage";
import {
  clearSellFlowLastPath,
  isResumableSellPath,
  readSellFlowLastPath,
} from "@/app/lib/sellFlowResume";
import { clearSellSteg3Draft } from "@/app/lib/sellSteg3Storage";
import { readJsonResponseBody } from "@/app/lib/readJsonResponseBody";
import { useScrollIntoViewWhen } from "@/app/lib/useScrollIntoViewWhen";
import { clearSellSkadeSessionStorage } from "@/app/lib/sellSkadeStorage";
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

export function SellCarHero() {
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
    const draft = readSellHeroDraft();
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
            const draft = readSellHeroDraft();
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
        const last = readSellFlowLastPath();
        if (last && isResumableSellPath(last)) {
          router.replace(last);
          return;
        }
        setRegnr(json.kjennemerke.replace(/\s/g, ""));
        setKilometer(String(json.kilometerstand).replace(/\s/g, ""));
      } catch {
        if (!cancelled) {
          const draft = readSellHeroDraft();
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
    persistSellHeroDraft({ regnr, kilometer });
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
      clearSellFlowLastPath();
      clearSellHeroDraft();
      goToDisclosure();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.hero} aria-label="Fortsett med salg">
      <div className={styles.heroInner}>
        <h1 className={styles.heroTitle}>
          Du er på rett sted! Vi kjøper
          <br />
          alle type biler.
        </h1>
        <p className={styles.heroLead}>
          Du mottar et uforpliktende tilbud om bilen fra oss innen 24 timer
          etter vi har mottatt og vurdert informasjonen du har sendt.
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
        <SellHowItWorks />
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { clearInnbytteFlowLastPath } from "@/app/lib/innbytteFlowResume";
import { clearInnbytteHeroDraft } from "@/app/lib/innbytteHeroDraft";
import { readJsonResponseBody } from "@/app/lib/readJsonResponseBody";
import { clearSellDekkDraft } from "@/app/lib/sellDekkStorage";
import { clearSellSteg3Draft } from "@/app/lib/sellSteg3Storage";
import { clearSellSkadeSessionStorage } from "@/app/lib/sellSkadeStorage";

import styles from "./VareBilerHero.module.css";

const INNBYTTE_INTAKE_POST = "/api/innbytte/intake";
const INNBYTTE_INTAKE_SESSION = "/api/innbytte/intake/session";

export function VareBilerHero() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [regnr, setRegnr] = useState("");
  const [kilometer, setKilometer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setRegnr(searchParams.get("reg") ?? "");
    setKilometer(searchParams.get("km") ?? "");
  }, [searchParams.toString()]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const reg = regnr.trim();
    const km = kilometer.trim();
    if (!reg || !km) {
      setFormError("Fyll inn registreringsnummer og kilometerstand.");
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch(INNBYTTE_INTAKE_POST, {
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

      const sessionRes = await fetch(INNBYTTE_INTAKE_SESSION, {
        cache: "no-store",
        credentials: "include",
      });
      const sessionJson = await readJsonResponseBody<
        { error?: string } & Record<string, unknown>
      >(sessionRes);
      if (!sessionRes.ok) {
        throw new Error(
          typeof sessionJson.error === "string" && sessionJson.error.trim()
            ? sessionJson.error
            : "Kunne ikke hente kjøretøydata.",
        );
      }

      clearInnbytteHeroDraft();
      router.push("/innbytte");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.root} aria-labelledby="vare-biler-cta-heading">
      <div className={styles.card}>
        <div className={styles.inner}>
          <div className={styles.copy}>
            <h1 id="vare-biler-cta-heading" className={styles.title}>
              Vil du bruke bilen din som innbytte?
            </h1>
            <p className={styles.lead}>
              Da kan du starte med å fylle ut registreringsnummer og kilometerstand på
              bilen.
            </p>
          </div>

          <form className={styles.controls} onSubmit={onSubmit} noValidate>
            {formError ? (
              <p className={styles.formError} role="alert">
                {formError}
              </p>
            ) : null}
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <input
                  className={`${styles.input} ${styles.inputReg}`}
                  type="text"
                  name="regnr"
                  placeholder="AB 12345"
                  autoComplete="off"
                  inputMode="text"
                  value={regnr}
                  disabled={submitting}
                  onChange={(ev) => setRegnr(ev.target.value)}
                  aria-label="Registreringsnummer"
                />
                <span className={styles.plateIcon} aria-hidden>
                  <Image src="/bilder/selgbilen/n.svg" alt="" width={15} height={31} />
                </span>
              </div>

              <div className={styles.field}>
                <input
                  className={`${styles.input} ${styles.inputKm}`}
                  type="text"
                  name="kilometer"
                  placeholder="100 000"
                  autoComplete="off"
                  inputMode="numeric"
                  value={kilometer}
                  disabled={submitting}
                  onChange={(ev) => setKilometer(ev.target.value)}
                  aria-label="Kilometerstand"
                />
                <span className={styles.kmSuffix} aria-hidden>
                  KM
                </span>
              </div>
            </div>

            <button type="submit" className={styles.submit} disabled={submitting}>
              {submitting ? "Henter data…" : "Fortsett"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

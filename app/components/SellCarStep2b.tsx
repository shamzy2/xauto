"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { readJsonResponseBody } from "@/app/lib/readJsonResponseBody";
import {
  persistSellDekkDraft,
  readSellDekkDraft,
  type SellDekkTreadValue,
} from "@/app/lib/sellDekkStorage";
import { useScrollIntoViewWhen } from "@/app/lib/useScrollIntoViewWhen";
import {
  SELL_FLOW_STEPS,
  SELL_FLOW_WIZARD_STEP_COUNT,
} from "@/lib/sellFlowSteps";
import { SellFlowPageShell } from "./SellFlowPageShell";
import { SellFlowWizardChrome } from "./SellFlowWizardChrome";
import { useSellFlowRoute } from "./SellFlowRouteContext";
import flow from "./sellFlowShared.module.css";

const TREAD_OPTIONS = [
  { value: "good", label: "Bra mønster" },
  { value: "poor", label: "Dårlig mønster/bør byttes" },
] as const;

type TreadValue = SellDekkTreadValue;

export function SellCarStep2b() {
  const router = useRouter();
  const { basePath, intakeSessionUrl } = useSellFlowRoute();
  const formId = useId();
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [summerTread, setSummerTread] = useState<TreadValue>("");
  const [winterTread, setWinterTread] = useState<TreadValue>("");
  const [formError, setFormError] = useState<string | null>(null);
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

  useEffect(() => {
    if (fetchError) return;
    const draft = readSellDekkDraft();
    if (!draft) return;
    if (draft.summer) setSummerTread(draft.summer);
    if (draft.winter) setWinterTread(draft.winter);
  }, [fetchError]);

  function validateAndContinue() {
    if (!summerTread) {
      setFormError("Velg tilstand på sommerdekk.");
      return;
    }
    if (!winterTread) {
      setFormError("Velg tilstand på vinterdekk.");
      return;
    }
    setFormError(null);
    persistSellDekkDraft({ summer: summerTread, winter: winterTread });
    router.push(`${basePath}/steg-3`);
  }

  const stepMeta = SELL_FLOW_STEPS[1]!;

  return (
    <SellFlowPageShell>
      {fetchError ? (
        <p ref={fetchErrorRef} className={flow.errorCard} data-form-error-anchor>
          {fetchError}
        </p>
      ) : null}
      {!fetchError ? (
        <SellFlowWizardChrome
          stepIndex={1}
          stepCount={SELL_FLOW_WIZARD_STEP_COUNT}
          title={stepMeta.title}
          lead={stepMeta.lead}
        >
          <div className={flow.flowSection}>
            <section
              className={flow.fieldPanel}
              role="group"
              aria-labelledby={`${formId}-summer-h`}
            >
              <p className={flow.panelTitle} id={`${formId}-summer-h`}>
                Tilstand på sommerdekk
              </p>
              <div className={flow.radioStack}>
                {TREAD_OPTIONS.map((opt) => (
                  <label
                    key={`summer-${opt.value}`}
                    className={flow.radioOption}
                  >
                    <input
                      className={flow.radioInput}
                      type="radio"
                      name={`${formId}-summer`}
                      value={opt.value}
                      checked={summerTread === opt.value}
                      onChange={() => {
                        const next = opt.value;
                        setSummerTread(next);
                        persistSellDekkDraft({
                          summer: next,
                          winter: winterTread,
                        });
                      }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </section>

            <section
              className={flow.fieldPanel}
              role="group"
              aria-labelledby={`${formId}-winter-h`}
            >
              <p className={flow.panelTitle} id={`${formId}-winter-h`}>
                Tilstand på vinterdekk
              </p>
              <div className={flow.radioStack}>
                {TREAD_OPTIONS.map((opt) => (
                  <label
                    key={`winter-${opt.value}`}
                    className={flow.radioOption}
                  >
                    <input
                      className={flow.radioInput}
                      type="radio"
                      name={`${formId}-winter`}
                      value={opt.value}
                      checked={winterTread === opt.value}
                      onChange={() => {
                        const next = opt.value;
                        setWinterTread(next);
                        persistSellDekkDraft({
                          summer: summerTread,
                          winter: next,
                        });
                      }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </section>

            {formError ? (
              <p
                ref={formErrorRef}
                className={flow.formError}
                data-form-error-anchor
                role="alert"
              >
                {formError}
              </p>
            ) : null}
          </div>

          <div className={flow.flowNav}>
            <Link href={`${basePath}/steg-2a`} className={flow.flowBtnGhost}>
              Tilbake
            </Link>
            <button
              type="button"
              className={flow.flowBtnPrimary}
              onClick={validateAndContinue}
            >
              Neste →
            </button>
          </div>
        </SellFlowWizardChrome>
      ) : null}
    </SellFlowPageShell>
  );
}

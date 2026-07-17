"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  persistSellSteg3Draft,
  readSellSteg3Draft,
} from "@/app/lib/sellSteg3Storage";
import { useScrollIntoViewWhen } from "@/app/lib/useScrollIntoViewWhen";
import {
  SELL_FLOW_STEPS,
  SELL_FLOW_WIZARD_STEP_COUNT,
} from "@/lib/sellFlowSteps";
import { SellFlowPageShell } from "./SellFlowPageShell";
import { SellFlowWizardChrome } from "./SellFlowWizardChrome";
import { useSellFlowRoute } from "./SellFlowRouteContext";
import flow from "./sellFlowShared.module.css";

const SERVICE_OPTIONS = [
  { value: "full", label: "Komplett servicehistorikk" },
  { value: "partial", label: "Delvis servicehistorikk" },
  { value: "none", label: "Mangler servicehistorikk" },
] as const;

const EQUIPMENT_ITEMS = [
  "Navigasjon",
  "Hengerfeste",
  "DAB-radio",
  "Bluetooth",
  "Ryggekamera",
  "360-kamera",
  "Parkeringssensor",
  "Webasto/parkeringsvarmer",
  "Adaptive Cruise Control ACC",
  "Skinnseter",
  "Delskinn",
  "Stoffseter",
  "Panorama/soltak",
  "Oppvarmet ratt",
  "Oppvarmede forseter",
  "Oppvarmede bakseter",
  "Keyless GO",
] as const;

function CalendarIcon() {
  return (
    <svg
      className={flow.dateIcon}
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V8.5c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.695 13.7h.01M15.695 16.7h.01M11.995 13.7h.01M11.995 16.7h.01M8.294 13.7h.01M8.294 16.7h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SellCarStep3() {
  const router = useRouter();
  const { basePath } = useSellFlowRoute();
  const formId = useId();
  const hydrationDoneRef = useRef(false);
  const [part, setPart] = useState<1 | 2>(1);
  const [serviceHistory, setServiceHistory] = useState<string>("");
  const [lastServiceDate, setLastServiceDate] = useState("");
  const [equipment, setEquipment] = useState<Record<string, boolean>>({});
  const [extraEquipmentOpen, setExtraEquipmentOpen] = useState(false);
  const [extraEquipmentNote, setExtraEquipmentNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const formErrorRef = useRef<HTMLParagraphElement>(null);
  useScrollIntoViewWhen(formError, formErrorRef);
  const [allowFinishSubmit, setAllowFinishSubmit] = useState(false);

  useLayoutEffect(() => {
    const d = readSellSteg3Draft();
    if (d) {
      if (d.serviceHistory) setServiceHistory(d.serviceHistory);
      setLastServiceDate(d.lastServiceDate);
      const nextEq: Record<string, boolean> = {};
      for (const item of EQUIPMENT_ITEMS) {
        nextEq[item] = d.equipmentTrueKeys.includes(item);
      }
      setEquipment(nextEq);
      setExtraEquipmentOpen(d.extraEquipmentOpen);
      setExtraEquipmentNote(d.extraEquipmentNote);
      setPart(d.part);
    }
    hydrationDoneRef.current = true;
  }, []);

  const equipmentSig = EQUIPMENT_ITEMS.map((item) =>
    equipment[item] ? "1" : "0",
  ).join("");

  useEffect(() => {
    if (!hydrationDoneRef.current) return;
    persistSellSteg3Draft({
      part,
      serviceHistory,
      lastServiceDate,
      equipmentTrueKeys: EQUIPMENT_ITEMS.filter((item) => equipment[item]),
      extraEquipmentOpen,
      extraEquipmentNote,
    });
  }, [
    part,
    serviceHistory,
    lastServiceDate,
    equipmentSig,
    extraEquipmentOpen,
    extraEquipmentNote,
  ]);

  useEffect(() => {
    if (part !== 2) {
      setAllowFinishSubmit(false);
      return;
    }
    setAllowFinishSubmit(false);
    const t = window.setTimeout(() => setAllowFinishSubmit(true), 400);
    return () => clearTimeout(t);
  }, [part]);

  const extraEquipmentPanelId = `${formId}-mer-utstyr-panel`;
  const merUtstyrPanelRef = useRef<HTMLDivElement>(null);
  const prevMerUtstyrOpenRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (part !== 2) {
      prevMerUtstyrOpenRef.current = null;
      return;
    }
    const was = prevMerUtstyrOpenRef.current;
    prevMerUtstyrOpenRef.current = extraEquipmentOpen;
    if (was === null) return;
    if (!extraEquipmentOpen || was === true) return;

    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scrollPanel = () => {
      const el = merUtstyrPanelRef.current;
      if (!el) return;
      el.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "nearest",
        inline: "nearest",
      });
    };

    const delayMs = reduced ? 0 : 80;
    const t = window.setTimeout(scrollPanel, delayMs);
    return () => window.clearTimeout(t);
  }, [extraEquipmentOpen, part]);

  function toggleEquipment(key: string) {
    setEquipment((prev) => ({ ...prev, [key]: !prev[key] }));
    if (formError) setFormError(null);
  }

  function goNextPart() {
    if (!serviceHistory) {
      setFormError("Velg et alternativ for servicehistorikk.");
      return;
    }
    if (!lastServiceDate.trim()) {
      setFormError("Velg dato for når siste service ble utført.");
      return;
    }
    setFormError(null);
    setPart(2);
  }

  function goFinish() {
    if (!allowFinishSubmit) return;
    const harValgtUtstyr = EQUIPMENT_ITEMS.some((item) => equipment[item]);
    const merUtstyrBesvart = extraEquipmentNote.trim().length >= 3;
    if (!harValgtUtstyr && !merUtstyrBesvart) {
      setFormError(
        "Kryss av for utstyr som gjelder bilen din, eller trykk «Mer utstyr?» og skriv kort hva som gjelder, for eksempel annet utstyr, eller at bilen ikke har noe av det som står over.",
      );
      return;
    }
    setFormError(null);
    router.push(`${basePath}/steg-4`);
  }

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <SellFlowPageShell>
      <SellFlowWizardChrome
        stepIndex={2}
        stepCount={SELL_FLOW_WIZARD_STEP_COUNT}
        title={SELL_FLOW_STEPS[2]!.title}
        lead={SELL_FLOW_STEPS[2]!.lead}
        focusKey={`part-${part}`}
      >
        <form
          id={formId}
          className={flow.flowSection}
          onSubmit={handleFormSubmit}
          noValidate
        >
          {part === 1 ? (
            <div className={flow.fieldPanel}>
              <p className={flow.panelTitle}>Servicehistorikk</p>
              <p className={flow.panelLead}>
                Hvor komplett er servicehistorikken på bilen?
              </p>
              <div className={flow.radioStack}>
                {SERVICE_OPTIONS.map((opt) => (
                  <label key={opt.value} className={flow.radioOption}>
                    <input
                      className={flow.radioInput}
                      type="radio"
                      name="serviceHistory"
                      value={opt.value}
                      checked={serviceHistory === opt.value}
                      onChange={() => {
                        setServiceHistory(opt.value);
                        if (formError) setFormError(null);
                      }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              <label className={flow.fieldLabel} htmlFor={`${formId}-service-date`}>
                Når er siste service utført?
              </label>
              <div className={flow.dateRow}>
                <CalendarIcon />
                <input
                  id={`${formId}-service-date`}
                  className={flow.textInput}
                  type="date"
                  name="lastServiceDate"
                  value={lastServiceDate}
                  onChange={(ev) => {
                    setLastServiceDate(ev.target.value);
                    if (formError) setFormError(null);
                  }}
                  lang="nb-NO"
                />
              </div>
              <p className={flow.dateHint}>
                dd.mm.åååå, vennligst velg dato
              </p>
            </div>
          ) : (
            <div className={flow.fieldPanel}>
              <p className={flow.panelTitle}>Utstyrsnivå på bilen</p>
              <p className={flow.panelLead}>
                Kryss av for utstyr som gjelder bilen din.
              </p>
              <div className={flow.checkGrid}>
                {EQUIPMENT_ITEMS.map((item) => (
                  <label key={item} className={flow.checkOption}>
                    <input
                      className={flow.checkInput}
                      type="checkbox"
                      name={`eq-${item}`}
                      checked={Boolean(equipment[item])}
                      onChange={() => toggleEquipment(item)}
                    />
                    {item}
                  </label>
                ))}
              </div>

              <button
                type="button"
                className={flow.expandBtn}
                aria-expanded={extraEquipmentOpen}
                aria-controls={extraEquipmentPanelId}
                onClick={() => {
                  setExtraEquipmentOpen((o) => !o);
                  if (formError) setFormError(null);
                }}
              >
                Mer utstyr?
              </button>
              {extraEquipmentOpen ? (
                <div
                  ref={merUtstyrPanelRef}
                  id={extraEquipmentPanelId}
                  className={flow.expandPanel}
                  data-form-error-anchor
                >
                  <label
                    className={flow.fieldLabel}
                    htmlFor={`${formId}-extra-utstyr`}
                  >
                    Beskriv her
                  </label>
                  <textarea
                    id={`${formId}-extra-utstyr`}
                    className={flow.textarea}
                    name="extraEquipment"
                    rows={4}
                    value={extraEquipmentNote}
                    onChange={(e) => {
                      setExtraEquipmentNote(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="F.eks. noe som ikke står i utstyrlisten over."
                  />
                </div>
              ) : null}
            </div>
          )}

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
        </form>

        <div className={flow.flowNav}>
          {part === 1 ? (
            <>
              <Link href={`${basePath}/steg-2b`} className={flow.flowBtnGhost}>
                Tilbake
              </Link>
              <button
                type="button"
                className={flow.flowBtnPrimary}
                onClick={goNextPart}
              >
                Neste →
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={flow.flowBtnGhost}
                onClick={() => {
                  setPart(1);
                  setFormError(null);
                }}
              >
                Tilbake
              </button>
              <button
                type="button"
                className={flow.flowBtnPrimary}
                disabled={!allowFinishSubmit}
                aria-disabled={!allowFinishSubmit}
                onClick={goFinish}
              >
                Neste →
              </button>
            </>
          )}
        </div>
      </SellFlowWizardChrome>
    </SellFlowPageShell>
  );
}

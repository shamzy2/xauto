"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type TouchEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { clearInnbytteFlowLastPath } from "@/app/lib/innbytteFlowResume";
import { clearInnbytteHeroDraft } from "@/app/lib/innbytteHeroDraft";
import { readJsonResponseBody } from "@/app/lib/readJsonResponseBody";
import { clearSellDekkDraft, readSellDekkDraft } from "@/app/lib/sellDekkStorage";
import { clearSellFlowLastPath } from "@/app/lib/sellFlowResume";
import { clearSellHeroDraft } from "@/app/lib/sellHeroDraft";
import { readPickupAddress, clearPickupAddress } from "@/app/lib/sellPickupAddressStorage";
import { clearSellSteg3Draft, readSellSteg3Draft } from "@/app/lib/sellSteg3Storage";
import {
  clearSellSkadeSessionStorage,
  readSkadeKartComment,
  readSkadeZonesSnapshot,
} from "@/app/lib/sellSkadeStorage";
import { useScrollIntoViewWhen } from "@/app/lib/useScrollIntoViewWhen";
import {
  SUBMISSION_MAX_PHOTOS_COUNT,
  validateSubmissionPhotoSizes,
} from "@/lib/submissionUploadLimits";
import {
  SELL_FLOW_STEPS,
  SELL_FLOW_WIZARD_STEP_COUNT,
} from "@/lib/sellFlowSteps";
import { SellFlowWizardChrome } from "./SellFlowWizardChrome";
import { SellFlowPageShell } from "./SellFlowPageShell";
import { SellFlowDealerAside } from "./SellFlowDealerAside";
import { useSellFinalize } from "./SellFinalizeContext";
import flowStyles from "./sellFlowShared.module.css";
import { useSellFlowRoute } from "./SellFlowRouteContext";
import { SellMobileCtaDock } from "./SellMobileCtaDock";
import styles from "./SellCarFinalizeSlides.module.css";

function navigateWithTransition(
  router: ReturnType<typeof useRouter>,
  path: string,
) {
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

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 19.5c0-3.5 3.5-6.5 7-6.5s7 3 7 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 6h16v12H4V6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M4 7l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M8.5 3h2l1.5 5.5-2 1.2a11 11 0 005.3 5.3l1.2-2L20 14.5v2c0 1-1 2-2 2h-1C10.4 20 4 13.6 4 5.5 4 4.5 5 3.5 6 3.5h2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloudUploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M7 18a4.5 4.5 0 01-1.9-8.6A6 6 0 0117 9a3.5 3.5 0 012.2 6.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12v9M9 15l3-3 3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SellFinalizePriceSlide() {
  const router = useRouter();
  const formId = useId();
  const { flow, priceHint, setPriceHint } = useSellFinalize();
  const { basePath } = useSellFlowRoute();
  const [formError, setFormError] = useState<string | null>(null);
  const formErrorRef = useRef<HTMLParagraphElement>(null);
  useScrollIntoViewWhen(formError, formErrorRef);

  const priceTitle =
    flow === "innbytte"
      ? "Forventning til innbytteverdi"
      : "Forventning til oppkjøpspris";
  const priceError =
    flow === "innbytte"
      ? "Fyll inn forventet innbytteverdi."
      : "Fyll inn ditt prisforslag.";

  function goNext() {
    if (!priceHint.trim()) {
      setFormError(priceError);
      return;
    }
    setFormError(null);
    navigateWithTransition(router, `${basePath}/steg-4c`);
  }

  return (
    <SellFlowPageShell>
      <SellFlowWizardChrome
        stepIndex={3}
        stepCount={SELL_FLOW_WIZARD_STEP_COUNT}
        title={priceTitle}
        lead="Valgfritt — hva håper du å få for bilen?"
      >
        <div className={flowStyles.fieldPanel}>
          <p className={flowStyles.panelTitle}>Ditt prisforslag</p>
          <p className={flowStyles.panelLead}>
            Husk at det medfører en del kostnader for oss å ta inn biler for
            videresalg, som lagring, klargjøring, annonsering og fotografering.
          </p>
          <label className={flowStyles.fieldLabel} htmlFor={`${formId}-price`}>
            Beløp
          </label>
          <input
            id={`${formId}-price`}
            className={flowStyles.textInput}
            type="text"
            name="priceHint"
            autoComplete="off"
            required
            aria-required
            placeholder="F.eks. 250 000 kr"
            value={priceHint}
            onChange={(ev) => {
              setPriceHint(ev.target.value);
              if (formError) setFormError(null);
            }}
            aria-invalid={formError ? true : undefined}
            aria-describedby={formError ? `${formId}-err` : undefined}
          />
          {formError ? (
            <p
              ref={formErrorRef}
              className={flowStyles.formError}
              data-form-error-anchor
              id={`${formId}-err`}
              role="alert"
            >
              {formError}
            </p>
          ) : null}
        </div>

        <div className={flowStyles.flowNav}>
          <Link href={`${basePath}/steg-3`} className={flowStyles.flowBtnGhost}>
            Tilbake
          </Link>
          <button type="button" className={flowStyles.flowBtnPrimary} onClick={goNext}>
            Neste →
          </button>
        </div>
      </SellFlowWizardChrome>
    </SellFlowPageShell>
  );
}

export function SellFinalizePhotosSlide() {
  const router = useRouter();
  const { basePath } = useSellFlowRoute();
  const formId = useId();
  const fileInputId = `${formId}-files`;
  const previewListId = `${formId}-previews`;
  const lightboxTitleId = `${formId}-lightbox-title`;
  const { photoFiles, setPhotoFilesFromList, removePhotoAt, photoCompressPending } =
    useSellFinalize();
  const [previewItems, setPreviewItems] = useState<
    { url: string; name: string }[]
  >([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const formErrorRef = useRef<HTMLParagraphElement>(null);
  useScrollIntoViewWhen(formError, formErrorRef);

  useEffect(() => {
    const items = photoFiles.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setPreviewItems(items);
    return () => {
      for (const { url } of items) {
        URL.revokeObjectURL(url);
      }
    };
  }, [photoFiles]);

  useEffect(() => {
    setLightboxIndex((i) => {
      if (i === null) return null;
      if (previewItems.length === 0) return null;
      return Math.min(i, previewItems.length - 1);
    });
  }, [previewItems.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setLightboxIndex(null);
        return;
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((i) =>
          i !== null && i > 0 ? i - 1 : i,
        );
        return;
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((i) =>
          i !== null && i < previewItems.length - 1 ? i + 1 : i,
        );
      }
    }
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIndex, previewItems.length]);

  function openLightbox(index: number) {
    setLightboxIndex(index);
  }

  function closeLightbox() {
    setLightboxIndex(null);
  }

  function goLightboxPrev() {
    setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  }

  function goLightboxNext() {
    setLightboxIndex((i) =>
      i !== null && i < previewItems.length - 1 ? i + 1 : i,
    );
  }

  function onLightboxTouchStart(e: TouchEvent) {
    touchStartX.current = e.changedTouches[0].clientX;
  }

  function onLightboxTouchEnd(e: TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 48) return;
    if (dx > 0) goLightboxPrev();
    else goLightboxNext();
  }

  const filesLabel =
    photoFiles.length > 0
      ? photoFiles.map((f) => f.name).join(", ")
      : "Ingen fil valgt";

  const lightboxItem =
    lightboxIndex !== null ? previewItems[lightboxIndex] : null;
  const lightboxCount = previewItems.length;
  const canPrev = lightboxIndex !== null && lightboxIndex > 0;
  const canNext =
    lightboxIndex !== null && lightboxIndex < lightboxCount - 1;

  function goNextFromPhotos() {
    const sizeErr = validateSubmissionPhotoSizes(photoFiles);
    if (sizeErr) {
      setFormError(sizeErr);
      return;
    }
    setFormError(null);
    navigateWithTransition(router, `${basePath}/steg-4c`);
  }

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <article className={styles.card} aria-labelledby={`${formId}-h`}>
          <header className={styles.cardHeader}>
            <h1 className={styles.cardTitle} id={`${formId}-h`}>
              Bilder av bilen (frivillig)
            </h1>
            <p className={styles.subMeta}>
              Bilder er frivillig, men de hjelper oss å gi deg et bedre og mer
              treffsikkert tilbud. Gjerne legg ved noen fra utsiden,
              interiøret og eventuelle detaljer du vil vise frem.{" "}
              Vanlige bilder fra telefon (f.eks. iPhone) skaleres og komprimeres
              automatisk før sending. Opptil {SUBMISSION_MAX_PHOTOS_COUNT}{" "}
              bilder; samlet størrelse etter komprimering er begrenset (ca. 4 MB).
            </p>
          </header>
          <div className={styles.cardBody}>
            <input
              id={fileInputId}
              className={styles.srOnly}
              type="file"
              name="photos"
              accept="image/*"
              multiple
              disabled={photoCompressPending}
              onChange={(ev) => {
                setPhotoFilesFromList(ev.target.files);
                if (formError) setFormError(null);
              }}
            />
            <label className={styles.uploadLabel} htmlFor={fileInputId}>
              <span className={styles.uploadRow}>
                <CloudUploadIcon className={styles.uploadIcon} />
                <span>Last opp</span>
              </span>
              {photoCompressPending ? (
                <p className={styles.compressStatus}>Tilpasser bildene …</p>
              ) : (
                <p className={styles.fileName}>{filesLabel}</p>
              )}
            </label>

            {previewItems.length > 0 ? (
              <ul
                className={styles.previewGrid}
                id={previewListId}
                aria-label="Forhåndsvisning av valgte bilder"
              >
                {previewItems.map((item, index) => (
                  <li key={`${index}-${item.name}`} className={styles.previewItem}>
                    <button
                      type="button"
                      className={styles.previewRemoveBtn}
                      aria-label={`Fjern bilde: ${item.name}`}
                      title={`Fjern: ${item.name}`}
                      onClick={() => {
                        removePhotoAt(index);
                        if (formError) setFormError(null);
                      }}
                    >
                      ×
                    </button>
                    <button
                      type="button"
                      className={styles.previewThumbBtn}
                      onClick={() => openLightbox(index)}
                      title={`Vis stort: ${item.name}`}
                    >
                      <img
                        src={item.url}
                        alt={`Forhåndsvisning: ${item.name}`}
                        className={styles.previewImg}
                        loading="lazy"
                      />
                    </button>
                    <span className={styles.previewName}>{item.name}</span>
                  </li>
                ))}
              </ul>
            ) : null}
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
          </div>
        </article>

        <SellMobileCtaDock className={styles.ctaRow}>
          <Link
            href={`${basePath}/steg-4`}
            className={`${styles.backLink} sellFlowBackLink`}
          >
            Tilbake
          </Link>
          <button type="button" className={styles.cta} onClick={goNextFromPhotos}>
            Gå videre
          </button>
        </SellMobileCtaDock>
      </div>

      {lightboxItem ? (
        <div
          className={styles.lightboxRoot}
          role="dialog"
          aria-modal="true"
          aria-labelledby={lightboxTitleId}
        >
          <button
            type="button"
            className={styles.lightboxBackdrop}
            aria-label="Lukk bildevisning"
            onClick={closeLightbox}
          />
          <div
            className={styles.lightboxPanel}
            onTouchStart={onLightboxTouchStart}
            onTouchEnd={onLightboxTouchEnd}
          >
            <button
              type="button"
              className={styles.lightboxClose}
              aria-label="Lukk"
              onClick={closeLightbox}
            >
              ×
            </button>
            {lightboxCount > 1 ? (
              <>
                <button
                  type="button"
                  className={`${styles.lightboxNav} ${styles.lightboxNavPrev}`}
                  aria-label="Forrige bilde"
                  disabled={!canPrev}
                  onClick={goLightboxPrev}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className={`${styles.lightboxNav} ${styles.lightboxNavNext}`}
                  aria-label="Neste bilde"
                  disabled={!canNext}
                  onClick={goLightboxNext}
                >
                  ›
                </button>
              </>
            ) : null}
            <div className={styles.lightboxStage}>
              <img
                src={lightboxItem.url}
                alt={lightboxItem.name}
                className={styles.lightboxImg}
                draggable={false}
              />
            </div>
            <p className={styles.lightboxCaption} id={lightboxTitleId}>
              <span className={styles.lightboxFileName}>
                {lightboxItem.name}
              </span>
              {lightboxCount > 1 && lightboxIndex !== null ? (
                <span className={styles.lightboxCounter}>
                  {lightboxIndex + 1} av {lightboxCount}
                </span>
              ) : null}
            </p>
            {lightboxCount > 1 ? (
              <p className={styles.lightboxSwipeHint} aria-hidden>
                Sveip eller bruk piltastene for å bla
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const ADDITIONAL_NOTE_MIN_LEN = 3;

export function SellFinalizeAdditionalSlide() {
  const router = useRouter();
  const formId = useId();
  const { basePath } = useSellFlowRoute();
  const {
    additionalComment,
    setAdditionalComment,
    wantsAdditionalNote,
    setWantsAdditionalNote,
  } = useSellFinalize();
  const [formError, setFormError] = useState<string | null>(null);
  const formErrorRef = useRef<HTMLParagraphElement>(null);
  useScrollIntoViewWhen(formError, formErrorRef);

  function goNext() {
    if (
      wantsAdditionalNote &&
      additionalComment.trim().length < ADDITIONAL_NOTE_MIN_LEN
    ) {
      setFormError(
        "Du har huket av for merknad. Skriv noe i feltet, eller fjern avkrysningen for å gå videre uten merknad.",
      );
      return;
    }
    setFormError(null);
    navigateWithTransition(router, `${basePath}/steg-4d`);
  }

  return (
    <SellFlowPageShell>
      <SellFlowWizardChrome
        stepIndex={3}
        stepCount={SELL_FLOW_WIZARD_STEP_COUNT}
        title="Noe annet du vil legge til?"
        lead="Valgfritt steg — huk av bare hvis du vil legge ved en merknad."
      >
        <div className={flowStyles.flowSection}>
          <div className={flowStyles.fieldPanel}>
            <label className={flowStyles.optionalChkLabel}>
              <input
                type="checkbox"
                className={flowStyles.optionalChk}
                checked={wantsAdditionalNote}
                onChange={(e) => {
                  const on = e.target.checked;
                  setWantsAdditionalNote(on);
                  if (!on) setAdditionalComment("");
                  if (formError) setFormError(null);
                }}
              />
              Jeg vil legge til en merknad
            </label>
            {wantsAdditionalNote ? (
              <>
                <label
                  className={flowStyles.fieldLabel}
                  htmlFor={`${formId}-additional`}
                >
                  Din merknad
                </label>
                <textarea
                  id={`${formId}-additional`}
                  className={flowStyles.textarea}
                  name="additionalComment"
                  rows={5}
                  value={additionalComment}
                  onChange={(e) => {
                    setAdditionalComment(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="Skriv her hvis du har spørsmål, tilleggsopplysninger eller annet vi bør vite."
                  aria-invalid={formError ? true : undefined}
                  aria-describedby={
                    formError ? `${formId}-additional-err` : undefined
                  }
                />
              </>
            ) : null}
          </div>

          {formError ? (
            <p
              ref={formErrorRef}
              className={flowStyles.formError}
              data-form-error-anchor
              id={`${formId}-additional-err`}
              role="alert"
            >
              {formError}
            </p>
          ) : null}
        </div>

        <div className={flowStyles.flowNav}>
          <Link href={`${basePath}/steg-4`} className={flowStyles.flowBtnGhost}>
            Tilbake
          </Link>
          <button
            type="button"
            className={flowStyles.flowBtnPrimary}
            onClick={goNext}
          >
            Neste →
          </button>
        </div>
      </SellFlowWizardChrome>
    </SellFlowPageShell>
  );
}

export function SellFinalizeContactSlide() {
  const router = useRouter();
  const formId = useId();
  const { basePath, intakeSessionUrl } = useSellFlowRoute();
  const {
    flow,
    fullName,
    setFullName,
    email,
    setEmail,
    phone,
    setPhone,
    priceHint,
    additionalComment,
    wantsAdditionalNote,
    finnListing,
    setFinnListing,
    photoFiles,
    reset,
  } = useSellFinalize();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const formErrorRef = useRef<HTMLParagraphElement>(null);
  useScrollIntoViewWhen(formError, formErrorRef);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = fullName.trim();
    const mail = email.trim();
    const tel = phone.trim();
    if (!name) {
      setFormError("Fyll inn fullt navn.");
      return;
    }
    if (!mail) {
      setFormError("Fyll inn e-postadresse.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setFormError("Oppgi en gyldig e-postadresse.");
      return;
    }
    if (!tel) {
      setFormError("Fyll inn mobilnummer.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const finnListingUrl =
        flow === "innbytte" ? finnListing.trim() : "";
      if (flow === "innbytte" && !finnListingUrl) {
        setFormError(
          "Skriv FINN-kode eller lenke til annonsen for bilen du vil innbytte med hos oss.",
        );
        setSubmitting(false);
        return;
      }

      const photoSizeErr = validateSubmissionPhotoSizes(photoFiles);
      if (photoSizeErr) {
        setFormError(photoSizeErr);
        setSubmitting(false);
        return;
      }

      let intakeSummary:
        | {
            kjennemerke?: string;
            kilometerstand?: string;
            carModel?: string;
            firstRegistrationYear?: number | null;
          }
        | undefined;

      const sessionRes = await fetch(intakeSessionUrl, {
        cache: "no-store",
        credentials: "include",
      });
      if (sessionRes.ok) {
        const j = await readJsonResponseBody<{
          kjennemerke?: string;
          kilometerstand?: string;
          carModel?: string;
          firstRegistrationYear?: number | null;
        }>(sessionRes);
        intakeSummary = {
          kjennemerke: j.kjennemerke,
          kilometerstand: j.kilometerstand,
          carModel: j.carModel,
          firstRegistrationYear: j.firstRegistrationYear ?? null,
        };
      }

      const pickupAddress = readPickupAddress(flow);
      const steg3Draft = readSellSteg3Draft();
      const payload = {
        priceHint: priceHint.trim(),
        additionalComment: additionalComment.trim(),
        wantsAdditionalNote,
        dekk: readSellDekkDraft(),
        skadeZones: readSkadeZonesSnapshot(),
        skadeComment: readSkadeKartComment(),
        steg3: { ...steg3Draft, pickupAddress },
        intakeSummary,
      };

      const fd = new FormData();
      fd.set("payload", JSON.stringify(payload));
      fd.set("fullName", name);
      fd.set("email", mail);
      fd.set("phone", tel);
      if (flow === "innbytte") {
        fd.set("finnListingUrl", finnListingUrl);
      }
      photoFiles.forEach((file, i) => {
        fd.append(`photo_${i}`, file);
      });

      const endpoint =
        flow === "innbytte"
          ? "/api/innbytte/submissions"
          : "/api/sell/submissions";

      const res = await fetch(endpoint, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const json = await readJsonResponseBody<{
        error?: string;
        hint?: string;
      }>(res);
      if (!res.ok) {
        const base = json.error ?? "Kunne ikke sende skjema.";
        throw new Error(json.hint ? `${base} ${json.hint}` : base);
      }

      clearSellSteg3Draft();
      clearPickupAddress(flow);
      clearSellDekkDraft();
      clearSellSkadeSessionStorage();
      if (flow === "innbytte") {
        clearInnbytteHeroDraft();
        clearInnbytteFlowLastPath();
      } else {
        clearSellHeroDraft();
        clearSellFlowLastPath();
      }
      reset();
      navigateWithTransition(router, `${basePath}/takk`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Noe gikk galt.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SellFlowPageShell>
      <SellFlowWizardChrome
        stepIndex={3}
        stepCount={SELL_FLOW_WIZARD_STEP_COUNT}
        title={SELL_FLOW_STEPS[3]!.title}
        lead={SELL_FLOW_STEPS[3]!.lead}
      >
        <div className={flowStyles.flowSection}>
          <form
            className={flowStyles.flowSection}
            id={`${formId}-form`}
            onSubmit={handleSubmit}
            noValidate
          >
            {flow === "innbytte" ? (
              <div className={flowStyles.fieldPanel}>
                <p className={flowStyles.panelTitle}>
                  Hvilken bil vil du innbytte med hos oss?
                </p>
                <p className={flowStyles.panelLead}>
                  Lim inn lenke til annonsen, eller skriv FINN-kode.
                </p>
                <label
                  className={flowStyles.fieldLabel}
                  htmlFor={`${formId}-finn`}
                >
                  FINN-kode / lenke{" "}
                  <span aria-hidden style={{ color: "var(--accent)" }}>
                    *
                  </span>
                </label>
                <textarea
                  id={`${formId}-finn`}
                  className={flowStyles.textarea}
                  name="finnListing"
                  rows={4}
                  required
                  aria-required
                  placeholder="Lim inn lenke til annonsen, eller skriv FINN-kode"
                  value={finnListing}
                  onChange={(ev) => {
                    setFinnListing(ev.target.value);
                    if (formError) setFormError(null);
                  }}
                  aria-invalid={formError ? true : undefined}
                />
              </div>
            ) : null}

            <div className={flowStyles.fieldPanel}>
              <p className={flowStyles.panelTitle}>Info om deg</p>
              <p className={flowStyles.panelLead}>
                Vi trenger kontaktinfo for å sende deg tilbudet.
              </p>

              <div className={flowStyles.inputWithIcon}>
                <PersonIcon className={flowStyles.fieldIcon} />
                <label className={flowStyles.srOnly} htmlFor={`${formId}-name`}>
                  Fullt navn
                </label>
                <input
                  id={`${formId}-name`}
                  className={`${flowStyles.textInput} ${flowStyles.textInputPadded}`}
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  placeholder="Fullt navn"
                  value={fullName}
                  onChange={(ev) => setFullName(ev.target.value)}
                />
              </div>

              <div className={flowStyles.inputWithIcon}>
                <EmailIcon className={flowStyles.fieldIcon} />
                <label className={flowStyles.srOnly} htmlFor={`${formId}-email`}>
                  E-postadresse
                </label>
                <input
                  id={`${formId}-email`}
                  className={`${flowStyles.textInput} ${flowStyles.textInputPadded}`}
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="E-postadresse"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                />
              </div>

              <div className={flowStyles.inputWithIcon}>
                <PhoneIcon className={flowStyles.fieldIcon} />
                <label className={flowStyles.srOnly} htmlFor={`${formId}-phone`}>
                  Mobilnummer
                </label>
                <input
                  id={`${formId}-phone`}
                  className={`${flowStyles.textInput} ${flowStyles.textInputPadded}`}
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder="Mobilnummer"
                  value={phone}
                  onChange={(ev) => setPhone(ev.target.value)}
                />
              </div>
            </div>

            {formError ? (
              <p
                ref={formErrorRef}
                className={flowStyles.formError}
                data-form-error-anchor
                role="alert"
              >
                {formError}
              </p>
            ) : null}
          </form>

          <SellFlowDealerAside />
        </div>

        <div className={flowStyles.flowNav}>
          <Link href={`${basePath}/steg-4c`} className={flowStyles.flowBtnGhost}>
            Tilbake
          </Link>
          <button
            type="submit"
            className={flowStyles.flowBtnPrimary}
            form={`${formId}-form`}
            disabled={submitting}
          >
            {submitting ? "Sender…" : "Send inn →"}
          </button>
        </div>
      </SellFlowWizardChrome>
    </SellFlowPageShell>
  );
}

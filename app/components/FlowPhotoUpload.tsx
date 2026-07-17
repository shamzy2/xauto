"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
} from "react";
import {
  SUBMISSION_MAX_PHOTOS_COUNT,
  validateSubmissionPhotoSizes,
} from "@/lib/submissionUploadLimits";
import { useSellFinalize } from "./SellFinalizeContext";
import { ImagePlusIcon } from "./FlowIcons";
import flow from "./sellFlowShared.module.css";
import styles from "./FlowPhotoUpload.module.css";

export function FlowPhotoUpload() {
  const formId = useId();
  const inputId = `${formId}-photos`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { photoFiles, setPhotoFilesFromList, removePhotoAt, photoCompressPending } =
    useSellFinalize();
  const [previewItems, setPreviewItems] = useState<
    { url: string; name: string }[]
  >([]);

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

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const merged = [...photoFiles, ...Array.from(fileList)].slice(
      0,
      SUBMISSION_MAX_PHOTOS_COUNT,
    );
    const sizeErr = validateSubmissionPhotoSizes(merged);
    if (sizeErr) {
      setError(sizeErr);
      return;
    }
    setError(null);
    const dt = new DataTransfer();
    for (const file of merged) dt.items.add(file);
    setPhotoFilesFromList(dt.files);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  return (
    <section className={flow.fieldPanel} aria-labelledby={`${formId}-h`}>
      <p className={flow.panelTitle} id={`${formId}-h`}>
        Legg til bilder av bilen
      </p>
      <p className={flow.panelLead}>
        Utvendig, innvendig og dekk. Valgfritt, men anbefalt.
      </p>

      <div
        className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <span className={styles.uploadIcon} aria-hidden>
          <ImagePlusIcon className={styles.uploadIconSvg} />
        </span>
        <button
          type="button"
          className={styles.uploadBtn}
          disabled={photoCompressPending}
          onClick={() => inputRef.current?.click()}
        >
          Velg bilder
        </button>
        <input
          ref={inputRef}
          id={inputId}
          className={styles.hiddenInput}
          type="file"
          accept="image/*"
          multiple
          disabled={photoCompressPending}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {photoCompressPending ? (
          <p className={styles.compressStatus}>Tilpasser bildene …</p>
        ) : null}
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {previewItems.length > 0 ? (
        <ul className={styles.previewGrid} aria-label="Valgte bilder">
          {previewItems.map((item, index) => (
            <li key={`${index}-${item.name}`} className={styles.previewItem}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.name}
                className={styles.previewImg}
              />
              <button
                type="button"
                className={styles.removeBtn}
                aria-label={`Fjern bilde: ${item.name}`}
                onClick={() => {
                  removePhotoAt(index);
                  setError(null);
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className={styles.meta}>
        {photoFiles.length} av {SUBMISSION_MAX_PHOTOS_COUNT} bilder
      </p>
    </section>
  );
}

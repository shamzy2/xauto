"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SetStateAction,
} from "react";

import {
  clearInnbytteFinalizeDraft,
  persistInnbytteFinalizeDraft,
  readInnbytteFinalizeDraft,
} from "@/app/lib/innbytteFinalizeDraft";
import {
  clearInnbytteFinalizePhotos,
} from "@/app/lib/innbytteFinalizePhotoPersistence";
import {
  clearSellFinalizeDraft,
  persistSellFinalizeDraft,
  readSellFinalizeDraft,
} from "@/app/lib/sellFinalizeDraft";
import {
  clearFinalizePhotos,
} from "@/app/lib/sellFinalizePhotoPersistence";
import { compressImagesForUpload } from "@/app/lib/compressImagesForUpload";

export type SellFinalizeFlow = "sell" | "innbytte";

type SellFinalizeContextValue = {
  flow: SellFinalizeFlow;
  priceHint: string;
  setPriceHint: (v: SetStateAction<string>) => void;
  photoFiles: File[];
  /** True while resizing iPhone-style photos before they appear in the list. */
  photoCompressPending: boolean;
  setPhotoFilesFromList: (files: FileList | null) => void;
  removePhotoAt: (index: number) => void;
  additionalComment: string;
  setAdditionalComment: (v: SetStateAction<string>) => void;
  wantsAdditionalNote: boolean;
  setWantsAdditionalNote: (v: SetStateAction<boolean>) => void;
  /** Kun innbytte — FINN før kontakt. */
  finnListing: string;
  setFinnListing: (v: SetStateAction<string>) => void;
  fullName: string;
  setFullName: (v: SetStateAction<string>) => void;
  email: string;
  setEmail: (v: SetStateAction<string>) => void;
  phone: string;
  setPhone: (v: SetStateAction<string>) => void;
  reset: () => void;
};

const SellFinalizeContext = createContext<SellFinalizeContextValue | null>(
  null,
);

export function SellFinalizeProvider({
  children,
  flow = "sell",
}: {
  children: ReactNode;
  flow?: SellFinalizeFlow;
}) {
  const [priceHint, setPriceHint] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoCompressPending, setPhotoCompressPending] = useState(false);
  const [additionalComment, setAdditionalComment] = useState("");
  const [wantsAdditionalNote, setWantsAdditionalNote] = useState(false);
  const [finnListing, setFinnListing] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const readyForTextPersist = useRef(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useLayoutEffect(() => {
    if (flow === "innbytte") {
      const d = readInnbytteFinalizeDraft();
      if (d) {
        setPriceHint(d.priceHint);
        setAdditionalComment(d.additionalComment);
        setWantsAdditionalNote(d.wantsAdditionalNote);
        setFinnListing(d.finnListing ?? "");
        setFullName(d.fullName);
        setEmail(d.email);
        setPhone(d.phone);
      }
    } else {
      const d = readSellFinalizeDraft();
      if (d) {
        setPriceHint(d.priceHint);
        setAdditionalComment(d.additionalComment);
        setWantsAdditionalNote(d.wantsAdditionalNote);
        setFullName(d.fullName);
        setEmail(d.email);
        setPhone(d.phone);
      }
    }
    readyForTextPersist.current = true;
    setPhotoFiles([]);
    void (flow === "innbytte"
      ? clearInnbytteFinalizePhotos()
      : clearFinalizePhotos());
  }, [flow]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!readyForTextPersist.current) return;
    if (flow === "innbytte") {
      persistInnbytteFinalizeDraft({
        priceHint,
        additionalComment,
        wantsAdditionalNote,
        finnListing,
        fullName,
        email,
        phone,
      });
    } else {
      persistSellFinalizeDraft({
        priceHint,
        additionalComment,
        wantsAdditionalNote,
        fullName,
        email,
        phone,
      });
    }
  }, [
    flow,
    priceHint,
    additionalComment,
    wantsAdditionalNote,
    finnListing,
    fullName,
    email,
    phone,
  ]);

  const setPhotoFilesFromList = useCallback((list: FileList | null) => {
    if (!list?.length) {
      setPhotoCompressPending(false);
      setPhotoFiles([]);
      return;
    }
    setPhotoCompressPending(true);
    void (async () => {
      try {
        const raw = Array.from(list);
        const out = await compressImagesForUpload(raw);
        setPhotoFiles(out);
      } finally {
        setPhotoCompressPending(false);
      }
    })();
  }, []);

  const removePhotoAt = useCallback((index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    if (flow === "innbytte") {
      clearInnbytteFinalizeDraft();
      void clearInnbytteFinalizePhotos();
    } else {
      clearSellFinalizeDraft();
      void clearFinalizePhotos();
    }
    setPriceHint("");
    setPhotoFiles([]);
    setAdditionalComment("");
    setWantsAdditionalNote(false);
    setFinnListing("");
    setFullName("");
    setEmail("");
    setPhone("");
  }, [flow]);

  const value = useMemo(
    () => ({
      flow,
      priceHint,
      setPriceHint,
      photoFiles,
      photoCompressPending,
      setPhotoFilesFromList,
      removePhotoAt,
      additionalComment,
      setAdditionalComment,
      wantsAdditionalNote,
      setWantsAdditionalNote,
      finnListing,
      setFinnListing,
      fullName,
      setFullName,
      email,
      setEmail,
      phone,
      setPhone,
      reset,
    }),
    [
      flow,
      priceHint,
      photoFiles,
      photoCompressPending,
      setPhotoFilesFromList,
      removePhotoAt,
      additionalComment,
      wantsAdditionalNote,
      finnListing,
      fullName,
      email,
      phone,
      reset,
    ],
  );

  return (
    <SellFinalizeContext.Provider value={value}>
      {children}
    </SellFinalizeContext.Provider>
  );
}

export function useSellFinalize() {
  const ctx = useContext(SellFinalizeContext);
  if (!ctx) {
    throw new Error("useSellFinalize må brukes innen SellFinalizeProvider");
  }
  return ctx;
}

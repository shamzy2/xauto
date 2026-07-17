"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Value = {
  /** Når false og pathname er `/selg`, skjul footer (f.eks. oppsummering etter «Fortsett»). */
  showFooterOnSelgRoot: boolean;
  setShowFooterOnSelgRoot: (v: boolean) => void;
};

const SellSelgFooterBridgeContext = createContext<Value | null>(null);

export function SellSelgFooterBridge({ children }: { children: ReactNode }) {
  const [showFooterOnSelgRoot, setShowFooterOnSelgRoot] = useState(true);
  const value = useMemo(
    () => ({ showFooterOnSelgRoot, setShowFooterOnSelgRoot }),
    [showFooterOnSelgRoot],
  );
  return (
    <SellSelgFooterBridgeContext.Provider value={value}>
      {children}
    </SellSelgFooterBridgeContext.Provider>
  );
}

export function useSellSelgFooterBridge() {
  const ctx = useContext(SellSelgFooterBridgeContext);
  if (!ctx) {
    throw new Error(
      "useSellSelgFooterBridge må brukes innen SellSelgFooterBridge",
    );
  }
  return ctx;
}

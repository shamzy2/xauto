"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

export type SellFlowBasePath = "/selg" | "/innbytte";

type SellFlowRouteValue = {
  basePath: SellFlowBasePath;
  intakePostUrl: string;
  intakeSessionUrl: string;
};

const SellFlowRouteContext = createContext<SellFlowRouteValue>({
  basePath: "/selg",
  intakePostUrl: "/api/sell/intake",
  intakeSessionUrl: "/api/sell/intake/session",
});

export function SellFlowRouteProvider({
  basePath,
  children,
}: {
  basePath: SellFlowBasePath;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({
      basePath,
      intakePostUrl:
        basePath === "/innbytte" ? "/api/innbytte/intake" : "/api/sell/intake",
      intakeSessionUrl:
        basePath === "/innbytte"
          ? "/api/innbytte/intake/session"
          : "/api/sell/intake/session",
    }),
    [basePath],
  );
  return (
    <SellFlowRouteContext.Provider value={value}>
      {children}
    </SellFlowRouteContext.Provider>
  );
}

export function useSellFlowRoute(): SellFlowRouteValue {
  return useContext(SellFlowRouteContext);
}

export type SellFlowStep = {
  id: string;
  suffix: string;
  title: string;
  lead: string;
};

/** Dinbil-inspirert 4-stegs egenerklæring (uten skadekart). */
export const SELL_FLOW_WIZARD_STEP_COUNT = 4;

export const SELL_FLOW_STEPS: SellFlowStep[] = [
  {
    id: "pickup",
    suffix: "steg-2a",
    title: "Henteadresse og bilder",
    lead: "Hvor står bilen? Legg gjerne ved bilder av utvendig, innvendig og dekk.",
  },
  {
    id: "dekk",
    suffix: "steg-2b",
    title: "Dekk og brems",
    lead: "Oppgi tilstand på dekk og brems.",
  },
  {
    id: "tilstand",
    suffix: "steg-3",
    title: "Tilstand og utstyr",
    lead: "Svar på spørsmål om bilens tilstand og historikk.",
  },
  {
    id: "finish",
    suffix: "steg-4d",
    title: "Kontakt",
    lead: "Hvordan når vi deg med tilbud?",
  },
];

export function wizardStepIndexFromSuffix(suffix: string): number {
  if (suffix === "steg-2a") return 0;
  if (suffix === "steg-2b") return 1;
  if (suffix === "steg-3") return 2;
  if (suffix === "steg-4" || suffix === "steg-4c" || suffix === "steg-4d") {
    return 3;
  }
  return 0;
}

export function flowStepIndex(pathname: string, basePath: "/selg" | "/innbytte"): number {
  const suffix = pathname.replace(basePath, "").replace(/^\//, "");
  if (!suffix) return -1;
  return wizardStepIndexFromSuffix(suffix);
}

export function flowStepFromPath(
  pathname: string,
  basePath: "/selg" | "/innbytte",
): SellFlowStep | null {
  const idx = flowStepIndex(pathname, basePath);
  if (idx < 0) return null;
  return SELL_FLOW_STEPS[idx] ?? null;
}

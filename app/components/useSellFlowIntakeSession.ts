"use client";

import { useEffect, useState } from "react";
import { readJsonResponseBody } from "@/app/lib/readJsonResponseBody";
import type { SellFlowIntakeSession } from "@/types/vehicleFlowSummary";
import { useSellFlowRoute } from "./SellFlowRouteContext";

export function useSellFlowIntakeSession() {
  const { intakeSessionUrl } = useSellFlowRoute();
  const [data, setData] = useState<SellFlowIntakeSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(intakeSessionUrl, {
          cache: "no-store",
          credentials: "include",
        });
        const json = await readJsonResponseBody<SellFlowIntakeSession & { error?: string }>(
          res,
        );
        if (!res.ok) {
          throw new Error(json.error ?? "Kunne ikke hente bilinformasjon.");
        }
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setData(null);
          setError(e instanceof Error ? e.message : "Noe gikk galt.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [intakeSessionUrl]);

  return { data, loading, error };
}

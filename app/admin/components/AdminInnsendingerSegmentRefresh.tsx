"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { createClient } from "@/lib/supabase/client";

const LIST_PATHS = new Set([
  "/admin/innsendinger",
  "/admin/innsendinger/innbytte",
  "/admin/innsendinger/kontakt",
]);

/**
 * Live oppdatering av innsendinger-listen: Supabase Realtime på
 * `sell_submissions`, `innbytte_submissions` og `contact_submissions`, pluss poll og synlig fane.
 */
export function AdminInnsendingerSegmentRefresh({
  pollMs = 25_000,
  debounceMs = 350,
}: {
  pollMs?: number;
  debounceMs?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isList = LIST_PATHS.has(pathname);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefresh = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      router.refresh();
    }, debounceMs);
  }, [router, debounceMs]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isList) return;
    router.refresh();
  }, [router, pathname, isList]);

  useEffect(() => {
    if (!isList) return;

    const tick = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    const id = window.setInterval(tick, pollMs);
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router, isList, pollMs]);

  useEffect(() => {
    if (!isList) return;

    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      return;
    }

    const ch = supabase
      .channel("admin-innsendinger-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sell_submissions",
        },
        () => {
          scheduleRefresh();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "innbytte_submissions",
        },
        () => {
          scheduleRefresh();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contact_submissions",
        },
        () => {
          scheduleRefresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(ch);
    };
  }, [isList, scheduleRefresh]);

  return null;
}

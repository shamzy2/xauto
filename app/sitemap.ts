import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/siteUrl";

const publicPaths = [
  "/",
  "/vare-biler",
  "/kontakt",
  "/tjenester",
  "/selg",
  "/selg/steg-2a",
  "/selg/steg-2b",
  "/selg/steg-3",
  "/selg/steg-4",
  "/selg/steg-4c",
  "/selg/steg-4d",
  "/selg/takk",
  "/innbytte",
  "/innbytte/steg-2a",
  "/innbytte/steg-2b",
  "/innbytte/steg-3",
  "/innbytte/steg-4",
  "/innbytte/steg-4c",
  "/innbytte/steg-4d",
  "/innbytte/takk",
] as const;

function priorityFor(path: string): number {
  if (path === "/") return 1;
  if (path === "/selg" || path === "/innbytte") return 0.9;
  if (path.endsWith("/takk")) return 0.3;
  return 0.65;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();
  return publicPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: priorityFor(path),
  }));
}

import "server-only";

import { jsPDF } from "jspdf";

import type { SkadeKartZonesState } from "@/app/lib/sellSkadeStorage";
import { skadeZonesFromSubmission } from "@/app/lib/sellSkadeStorage";
import { formatOsloDateTimeLong } from "@/lib/formatOslo";

import {
  formatDekkLines,
  formatSteg3Lines,
  SKADE_ZONE_LABELS,
  skadeMerkedeSonenavn,
  vegvesenSummaryLines,
  type AdminSubmissionRow,
} from "./adminSubmissionFormatting";
import {
  normalizeKjennemerke,
  ordinartKjennemerkeFromVegvesenPayload,
} from "./vegvesen";
import { vegvesenAdminSummaryFromPayload } from "./vegvesenAdminSummary";

export type PdfImagePart = { base64: string; format: "JPEG" | "PNG" };

/** Palett tilpasset admin / nettside (navy, accent #eaa038, skade-rødt). */
const COL = {
  navy: [10, 28, 54] as [number, number, number],
  accent: [234, 160, 56] as [number, number, number],
  accentSoft: [252, 244, 230] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  text: [15, 23, 42] as [number, number, number],
  muted: [100, 104, 112] as [number, number, number],
  cardBg: [248, 250, 252] as [number, number, number],
  cardBorder: [218, 224, 234] as [number, number, number],
  mapBg: [246, 247, 249] as [number, number, number],
  zoneIdleFill: [255, 255, 255] as [number, number, number],
  zoneIdleBorder: [175, 180, 192] as [number, number, number],
  zoneMarkFill: [252, 244, 230] as [number, number, number],
  zoneMarkBorder: [234, 160, 56] as [number, number, number],
  footerGray: [140, 144, 152] as [number, number, number],
};

const PAGE_W = 210;
const PAGE_H = 297;

function ensureSpace(doc: jsPDF, yRef: { y: number }, neededMm: number) {
  if (yRef.y + neededMm > 275) {
    doc.addPage();
    yRef.y = 18;
  }
}

function addWrapped(
  doc: jsPDF,
  text: string,
  margin: number,
  maxW: number,
  yRef: { y: number },
  lineH = 4.8,
) {
  doc.setTextColor(...COL.text);
  const lines = doc.splitTextToSize(text, maxW);
  for (const line of lines) {
    if (yRef.y > 268) {
      doc.addPage();
      yRef.y = 18;
    }
    doc.text(line, margin, yRef.y);
    yRef.y += lineH;
  }
}

function sectionHeading(
  doc: jsPDF,
  yRef: { y: number },
  margin: number,
  maxW: number,
  title: string,
) {
  ensureSpace(doc, yRef, 16);
  doc.setFillColor(...COL.accentSoft);
  doc.setDrawColor(...COL.cardBorder);
  doc.setLineWidth(0.15);
  doc.roundedRect(margin, yRef.y, maxW, 11, 1.8, 1.8, "FD");
  doc.setFillColor(...COL.accent);
  doc.rect(margin + 1.2, yRef.y + 2.2, 2.4, 6.6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(...COL.navy);
  doc.text(title, margin + 6, yRef.y + 7.6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COL.text);
  yRef.y += 14;
}

function keyValueRow(
  doc: jsPDF,
  yRef: { y: number },
  margin: number,
  maxW: number,
  key: string,
  value: string,
) {
  const valueLines = doc.splitTextToSize(value || "—", maxW - 50);
  const rowH = Math.max(5.5, valueLines.length * 4.8);
  ensureSpace(doc, yRef, rowH + 1);
  doc.setFontSize(8.2);
  doc.setTextColor(...COL.muted);
  doc.text(key, margin + 2, yRef.y + 3.5);
  doc.setTextColor(...COL.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  let vy = yRef.y + 3.5;
  for (const vl of valueLines) {
    doc.text(vl, margin + 48, vy);
    vy += 4.8;
  }
  doc.setFont("helvetica", "normal");
  yRef.y += rowH + 1.5;
}

function bulletParagraph(
  doc: jsPDF,
  yRef: { y: number },
  margin: number,
  maxW: number,
  text: string,
) {
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(text, maxW - 10);
  const lineStep = 4.8;
  const blockH = Math.max(5, lines.length * lineStep);
  ensureSpace(doc, yRef, blockH + 4);
  doc.setFillColor(...COL.accent);
  doc.circle(margin + 2.5, yRef.y + 3.2, 0.75, "F");
  doc.setTextColor(...COL.text);
  let ly = yRef.y + 4.5;
  for (const line of lines) {
    if (ly > 268) {
      doc.addPage();
      yRef.y = 18;
      ly = yRef.y + 4.5;
      doc.setFillColor(...COL.accent);
      doc.circle(margin + 2.5, ly - 1.3, 0.75, "F");
      doc.setTextColor(...COL.text);
    }
    doc.text(line, margin + 8, ly);
    ly += lineStep;
  }
  yRef.y = ly + 1.5;
}

const SKADE_GRID: [keyof SkadeKartZonesState, keyof SkadeKartZonesState][] = [
  ["frontLeft", "frontRight"],
  ["left", "right"],
  ["rearLeft", "rearRight"],
];

const SKADE_ROW_FR = [0.88, 1.24, 0.88] as const;

/** Tegner skadekart som i admin (rutenett + farger), toppvisning av bil. */
function drawSkadeKartPdf(
  doc: jsPDF,
  zones: SkadeKartZonesState,
  x: number,
  y: number,
  width: number,
): number {
  const mapH = width * (155 / 299);
  const pad = 2;
  const gap = 1.1;
  doc.setFillColor(...COL.mapBg);
  doc.setDrawColor(...COL.cardBorder);
  doc.setLineWidth(0.25);
  doc.roundedRect(x, y, width, mapH, 2.8, 2.8, "FD");

  const innerW = width - 2 * pad;
  const innerH = mapH - 2 * pad;
  const cellW = (innerW - gap) / 2;
  const rowSum = SKADE_ROW_FR[0] + SKADE_ROW_FR[1] + SKADE_ROW_FR[2];
  const rowGapTotal = 2 * gap;
  const rowInnerH = innerH - rowGapTotal;
  const h0 = (rowInnerH * SKADE_ROW_FR[0]) / rowSum;
  const h1 = (rowInnerH * SKADE_ROW_FR[1]) / rowSum;
  const h2 = (rowInnerH * SKADE_ROW_FR[2]) / rowSum;
  const rowHeights = [h0, h1, h2];

  let yy = y + pad;
  for (let r = 0; r < 3; r++) {
    const rh = rowHeights[r]!;
    for (let c = 0; c < 2; c++) {
      const id = SKADE_GRID[r]![c]!;
      const marked = Boolean(zones[id]);
      const cx = x + pad + c * (cellW + gap);
      if (marked) {
        doc.setFillColor(...COL.zoneMarkFill);
        doc.setDrawColor(...COL.zoneMarkBorder);
        doc.setLineWidth(0.35);
      } else {
        doc.setFillColor(...COL.zoneIdleFill);
        doc.setDrawColor(...COL.zoneIdleBorder);
        doc.setLineWidth(0.2);
      }
      doc.roundedRect(cx, yy, cellW, rh, 1.6, 1.6, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.2);
      doc.setTextColor(
        ...(marked
          ? COL.zoneMarkBorder
          : ([120, 125, 135] as [number, number, number])),
      );
      const label = SKADE_ZONE_LABELS[id] ?? id;
      const short =
        label.length > 22 ? `${label.slice(0, 20)}…` : label;
      doc.text(short, cx + 1.4, yy + 3.8);
    }
    yy += rh + gap;
  }

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COL.text);
  return mapH;
}

function drawSkadeLegend(doc: jsPDF, x: number, y: number) {
  doc.setFontSize(7.5);
  doc.setTextColor(...COL.muted);
  let lx = x;
  doc.setFillColor(...COL.zoneIdleFill);
  doc.setDrawColor(...COL.zoneIdleBorder);
  doc.roundedRect(lx, y, 4, 4, 0.6, 0.6, "FD");
  doc.text("Ikke markert", lx + 6, y + 3.2);
  lx += 38;
  doc.setFillColor(...COL.zoneMarkFill);
  doc.setDrawColor(...COL.zoneMarkBorder);
  doc.roundedRect(lx, y, 4, 4, 0.6, 0.6, "FD");
  doc.text("Markert skade", lx + 6, y + 3.2);
}

function drawPhotoPageHeader(
  doc: jsPDF,
  yRef: { y: number },
  margin: number,
  index: number,
  total: number,
) {
  doc.setFillColor(...COL.navy);
  doc.rect(0, 0, PAGE_W, 16, "F");
  doc.setFillColor(...COL.accent);
  doc.rect(0, 16, PAGE_W, 1.1, "F");
  doc.setTextColor(...COL.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Bilder fra kunden", margin, 10.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${index + 1} av ${total}`, PAGE_W - margin, 10.5, { align: "right" });
  doc.setTextColor(...COL.text);
  yRef.y = 22;
}

function addFooters(doc: jsPDF) {
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(...COL.footerGray);
    doc.setFont("helvetica", "normal");
    doc.text(`Side ${i} av ${n}`, PAGE_W / 2, PAGE_H - 8, { align: "center" });
    doc.setTextColor(...COL.text);
  }
}

export function buildSellSubmissionPdf(
  row: AdminSubmissionRow,
  images: PdfImagePart[],
): Uint8Array {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 14;
  const maxW = PAGE_W - 2 * margin;
  const yRef = { y: 0 };

  /* ——— Forside-header (som hero på innsendingssiden) ——— */
  doc.setFillColor(...COL.navy);
  doc.rect(0, 0, PAGE_W, 42, "F");
  doc.setFillColor(...COL.accent);
  doc.rect(0, 42, PAGE_W, 1.4, "F");
  doc.setTextColor(...COL.white);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const isInnbytte = Boolean(
    row.finn_listing_url != null && String(row.finn_listing_url).trim(),
  );
  doc.text(
    isInnbytte
      ? "X Auto · Innbytte-innsending"
      : "X Auto · Salgsinnsending",
    margin,
    14,
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(row.kjennemerke, margin, 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.8);
  const meta = `Mottatt ${formatOsloDateTimeLong(row.created_at)}  ·  ID ${row.id}`;
  doc.text(meta, margin, 34);
  doc.setTextColor(...COL.text);
  yRef.y = 50;

  const vv = vegvesenAdminSummaryFromPayload(row.vegvesen_snapshot);
  const ordinartReg = ordinartKjennemerkeFromVegvesenPayload(
    row.vegvesen_snapshot,
    normalizeKjennemerke(row.kjennemerke),
  );
  const zones = skadeZonesFromSubmission(row.skade_zones);
  const merket = skadeMerkedeSonenavn(zones);

  sectionHeading(doc, yRef, margin, maxW, "Kontakt");
  doc.setFillColor(...COL.cardBg);
  doc.setDrawColor(...COL.cardBorder);
  doc.setLineWidth(0.15);
  const cardTop = yRef.y;
  keyValueRow(doc, yRef, margin, maxW, "Navn", row.full_name);
  keyValueRow(doc, yRef, margin, maxW, "E-post", row.email);
  keyValueRow(doc, yRef, margin, maxW, "Telefon", row.phone);
  keyValueRow(
    doc,
    yRef,
    margin,
    maxW,
    "IP (innsending)",
    row.submitter_ip?.trim() || "—",
  );
  keyValueRow(
    doc,
    yRef,
    margin,
    maxW,
    "Enhet / nettleser (User-Agent)",
    row.submitter_user_agent?.trim() || "—",
  );
  doc.roundedRect(margin, cardTop - 2, maxW, yRef.y - cardTop + 4, 2, 2, "S");
  yRef.y += 6;

  sectionHeading(doc, yRef, margin, maxW, "Kjøretøy");
  const vCardTop = yRef.y;
  keyValueRow(
    doc,
    yRef,
    margin,
    maxW,
    "Skilt (personlig / oppslag · ordinært)",
    ordinartReg
      ? `${row.kjennemerke} · ordinært: ${ordinartReg}`
      : row.kjennemerke,
  );
  keyValueRow(doc, yRef, margin, maxW, "Kilometer", row.kilometerstand);
  keyValueRow(
    doc,
    yRef,
    margin,
    maxW,
    "Modell (lagret)",
    row.car_model ?? "—",
  );
  keyValueRow(
    doc,
    yRef,
    margin,
    maxW,
    "Førstegangsreg. år",
    row.first_registration_year != null
      ? String(row.first_registration_year)
      : "—",
  );
  if (isInnbytte) {
    keyValueRow(
      doc,
      yRef,
      margin,
      maxW,
      "FINN (kode / lenke)",
      row.finn_listing_url?.trim() || "—",
    );
  }
  doc.roundedRect(margin, vCardTop - 2, maxW, yRef.y - vCardTop + 4, 2, 2, "S");
  yRef.y += 6;

  sectionHeading(doc, yRef, margin, maxW, "Vegvesen (kort)");
  for (const line of vegvesenSummaryLines(vv)) {
    bulletParagraph(doc, yRef, margin, maxW, line);
  }
  yRef.y += 2;

  sectionHeading(doc, yRef, margin, maxW, "Pris og merknader");
  const pCardTop = yRef.y;
  keyValueRow(
    doc,
    yRef,
    margin,
    maxW,
    "Prisforventning",
    row.price_hint?.trim() || "—",
  );
  keyValueRow(
    doc,
    yRef,
    margin,
    maxW,
    "«Jeg vil legge til en merknad»",
    row.wants_additional_note == null
      ? "—"
      : row.wants_additional_note
        ? "Ja"
        : "Nei",
  );
  keyValueRow(
    doc,
    yRef,
    margin,
    maxW,
    "Tilleggskommentar",
    row.additional_comment?.trim() || "—",
  );
  doc.roundedRect(margin, pCardTop - 2, maxW, yRef.y - pCardTop + 4, 2, 2, "S");
  yRef.y += 8;

  sectionHeading(doc, yRef, margin, maxW, "Skader — kart (som på innsendingssiden)");
  ensureSpace(doc, yRef, 28);
  doc.setFontSize(9);
  doc.setTextColor(...COL.muted);
  addWrapped(
    doc,
    `Merknad fra kunde: ${row.skade_comment?.trim() || "—"}`,
    margin + 2,
    maxW - 4,
    yRef,
    4.5,
  );
  doc.setTextColor(...COL.text);
  yRef.y += 2;
  const mapW = Math.min(maxW, 118);
  const mapX = margin + (maxW - mapW) / 2;
  ensureSpace(doc, yRef, mapW * (155 / 299) + 22);
  const mapH = drawSkadeKartPdf(doc, zones, mapX, yRef.y, mapW);
  yRef.y += mapH + 3;
  drawSkadeLegend(doc, margin + 2, yRef.y);
  yRef.y += 8;
  doc.setFontSize(9);
  doc.setTextColor(...COL.text);
  doc.setFont("helvetica", "bold");
  ensureSpace(doc, yRef, 8);
  doc.text("Markerte soner (liste):", margin + 2, yRef.y + 4);
  yRef.y += 7;
  doc.setFont("helvetica", "normal");
  addWrapped(
    doc,
    merket.length > 0 ? merket.join(", ") : "Ingen soner markert.",
    margin + 2,
    maxW - 4,
    yRef,
    4.5,
  );
  yRef.y += 4;

  sectionHeading(doc, yRef, margin, maxW, "Dekk");
  for (const line of formatDekkLines(row.dekk)) {
    bulletParagraph(doc, yRef, margin, maxW, line);
  }
  yRef.y += 2;

  sectionHeading(doc, yRef, margin, maxW, "Service og utstyr");
  for (const line of formatSteg3Lines(row.steg3)) {
    bulletParagraph(doc, yRef, margin, maxW, line);
  }
  yRef.y += 4;

  if (images.length === 0) {
    sectionHeading(doc, yRef, margin, maxW, "Bilder");
    doc.setFontSize(9);
    doc.setTextColor(...COL.muted);
    addWrapped(doc, "Ingen bilder vedlagt.", margin + 2, maxW - 4, yRef, 5);
    doc.setTextColor(...COL.text);
  } else {
    sectionHeading(doc, yRef, margin, maxW, "Bilder");
    doc.setFontSize(9);
    addWrapped(
      doc,
      `Neste sider: ${images.length} bilde(r) (nedskalert for PDF — full oppløsning i admin).`,
      margin + 2,
      maxW - 4,
      yRef,
      4.8,
    );
  }

  for (let i = 0; i < images.length; i++) {
    const img = images[i]!;
    doc.addPage();
    yRef.y = 0;
    drawPhotoPageHeader(doc, yRef, margin, i, images.length);
    const dataUri = img.base64.startsWith("data:")
      ? img.base64
      : `data:image/${img.format.toLowerCase()};base64,${img.base64}`;

    let drawW = maxW;
    let drawH = 120;
    try {
      const props = doc.getImageProperties(dataUri);
      const maxImgH = 250;
      drawW = maxW;
      drawH = (props.height * drawW) / props.width;
      if (drawH > maxImgH) {
        drawH = maxImgH;
        drawW = (props.width * drawH) / props.height;
      }
    } catch {
      /* bruk fallback */
    }

    const imgX = margin + (maxW - drawW) / 2;
    try {
      doc.setDrawColor(...COL.cardBorder);
      doc.setLineWidth(0.2);
      doc.roundedRect(imgX - 1.5, yRef.y - 1.5, drawW + 3, drawH + 3, 2, 2, "S");
      doc.addImage(dataUri, img.format, imgX, yRef.y, drawW, drawH);
      yRef.y += drawH + 6;
      doc.setFillColor(...COL.accentSoft);
      doc.roundedRect(margin, yRef.y, maxW, 8, 1.2, 1.2, "F");
      doc.setFontSize(8);
      doc.setTextColor(...COL.muted);
      doc.text("Opplastet av kunde · kan åpnes i farger på skjerm", margin + 3, yRef.y + 5.2);
      doc.setTextColor(...COL.text);
    } catch {
      addWrapped(
        doc,
        "(Kunne ikke tegne dette bildet i PDF.)",
        margin,
        maxW,
        yRef,
      );
    }
  }

  doc.addPage();
  yRef.y = 18;
  sectionHeading(doc, yRef, margin, maxW, "Vegvesen rådata (JSON)");
  const raw =
    row.vegvesen_snapshot != null
      ? JSON.stringify(row.vegvesen_snapshot)
      : "";
  const cap = 12_000;
  const jsonBlock =
    raw.length > cap
      ? `${raw.slice(0, cap)}\n\n[… forkortet — full data i admin]`
      : raw || "—";

  doc.setFontSize(7.5);
  doc.setFont("courier", "normal");
  doc.setTextColor(55, 60, 72);
  const jsonLines = doc.splitTextToSize(jsonBlock, maxW - 8);
  const jsonLineStep = 3.45;
  yRef.y += 2;
  for (const line of jsonLines) {
    if (yRef.y > 265) {
      doc.addPage();
      yRef.y = 18;
      sectionHeading(
        doc,
        yRef,
        margin,
        maxW,
        "Vegvesen rådata (fortsettelse)",
      );
      yRef.y += 2;
      doc.setFont("courier", "normal");
      doc.setTextColor(55, 60, 72);
    }
    doc.text(line, margin + 4, yRef.y);
    yRef.y += jsonLineStep;
  }
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COL.text);

  addFooters(doc);

  const out = doc.output("arraybuffer");
  return new Uint8Array(out);
}

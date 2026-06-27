import type { Metadata } from "next";
import { DM_Sans, Newsreader } from "next/font/google";
import { site } from "@/lib/content";
import "./globals.css";

const display = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${site.name} – ${site.tagline}`,
  description:
    "Bruktbiler på Fetsund. Innbytte, finansiering, forsikring og bruktbilgaranti.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="no" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}

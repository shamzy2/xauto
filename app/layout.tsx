import type { Metadata, Viewport } from "next";
import { Barlow, Chakra_Petch } from "next/font/google";
import { OrganizationJsonLd } from "./components/OrganizationJsonLd";
import { FooterGate } from "./components/FooterGate";
import { RouteTransition } from "./components/RouteTransition";
import { SellSelgFooterBridge } from "./components/SellSelgFooterBridge";
import { SiteBackdrop } from "./components/SiteBackdrop";
import { getSiteUrl } from "@/lib/siteUrl";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-body",
});

/** Geometrisk, bilmerke-aktig display (Nissan Brand-inspirert). */
const chakra = Chakra_Petch({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-display",
});

const site = new URL(getSiteUrl());

const defaultDescription =
  "X Bilsenter AS på Fetsund: trygg bilhandel med tydelige valg innen finansiering og forsikring. Bruktbil, innbytte og salg av bil, lokalt eller på avstand.";

export const viewport: Viewport = {
  themeColor: "#121212",
};

export const metadata: Metadata = {
  metadataBase: site,
  title: {
    default: "X Bilsenter AS – Bilhandel gjort trygt og enkelt.",
    template: "%s - X Bilsenter AS",
  },
  description: defaultDescription,
  keywords: [
    "X Bilsenter",
    "bilforhandler",
    "Fetsund",
    "bruktbil",
    "innbytte",
    "selg bil",
    "bilgaranti",
  ],
  icons: {
    icon: [{ url: "/safavicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "nb_NO",
    siteName: "X Bilsenter AS",
    title: "X Bilsenter AS – Bilhandel gjort trygt og enkelt.",
    description: defaultDescription,
    images: [{ url: "/bilder/hero/finans.jpg", alt: "X Bilsenter" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "X Bilsenter AS – Bilhandel gjort trygt og enkelt.",
    description: defaultDescription,
    images: ["/bilder/hero/finans.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb" className={`${barlow.variable} ${chakra.variable}`}>
      <body className={barlow.className} suppressHydrationWarning>
        <SiteBackdrop />
        <OrganizationJsonLd />
        <SellSelgFooterBridge>
          <RouteTransition>{children}</RouteTransition>
          <FooterGate />
        </SellSelgFooterBridge>
      </body>
    </html>
  );
}

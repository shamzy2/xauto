import type { Metadata } from "next";
import { InnbytteCarHero } from "@/app/components/InnbytteCarFlow";
import { Menu } from "@/app/components/Menu";
import pageStyles from "../selg/page.module.css";

export const metadata: Metadata = {
  title: "Innbytte",
  description:
    "Få uforpliktende tilbud på innbytte innen 24 timer. X Bilsenter hjelper deg.",
};

export default function InnbyttePage() {
  return (
    <>
      <div className={pageStyles.flowPage}>
        <Menu />
        <InnbytteCarHero />
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { Menu } from "../components/Menu";
import { SellCarHero } from "../components/SellCarFlow";
import pageStyles from "./page.module.css";

export const metadata: Metadata = {
  title: "Selg bilen",
  description:
    "Få uforpliktende tilbud innen 24 timer. Selg bilen trygt hos X Bilsenter.",
};

export default function SelgPage() {
  return (
    <>
      {/* Outside main.page so no max-width / padding from globals — true full viewport width */}
      <div className={pageStyles.flowPage}>
        <Menu />
        <SellCarHero />
      </div>
    </>
  );
}

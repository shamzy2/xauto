import type { Metadata } from "next";
import { Menu } from "@/app/components/Menu";
import { FlowTakkPanel } from "@/app/components/FlowTakkPanel";
import pageStyles from "../page.module.css";
import { TakkClearResume } from "./TakkClearResume";

export const metadata: Metadata = {
  title: "Takk for innsendingen",
  description:
    "Vi har mottatt opplysningene dine og kommer tilbake med pristilbud.",
};

export default function SelgTakkPage() {
  return (
    <div className={pageStyles.flowPageSteps}>
      <TakkClearResume />
      <Menu />
      <FlowTakkPanel
        message="Innsendingen er sendt inn. Du vil få et pristilbud innen 24 timer."
        restartHref="/selg"
        restartLabel="Start en ny vurdering"
      />
    </div>
  );
}

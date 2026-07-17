import type { Metadata } from "next";
import { Menu } from "@/app/components/Menu";
import { FlowTakkPanel } from "@/app/components/FlowTakkPanel";
import pageStyles from "../../selg/page.module.css";
import { InnbytteTakkClearResume } from "./TakkClearResume";

export const metadata: Metadata = {
  title: "Takk for innsendingen",
  description:
    "Vi har mottatt opplysningene dine og kommer tilbake med svar på innbytte.",
};

export default function InnbytteTakkPage() {
  return (
    <div className={pageStyles.flowPageSteps}>
      <InnbytteTakkClearResume />
      <Menu />
      <FlowTakkPanel
        message="Innsendingen er sendt inn. Du hører fra oss innen 24 timer med tilbakemelding på innbytte."
        restartHref="/innbytte"
        restartLabel="Start en ny forespørsel"
      />
    </div>
  );
}

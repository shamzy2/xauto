import type { Metadata } from "next";

import { TjenesterExperience } from "./TjenesterExperience";
import { TJENESTER_SECTIONS } from "./tjenester-sections";

export const metadata: Metadata = {
  title: "Andre tjenester",
  description:
    "Solfilm, detailing, lakkforsegling og klargjøring hos X Auto på Fetsund. Ta kontakt for pristilbud.",
};

export default function TjenesterPage() {
  return <TjenesterExperience sections={TJENESTER_SECTIONS} />;
}

import type { Metadata } from "next";

import { OmOssExperience } from "./OmOssExperience";

export const metadata: Metadata = {
  title: "Om oss",
  description:
    "Bli bedre kjent med X Auto AS på Fetsund — bilbutikken for deg som ønsker en 100 % enkel og trygg handel.",
};

export default function OmOssPage() {
  return <OmOssExperience />;
}

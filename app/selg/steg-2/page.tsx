import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Registrering",
  description: "Oppsummering av kjøretøy i salgsskjemaet.",
};

export default function SelgSteg2RedirectPage() {
  redirect("/selg");
}

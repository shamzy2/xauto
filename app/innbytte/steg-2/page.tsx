import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Registrering",
  description: "Oppsummering av kjøretøy i innbytteskjemaet.",
};

export default function InnbytteSteg2RedirectPage() {
  redirect("/innbytte");
}

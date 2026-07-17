import { SellFinalizeProvider } from "@/app/components/SellFinalizeContext";
import { SellFlowPathPersistence } from "@/app/components/SellFlowPathPersistence";
import { SellFlowRouteProvider } from "@/app/components/SellFlowRouteContext";

/**
 * Holder avslutningsutkast (pris, bilder, merknad, kontakt) for hele `/selg/*`,
 * så tilbake fra f.eks. steg-4 til steg-3 ikke tømmer utfylt data.
 */
export default function SelgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SellFlowRouteProvider basePath="/selg">
      <SellFinalizeProvider flow="sell">
        <SellFlowPathPersistence />
        {children}
      </SellFinalizeProvider>
    </SellFlowRouteProvider>
  );
}

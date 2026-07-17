import { InnbytteFlowPathPersistence } from "@/app/components/InnbytteFlowPathPersistence";
import { SellFinalizeProvider } from "@/app/components/SellFinalizeContext";
import { SellFlowRouteProvider } from "@/app/components/SellFlowRouteContext";

export default function InnbytteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SellFlowRouteProvider basePath="/innbytte">
      <SellFinalizeProvider flow="innbytte">
        <InnbytteFlowPathPersistence />
        {children}
      </SellFinalizeProvider>
    </SellFlowRouteProvider>
  );
}

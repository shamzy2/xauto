export type VehicleFlowSummary = {
  make: string;
  model: string;
  variant: string | null;
  year: number | null;
  firstRegistered: string;
  fuel: string;
  bodyType: string;
  powerHp: string;
  color: string;
  driveType: string;
  euControl: string;
};

export type SellFlowIntakeSession = {
  carModel: string;
  firstRegistrationYear: number | null;
  kjennemerke: string;
  kilometerstand: string;
  vehicleSummary: VehicleFlowSummary;
};

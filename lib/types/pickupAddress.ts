export type PickupAddress = {
  street: string;
  postalCode: string;
  city: string;
  municipality?: string;
  lat?: number;
  lon?: number;
};

export function emptyPickupAddress(): PickupAddress {
  return {
    street: "",
    postalCode: "",
    city: "",
  };
}

export function isPickupAddressComplete(address: PickupAddress): boolean {
  return (
    address.street.trim().length > 0 &&
    /^\d{4}$/.test(address.postalCode.replace(/\D/g, "")) &&
    address.city.trim().length > 0 &&
    typeof address.lat === "number" &&
    typeof address.lon === "number"
  );
}

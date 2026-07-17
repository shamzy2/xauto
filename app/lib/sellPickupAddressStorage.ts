import {
  emptyPickupAddress,
  type PickupAddress,
} from "@/lib/types/pickupAddress";

const KEY_SELL = "xauto:sell:pickupAddress";
const KEY_INNBYTTE = "xauto:innbytte:pickupAddress";

function keyFor(flow: "sell" | "innbytte") {
  return flow === "innbytte" ? KEY_INNBYTTE : KEY_SELL;
}

export function persistPickupAddress(
  flow: "sell" | "innbytte",
  address: PickupAddress,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(keyFor(flow), JSON.stringify(address));
  } catch {
    /* ignore */
  }
}

export function readPickupAddress(flow: "sell" | "innbytte"): PickupAddress {
  if (typeof window === "undefined") return emptyPickupAddress();
  try {
    const raw = sessionStorage.getItem(keyFor(flow));
    if (!raw) return emptyPickupAddress();
    const parsed = JSON.parse(raw) as Partial<PickupAddress>;
    return {
      ...emptyPickupAddress(),
      ...parsed,
    };
  } catch {
    return emptyPickupAddress();
  }
}

export function clearPickupAddress(flow: "sell" | "innbytte"): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(keyFor(flow));
  } catch {
    /* ignore */
  }
}

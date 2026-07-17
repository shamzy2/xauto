import "server-only";

import { revalidatePath } from "next/cache";

/** Recompute dashboard + årsregnskap when accounting data changes. */
export function revalidateAccountingPaths(carId?: string): void {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/reports/annual");
  revalidatePath("/admin/cars");
  revalidatePath("/admin/costs/general");
  revalidatePath("/admin/financing");
  revalidatePath("/admin/accounting/settings");
  if (carId) {
    revalidatePath(`/admin/cars/${carId}`);
  }
}

import "server-only";

import { getReceiptSignedUrl } from "@/lib/server/receiptStorage";

export type WithReceiptViewUrl<T> = T & { receiptViewUrl: string | null };

export async function attachReceiptViewUrls<
  T extends { receiptStoragePath: string | null },
>(items: T[]): Promise<WithReceiptViewUrl<T>[]> {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      receiptViewUrl: item.receiptStoragePath
        ? await getReceiptSignedUrl(item.receiptStoragePath)
        : null,
    })),
  );
}

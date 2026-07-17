const DB_NAME = "xauto-innbytte-finalize";
const STORE_NAME = "kv";
const KEY_FILES = "photoFiles";

type StoredPhoto = { name: string; type: string; buffer: ArrayBuffer };

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

export async function readInnbytteFinalizePhotos(): Promise<File[]> {
  if (typeof indexedDB === "undefined") return [];
  try {
    const db = await openDb();
    const raw = await new Promise<StoredPhoto[] | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const r = tx.objectStore(STORE_NAME).get(KEY_FILES);
      r.onerror = () => reject(r.error);
      r.onsuccess = () => resolve(r.result as StoredPhoto[] | undefined);
    });
    db.close();
    if (!raw?.length) return [];
    return raw.map(
      (s) =>
        new File([s.buffer], s.name, {
          type: s.type || "application/octet-stream",
        }),
    );
  } catch {
    return [];
  }
}

export async function persistInnbytteFinalizePhotos(files: File[]): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    let stored: StoredPhoto[] | null = null;
    if (files.length) {
      stored = await Promise.all(
        files.map(async (f) => ({
          name: f.name,
          type: f.type,
          buffer: await f.arrayBuffer(),
        })),
      );
    }
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      const store = tx.objectStore(STORE_NAME);
      if (!stored) {
        store.delete(KEY_FILES);
      } else {
        store.put(stored, KEY_FILES);
      }
    });
    db.close();
  } catch {
    /* quota / private mode */
  }
}

export async function clearInnbytteFinalizePhotos(): Promise<void> {
  await persistInnbytteFinalizePhotos([]);
}

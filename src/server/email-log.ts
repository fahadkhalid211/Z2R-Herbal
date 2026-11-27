import type { JsonStore } from "./json-store";

const LOG = "sent-emails";
const KEEP_MS = 180 * 24 * 60 * 60 * 1000;

interface SentRecord {
  key: string;
  at: string;
}

export async function claimEmail(store: JsonStore, key: string, now = new Date()): Promise<boolean> {
  return store.update<SentRecord, boolean>(LOG, (list) => {
    const kept = list.filter((r) => now.getTime() - new Date(r.at).getTime() < KEEP_MS);
    if (kept.some((r) => r.key === key)) return { list: kept, result: false };
    return { list: [...kept, { key, at: now.toISOString() }], result: true };
  });
}

export async function releaseEmail(store: JsonStore, key: string): Promise<void> {
  await store.update<SentRecord, void>(LOG, (list) => ({
    list: list.filter((r) => r.key !== key),
    result: undefined,
  }));
}

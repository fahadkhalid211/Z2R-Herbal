import { createHash, randomBytes } from "node:crypto";
import type { JsonStore } from "./json-store";

export const VERIFY_TTL_HOURS = 24;
const TTL_MS = VERIFY_TTL_HOURS * 60 * 60 * 1000;
const KEEP_MS = 30 * 24 * 60 * 60 * 1000;

const TOKENS = "email-verifications";
const VERIFIED = "verified-emails";

interface TokenRecord {
  tokenHash: string;
  customerId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
  replacedAt?: string;
}

interface VerifiedRecord {
  customerId: string;
  email: string;
  verifiedAt: string;
}

export type VerifyOutcome =
  | { status: "verified"; email: string }
  | { status: "already-verified"; email: string }
  | { status: "expired" }
  | { status: "replaced" }
  | { status: "invalid" };

const hash = (token: string) => createHash("sha256").update(token).digest("hex");
const normal = (email: string) => email.trim().toLowerCase();
const TOKEN_SHAPE = /^[A-Za-z0-9_-]{43}$/;

export async function issueVerification(
  store: JsonStore,
  customerId: string,
  email: string,
  now = new Date(),
): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await store.update<TokenRecord, void>(TOKENS, (list) => {
    const at = now.toISOString();
    const kept = list
      .filter((r) => now.getTime() - new Date(r.createdAt).getTime() < KEEP_MS)
      .map((r) => (r.customerId === customerId && !r.usedAt && !r.replacedAt ? { ...r, replacedAt: at } : r));
    kept.push({
      tokenHash: hash(token),
      customerId,
      email: normal(email),
      createdAt: at,
      expiresAt: new Date(now.getTime() + TTL_MS).toISOString(),
    });
    return { list: kept, result: undefined };
  });
  return token;
}

export async function isEmailVerified(store: JsonStore, customerId: string, email: string): Promise<boolean> {
  const verified = await store.read<VerifiedRecord>(VERIFIED);
  return verified.some((v) => v.customerId === customerId && v.email === normal(email));
}

export async function redeemVerificationToken(
  store: JsonStore,
  token: string,
  now = new Date(),
): Promise<VerifyOutcome> {
  if (!TOKEN_SHAPE.test(token)) return { status: "invalid" };
  const tokenHash = hash(token);
  const found = await store.update<
    TokenRecord,
    { status: "ok" | "used" | "expired" | "replaced" | "invalid"; record?: TokenRecord }
  >(TOKENS, (list) => {
    const index = list.findIndex((r) => r.tokenHash === tokenHash);
    const record = list[index];
    if (!record) return { list, result: { status: "invalid" } };
    if (record.usedAt) return { list, result: { status: "used", record } };
    if (record.replacedAt) return { list, result: { status: "replaced" } };
    if (new Date(record.expiresAt).getTime() <= now.getTime()) return { list, result: { status: "expired" } };
    const used = { ...record, usedAt: now.toISOString() };
    return { list: list.map((r, i) => (i === index ? used : r)), result: { status: "ok", record: used } };
  });

  if (found.status === "ok" && found.record) {
    const { customerId, email } = found.record;
    await store.update<VerifiedRecord, void>(VERIFIED, (list) => ({
      list: list.some((v) => v.customerId === customerId && v.email === email)
        ? list
        : [...list, { customerId, email, verifiedAt: now.toISOString() }],
      result: undefined,
    }));
    return { status: "verified", email };
  }
  if (found.status === "used" && found.record) {
    const done = await isEmailVerified(store, found.record.customerId, found.record.email);
    return done ? { status: "already-verified", email: found.record.email } : { status: "invalid" };
  }
  if (found.status === "expired") return { status: "expired" };
  if (found.status === "replaced") return { status: "replaced" };
  return { status: "invalid" };
}

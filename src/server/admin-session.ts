import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "z2r_admin";
const TTL_MS = 12 * 60 * 60 * 1000;

const secret = () => process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "";
const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

const same = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export const adminConfigured = (): boolean => Boolean(process.env.ADMIN_PASSWORD);

export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && same(password, expected!);
}

export function createAdminSession(now = Date.now()): string {
  const payload = String(now + TTL_MS);
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSession(value: string | undefined, now = Date.now()): boolean {
  if (!value || !adminConfigured()) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || !same(signature, sign(payload))) return false;
  return Number(payload) > now;
}

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/admin",
  maxAge: TTL_MS / 1000,
};

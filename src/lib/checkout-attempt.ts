import type { Order } from "@/lib/customer-api";

const ATTEMPT = "z2r.checkout.attempt";
const PLACED = "z2r.checkout.placed";
const ATTEMPT_TTL_MS = 24 * 60 * 60 * 1000;
const PLACED_TTL_MS = 2 * 60 * 60 * 1000;

interface Attempt {
  key: string;
  signature: string;
  at: number;
}

export interface PlacedCheckout {
  order: Order;
  payLabel: string;
  phone: string;
  at: number;
}

function read<T>(storage: () => Storage, name: string): T | null {
  try {
    const raw = storage().getItem(name);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(storage: () => Storage, name: string, value: unknown): void {
  try {
    if (value === null) storage().removeItem(name);
    else storage().setItem(name, JSON.stringify(value));
  } catch {}
}

const local = () => localStorage;
const session = () => sessionStorage;

export function checkoutSignature(email: string, lines: { variantId: string; quantity: number }[]): string {
  const cart = lines
    .map((l) => `${l.variantId}x${l.quantity}`)
    .sort()
    .join(",");
  return `${email.trim().toLowerCase()}|${cart}`;
}

export function checkoutKey(signature: string, now = Date.now()): string {
  const saved = read<Attempt>(local, ATTEMPT);
  if (
    saved &&
    typeof saved.key === "string" &&
    saved.signature === signature &&
    now - saved.at < ATTEMPT_TTL_MS
  )
    return saved.key;
  const key = crypto.randomUUID();
  write(local, ATTEMPT, { key, signature, at: now } satisfies Attempt);
  return key;
}

export function forgetCheckoutKey(): void {
  write(local, ATTEMPT, null);
}

export function rememberPlaced(placed: Omit<PlacedCheckout, "at">, now = Date.now()): void {
  write(session, PLACED, { ...placed, at: now } satisfies PlacedCheckout);
}

export function placedCheckout(now = Date.now(), maxAgeMs = PLACED_TTL_MS): PlacedCheckout | null {
  const saved = read<PlacedCheckout>(session, PLACED);
  if (!saved || !saved.order || typeof saved.order.id !== "string" || now - saved.at > maxAgeMs) return null;
  return saved;
}

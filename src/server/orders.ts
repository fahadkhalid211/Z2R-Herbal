import { randomInt } from "node:crypto";
import { formatPrice } from "@/lib/money";
import type { PricedVariant } from "@/services/types";
import type { JsonStore } from "./json-store";

export interface OrderLine {
  productId: string;
  variantId?: string;
  sku?: string;
  variantLabel?: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export const ORDER_STATUSES = ["Order received", "Confirmed", "Shipped", "Delivered", "Cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface StoredOrder {
  id: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province?: string;
  notes: string | null;
  items: OrderLine[];
  subtotal: number;
}

const ORDERS = "orders";

export type RequestedLine = ({ variantId: string } | { productId: string }) & { quantity: number };

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province?: string;
  notes?: string;
}

export interface PublicOrder {
  id: string;
  status: string;
  placedAt: string;
  paymentMethod: string;
  items: { name: string; variantLabel?: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  shipping?: number;
  total?: number;
}

export function priceOrder(
  requested: unknown[],
  catalogue: PricedVariant[],
): { lines: OrderLine[]; subtotal: number } | { error: string } {
  if (requested.length === 0) return { error: "Your cart is empty." };
  const merged = new Map<PricedVariant, number>();
  for (const line of requested) {
    if (typeof line !== "object" || line === null) return { error: "Please check the quantities." };
    const { quantity } = line as { quantity?: unknown };
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 99)
      return { error: "Please check the quantities." };
    const variant =
      "variantId" in line && typeof line.variantId === "string"
        ? catalogue.find((v) => v.id === line.variantId)
        : "productId" in line && typeof line.productId === "string"
          ? catalogue.find((v) => v.productId === line.productId && v.isDefault)
          : undefined;
    if (!variant) return { error: "A product in your cart is no longer available." };
    merged.set(variant, (merged.get(variant) ?? 0) + quantity);
  }
  const lines: OrderLine[] = [];
  for (const [variant, quantity] of merged) {
    if (quantity > 99) return { error: "Please check the quantities." };
    lines.push({
      productId: variant.productId,
      variantId: variant.id,
      sku: variant.sku,
      variantLabel: variant.label,
      name: variant.name,
      quantity,
      unitPrice: variant.price,
    });
  }
  return { lines, subtotal: lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0) };
}

const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeOrderId(date = new Date(), random: (max: number) => number = randomInt): string {
  const pk = new Date(date.getTime() + 5 * 60 * 60 * 1000);
  const ymd = pk.toISOString().slice(2, 10).replace(/-/g, "");
  const suffix = Array.from({ length: 4 }, () => ID_ALPHABET[random(ID_ALPHABET.length)]).join("");
  return `Z2R-${ymd}-${suffix}`;
}

export const toPublicOrder = (o: StoredOrder): PublicOrder => ({
  id: o.id,
  status: o.status,
  placedAt: o.createdAt,
  paymentMethod: o.paymentMethod,
  items: o.items.map(({ name, variantLabel, quantity, unitPrice }) => ({
    name,
    ...(variantLabel && { variantLabel }),
    quantity,
    unitPrice,
  })),
  subtotal: o.subtotal,
});

export function createOrder(
  store: JsonStore,
  customer: OrderCustomer,
  priced: { lines: OrderLine[]; subtotal: number },
  now = new Date(),
): Promise<StoredOrder> {
  return store.update<StoredOrder, StoredOrder>(ORDERS, (list) => {
    let id = makeOrderId(now);
    while (list.some((o) => o.id === id)) id = makeOrderId(now);
    const row: StoredOrder = {
      id,
      createdAt: now.toISOString(),
      status: "Order received",
      paymentMethod: "Cash on Delivery",
      ...customer,
      notes: customer.notes || null,
      items: priced.lines,
      subtotal: priced.subtotal,
    };
    return { list: [...list, row], result: row };
  });
}

const digits = (value: string) => value.replace(/\D/g, "");

export function contactMatches(order: Pick<StoredOrder, "email" | "phone">, contact: string): boolean {
  const value = contact.trim();
  if (value.includes("@")) return value.toLowerCase() === order.email.toLowerCase();
  const a = digits(value).slice(-10);
  return a.length === 10 && a === digits(order.phone).slice(-10);
}

export async function findOrderFor(
  store: JsonStore,
  orderId: string,
  contact: string,
): Promise<StoredOrder | null> {
  const id = orderId.trim().toUpperCase();
  const order = (await store.read<StoredOrder>(ORDERS)).find((o) => o.id === id);
  return order && contactMatches(order, contact) ? order : null;
}

export async function listOrders(store: JsonStore, limit = 200): Promise<StoredOrder[]> {
  const list = await store.read<StoredOrder>(ORDERS);
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export async function setOrderStatus(store: JsonStore, id: string, status: OrderStatus): Promise<void> {
  await store.update<StoredOrder, void>(ORDERS, (list) => ({
    list: list.map((o) => (o.id === id ? { ...o, status } : o)),
    result: undefined,
  }));
}

export async function addSubscriber(store: JsonStore, email: string, now = new Date()): Promise<void> {
  const address = email.trim().toLowerCase();
  await store.update<{ email: string; createdAt: string }, void>("subscribers", (list) => ({
    list: list.some((s) => s.email === address)
      ? list
      : [...list, { email: address, createdAt: now.toISOString() }],
    result: undefined,
  }));
}

export function orderEmails(order: StoredOrder) {
  const items = order.items.map(
    (l) =>
      `${l.quantity} × ${l.name}${l.variantLabel ? ` (${l.variantLabel})` : ""} — ${formatPrice(l.unitPrice * l.quantity)}`,
  );
  const summary = [...items, "", `Subtotal: ${formatPrice(order.subtotal)}`, "Payment: Cash on Delivery"];
  return {
    support: {
      subject: `New order ${order.id} · ${formatPrice(order.subtotal)} · ${order.city}`,
      lines: [
        `Order ID: ${order.id}`,
        `Placed: ${new Date(order.createdAt).toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}`,
        "",
        `Name: ${order.name}`,
        `Phone: ${order.phone}`,
        `Email: ${order.email}`,
        `Address: ${order.address}, ${order.city}${order.province ? `, ${order.province}` : ""}`,
        ...(order.notes ? [`Notes: ${order.notes}`] : []),
        "",
        ...summary,
        "",
        "Please contact the customer to confirm the order and the shipping charges.",
      ],
    },
    customer: {
      subject: `Your Z2R Herbal order ${order.id}`,
      lines: [
        `Thank you, ${order.name}! We have received your order.`,
        "",
        `Order ID: ${order.id}`,
        ...summary,
        "",
        `Our team will contact you on ${order.phone} to confirm your order and the shipping charges.`,
        "Keep your Order ID to track your delivery on our website.",
      ],
    },
  };
}

import { logger } from "@/lib/logger";
import { publicMediaUrl, storeApi } from "./client";

const num = (value: string | null | undefined): number => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};

interface ApiQuote {
  currency: string;
  lines: {
    variantId: string;
    quantity: number;
    available: boolean;
    problem: string | null;
    productName: string;
    slug: string;
    label: string;
    sku: string;
    imageUrl: string | null;
    unitPrice: string;
    lineTotal: string;
  }[];
  canCheckout: boolean;
  subtotal: string;
  delivery: string;
  total: string;
  freeDelivery: { threshold: string | null; qualifies: boolean; amountRemaining: string } | null;
  paymentMethod: string;
}

export interface CartQuote {
  lines: {
    variantId: string;
    quantity: number;
    available: boolean;
    problem: string | null;
    name: string;
    label: string;
    imageUrl: string | null;
    unitPrice: number;
    lineTotal: number;
  }[];
  canCheckout: boolean;
  subtotal: number;
  delivery: number;
  total: number;
  freeDelivery: { threshold: number; qualifies: boolean; amountRemaining: number } | null;
}

export async function quoteCart(items: { variantId: string; quantity: number }[]): Promise<CartQuote> {
  const { data } = await storeApi<ApiQuote>("/cart/quote", { method: "POST", body: { items } });
  return {
    lines: data.lines.map((l) => ({
      variantId: l.variantId,
      quantity: l.quantity,
      available: l.available,
      problem: l.problem,
      name: l.productName,
      label: /^default$/i.test(l.label) ? "" : l.label,
      imageUrl: publicMediaUrl(l.imageUrl),
      unitPrice: num(l.unitPrice),
      lineTotal: num(l.lineTotal),
    })),
    canCheckout: data.canCheckout,
    subtotal: num(data.subtotal),
    delivery: num(data.delivery),
    total: num(data.total),
    freeDelivery: data.freeDelivery?.threshold
      ? {
          threshold: num(data.freeDelivery.threshold),
          qualifies: data.freeDelivery.qualifies,
          amountRemaining: num(data.freeDelivery.amountRemaining),
        }
      : null,
  };
}

interface ApiOrderSummary {
  id: string;
  number: string;
  status: { code: string; label: string };
  placedAt: string;
  total: string;
  currency: string;
  units: number;
}

export interface ApiOrder {
  id: string;
  number: string;
  status: { code: string; label: string };
  paymentMethod: string;
  paymentStatus: string;
  placedAt: string;
  canceledAt: string | null;
  currency: string;
  customer: { name: string; email: string | null; phone: string | null };
  shippingAddress: {
    name: string;
    phone: string | null;
    line1: string;
    line2: string | null;
    city: string;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  } | null;
  items: {
    name: string;
    variant: string | null;
    sku: string;
    quantity: number;
    canceledQuantity: number;
    unitPrice: string;
    lineTotal: string;
  }[];
  subtotal: string;
  discount: string | null;
  delivery: string | null;
  total: string;
  note: string | null;
  shipments: {
    status: string;
    courier: string | null;
    trackingNumber: string | null;
    dispatchedAt: string | null;
    deliveredAt: string | null;
  }[];
  canCancel: boolean;
  cancelBlockedReason: string | null;
}

export interface SiteOrder {
  id: string;
  ref: string;
  status: string;
  statusCode: string;
  placedAt: string;
  paymentMethod?: string;
  items: { name: string; variantLabel?: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  discount?: number;
  shipping?: number;
  total?: number;
  units?: number;
  delivery?: string;
  shippingAddress?: string;
  shipments?: {
    status: string;
    courier?: string;
    trackingNumber?: string;
    dispatchedAt?: string;
    deliveredAt?: string;
  }[];
  canCancel?: boolean;
  cancelBlockedReason?: string;
  summary?: boolean;
  contact?: { email?: string; phone?: string };
}

export function text(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    for (const key of ["label", "title", "name", "code"]) {
      const v = o[key];
      if (typeof v === "string" && v.trim()) return v;
    }
  }
  return fallback;
}

function statusOf(value: unknown): { label: string; code: string } {
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    const code = text(o.code, "placed");
    return { label: text(o.label, text(o.name, "Order received")), code };
  }
  const plain = text(value);
  return plain ? { label: plain, code: plain.toLowerCase() } : { label: "Order received", code: "placed" };
}

const paymentLabel = (method: unknown) => {
  const label = text(method, "cod");
  return /\bcod\b|on\s*delivery/i.test(label) ? "Cash on Delivery" : label;
};

export function toSiteOrder(o: ApiOrder): SiteOrder {
  const address = o.shippingAddress;
  const shipments = o.shipments ?? [];
  const lastShipment = shipments.at(-1);
  const status = statusOf(o.status);
  return {
    id: text(o.number, text(o.id)),
    ref: text(o.id),
    status: status.label,
    statusCode: status.code,
    placedAt: text(o.placedAt, new Date().toISOString()),
    paymentMethod: paymentLabel(o.paymentMethod),
    items: (o.items ?? [])
      .map((i) => {
        const variant = text(i.variant);
        return {
          name: text(i.name, "Item"),
          ...(variant && !/^default$/i.test(variant) && { variantLabel: variant }),
          quantity: (Number(i.quantity) || 0) - (Number(i.canceledQuantity) || 0),
          unitPrice: num(i.unitPrice),
        };
      })
      .filter((i) => i.quantity > 0),
    subtotal: num(o.subtotal),
    ...(num(o.discount) > 0 && { discount: num(o.discount) }),
    ...(o.delivery != null && { shipping: num(o.delivery) }),
    total: num(o.total),
    ...(lastShipment?.trackingNumber && {
      delivery: `${text(lastShipment.courier) ? `${text(lastShipment.courier)} · ` : ""}Tracking number ${text(lastShipment.trackingNumber)}`,
    }),
    ...(address && {
      shippingAddress: [
        address.name,
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.postalCode,
      ]
        .map((part) => text(part))
        .filter(Boolean)
        .join(", "),
    }),
    shipments: shipments.map((s) => ({
      status: text(s.status, statusOf(s.status).label),
      ...(text(s.courier) && { courier: text(s.courier) }),
      ...(text(s.trackingNumber) && { trackingNumber: text(s.trackingNumber) }),
      ...(text(s.dispatchedAt) && { dispatchedAt: text(s.dispatchedAt) }),
      ...(text(s.deliveredAt) && { deliveredAt: text(s.deliveredAt) }),
    })),
    canCancel: o.canCancel === true,
    ...(text(o.cancelBlockedReason) && { cancelBlockedReason: text(o.cancelBlockedReason) }),
    contact: {
      ...(text(o.customer?.email) && { email: text(o.customer?.email) }),
      ...(text(o.customer?.phone) && { phone: text(o.customer?.phone) }),
    },
  };
}

const fromSummary = (s: ApiOrderSummary): SiteOrder => {
  const status = statusOf(s.status);
  return {
    id: text(s.number, text(s.id)),
    ref: text(s.id),
    status: status.label,
    statusCode: status.code,
    placedAt: text(s.placedAt),
    items: [],
    subtotal: 0,
    total: num(s.total),
    units: Number(s.units) || 0,
    summary: true,
  };
};

export async function listCustomerOrders(token: string, ip: string | undefined, page = 1, pageSize = 10) {
  const { data, meta } = await storeApi<ApiOrderSummary[]>(
    `/customers/me/orders?page=${page}&pageSize=${pageSize}`,
    {
      customerToken: token,
      endUserIp: ip,
    },
  );
  return { orders: data.map(fromSummary), total: meta?.total ?? data.length, page, pageSize };
}

export async function customerOrder(token: string, ip: string | undefined, id: string): Promise<SiteOrder> {
  const { data } = await storeApi<ApiOrder>(`/customers/me/orders/${encodeURIComponent(id)}`, {
    customerToken: token,
    endUserIp: ip,
  });
  return toSiteOrder(data);
}

export async function cancelCustomerOrder(token: string, ip: string | undefined, id: string, reason: string) {
  const { data } = await storeApi<ApiOrder>(`/customers/me/orders/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
    body: { reason },
    customerToken: token,
    endUserIp: ip,
  });
  return toSiteOrder(data);
}

export interface PaymentMethod {
  id: string;
  title: string;
  accountDetails: string | null;
}

const METHODS_TTL_MS = 60_000;
let methodsCache: { at: number; data: PaymentMethod[] } | null = null;

export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  if (methodsCache && Date.now() - methodsCache.at < METHODS_TTL_MS) return methodsCache.data;
  const { data } = await storeApi<PaymentMethod[]>("/payment-methods");
  const methods = (Array.isArray(data) ? data : []).filter((m) => m?.id && m.title);
  methodsCache = { at: Date.now(), data: methods };
  return methods;
}

let methodsFailedAt = 0;

export async function paymentMethodTitles(): Promise<string[]> {
  if (Date.now() - methodsFailedAt < METHODS_TTL_MS) return [];
  try {
    return (await listPaymentMethods()).map((m) => m.title.trim()).filter(Boolean);
  } catch (error) {
    methodsFailedAt = Date.now();
    logger.warn("Payment methods could not be loaded", { error });
    return [];
  }
}

export function forgetPaymentMethods(): void {
  methodsCache = null;
  methodsFailedAt = 0;
}

export function joinMethods(titles: string[]): string {
  if (titles.length <= 1) return titles[0] ?? "";
  return `${titles.slice(0, -1).join(", ")} or ${titles.at(-1)}`;
}

export interface CheckoutInput {
  items: { variantId: string; quantity: number }[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    notes?: string;
  };
  idempotencyKey: string;
  paymentMethod?: Pick<PaymentMethod, "id" | "title">;
  customerToken?: string;
  endUserIp?: string;
}

export async function placeCheckout(input: CheckoutInput): Promise<SiteOrder> {
  const c = input.customer;
  const line1 = c.address.slice(0, 190);
  const line2 = c.address.length > 190 ? c.address.slice(190, 380) : undefined;
  const { data } = await storeApi<ApiOrder>("/checkout", {
    method: "POST",
    idempotencyKey: input.idempotencyKey,
    customerToken: input.customerToken,
    endUserIp: input.endUserIp,
    body: {
      items: input.items,
      customer: { name: c.name, email: c.email, phone: c.phone },
      shippingAddress: {
        name: c.name,
        phone: c.phone,
        line1,
        ...(line2 && { line2 }),
        city: c.city,
        state: c.province,
      },
      ...(input.paymentMethod ? { paymentMethodId: input.paymentMethod.id } : { paymentMethod: "cod" }),
      ...(c.notes && { note: c.notes }),
    },
  });
  const order = data as Partial<ApiOrder> & { orderNumber?: string };
  if (order.items && order.status && order.number) {
    try {
      return toSiteOrder(order as ApiOrder);
    } catch (error) {
      logger.error("Placed order could not be read in full", { error, order: order.number });
    }
  }
  const status = statusOf(order.status);
  return {
    id: text(order.number, text(order.orderNumber, text(order.id))),
    ref: text(order.id),
    status: status.label,
    statusCode: status.code,
    placedAt: text(order.placedAt, new Date().toISOString()),
    paymentMethod: input.paymentMethod?.title ?? "Cash on Delivery",
    items: [],
    subtotal: num(order.subtotal),
    ...(order.total && { total: num(order.total) }),
  };
}

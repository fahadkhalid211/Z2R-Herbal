"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { logger } from "@/lib/logger";
import { checkoutSchema, contactSchema, emailSchema, fieldErrors, trackOrderSchema } from "@/lib/validation";
import { getServices } from "@/services";
import { randomUUID } from "node:crypto";
import { storeApiEnabled } from "./store-api/client";
import { asCustomer, customerTokenIfSignedIn, endUserIp, hasSession } from "./store-api/customer";
import {
  type CartQuote,
  type SiteOrder,
  customerOrder,
  listCustomerOrders,
  listPaymentMethods,
  placeCheckout,
  quoteCart,
} from "./store-api/orders";
import { type ApiActionFailure, apiFailure } from "./store-api/results";
import { getStore } from "./json-store";
import { emailHtml, sendMail, supportInbox } from "./mail";
import { sendContactEmails, sendOrderEmails, toOrderEmailData } from "./notifications";
import {
  addSubscriber,
  type PublicOrder,
  type RequestedLine,
  contactMatches,
  createOrder,
  findOrderFor,
  orderEmails,
  priceOrder,
  toPublicOrder,
} from "./orders";
import { createRateLimit } from "./rate-limit";

export type ActionResult<T> = ({ ok: true } & T) | ApiActionFailure;

export type ShownOrder = PublicOrder & Partial<Omit<SiteOrder, keyof PublicOrder>>;

const orderLimit = createRateLimit({ limit: 5, windowMs: 10 * 60 * 1000 });
const trackLimit = createRateLimit({ limit: 20, windowMs: 10 * 60 * 1000 });
const quoteLimit = createRateLimit({ limit: 60, windowMs: 10 * 60 * 1000 });
const formLimit = createRateLimit({ limit: 5, windowMs: 10 * 60 * 1000 });

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

const TOO_MANY = {
  ok: false,
  code: "RATE_LIMITED",
  message: "Too many attempts. Please wait a few minutes and try again.",
} as const;
const UNAVAILABLE = {
  ok: false,
  code: "UNAVAILABLE",
  message: "We could not complete this right now. Please try again, or contact us on WhatsApp.",
} as const;

export interface PlaceOrderInput {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    notes?: string;
  };
  items: RequestedLine[];
  company?: string;
  idempotencyKey?: string;
  paymentMethodId?: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const shown = (o: SiteOrder): ShownOrder => ({ ...o, paymentMethod: o.paymentMethod ?? "Cash on Delivery" });

export async function placeOrder(input: PlaceOrderInput): Promise<ActionResult<{ order: ShownOrder }>> {
  if (input.company) return { ok: false, code: "VALIDATION", message: "Please check your details." };
  if (!orderLimit(await clientIp())) return TOO_MANY;

  const parsed = checkoutSchema.safeParse(input.customer);
  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "Please check the highlighted fields.",
      fields: fieldErrors(parsed.error),
    };
  }
  const catalogue = await getServices().products.variants();
  const priced = priceOrder(Array.isArray(input.items) ? input.items : [], catalogue);
  if ("error" in priced) return { ok: false, code: "VALIDATION", message: priced.error };

  if (storeApiEnabled()) {
    let order: SiteOrder;
    const methods = await listPaymentMethods().catch(() => null);
    const chosen = methods
      ? methods.find((m) => m.id === input.paymentMethodId)
      : typeof input.paymentMethodId === "string" && input.paymentMethodId
        ? { id: input.paymentMethodId, title: "" }
        : undefined;
    if (methods?.length && !chosen) {
      const message = "Please choose a payment method.";
      return { ok: false, code: "VALIDATION", message, fields: { paymentMethodId: message } };
    }
    const customerToken = await customerTokenIfSignedIn();
    try {
      order = await placeCheckout({
        ...(chosen && { paymentMethod: { id: chosen.id, title: chosen.title || "Online payment" } }),
        items: priced.lines.map((l) => ({ variantId: l.variantId!, quantity: l.quantity })),
        customer: parsed.data,
        idempotencyKey:
          typeof input.idempotencyKey === "string" && UUID.test(input.idempotencyKey)
            ? input.idempotencyKey
            : randomUUID(),
        customerToken,
        endUserIp: await endUserIp(),
      });
    } catch (error) {
      return apiFailure(error, "Checkout");
    }
    const placedOrder = order;
    const details = parsed.data;
    const signedIn = Boolean(customerToken);
    after(async () => {
      try {
        await sendOrderEmails(getStore(), toOrderEmailData(placedOrder, details), { signedIn });
      } catch (error) {
        logger.error("Order emails failed", { error, order: placedOrder.id });
      }
    });
    return { ok: true, order: shown(placedOrder) };
  }

  try {
    const order = await createOrder(getStore(), parsed.data, priced);
    const mails = orderEmails(order);
    const inbox = supportInbox();
    await Promise.all([
      inbox &&
        sendMail({
          to: inbox,
          replyTo: order.email,
          subject: mails.support.subject,
          text: mails.support.lines.join("\n"),
          html: emailHtml(mails.support.subject, mails.support.lines),
        }),
      sendMail({
        to: order.email,
        subject: mails.customer.subject,
        text: mails.customer.lines.join("\n"),
        html: emailHtml(mails.customer.subject, mails.customer.lines),
      }),
    ]);
    return { ok: true, order: toPublicOrder(order) };
  } catch (error) {
    logger.error("Order could not be saved", { error });
    return UNAVAILABLE;
  }
}

export async function trackOrder(input: {
  orderId: string;
  contact: string;
}): Promise<ActionResult<{ order: ShownOrder }>> {
  if (!trackLimit(await clientIp())) return TOO_MANY;
  const parsed = trackOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "Please check the highlighted fields.",
      fields: fieldErrors(parsed.error),
    };
  }
  if (storeApiEnabled()) {
    if (!(await hasSession()))
      return {
        ok: false,
        code: "UNAUTHORIZED",
        message: "Please sign in to your account to track your order.",
      };
    try {
      const wanted = parsed.data.orderId.trim().toUpperCase();
      const order = await asCustomer(async (token, ip) => {
        for (let page = 1; page <= 5; page++) {
          const result = await listCustomerOrders(token, ip, page, 20);
          const hit = result.orders.find((o) => o.id.toUpperCase() === wanted);
          if (hit) return customerOrder(token, ip, hit.ref);
          if (page * result.pageSize >= result.total) break;
        }
        return null;
      });
      const contact = order?.contact;
      const matches =
        order &&
        contact &&
        contactMatches({ email: contact.email ?? "", phone: contact.phone ?? "" }, parsed.data.contact);
      return matches
        ? { ok: true, order: shown(order) }
        : { ok: false, code: "NOT_FOUND", message: "No matching order." };
    } catch (error) {
      return apiFailure(error, "Order lookup");
    }
  }
  try {
    const order = await findOrderFor(getStore(), parsed.data.orderId, parsed.data.contact);
    return order
      ? { ok: true, order: toPublicOrder(order) }
      : { ok: false, code: "NOT_FOUND", message: "No matching order." };
  } catch (error) {
    logger.error("Order lookup failed", { error });
    return UNAVAILABLE;
  }
}

export async function sendContactMessage(input: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  company?: string;
}): Promise<ActionResult<object>> {
  if (input.company) return { ok: true };
  if (!formLimit(await clientIp())) return TOO_MANY;
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: "Please check the highlighted fields.",
      fields: fieldErrors(parsed.error),
    };
  }
  const { name, email, phone, message } = parsed.data;
  const { admin } = await sendContactEmails({
    name,
    email,
    ...(phone && { phone }),
    message,
    submittedAt: new Date().toISOString(),
  });
  return admin === "sent" ? { ok: true } : UNAVAILABLE;
}

export async function subscribe(email: string): Promise<ActionResult<object>> {
  if (!formLimit(await clientIp())) return TOO_MANY;
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success)
    return { ok: false, code: "VALIDATION", message: "Please enter a valid email address." };
  try {
    await addSubscriber(getStore(), parsed.data);
    return { ok: true };
  } catch (error) {
    logger.error("Newsletter sign-up failed", { error });
    return UNAVAILABLE;
  }
}

export async function quoteMyCart(
  items: { variantId: string; quantity: number }[],
): Promise<ActionResult<{ quote: CartQuote }>> {
  if (!storeApiEnabled())
    return { ok: false, code: "UNAVAILABLE", message: "Prices are shown on each product." };
  if (!quoteLimit(await clientIp())) return TOO_MANY;
  const lines = (Array.isArray(items) ? items : [])
    .filter(
      (l) =>
        typeof l?.variantId === "string" &&
        Number.isInteger(l.quantity) &&
        l.quantity >= 1 &&
        l.quantity <= 99,
    )
    .slice(0, 50)
    .map((l) => ({ variantId: l.variantId, quantity: l.quantity }));
  if (lines.length === 0) return { ok: false, code: "VALIDATION", message: "Your cart is empty." };
  try {
    return { ok: true, quote: await quoteCart(lines) };
  } catch (error) {
    return apiFailure(error, "Cart quote");
  }
}

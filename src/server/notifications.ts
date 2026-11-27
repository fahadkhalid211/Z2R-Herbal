import { logger } from "@/lib/logger";
import { SITE_URL } from "@/lib/site-url";
import { claimEmail, releaseEmail } from "./email-log";
import {
  type ContactEmailData,
  type EmailContent,
  type OrderEmailData,
  adminContactEmail,
  adminOrderEmail,
  contactConfirmationEmail,
  orderConfirmationEmail,
  passwordResetCodeEmail,
  verificationEmail,
} from "./email-templates";
import { VERIFY_TTL_HOURS, issueVerification } from "./email-verification";
import type { JsonStore } from "./json-store";
import { adminInbox, sendMail } from "./mail";
import type { SiteOrder } from "./store-api/orders";

export type MailResult = "sent" | "failed" | "skipped" | "no-recipient";

const send = async (to: string | undefined, content: EmailContent, replyTo?: string): Promise<MailResult> => {
  if (!to) return "no-recipient";
  return (await sendMail({ to, ...content, ...(replyTo && { replyTo }), withLogo: true }))
    ? "sent"
    : "failed";
};

async function once(store: JsonStore, key: string, deliver: () => Promise<MailResult>): Promise<MailResult> {
  if (!(await claimEmail(store, key))) return "skipped";
  const result = await deliver();
  if (result !== "sent") await releaseEmail(store, key);
  return result;
}

export function toOrderEmailData(
  order: SiteOrder,
  checkout: { name: string; email: string; phone: string; notes?: string },
): OrderEmailData {
  return {
    number: order.id,
    placedAt: order.placedAt,
    status: order.status,
    paymentMethod: order.paymentMethod,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    total: order.total,
    shippingAddress: order.shippingAddress,
    note: checkout.notes,
    customer: {
      name: checkout.name,
      email: order.contact?.email ?? checkout.email,
      phone: order.contact?.phone ?? checkout.phone,
    },
  };
}

export async function sendOrderEmails(
  store: JsonStore,
  data: OrderEmailData,
  { signedIn }: { signedIn: boolean },
): Promise<{ customer: MailResult; admin: MailResult }> {
  if (!data.number) return { customer: "failed", admin: "failed" };
  const [customer, admin] = await Promise.all([
    once(store, `order:${data.number}:customer`, () =>
      send(data.customer.email, orderConfirmationEmail(data, signedIn ? `${SITE_URL}/account` : undefined)),
    ),
    once(store, `order:${data.number}:admin`, () =>
      send(adminInbox(), adminOrderEmail(data), data.customer.email),
    ),
  ]);
  if (customer !== "sent" && customer !== "skipped")
    logger.error("Order confirmation email not sent", { order: data.number, result: customer });
  if (admin !== "sent" && admin !== "skipped")
    logger.error("New-order alert email not sent", { order: data.number, result: admin });
  return { customer, admin };
}

export async function sendContactEmails(
  data: ContactEmailData,
): Promise<{ admin: MailResult; customer: MailResult }> {
  const admin = await send(adminInbox(), adminContactEmail(data), data.email);
  if (admin !== "sent") return { admin, customer: "skipped" };
  const customer = await send(data.email, contactConfirmationEmail(data));
  if (customer !== "sent") logger.error("Contact confirmation email not sent", { result: customer });
  return { admin, customer };
}

export async function sendVerificationEmail(
  store: JsonStore,
  customer: { id: string; name: string; email: string },
): Promise<boolean> {
  const token = await issueVerification(store, customer.id, customer.email);
  const link = `${SITE_URL}/verify-email?token=${encodeURIComponent(token)}`;
  const result = await send(
    customer.email,
    verificationEmail({ name: customer.name, email: customer.email, link, expiresInHours: VERIFY_TTL_HOURS }),
  );
  if (result !== "sent") logger.error("Verification email not sent", { result });
  return result === "sent";
}

export async function sendPasswordResetCode(delivery: {
  code: string;
  expiresInMinutes: number;
  customer: { name: string; email: string };
}): Promise<boolean> {
  const result = await send(
    delivery.customer.email,
    passwordResetCodeEmail({
      name: delivery.customer.name,
      code: delivery.code,
      expiresInMinutes: delivery.expiresInMinutes,
    }),
  );
  if (result !== "sent") logger.error("Password reset email not sent", { result });
  return result === "sent";
}

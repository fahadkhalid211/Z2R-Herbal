"use server";

import { z } from "zod";
import {
  emailSchema,
  fieldErrors,
  loginSchema,
  nameSchema,
  passwordSchema,
  phoneSchema,
} from "@/lib/validation";
import { storeApiEnabled } from "./store-api/client";
import {
  type ApiCustomer,
  asCustomer,
  clearSession,
  endUserIp,
  customerCalls,
  hasSession,
  saveSession,
  updateAccessToken,
} from "./store-api/customer";
import { type SiteOrder, cancelCustomerOrder, customerOrder, listCustomerOrders } from "./store-api/orders";
import { type ApiActionFailure, apiFailure } from "./store-api/results";
import { headers } from "next/headers";
import { logger } from "@/lib/logger";
import { formatPrice } from "@/lib/money";
import { isDispatched } from "@/lib/order-status";
import { type VerifyOutcome, isEmailVerified, redeemVerificationToken } from "./email-verification";
import { getStore } from "./json-store";
import { sendPasswordResetCode, sendVerificationEmail } from "./notifications";
import { createRateLimit } from "./rate-limit";

export type AccountResult<T> = ({ ok: true } & T) | ApiActionFailure;

export interface AccountCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  emailVerified?: boolean;
}

async function withVerification(customer: AccountCustomer): Promise<AccountCustomer> {
  try {
    return { ...customer, emailVerified: await isEmailVerified(getStore(), customer.id, customer.email) };
  } catch (error) {
    logger.error("Email verification status could not be read", { error });
    return customer;
  }
}

const NOT_CONNECTED: ApiActionFailure = {
  ok: false,
  code: "UNAVAILABLE",
  message: "Customer accounts are not available yet.",
};

const toCustomer = (c: ApiCustomer): AccountCustomer => ({
  id: c.id,
  name: c.name,
  email: c.email,
  ...(c.phone && { phone: c.phone }),
});

const invalid = (error: z.ZodError): ApiActionFailure => ({
  ok: false,
  code: "VALIDATION",
  message: "Please check the highlighted fields.",
  fields: fieldErrors(error),
});

const registerInput = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

export async function registerCustomer(
  input: z.input<typeof registerInput>,
): Promise<AccountResult<{ customer: AccountCustomer; verificationSent?: boolean }>> {
  if (!storeApiEnabled()) return NOT_CONNECTED;
  const parsed = registerInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  let customer: AccountCustomer;
  try {
    const session = await customerCalls.register(parsed.data);
    await saveSession(session);
    customer = toCustomer(session.customer);
  } catch (error) {
    return apiFailure(error, "Register");
  }
  const verificationSent = await sendVerificationEmail(getStore(), customer).catch((error: unknown) => {
    logger.error("Verification email failed", { error });
    return false;
  });
  return { ok: true, customer: { ...customer, emailVerified: false }, verificationSent };
}

export async function loginCustomer(
  input: z.input<typeof loginSchema>,
): Promise<AccountResult<{ customer: AccountCustomer }>> {
  if (!storeApiEnabled()) return NOT_CONNECTED;
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    const session = await customerCalls.login(parsed.data);
    await saveSession(session);
    return { ok: true, customer: await withVerification(toCustomer(session.customer)) };
  } catch (error) {
    return apiFailure(error, "Login");
  }
}

export async function logoutCustomer(): Promise<AccountResult<object>> {
  if (!storeApiEnabled()) return NOT_CONNECTED;
  try {
    if (await hasSession()) await asCustomer((token, ip) => customerCalls.logout(token, ip));
  } catch {}
  await clearSession();
  return { ok: true };
}

export async function currentCustomer(): Promise<AccountResult<{ customer: AccountCustomer | null }>> {
  if (!storeApiEnabled()) return NOT_CONNECTED;
  if (!(await hasSession())) return { ok: true, customer: null };
  try {
    const me = toCustomer(await asCustomer((token, ip) => customerCalls.me(token, ip)));
    return { ok: true, customer: await withVerification(me) };
  } catch (error) {
    const failure = apiFailure(error, "Account");
    return failure.code === "UNAUTHORIZED" ? { ok: true, customer: null } : failure;
  }
}

const profileInput = z.object({ name: nameSchema, phone: phoneSchema });

export async function updateProfile(
  input: z.input<typeof profileInput>,
): Promise<AccountResult<{ customer: AccountCustomer }>> {
  if (!storeApiEnabled()) return NOT_CONNECTED;
  const parsed = profileInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    const customer = await asCustomer((token, ip) => customerCalls.update(token, ip, parsed.data));
    return { ok: true, customer: toCustomer(customer) };
  } catch (error) {
    return apiFailure(error, "Profile update");
  }
}

const passwordInput = z
  .object({
    currentPassword: z.string().min(1, "Please enter your current password."),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "The passwords do not match.",
  });

export async function changePassword(input: z.input<typeof passwordInput>): Promise<AccountResult<object>> {
  if (!storeApiEnabled()) return NOT_CONNECTED;
  const parsed = passwordInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    const result = await asCustomer((token, ip) =>
      customerCalls.changePassword(token, ip, {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      }),
    );
    await updateAccessToken(result.accessToken, result.expiresIn);
    return { ok: true };
  } catch (error) {
    return apiFailure(error, "Password change");
  }
}

const PAGE_SIZE = 10;
const FETCH_SIZE = 50;
const FETCH_PAGES = 20;

async function allMyOrders(token: string, ip: string | undefined): Promise<SiteOrder[]> {
  const orders: SiteOrder[] = [];
  for (let page = 1; page <= FETCH_PAGES; page++) {
    const result = await listCustomerOrders(token, ip, page, FETCH_SIZE);
    orders.push(...result.orders);
    if (result.orders.length === 0 || page * result.pageSize >= result.total) break;
  }
  return orders;
}

const placedTime = (o: SiteOrder) => {
  const t = new Date(o.placedAt).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const searchText = (o: SiteOrder) => {
  const d = new Date(o.placedAt);
  const date = Number.isNaN(d.getTime())
    ? o.placedAt
    : [
        d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }),
        d.toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" }),
      ].join(" ");
  const total = o.total !== undefined ? `${formatPrice(o.total)} ${o.total}` : "";
  return `${o.id} ${o.status} ${o.statusCode} ${date} ${total}`.toLowerCase();
};

export async function myOrders(
  page = 1,
  query = "",
): Promise<
  AccountResult<{ orders: SiteOrder[]; total: number; page: number; pageSize: number; all: number }>
> {
  if (!storeApiEnabled()) return NOT_CONNECTED;
  const words = String(query ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 80)
    .split(/\s+/)
    .filter(Boolean);
  try {
    const orders = (await asCustomer((token, ip) => allMyOrders(token, ip))).sort(
      (a, b) => placedTime(b) - placedTime(a),
    );
    const found = words.length
      ? orders.filter((o) => {
          const text = searchText(o);
          return words.every((w) => text.includes(w));
        })
      : orders;
    const pages = Math.max(1, Math.ceil(found.length / PAGE_SIZE));
    const current = Math.min(Math.max(1, Math.floor(page)), pages);
    return {
      ok: true,
      orders: found.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
      total: found.length,
      page: current,
      pageSize: PAGE_SIZE,
      all: orders.length,
    };
  } catch (error) {
    return apiFailure(error, "Order history");
  }
}

const orderRef = z.string().trim().min(1).max(80);

export async function myOrder(ref: string): Promise<AccountResult<{ order: SiteOrder }>> {
  if (!storeApiEnabled()) return NOT_CONNECTED;
  const parsed = orderRef.safeParse(ref);
  if (!parsed.success) return { ok: false, code: "NOT_FOUND", message: "Order not found." };
  try {
    return { ok: true, order: await asCustomer((token, ip) => customerOrder(token, ip, parsed.data)) };
  } catch (error) {
    return apiFailure(error, "Order details");
  }
}

const cancelReason = z.string().trim().min(3, "Please tell us why, in a few words.").max(300);

export async function cancelMyOrder(
  ref: string,
  reason: string,
): Promise<AccountResult<{ order: SiteOrder }>> {
  if (!storeApiEnabled()) return NOT_CONNECTED;
  const id = orderRef.safeParse(ref);
  if (!id.success) return { ok: false, code: "NOT_FOUND", message: "Order not found." };
  const why = cancelReason.safeParse(reason);
  if (!why.success) {
    const message = why.error.issues[0]?.message ?? "Please tell us why.";
    return { ok: false, code: "VALIDATION", message, fields: { reason: message } };
  }
  try {
    const result: { kind: "blocked" | "cancelled"; order: SiteOrder } = await asCustomer(
      async (token, ip) => {
        const current = await customerOrder(token, ip, id.data);
        if (current.canCancel === false || isDispatched(current)) return { kind: "blocked", order: current };
        return { kind: "cancelled", order: await cancelCustomerOrder(token, ip, id.data, why.data) };
      },
    );
    if (result.kind === "blocked") {
      return {
        ok: false,
        code: "CONFLICT",
        message: isDispatched(result.order)
          ? "This order has already been dispatched, so it can no longer be cancelled."
          : (result.order.cancelBlockedReason ?? "This order can no longer be cancelled."),
      };
    }
    return { ok: true, order: result.order };
  } catch (error) {
    return apiFailure(error, "Order cancel");
  }
}

const resendLimit = createRateLimit({ limit: 3, windowMs: 30 * 60 * 1000 });
const confirmLimit = createRateLimit({ limit: 20, windowMs: 10 * 60 * 1000 });

export async function resendVerification(): Promise<AccountResult<{ alreadyVerified: boolean }>> {
  if (!storeApiEnabled()) return NOT_CONNECTED;
  if (!(await hasSession()))
    return { ok: false, code: "UNAUTHORIZED", message: "Please sign in to continue." };
  try {
    const me = await withVerification(
      toCustomer(await asCustomer((token, ip) => customerCalls.me(token, ip))),
    );
    if (me.emailVerified) return { ok: true, alreadyVerified: true };
    if (!resendLimit(me.id))
      return {
        ok: false,
        code: "RATE_LIMITED",
        message:
          "A verification email was sent a few times already. Please check your inbox, or try again later.",
      };
    const sent = await sendVerificationEmail(getStore(), me);
    return sent
      ? { ok: true, alreadyVerified: false }
      : {
          ok: false,
          code: "UNAVAILABLE",
          message: "We could not send the verification email right now. Please try again shortly.",
        };
  } catch (error) {
    return apiFailure(error, "Resend verification");
  }
}

export async function confirmEmailVerification(token: string): Promise<{ status: VerifyOutcome["status"] }> {
  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",").at(-1)?.trim() ?? "unknown";
  if (!confirmLimit(ip)) return { status: "invalid" };
  try {
    const outcome = await redeemVerificationToken(getStore(), String(token ?? ""));
    return { status: outcome.status };
  } catch (error) {
    logger.error("Email verification failed", { error });
    return { status: "invalid" };
  }
}

const forgotLimit = createRateLimit({ limit: 5, windowMs: 60 * 60 * 1000 });
const resetLimit = createRateLimit({ limit: 10, windowMs: 15 * 60 * 1000 });
const TOO_MANY_RESETS: ApiActionFailure = {
  ok: false,
  code: "RATE_LIMITED",
  message: "Too many attempts. Please wait a few minutes and try again.",
};

export async function requestPasswordReset(input: {
  email: string;
}): Promise<AccountResult<{ resendAfterSeconds: number }>> {
  if (!storeApiEnabled()) return NOT_CONNECTED;
  const parsed = z.object({ email: emailSchema }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const ip = await endUserIp();
  if (!forgotLimit(`${ip ?? "unknown"}:${parsed.data.email.toLowerCase()}`)) return TOO_MANY_RESETS;
  try {
    const { delivery, resendAfterSeconds } = await customerCalls.forgotPassword(parsed.data.email, ip);
    if (delivery)
      await sendPasswordResetCode(delivery).catch((error: unknown) =>
        logger.error("Password reset email failed", { error }),
      );
    return { ok: true, resendAfterSeconds: Math.max(resendAfterSeconds ?? 0, 60) };
  } catch (error) {
    return apiFailure(error, "Password reset request");
  }
}

const resetInput = z
  .object({
    email: emailSchema,
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Enter the 6-digit code from the email."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "The passwords do not match.",
  });

export async function resetForgottenPassword(
  input: z.input<typeof resetInput>,
): Promise<AccountResult<object>> {
  if (!storeApiEnabled()) return NOT_CONNECTED;
  const parsed = resetInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const ip = await endUserIp();
  if (!resetLimit(`${ip ?? "unknown"}:${parsed.data.email.toLowerCase()}`)) return TOO_MANY_RESETS;
  try {
    await customerCalls.resetPassword(
      { email: parsed.data.email, code: parsed.data.code, newPassword: parsed.data.password },
      ip,
    );
    return { ok: true };
  } catch (error) {
    const failure = apiFailure(error, "Password reset");
    if (failure.fields?.newPassword) failure.fields.password = failure.fields.newPassword;
    return failure;
  }
}

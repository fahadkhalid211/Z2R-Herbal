import { logger } from "@/lib/logger";
import { StoreApiError } from "./client";

export type ApiActionFailure = {
  ok: false;
  code: "VALIDATION" | "NOT_FOUND" | "RATE_LIMITED" | "UNAVAILABLE" | "UNAUTHORIZED" | "CONFLICT";
  message: string;
  fields?: Record<string, string>;
};

const FIELD_ALIASES: Record<string, string> = {
  "customer.name": "name",
  "customer.email": "email",
  "customer.phone": "phone",
  "shippingAddress.name": "name",
  "shippingAddress.phone": "phone",
  "shippingAddress.line1": "address",
  "shippingAddress.line2": "address",
  "shippingAddress.city": "city",
  "shippingAddress.state": "province",
  "shippingAddress.country": "province",
  note: "notes",
  currentPassword: "currentPassword",
  newPassword: "newPassword",
};

function fieldsOf(fieldErrors?: Record<string, string[]>): Record<string, string> | undefined {
  if (!fieldErrors) return undefined;
  const out: Record<string, string> = {};
  for (const [key, messages] of Object.entries(fieldErrors)) {
    const field = FIELD_ALIASES[key] ?? key.split(".").at(-1) ?? key;
    if (messages[0]) out[field] ??= messages[0];
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export function apiFailure(error: unknown, context: string): ApiActionFailure {
  if (error instanceof StoreApiError) {
    const fields = fieldsOf(error.fieldErrors);
    if (error.status === 422 || error.code === "validation_failed")
      return {
        ok: false,
        code: "VALIDATION",
        message: error.message || "Please check the highlighted fields.",
        ...(fields && { fields }),
      };
    if (error.status === 401)
      return { ok: false, code: "UNAUTHORIZED", message: error.message || "Please sign in to continue." };
    if (error.status === 404) return { ok: false, code: "NOT_FOUND", message: error.message || "Not found." };
    if (error.status === 409) return { ok: false, code: "CONFLICT", message: error.message };
    if (error.status === 429)
      return {
        ok: false,
        code: "RATE_LIMITED",
        message: "Too many attempts. Please wait a few minutes and try again.",
      };
    if (error.status === 400 && error.message)
      return { ok: false, code: "VALIDATION", message: error.message };
  }
  logger.error(`${context} failed (Store API)`, { error });
  return {
    ok: false,
    code: "UNAVAILABLE",
    message: "We could not complete this right now. Please try again, or contact us on WhatsApp.",
  };
}

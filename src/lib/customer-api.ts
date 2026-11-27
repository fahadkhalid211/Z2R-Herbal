import { ServiceError, isServiceError } from "@/services/errors";
import {
  cancelMyOrder,
  changePassword,
  confirmEmailVerification,
  currentCustomer,
  loginCustomer,
  logoutCustomer,
  myOrder,
  myOrders,
  registerCustomer,
  requestPasswordReset,
  resendVerification,
  resetForgottenPassword,
  updateProfile,
} from "@/server/account-actions";
import {
  type PlaceOrderInput,
  placeOrder,
  quoteMyCart,
  sendContactMessage,
  trackOrder,
} from "@/server/actions";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  emailVerified?: boolean;
}

export interface Order {
  id: string;
  ref?: string;
  status: string;
  statusCode?: string;
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

export type OrderRequest = PlaceOrderInput;

export class ActionError extends ServiceError {
  readonly fields?: Record<string, string>;
  constructor(code: ServiceError["code"], message: string, fields?: Record<string, string>) {
    super(code, message);
    this.fields = fields;
  }
}

type Result<T> = { ok: true } & T;
async function unwrap<T>(
  promise: Promise<Result<T> | { ok: false; code: string; message: string; fields?: Record<string, string> }>,
): Promise<T> {
  let result;
  try {
    result = await promise;
  } catch (cause) {
    throw new ServiceError("NETWORK", "The request failed", { cause });
  }
  if (result.ok) return result;
  const code = result.code === "RATE_LIMITED" ? "VALIDATION" : (result.code as ServiceError["code"]);
  throw new ActionError(code, result.message, result.fields);
}

export const customerApi = {
  register: async (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<Customer> => (await unwrap(registerCustomer(input))).customer,
  login: async (input: { email: string; password: string }): Promise<Customer> =>
    (await unwrap(loginCustomer(input))).customer,
  logout: async (): Promise<void> => {
    await unwrap(logoutCustomer());
  },
  me: async (): Promise<Customer> => {
    const { customer } = await unwrap(currentCustomer());
    if (!customer) throw new ServiceError("UNAUTHORIZED", "Not signed in.");
    return customer;
  },
  updateProfile: async (input: { name: string; phone: string }): Promise<Customer> =>
    (await unwrap(updateProfile(input))).customer,
  changePassword: async (input: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    await unwrap(changePassword(input));
  },
  myOrders: async (
    page = 1,
    query = "",
  ): Promise<{ orders: Order[]; total: number; page: number; pageSize: number; all: number }> =>
    unwrap(myOrders(page, query)),
  resendVerification: async (): Promise<boolean> => (await unwrap(resendVerification())).alreadyVerified,
  requestPasswordReset: async (email: string): Promise<number> =>
    (await unwrap(requestPasswordReset({ email }))).resendAfterSeconds,
  resetPassword: async (input: {
    email: string;
    code: string;
    password: string;
    confirmPassword: string;
  }) => {
    await unwrap(resetForgottenPassword(input));
  },
  confirmEmail: (token: string) => confirmEmailVerification(token),
  myOrder: async (ref: string): Promise<Order> => (await unwrap(myOrder(ref))).order,
  cancelOrder: async (ref: string, reason: string): Promise<Order> =>
    (await unwrap(cancelMyOrder(ref, reason))).order,
  quoteCart: async (items: { variantId: string; quantity: number }[]): Promise<CartQuote> =>
    (await unwrap(quoteMyCart(items))).quote,
  placeOrder: async (input: OrderRequest): Promise<Order> => (await unwrap(placeOrder(input))).order,
  trackOrder: async (input: { orderId: string; contact: string }): Promise<Order> =>
    (await unwrap(trackOrder(input))).order,
  sendMessage: async (input: Parameters<typeof sendContactMessage>[0]): Promise<void> => {
    await unwrap(sendContactMessage(input));
  },
};

type Area = "account" | "checkout" | "tracking" | "contact";

const UNAVAILABLE: Record<Area, string> = {
  account: "Customer accounts are not available yet. Please check back soon.",
  checkout: "We could not place your order right now. Please try again, or order on WhatsApp.",
  tracking: "Order tracking is not available right now. Please try again shortly.",
  contact: "We could not send your message right now. Please try again, or contact us on WhatsApp.",
};

export function describeApiError(error: unknown, area: Area): string {
  if (!isServiceError(error)) return "Something went wrong. Please try again.";
  switch (error.code) {
    case "UNAVAILABLE":
      return area === "account" ? UNAVAILABLE.account : error.message || UNAVAILABLE[area];
    case "NETWORK":
      return "We could not reach the server. Please check your connection and try again.";
    case "UNAUTHORIZED":
      return area === "account" && !error.message.startsWith("Please sign in")
        ? error.message || "The email address or password is incorrect."
        : error.message;
    case "CONFLICT":
      return area === "account" ? "An account with this email address already exists." : error.message;
    case "NOT_FOUND":
      return area === "tracking"
        ? "We could not find an order matching those details. Please check them and try again."
        : error.message;
    case "VALIDATION":
      return error.message;
    default:
      return "Something went wrong. Please try again.";
  }
}

export const errorFields = (error: unknown): Record<string, string> =>
  error instanceof ActionError && error.fields ? error.fields : {};

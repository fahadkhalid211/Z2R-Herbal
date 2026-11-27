/**
 * Central tracking helpers.
 * - GA4 / Google tags: gtag('event', ...) (reaches the direct G- tag and GTM containers)
 * - Meta Pixel: fbq('track', ...)
 * Every call is wrapped so a blocked/missing pixel never breaks the site.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export const CURRENCY = "PKR";

export interface TrackedItem {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
  variant?: string;
}

type Params = Record<string, unknown>;

function ga(name: string, params: Params): void {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", name, params);
  } catch {}
}

function meta(name: string, params: Params, eventId?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (eventId) window.fbq?.("track", name, params, { eventID: eventId });
    else window.fbq?.("track", name, params);
  } catch {}
}

const qty = (i: TrackedItem) => i.quantity ?? 1;

const gaItems = (items: TrackedItem[]) =>
  items.map((i) => ({
    item_id: i.id,
    item_name: i.name,
    ...(i.variant && { item_variant: i.variant }),
    ...(i.price !== undefined && { price: i.price }),
    quantity: qty(i),
  }));

const metaContents = (items: TrackedItem[]) => items.map((i) => ({ id: i.id, quantity: qty(i) }));

export function itemsValue(items: TrackedItem[]): number | undefined {
  if (items.length === 0 || items.some((i) => i.price === undefined)) return undefined;
  return items.reduce((sum, i) => sum + (i.price as number) * qty(i), 0);
}

const money = (value: number | undefined) => (value === undefined ? {} : { value, currency: CURRENCY });

function ecommerce(
  gaName: string,
  metaName: string,
  items: TrackedItem[],
  extra: Params = {},
  eventId?: string,
) {
  const value = (extra.value as number | undefined) ?? itemsValue(items);
  ga(gaName, { ...money(value), ...extra, items: gaItems(items) });
  meta(
    metaName,
    {
      content_type: "product",
      content_ids: items.map((i) => i.id),
      contents: metaContents(items),
      num_items: items.reduce((n, i) => n + qty(i), 0),
      ...money(value),
    },
    eventId,
  );
}

export const trackViewItem = (item: TrackedItem) => {
  const value = item.price;
  ga("view_item", { ...money(value), items: gaItems([item]) });
  meta("ViewContent", {
    content_type: "product",
    content_ids: [item.id],
    content_name: item.name,
    ...money(value),
  });
};

export const trackAddToCart = (item: TrackedItem) => ecommerce("add_to_cart", "AddToCart", [item]);

export const trackAddToWishlist = (item: TrackedItem) => {
  ga("add_to_wishlist", { ...money(item.price), items: gaItems([item]) });
  meta("AddToWishlist", {
    content_type: "product",
    content_ids: [item.id],
    content_name: item.name,
    ...money(item.price),
  });
};

export const trackViewCart = (items: TrackedItem[]) => {
  const value = itemsValue(items);
  ga("view_cart", { ...money(value), items: gaItems(items) });
};

export const trackBeginCheckout = (items: TrackedItem[]) =>
  ecommerce("begin_checkout", "InitiateCheckout", items);

export const trackPurchase = (order: {
  id: string;
  items: TrackedItem[];
  value: number;
  shipping?: number;
  paymentType?: string;
}) =>
  ecommerce(
    "purchase",
    "Purchase",
    order.items,
    {
      transaction_id: order.id,
      value: order.value,
      ...(order.shipping !== undefined && { shipping: order.shipping }),
      ...(order.paymentType && { payment_type: order.paymentType }),
    },
    order.id,
  );

export const trackSearch = (term: string) => {
  ga("search", { search_term: term });
  meta("Search", { search_string: term });
};

export const trackLead = (source: "contact" | "newsletter") => {
  ga("generate_lead", { lead_source: source });
  meta("Lead", { content_name: source });
};

export const trackSignUp = () => {
  ga("sign_up", { method: "email" });
  meta("CompleteRegistration", { status: true });
};

/** Meta only: SPA route changes (first PageView is fired by the base code). */
export const trackRoutePageView = () => {
  try {
    window.fbq?.("track", "PageView");
  } catch {}
};

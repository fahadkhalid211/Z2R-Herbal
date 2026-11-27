"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Banknote, MessageCircle } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCart } from "@/components/cart/CartProvider";
import { useCartQuote } from "@/components/cart/useCartQuote";
import { startRouteLoader } from "@/components/layout/RouteLoader";
import { whatsAppHref } from "@/components/layout/WhatsAppButton";
import { OrderCard } from "@/components/order/OrderCard";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { SelectField, TextAreaField, TextField } from "@/components/ui/TextField";
import { TrustBar } from "@/components/ui/TrustBar";
import { PaymentMethodPicker } from "./PaymentMethodPicker";
import { cardSurface } from "@/components/ui/surface";
import { trackBeginCheckout, trackPurchase } from "@/lib/analytics";
import { cartSubtotal, pricedLines } from "@/lib/cart";
import type { CatalogItem } from "@/lib/catalog";
import {
  type PlacedCheckout,
  checkoutKey,
  checkoutSignature,
  forgetCheckoutKey,
  placedCheckout,
  rememberPlaced,
} from "@/lib/checkout-attempt";
import { type Customer, customerApi, describeApiError, errorFields } from "@/lib/customer-api";
import { formatPrice } from "@/lib/money";
import { PROVINCES, checkoutSchema, fieldErrors } from "@/lib/validation";
import type { PaymentMethod } from "@/server/store-api/orders";
import { isServiceError } from "@/services/errors";
import type { SiteConfig } from "@/services/types";

interface CheckoutViewProps {
  catalogue: CatalogItem[];
  whatsapp: SiteConfig["contact"]["whatsapp"];
  live?: boolean;
  paymentMethods?: PaymentMethod[];
}

const EMPTY = { name: "", email: "", phone: "", address: "", city: "", province: "", notes: "" };
const FIELD_ORDER = ["name", "email", "phone", "address", "city", "province", "notes"];

export function CheckoutView(props: CheckoutViewProps) {
  const { customer, status } = useAuth();
  return (
    <CheckoutForm
      key={customer?.id ?? "guest"}
      customer={customer}
      signedIn={status === "authenticated"}
      {...props}
    />
  );
}

function CheckoutForm({
  catalogue,
  whatsapp,
  customer,
  signedIn,
  live = false,
  paymentMethods = [],
}: CheckoutViewProps & { customer: Customer | null; signedIn: boolean }) {
  const { lines, ready, clear } = useCart();
  const [values, setValues] = useState(() => ({
    ...EMPTY,
    name: customer?.name ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [confirmation, setConfirmation] = useState<Omit<PlacedCheckout, "at"> | null>(null);
  const restored = useMemo(
    () => (ready && lines.length === 0 ? placedCheckout() : null),
    [ready, lines.length],
  );
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [methodId, setMethodId] = useState(paymentMethods[0]?.id ?? "");
  const chosen = paymentMethods.find((m) => m.id === methodId);
  const payLabel = chosen?.title ?? "Cash on Delivery";

  const items = pricedLines(lines, catalogue);
  const subtotal = cartSubtotal(items);
  const {
    quote,
    loading: quoting,
    failed: quoteFailed,
  } = useCartQuote(
    items.map(({ product, quantity }) => ({ variantId: product.id, quantity })),
    live,
  );
  const tracked = items.map(({ product, quantity }) => ({
    id: product.productId,
    name: product.name,
    price: product.salePrice,
    variant: product.variantLabel,
    quantity,
  }));
  const began = useRef(false);
  useEffect(() => {
    if (!ready || began.current || tracked.length === 0) return;
    began.current = true;
    trackBeginCheckout(tracked);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per checkout visit
  }, [ready, tracked.length]);
  const problems = quote?.lines.filter((l) => !l.available || l.problem) ?? [];
  const blocked = live && quote !== null && !quote.canCheckout;
  const set =
    (key: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  const formRef = useRef<HTMLFormElement>(null);
  const showErrors = (found: Record<string, string>) => {
    setErrors(found);
    const first =
      FIELD_ORDER.find((f) => found[f]) ?? (found.paymentMethodId ? "paymentMethodId" : undefined);
    const el = first ? formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`) : null;
    el?.focus({ preventScroll: true });
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const parsed = checkoutSchema.safeParse(values);
    if (!parsed.success) {
      showErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setPending(true);
    const orderLines = items.map(({ product, quantity }) => ({ variantId: product.id, quantity }));
    const idempotencyKey = checkoutKey(checkoutSignature(parsed.data.email, orderLines));
    try {
      const order = await customerApi.placeOrder({
        customer: parsed.data,
        items: orderLines,
        company,
        idempotencyKey,
        ...(chosen && { paymentMethodId: chosen.id }),
      });
      const done = { order, payLabel, phone: values.phone };
      trackPurchase({
        id: order.id,
        items: tracked,
        value: order.total ?? order.subtotal ?? subtotal,
        shipping: order.shipping,
        paymentType: payLabel,
      });
      forgetCheckoutKey();
      clear();
      rememberPlaced(done);
      if (live && signedIn) {
        setRedirecting(true);
        startRouteLoader();
        router.replace("/account");
        return;
      }
      setConfirmation(done);
      window.scrollTo({ top: 0 });
    } catch (error) {
      if (isServiceError(error) && (error.code === "VALIDATION" || error.code === "UNAUTHORIZED"))
        forgetCheckoutKey();
      const found = errorFields(error);
      showErrors(found);
      const shown = [...FIELD_ORDER, "paymentMethodId"];
      const hidden = Object.entries(found).filter(([field]) => !shown.includes(field));
      setFormError(
        hidden.length > 0 && !Object.keys(found).some((f) => shown.includes(f))
          ? hidden.map(([, message]) => message).join(" ")
          : describeApiError(error, "checkout"),
      );
    } finally {
      setPending(false);
    }
  };

  if (redirecting) {
    return (
      <div className="mx-auto max-w-2xl">
        <Notice tone="success" role="status" title="Thank you! Your order has been placed.">
          Taking you to My Orders…
        </Notice>
      </div>
    );
  }

  const done = confirmation ?? restored;
  if (done) {
    const placed = done.order;
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Notice tone="success" role="status" title="Thank you! Your order has been placed.">
          {live
            ? signedIn
              ? `Your order number is ${placed.id}. Payment: ${done.payLabel}. You can follow it, and cancel it before dispatch, in My Orders.`
              : `Your order number is ${placed.id}. Payment: ${done.payLabel}. Our team will contact you on ${done.phone}. Create an account with the same email to follow your orders online.`
            : `Our team will contact you on ${done.phone} to confirm your order and the shipping charges. Payment: ${done.payLabel}. Keep your Order ID to track your delivery.`}
        </Notice>
        {(placed.items?.length ?? 0) > 0 && <OrderCard order={placed} />}
        <div className="flex flex-wrap gap-3">
          {live ? (
            <ButtonLink href={signedIn ? "/account" : "/register"}>
              {signedIn ? "View My Orders" : "Create an Account"}
            </ButtonLink>
          ) : (
            <ButtonLink href="/contact">Contact Us</ButtonLink>
          )}
          <ButtonLink href="/shop" variant="outline-dark">
            Continue Shopping
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <p role="status" className="py-16 text-center text-ink-muted">
        Loading your order…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${cardSurface} mx-auto max-w-xl px-6 py-14 text-center`}>
        <h2 className="font-display text-[1.8rem] font-semibold text-ink">Your cart is empty</h2>
        <p className="mx-auto mt-3 max-w-sm text-ink-muted">Add a hair oil to your cart to check out.</p>
        <ButtonLink href="/shop" className="mt-7">
          Shop the Collection <ArrowRight aria-hidden="true" className="size-4" />
        </ButtonLink>
      </div>
    );
  }

  const help = whatsAppHref({
    number: whatsapp.number,
    greeting: [
      "Assalam o Alaikum! I need help with my order:",
      ...items.map(({ product, quantity }) => `${quantity} x ${product.name} (${product.variantLabel})`),
      `Subtotal: ${formatPrice(subtotal)}`,
    ].join("\n"),
  });

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="grid items-start gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-8"
    >
      <div className="space-y-6">
        <section aria-labelledby="details-title" className={`${cardSurface} p-6 sm:p-8`}>
          <h2 id="details-title" className="font-display text-[1.5rem] font-semibold text-ink">
            Customer information
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <TextField
              label="Full name"
              name="name"
              autoComplete="name"
              value={values.name}
              onChange={set("name")}
              error={errors.name}
              className="sm:col-span-2"
            />
            <TextField
              label="Email address"
              type="email"
              name="email"
              autoComplete="email"
              value={values.email}
              onChange={set("email")}
              error={errors.email}
            />
            <TextField
              label="Contact number"
              type="tel"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              value={values.phone}
              onChange={set("phone")}
              error={errors.phone}
            />
            <TextAreaField
              label="Shipping address"
              name="address"
              autoComplete="street-address"
              value={values.address}
              onChange={set("address")}
              error={errors.address}
              className="sm:col-span-2"
            />
            <TextField
              label="City"
              name="city"
              autoComplete="address-level2"
              value={values.city}
              onChange={set("city")}
              error={errors.city}
            />
            <SelectField
              label="Province"
              name="province"
              placeholder="Select your province"
              options={PROVINCES}
              value={values.province}
              onValueChange={(province) => setValues((v) => ({ ...v, province }))}
              error={errors.province}
            />
            <TextAreaField
              label="Order notes (optional)"
              name="notes"
              value={values.notes}
              onChange={set("notes")}
              error={errors.notes}
              hint="A landmark, or the best time to call you."
              className="sm:col-span-2"
            />
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="absolute -left-[9999px] h-px w-px opacity-0"
            />
          </div>
        </section>

        <section aria-labelledby="payment-title" className={`${cardSurface} p-6 sm:p-8`}>
          <h2 id="payment-title" className="font-display text-[1.5rem] font-semibold text-ink">
            Payment method
          </h2>
          {paymentMethods.length > 0 ? (
            <PaymentMethodPicker
              methods={paymentMethods}
              value={methodId}
              onChange={setMethodId}
              error={errors.paymentMethodId}
            />
          ) : (
            <label className="mt-5 flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-forest-600 bg-forest-600/[0.05] p-4">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked
                readOnly
                className="size-5 accent-forest-600"
              />
              <span className="feature-medal grid size-11 shrink-0 place-items-center rounded-full">
                <Banknote aria-hidden="true" className="size-5" strokeWidth={1.7} />
              </span>
              <span>
                <span className="block font-semibold text-forest-900">Cash on Delivery</span>
                <span className="block text-[0.85rem] text-ink-muted">
                  Pay in cash when your order arrives.
                </span>
              </span>
            </label>
          )}
          <TrustBar className="mt-5" />
        </section>
      </div>

      <section aria-labelledby="order-title" className={`${cardSurface} p-6 sm:p-7 lg:sticky lg:top-28`}>
        <h2 id="order-title" className="font-display text-[1.5rem] font-semibold text-ink">
          Order summary
        </h2>
        <ul className="mt-5 divide-y divide-forest-900/10">
          {items.map(({ product, quantity, lineTotal }) => (
            <li key={product.id} className="flex items-center gap-4 py-3.5">
              <span className="relative block h-16 w-12 shrink-0 rounded-xl bg-cream-100">
                <Image src={product.image.src} alt="" fill sizes="48px" className="object-contain p-1.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.95rem] leading-snug font-medium text-forest-900">
                  {product.name}
                </span>
                <span className="block text-[0.82rem] text-ink-muted">
                  {product.variantLabel} · {quantity} × {formatPrice(product.salePrice)}
                </span>
              </span>
              <span className="font-semibold tabular-nums">{formatPrice(lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-3 border-t border-forest-900/10 pt-4 text-[0.95rem]">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Subtotal</dt>
            <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Delivery</dt>
            <dd className="text-right tabular-nums">
              {!live ? (
                <span className="text-ink-muted">Confirmed by our team</span>
              ) : quote ? (
                quote.delivery === 0 ? (
                  <span className="font-medium text-forest-700">Free</span>
                ) : (
                  formatPrice(quote.delivery)
                )
              ) : (
                <span className="text-ink-muted">
                  {quoteFailed ? "Confirmed by our team" : "Calculating…"}
                </span>
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Payment</dt>
            <dd className="text-right font-medium text-forest-900">{payLabel}</dd>
          </div>
          {live && quote && (
            <div className="flex justify-between gap-4 border-t border-forest-900/10 pt-3 text-[1.05rem] font-semibold text-forest-900">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(quote.total)}</dd>
            </div>
          )}
        </dl>
        {live && quote?.freeDelivery && !quote.freeDelivery.qualifies && (
          <p className="mt-3 rounded-xl bg-lime-300/25 px-3.5 py-2.5 text-[0.84rem] text-forest-900">
            Add {formatPrice(quote.freeDelivery.amountRemaining)} more for free delivery.
          </p>
        )}
        {problems.length > 0 && (
          <Notice tone="error" role="alert" className="mt-4">
            {problems.map((p) => `${p.name}: ${p.problem ?? "no longer available"}`).join(" ")} Please update
            your cart.
          </Notice>
        )}
        {!live && (
          <p className="mt-3 text-[0.82rem] leading-relaxed text-ink-muted">
            Delivery charges may vary depending on your location and order size. Our team will call you to
            confirm your order and the final payable amount before dispatch.
          </p>
        )}
        {live && !signedIn && (
          <p className="mt-3 text-[0.84rem] text-ink-muted">
            Have an account?{" "}
            <a
              href="/login?next=/checkout"
              className="font-semibold text-forest-700 underline underline-offset-4"
            >
              Log in
            </a>{" "}
            to follow this order in My Orders.
          </p>
        )}

        {formError && (
          <Notice tone="error" role="alert" className="mt-5">
            {formError}
          </Notice>
        )}
        <button
          type="submit"
          disabled={pending || blocked || (live && quoting)}
          className={buttonClasses({ className: "mt-5 w-full disabled:opacity-60" })}
        >
          {pending ? "Placing your order…" : `Place Order · ${payLabel}`}
        </button>
        <a
          href={help}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 text-[0.9rem] font-medium text-forest-700 hover:text-forest-600"
        >
          <MessageCircle aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
          <span className="underline decoration-forest-600/30 underline-offset-4">
            Need help? Contact our customer support team on WhatsApp.
          </span>
        </a>
      </section>
    </form>
  );
}

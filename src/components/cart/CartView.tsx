"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, Trash2 } from "lucide-react";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { ButtonLink } from "@/components/ui/Button";
import { TrustBar } from "@/components/ui/TrustBar";
import { cardSurface } from "@/components/ui/surface";
import { trackViewCart } from "@/lib/analytics";
import { cartSubtotal, pricedLines } from "@/lib/cart";
import type { CatalogItem } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";
import { useCart } from "./CartProvider";
import { useCartQuote } from "./useCartQuote";

export function CartView({ catalogue, live = false }: { catalogue: CatalogItem[]; live?: boolean }) {
  const { lines, ready, setQuantity, remove } = useCart();
  const items = pricedLines(lines, catalogue);
  const subtotal = cartSubtotal(items);
  const { quote } = useCartQuote(
    items.map(({ product, quantity }) => ({ variantId: product.id, quantity })),
    live,
  );

  const viewed = useRef(false);
  useEffect(() => {
    if (!ready || viewed.current || items.length === 0) return;
    viewed.current = true;
    trackViewCart(
      items.map(({ product, quantity }) => ({
        id: product.productId,
        name: product.name,
        price: product.salePrice,
        variant: product.variantLabel,
        quantity,
      })),
    );
  }, [ready, items]);

  if (!ready) {
    return (
      <p role="status" className="py-16 text-center text-ink-muted">
        Loading your cart…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${cardSurface} mx-auto max-w-xl px-6 py-14 text-center`}>
        <h2 className="font-display text-[1.8rem] font-semibold text-ink">Your cart is empty</h2>
        <p className="mx-auto mt-3 max-w-sm text-ink-muted">
          Explore the collection and add your hair oils here.
        </p>
        <ButtonLink href="/shop" className="mt-7">
          Continue Shopping <ArrowRight aria-hidden="true" className="size-4" />
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.45fr_0.9fr] lg:gap-8">
      <ul
        aria-label="Products in your cart"
        className={`${cardSurface} divide-y divide-forest-900/10 px-5 sm:px-7`}
      >
        {items.map(({ product, quantity, lineTotal }) => (
          <li
            key={product.id}
            className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-x-6"
          >
            <Link
              href={product.href}
              prefetch={false}
              aria-hidden="true"
              tabIndex={-1}
              className="relative row-span-2 block h-28 w-20 rounded-2xl bg-cream-100 sm:row-span-1 sm:h-32 sm:w-24"
            >
              <Image src={product.image.src} alt="" fill sizes="80px" className="object-contain p-1.5" />
            </Link>
            <div className="min-w-0">
              <h2 className="font-display text-[1.15rem] leading-snug font-semibold text-ink">
                <Link href={product.href} prefetch={false} className="hover:text-forest-600">
                  {product.name}
                </Link>
              </h2>
              <p className="mt-1 text-[0.85rem] text-ink-muted">
                {product.variantLabel} · Sale Price {formatPrice(product.salePrice)}
              </p>
            </div>
            <div className="col-start-2 flex flex-wrap items-center justify-between gap-3 sm:col-start-3 sm:flex-col sm:items-end">
              <p className="order-2 text-[1.05rem] font-semibold text-forest-900 tabular-nums sm:order-1">
                {formatPrice(lineTotal)}
              </p>
              <div className="order-1 flex items-center gap-2 sm:order-2">
                <QuantityStepper
                  size="sm"
                  label={product.name}
                  value={quantity}
                  onChange={(q) => setQuantity(product.id, q)}
                />
                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  aria-label={`Remove ${product.name} from cart`}
                  className="grid size-10 place-items-center rounded-full text-ink-muted transition-colors duration-(--dur-fast) hover:bg-[#b3261e]/8 hover:text-[#b3261e]"
                >
                  <Trash2 aria-hidden="true" className="size-[18px]" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <section aria-labelledby="summary-title" className={`${cardSurface} p-6 sm:p-7 lg:sticky lg:top-28`}>
        <h2 id="summary-title" className="font-display text-[1.5rem] font-semibold text-ink">
          Order summary
        </h2>
        <dl className="mt-5 space-y-3 text-[0.95rem]">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Subtotal</dt>
            <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Delivery</dt>
            <dd className="text-right tabular-nums">
              {quote ? (
                quote.delivery === 0 ? (
                  <span className="font-medium text-forest-700">Free</span>
                ) : (
                  formatPrice(quote.delivery)
                )
              ) : (
                <span className="text-ink-muted">{live ? "Calculating…" : "Displayed during checkout"}</span>
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-forest-900/10 pt-4 text-[1.1rem] font-semibold text-forest-900">
            <dt>Order total</dt>
            <dd className="tabular-nums" aria-live="polite">
              {formatPrice(quote ? quote.total : subtotal)}
            </dd>
          </div>
        </dl>
        {quote?.freeDelivery ? (
          quote.freeDelivery.qualifies ? (
            <p className="mt-3 rounded-xl bg-forest-600/[0.07] px-3.5 py-2.5 text-[0.84rem] font-medium text-forest-800">
              Your order qualifies for free delivery.
            </p>
          ) : (
            <div className="mt-3 rounded-xl bg-lime-300/25 px-3.5 py-2.5 text-[0.84rem] text-forest-900">
              Add <strong>{formatPrice(quote.freeDelivery.amountRemaining)}</strong> more for free delivery.
              <span
                aria-hidden="true"
                className="mt-2 block h-1.5 overflow-hidden rounded-full bg-forest-900/10"
              >
                <span
                  className="block h-full rounded-full bg-forest-600"
                  style={{
                    width: `${Math.min(100, Math.round((quote.subtotal / quote.freeDelivery.threshold) * 100))}%`,
                  }}
                />
              </span>
            </div>
          )
        ) : (
          !live && (
            <p className="mt-3 text-[0.82rem] leading-relaxed text-ink-muted">
              Shipping charges are calculated separately and displayed during checkout.
            </p>
          )
        )}
        <ButtonLink href="/checkout" className="mt-6 w-full">
          Proceed to Checkout <ArrowRight aria-hidden="true" className="size-4" />
        </ButtonLink>
        <ButtonLink href="/shop" variant="outline-dark" className="mt-3 w-full">
          Continue Shopping
        </ButtonLink>
        <TrustBar className="mt-6 grid-cols-1" />
      </section>
    </div>
  );
}

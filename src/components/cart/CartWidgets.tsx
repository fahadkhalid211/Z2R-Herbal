"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, ShoppingCart, Zap } from "lucide-react";
import clsx from "clsx";
import { startRouteLoader } from "@/components/layout/RouteLoader";
import { buttonClasses } from "@/components/ui/Button";
import { type CartItem, useCart } from "./CartProvider";

export function BuyNowButton({
  item,
  quantity = 1,
  onDark = false,
  className,
}: {
  item: CartItem;
  quantity?: number;
  onDark?: boolean;
  className?: string;
}) {
  const { add } = useCart();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Buy Now: ${item.name}`}
      disabled={pending}
      onClick={() => {
        setPending(true);
        add(item, quantity);
        startRouteLoader();
        router.push("/checkout");
      }}
      className={buttonClasses({
        variant: onDark ? "primary" : "dark",
        size: "sm",
        className: clsx("depth-text min-w-[7rem] disabled:opacity-70", className),
      })}
    >
      <Zap aria-hidden="true" className="size-3.5" /> Buy Now
    </button>
  );
}

const TOAST_MS = 2600;

export function CartLink({ className }: { className?: string }) {
  const { count, addedTick } = useCart();
  return (
    <Link
      href="/cart"
      prefetch={false}
      aria-label={`Cart, ${count} items`}
      className={clsx(className, "relative")}
    >
      <ShoppingCart className="nav-icon" strokeWidth={1.7} />
      <span
        key={addedTick}
        data-bump={addedTick > 0}
        className="cart-badge absolute top-0.5 right-0 grid size-[18px] place-items-center rounded-full bg-lime-400 text-[0.65rem] font-semibold text-forest-900"
      >
        {count}
      </span>
    </Link>
  );
}

export function AddToCartButton({
  item,
  featured,
  onDark,
  quantity = 1,
  size = "sm",
  className = "mt-3",
}: {
  item: CartItem;
  quantity?: number;
  size?: "sm" | "md";
  featured?: boolean;
  onDark?: boolean;
  className?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <button
      type="button"
      aria-label={`Add to Cart: ${item.name}`}
      onClick={() => {
        add(item, quantity);
        setAdded(true);
      }}
      className={buttonClasses({
        variant: featured ? "primary" : onDark ? "ghost-light" : "outline-dark",
        size,
        className: clsx("depth-text min-w-[7.5rem]", className),
      })}
    >
      {added ? (
        <>
          <Check aria-hidden="true" className="size-3.5" /> Added
        </>
      ) : (
        <>
          <ShoppingCart aria-hidden="true" className="size-3.5" /> Add to Cart
        </>
      )}
    </button>
  );
}

export function CartToast() {
  const { addedTick, lastAdded } = useCart();
  const [dismissedTick, setDismissedTick] = useState(0);
  const open = addedTick > dismissedTick;

  useEffect(() => {
    if (addedTick === 0) return;
    const timer = setTimeout(() => setDismissedTick(addedTick), TOAST_MS);
    return () => clearTimeout(timer);
  }, [addedTick]);

  return (
    <div
      role="status"
      data-open={open}
      className="cart-toast fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-cream-50/10 bg-forest-900 py-2.5 pr-5 pl-2.5 text-cream-50 shadow-float sm:bottom-6 sm:left-6 sm:translate-x-0"
    >
      {lastAdded && (
        <>
          <Image
            src={lastAdded.image.src}
            width={lastAdded.image.width}
            height={lastAdded.image.height}
            alt=""
            sizes="40px"
            className="h-12 w-auto"
          />
          <p className="text-sm">
            <span className="block font-semibold">Added to cart</span>
            <span className="text-cream-50/75">{lastAdded.name}</span>
          </p>
        </>
      )}
    </div>
  );
}

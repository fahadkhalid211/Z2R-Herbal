"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { type CartItem } from "@/components/cart/CartProvider";
import { AddToCartButton, BuyNowButton } from "@/components/cart/CartWidgets";
import { formatPrice } from "@/lib/money";

export function StickyBuyBar({ item, price, watchId }: { item: CartItem; price: number; watchId: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const target = document.getElementById(watchId);
    if (!target) return;
    const io = new IntersectionObserver(([entry]) => {
      const past = !entry?.isIntersecting && (entry?.boundingClientRect.top ?? 0) < 0;
      setShown(past);
      document.documentElement.toggleAttribute("data-buybar", past);
    });
    io.observe(target);
    return () => {
      io.disconnect();
      document.documentElement.removeAttribute("data-buybar");
    };
  }, [watchId]);

  return (
    <div
      data-shown={shown}
      aria-hidden={!shown}
      className="buy-bar fixed inset-x-0 bottom-0 z-40 lg:hidden"
      inert={!shown}
    >
      <div className="flex items-center gap-3 border-t border-cream-200 bg-cream-50/95 px-4 py-3 shadow-[0_-18px_40px_-24px_rgb(1_35_19/0.5)] backdrop-blur">
        <span className="relative h-12 w-9 shrink-0">
          <Image src={item.image.src} alt="" fill sizes="36px" className="object-contain" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.88rem] font-semibold text-forest-900">{item.name}</span>
          <span className="block text-[0.85rem] font-semibold text-forest-700 tabular-nums">
            {formatPrice(price)}
          </span>
        </span>
        <AddToCartButton item={item} featured className="h-11 min-w-0 px-3.5 text-[0.8rem]" />
        <BuyNowButton item={item} className="h-11 min-w-0 px-3.5 text-[0.8rem]" />
      </div>
    </div>
  );
}

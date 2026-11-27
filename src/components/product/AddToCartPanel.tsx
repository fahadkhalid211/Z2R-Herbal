"use client";

import { useState } from "react";
import { type CartItem } from "@/components/cart/CartProvider";
import { AddToCartButton, BuyNowButton } from "@/components/cart/CartWidgets";
import { WishlistButton } from "@/components/cart/Wishlist";
import { QuantityStepper } from "./QuantityStepper";

export function AddToCartPanel({ item }: { item: CartItem }) {
  const [quantity, setQuantity] = useState(1);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <QuantityStepper value={quantity} onChange={setQuantity} label={item.name} />
      <AddToCartButton item={item} quantity={quantity} featured size="md" className="h-12 px-7" />
      <BuyNowButton item={item} quantity={quantity} className="h-12 px-7 text-[0.95rem]" />
      <WishlistButton id={item.id} name={item.name} className="size-12 border border-cream-200" />
    </div>
  );
}

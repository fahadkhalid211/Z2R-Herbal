"use client";

import { createContext, useContext, useState } from "react";
import clsx from "clsx";
import type { CartItem } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/money";
import type { Variant } from "@/services/types";
import { AddToCartPanel } from "./AddToCartPanel";
import { ProductPrice } from "./ProductPrice";
import { StickyBuyBar } from "./StickyBuyBar";

type SizeOption = Pick<Variant, "id" | "label" | "price" | "isDefault" | "compareAtPrice" | "stock">;

interface Selection {
  variants: SizeOption[];
  selected: SizeOption;
  select: (id: string) => void;
}

const SelectionContext = createContext<Selection | null>(null);

function useSelection(): Selection {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("Wrap the product in <VariantProvider>");
  return ctx;
}

export function VariantProvider({
  variants,
  children,
}: {
  variants: SizeOption[];
  children: React.ReactNode;
}) {
  const [selectedId, select] = useState(() => (variants.find((v) => v.isDefault) ?? variants[0])?.id);
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  if (!selected) return children;
  return (
    <SelectionContext.Provider value={{ variants, selected, select }}>{children}</SelectionContext.Provider>
  );
}

export function SelectedPrice(props: Omit<React.ComponentProps<typeof ProductPrice>, "amount">) {
  const { selected } = useSelection();
  return <ProductPrice amount={selected.price} compareAt={selected.compareAtPrice} {...props} />;
}

export function SizeSelector({ className }: { className?: string }) {
  const { variants, selected, select } = useSelection();
  if (variants.length < 2) return null;
  return (
    <fieldset className={className}>
      <legend className="text-[0.8rem] font-semibold tracking-[0.14em] text-olive-600 uppercase">Size</legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {variants.map((v) => (
          <label
            key={v.id}
            className={clsx(
              "flex h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-[0.9rem] font-medium transition-colors duration-(--dur-fast) has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest-600",
              v.id === selected.id
                ? "border-forest-700 bg-forest-700 text-cream-50"
                : "border-forest-600/20 bg-white text-forest-900 hover:border-forest-600/50",
            )}
          >
            <input
              type="radio"
              name="size"
              value={v.id}
              checked={v.id === selected.id}
              onChange={() => select(v.id)}
              className="sr-only"
            />
            {v.label}
            <span className="tabular-nums opacity-75">{formatPrice(v.price)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function SelectedAddToCartPanel({ item }: { item: Omit<CartItem, "variantId"> }) {
  const { selected } = useSelection();
  return (
    <AddToCartPanel
      item={{ ...item, variantId: selected.id, price: selected.price, variantLabel: selected.label }}
    />
  );
}

export function SelectedStickyBuyBar({
  item,
  watchId,
}: {
  item: Omit<CartItem, "variantId">;
  watchId: string;
}) {
  const { selected } = useSelection();
  return (
    <StickyBuyBar
      item={{ ...item, variantId: selected.id, price: selected.price, variantLabel: selected.label }}
      price={selected.price}
      watchId={watchId}
    />
  );
}

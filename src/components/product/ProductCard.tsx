import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { AddToCartButton, BuyNowButton } from "@/components/cart/CartWidgets";
import { WishlistButton } from "@/components/cart/Wishlist";
import { cardPrice, toCartItem } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { cssVars } from "@/lib/css-vars";
import type { Ingredient, Product } from "@/services/types";
import { BlendStrip } from "./BlendStrip";
import { ProductPrice } from "./ProductPrice";
import { Stars } from "./Stars";
import { TiltCard } from "./TiltCard";

interface ProductCardProps {
  product: Product;
  ingredient?: Ingredient;
  added?: Ingredient[];
  blend?: { oils: Ingredient[]; herbs: Ingredient[] };
  variant?: "feature" | "standard";
}

function ProductImageSwap({
  product,
  sizes,
  bottleSizes,
  fit = "contain",
}: {
  product: Product;
  sizes: string;
  bottleSizes: string;
  fit?: "contain" | "cover";
}) {
  return (
    <>
      <span aria-hidden="true" className="card-glow absolute inset-[12%] rounded-full" />
      <span
        aria-hidden="true"
        className="swap-shadow absolute inset-x-[22%] bottom-[3.5%] h-[7%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(1_35_19/0.32),transparent)]"
      />
      <Image
        src={product.images.card.src}
        alt={product.images.card.alt}
        fill
        sizes={sizes}
        className={cn("swap-pack p-[6%]", fit === "cover" ? "object-cover" : "object-contain")}
      />
      <Image
        src={product.images.bottle.src}
        alt=""
        fill
        sizes={bottleSizes}
        className="swap-bottle object-contain p-[8%]"
      />
    </>
  );
}

export function ProductCard({
  product,
  ingredient,
  added = [],
  blend,
  variant = "standard",
}: ProductCardProps) {
  const best = product.isBestseller;
  const cartItem = toCartItem(product);
  const price = cardPrice(product);

  if (variant === "feature") {
    return (
      <TiltCard
        className="product-card relative flex h-full flex-col overflow-hidden rounded-[28px] border border-forest-600 bg-forest-800 bg-[radial-gradient(80%_90%_at_80%_40%,#1d5528_0%,transparent_65%)] text-cream-50 shadow-float [--card-r:28px]"
        style={cssVars({ "--glow": product.accent.glow })}
      >
        {best && <span aria-hidden="true" className="bestseller-border" />}
        <div className="depth-top absolute top-5 right-5 z-10">
          <WishlistButton id={product.id} name={product.name} />
        </div>
        <Link
          href={product.href}
          prefetch={false}
          className="group grid flex-1 rounded-[26px] sm:grid-cols-[1fr_1.1fr] sm:items-center"
        >
          <div className="product-swap depth-image relative order-1 aspect-[5/4] sm:order-2 sm:aspect-auto sm:h-full sm:min-h-[24rem]">
            <span
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 aspect-square h-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold-300/35 shadow-[0_0_40px_-6px_rgb(217_180_74/0.35)]"
            />
            <ProductImageSwap
              product={product}
              sizes="(min-width: 1280px) 340px, (min-width: 1024px) 26vw, (min-width: 640px) 46vw, 90vw"
              bottleSizes="(min-width: 1024px) 140px, 30vw"
            />
          </div>
          <div
            className={cn(
              "depth-text order-2 px-6 pt-1 sm:order-1 sm:py-10 sm:pr-2 sm:pl-8",
              blend ? "pb-5 sm:pb-4" : "pb-24 sm:pb-28",
            )}
          >
            {best && (
              <p className="inline-flex items-center gap-1 rounded-full bg-lime-400 px-3 py-1 text-xs font-semibold text-forest-900 shadow">
                <Star aria-hidden="true" className="size-3 fill-current" />
                Bestseller
              </p>
            )}
            <h3 className="mt-4 font-display text-[2.3rem] leading-[0.95] font-bold italic sm:text-[2.6rem] lg:text-[3rem]">
              {product.shortName}
              <span className="block text-lime-300">Hair Oil</span>
            </h3>
            {product.rating && (
              <p className="mt-3 flex items-center gap-2 text-sm text-cream-50/80">
                <Stars value={product.rating.average} size={15} />
                {product.rating.average.toFixed(1)} ({product.rating.count})
              </p>
            )}
            <p
              className={cn(
                "mt-4 max-w-sm text-[0.92rem] leading-relaxed text-cream-50/80",
                !blend && "line-clamp-3",
              )}
            >
              {product.heroCopy}
            </p>
            <p className="mt-3 text-xs font-semibold tracking-wide text-gold-300">{price.sizeLabel}</p>
            <ProductPrice
              amount={price.amount}
              compareAt={price.from ? undefined : product.price}
              from={price.from}
              tone="dark"
              size="lg"
              className="mt-4"
            />
          </div>
        </Link>
        {blend ? (
          <div className="depth-text relative z-10 flex flex-col-reverse items-start gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:pb-8">
            <div className="flex flex-wrap gap-2.5">
              <AddToCartButton featured className="h-11 px-6 text-sm" item={cartItem} />
              <BuyNowButton
                onDark
                className="h-11 border border-lime-300/60 bg-transparent px-6 text-sm text-lime-300 shadow-none hover:bg-lime-300 hover:text-forest-900"
                item={cartItem}
              />
            </div>
            <BlendStrip oils={blend.oils} herbs={blend.herbs} />
          </div>
        ) : (
          <div className="absolute bottom-6 left-6 z-10 flex flex-wrap gap-2.5 sm:bottom-8 sm:left-8">
            <AddToCartButton featured className="h-11 px-6 text-sm" item={cartItem} />
            <BuyNowButton
              onDark
              className="h-11 border border-lime-300/60 bg-transparent px-6 text-sm text-lime-300 shadow-none hover:bg-lime-300 hover:text-forest-900"
              item={cartItem}
            />
          </div>
        )}
      </TiltCard>
    );
  }

  return (
    <TiltCard
      className={cn(
        "product-card relative flex h-full flex-col rounded-[22px] border p-3 [--card-r:22px] sm:p-4 lg:p-5",
        best
          ? "border-forest-600 bg-gradient-to-b from-forest-600 to-forest-900 text-cream-50 shadow-float"
          : "border-cream-200 bg-gradient-to-b from-white to-cream-100 text-ink shadow-[0_14px_40px_-26px_rgb(1_35_19/0.45)] hover:border-forest-600/25",
      )}
      style={cssVars({ "--glow": product.accent.glow })}
    >
      {best && <span aria-hidden="true" className="bestseller-border" />}
      <div className="depth-top absolute inset-x-3 top-3 z-10 flex items-start justify-between sm:inset-x-4 sm:top-4">
        {product.isNew ? (
          <p className="rounded-full bg-forest-600 px-3 py-1 text-xs font-semibold text-cream-50">New</p>
        ) : (
          <span />
        )}
        <WishlistButton id={product.id} name={product.name} />
      </div>

      <Link href={product.href} prefetch={false} className="group flex flex-1 flex-col rounded-[16px]">
        <div className="product-swap depth-image relative aspect-[4/5] w-full shrink-0">
          <ProductImageSwap
            product={product}
            fit="cover"
            sizes="(min-width: 1280px) 250px, (min-width: 1024px) 20vw, 46vw"
            bottleSizes="(min-width: 1024px) 110px, 22vw"
          />
        </div>
        <div className="mt-3 flex flex-1 flex-col">
          {ingredient && <IngredientLine items={[ingredient, ...added]} dark={best} />}
          <h3 className="depth-text mt-2 font-display text-[1.02rem] leading-snug font-semibold sm:text-[1.15rem]">
            {product.name}
          </h3>
          {product.rating && (
            <p className="depth-text mt-1 flex items-center gap-1.5 text-xs">
              <Stars value={product.rating.average} size={13} />
              <span className={best ? "text-cream-50/75" : "text-ink-muted"}>({product.rating.count})</span>
            </p>
          )}
          <p
            className={cn(
              "depth-text mt-1 text-xs sm:text-[0.82rem]",
              best ? "text-cream-50/75" : "text-ink-muted",
            )}
          >
            {product.sizeLabel}
          </p>
          <ProductPrice
            amount={price.amount}
            compareAt={price.from ? undefined : product.price}
            from={price.from}
            tone={best ? "dark" : "light"}
            layout="card"
            className="depth-text mt-auto pt-3"
          />
        </div>
      </Link>
      <div className="@container mt-4">
        <div className="grid grid-cols-1 gap-2 @[15.5rem]:grid-cols-2">
          <AddToCartButton
            featured={best}
            className="mt-0 h-10 w-full min-w-0 px-2 text-[0.78rem] lg:h-9"
            item={cartItem}
          />
          <BuyNowButton
            onDark={best}
            className="h-10 w-full min-w-0 px-2 text-[0.78rem] lg:h-9"
            item={cartItem}
          />
        </div>
      </div>
    </TiltCard>
  );
}

function IngredientLine({ items, dark }: { items: Ingredient[]; dark: boolean }) {
  return (
    <p className="depth-text flex min-w-0 items-center gap-2">
      <span aria-hidden="true" className="flex shrink-0">
        {items.map((item, i) => (
          <span
            key={item.id}
            className={cn(
              "relative size-7 overflow-hidden rounded-full border-2 bg-white shadow-[0_4px_10px_-4px_rgb(1_35_19/0.5)]",
              dark ? "border-forest-700" : "border-white",
              i > 0 && "-ml-2",
            )}
            style={{ zIndex: 10 - i }}
          >
            <Image src={item.image.src} alt="" fill sizes="28px" className="object-cover" />
          </span>
        ))}
      </span>
      <span
        className={cn(
          "truncate text-[0.66rem] font-semibold tracking-[0.12em] uppercase",
          dark ? "text-lime-300" : "text-olive-600",
        )}
        title={items.map((i) => i.name).join(" + ")}
      >
        {items.map((i) => i.name).join(" + ")}
      </span>
    </p>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trash2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { cardSurface } from "@/components/ui/surface";
import type { CatalogItem } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";
import { AddToCartButton } from "./CartWidgets";
import { useWishlist } from "./Wishlist";

export function WishlistView({ catalogue }: { catalogue: CatalogItem[] }) {
  const { ids, ready, toggle } = useWishlist();
  const saved = ids.flatMap((id) => catalogue.filter((p) => p.productId === id && p.isDefault));

  if (!ready) {
    return (
      <p role="status" className="py-16 text-center text-ink-muted">
        Loading your wishlist…
      </p>
    );
  }

  if (saved.length === 0) {
    return (
      <div className={`${cardSurface} mx-auto max-w-xl px-6 py-14 text-center`}>
        <h2 className="font-display text-[1.8rem] font-semibold text-ink">Your wishlist is empty</h2>
        <p className="mx-auto mt-3 max-w-sm text-ink-muted">Tap the heart on any hair oil to save it here.</p>
        <ButtonLink href="/shop" className="mt-7">
          Shop the Collection <ArrowRight aria-hidden="true" className="size-4" />
        </ButtonLink>
      </div>
    );
  }

  return (
    <ul
      aria-label="Saved products"
      className={`${cardSurface} mx-auto max-w-3xl divide-y divide-forest-900/10 px-5 sm:px-7`}
    >
      {saved.map((product) => (
        <li key={product.productId} className="flex flex-wrap items-center gap-4 py-5 sm:gap-6">
          <Link
            href={product.href}
            prefetch={false}
            aria-hidden="true"
            tabIndex={-1}
            className="relative block h-28 w-20 shrink-0 rounded-2xl bg-cream-100"
          >
            <Image src={product.image.src} alt="" fill sizes="80px" className="object-contain p-1.5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[1.15rem] leading-snug font-semibold text-ink">
              <Link href={product.href} prefetch={false} className="hover:text-forest-600">
                {product.name}
              </Link>
            </h2>
            <p className="mt-1 text-[0.85rem] text-ink-muted">
              {product.variantLabel} · Sale Price {formatPrice(product.salePrice)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AddToCartButton
              item={{
                id: product.productId,
                variantId: product.id,
                name: product.name,
                image: product.image,
              }}
              className="h-10 px-4 text-[0.8rem]"
            />
            <button
              type="button"
              onClick={() => toggle(product.productId)}
              aria-label={`Remove ${product.name} from wishlist`}
              className="grid size-10 place-items-center rounded-full text-ink-muted transition-colors duration-(--dur-fast) hover:bg-[#b3261e]/8 hover:text-[#b3261e]"
            >
              <Trash2 aria-hidden="true" className="size-[18px]" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

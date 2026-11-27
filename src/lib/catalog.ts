import type { ImageAsset, Ingredient, Product, Variant } from "@/services/types";

export interface CatalogItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  variantLabel: string;
  sku: string;
  isDefault: boolean;
  href: string;
  salePrice: number;
  image: ImageAsset;
}

export const defaultVariant = (p: Product): Variant => p.variants.find((v) => v.isDefault) ?? p.variants[0]!;

export const toCatalogItems = (p: Product): CatalogItem[] =>
  p.variants.map((v) => {
    const own = p.media.find((m) => m.variantId === v.id && (m.role === "bottle" || m.role === "pack"));
    return {
      id: v.id,
      productId: p.id,
      slug: p.slug,
      name: p.name,
      variantLabel: v.label,
      sku: v.sku,
      isDefault: v.isDefault,
      href: p.href,
      salePrice: v.price,
      image: own ? { src: own.src, alt: own.alt, width: own.width, height: own.height } : p.images.bottle,
    };
  });

export const toCartItem = (p: Product, variant: Variant = defaultVariant(p)) => ({
  id: p.id,
  variantId: variant.id,
  name: p.name,
  image: p.images.bottle,
});

export function cardPrice(p: Product): { amount: number; from: boolean; sizeLabel: string } {
  const prices = p.variants.map((v) => v.price);
  const amount = prices.length > 0 ? Math.min(...prices) : p.salePrice;
  const from = new Set(prices).size > 1;
  const sizeLabel = p.variants.length > 1 ? `${p.variants.length} sizes` : p.sizeLabel;
  return { amount, from, sizeLabel };
}

export const defaultVariantMap = (products: Product[]): Record<string, string> =>
  Object.fromEntries(products.map((p) => [p.id, defaultVariant(p).id]));

export const byShopOrder = (products: Product[]): Product[] =>
  [...products].sort((a, b) => a.shopOrder - b.shopOrder);

export function productIngredients(product: Product, ingredients: Ingredient[] = []) {
  const byRole = (role: Product["ingredients"][number]["role"]) =>
    product.ingredients.filter((l) => l.role === role).map((l) => l.ingredient);
  const bySlug = (slugs: string[] = []) =>
    slugs.flatMap((slug) => ingredients.filter((i) => i.slug === slug));
  const linked = product.ingredients.length > 0;
  const oils = linked ? byRole("blend-oil") : bySlug(product.blend?.oils);
  const herbs = linked ? byRole("blend-herb") : bySlug(product.blend?.herbs);
  return {
    ingredient: linked ? byRole("main")[0] : ingredients.find((i) => i.slug === product.ingredient),
    added: linked ? byRole("added") : bySlug(product.addedIngredients),
    blend: oils.length + herbs.length > 0 ? { oils, herbs } : undefined,
  };
}

export const listingTags = (product: Product): string =>
  [
    ...product.collections.map((slug) => `collection:${slug}`),
    ...product.ingredients.map((l) => `ingredient:${l.ingredient.slug}`),
    `category:${product.category}`,
  ].join(" ");

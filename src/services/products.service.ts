import type { DataSource } from "./adapters/types";
import { ServiceError } from "./errors";
import { parseOrThrow } from "./parse";
import { productListSchema } from "./schemas";
import type { PricedVariant, Product } from "./types";

export function toHeroSlides(products: Product[]): Product[] {
  return products
    .filter((p): p is Product & { heroOrder: number } => p.heroOrder !== null)
    .sort((a, b) => a.heroOrder - b.heroOrder);
}

export function pickFeatured(products: Product[]): Product | undefined {
  return (
    products.find((p) => p.featured) ?? products.find((p) => p.isBestseller) ?? toHeroSlides(products)[0]
  );
}

export function toPricedVariants(products: Product[]): PricedVariant[] {
  return products.flatMap((p) =>
    p.variants.map((v) => ({
      id: v.id,
      productId: p.id,
      name: p.name,
      sku: v.sku,
      label: v.label,
      price: v.price,
      isDefault: v.isDefault,
    })),
  );
}

export function createProductService(source: DataSource) {
  async function list(): Promise<Product[]> {
    const products = parseOrThrow(productListSchema, await source.products(), "products");
    return products.sort((a, b) => a.cardOrder - b.cardOrder);
  }

  async function heroSlides(): Promise<Product[]> {
    if (!source.heroProducts) return toHeroSlides(await list());
    return toHeroSlides(parseOrThrow(productListSchema, await source.heroProducts(), "hero products"));
  }

  async function featured(): Promise<Product | undefined> {
    return pickFeatured(await list());
  }

  async function bySlug(slug: string): Promise<Product> {
    const product = (await list()).find((p) => p.slug === slug);
    if (!product) throw new ServiceError("NOT_FOUND", `No product with slug "${slug}"`);
    return product;
  }

  async function inCategories(slugs: string[]): Promise<Product[]> {
    const wanted = new Set(slugs);
    return (await list()).filter((p) => wanted.has(p.category)).sort((a, b) => a.shopOrder - b.shopOrder);
  }

  async function variants(): Promise<PricedVariant[]> {
    return toPricedVariants(await list());
  }

  return { list, heroSlides, featured, bySlug, inCategories, variants };
}

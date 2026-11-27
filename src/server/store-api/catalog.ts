import { logger } from "@/lib/logger";
import type {
  CatalogRows,
  ImageRow,
  IngredientRow,
  ProductIngredientRow,
  ProductRow,
  VariantRow,
} from "@/services/adapters/catalog/rows";
import { catalogRows as localRows } from "@/services/adapters/mock/data/catalog";
import { publicMediaUrl, storeApi } from "./client";

interface ApiCategory {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}

interface ApiProductCard {
  id: string;
  slug: string;
  name: string;
  signature: boolean;
}

export interface ApiInformation {
  section: string;
  items: { title: string; details: string; imageUrl: string | null }[];
}

interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  signature: { label: string } | null;
  rating?: { average: number; count: number };
  categories: { name: string; slug: string; primary: boolean }[];
  variants: {
    id: string;
    sku: string;
    label: string;
    isDefault: boolean;
    price: string;
    compareAtPrice: string | null;
    stock: { state: "in_stock" | "low_stock" | "out_of_stock" | string; quantity: number | null };
    canBuy: boolean;
  }[];
  images: {
    url: string;
    alt: string | null;
    width: number;
    height: number;
    variantId: string | null;
    isCover: boolean;
  }[];
  information: ApiInformation[];
  seo: { title: string | null; description: string | null } | null;
}

export interface StoreInfo {
  name: string;
  currency: string;
  delivery: { charge: string; freeFrom: string | null; rule: string };
  paymentMethods: { code: string; label: string }[];
  cancelPolicy: string | null;
}

export interface StoreSnapshot {
  fetchedAt: number;
  info: StoreInfo;
  categories: ApiCategory[];
  products: ApiProduct[];
}

const FRESH_MS = 5 * 60_000;
const RETRY_AFTER_FAILURE_MS = 60_000;
const DETAIL_CONCURRENCY = 3;

let snapshot: StoreSnapshot | null = null;
let refreshing: Promise<StoreSnapshot> | null = null;
let lastFailureAt = 0;

async function inBatches<T, R>(items: T[], size: number, run: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size)
    out.push(...(await Promise.all(items.slice(i, i + size).map(run))));
  return out;
}

async function fetchSnapshot(): Promise<StoreSnapshot> {
  const cards: ApiProductCard[] = [];
  for (let page = 1; page <= 20; page++) {
    const { data, meta } = await storeApi<ApiProductCard[]>(`/products?page=${page}&pageSize=100`);
    cards.push(...data);
    if (!meta || page * meta.pageSize >= meta.total || data.length === 0) break;
  }
  const [info, categories, products] = await Promise.all([
    storeApi<StoreInfo>("/info").then((r) => r.data),
    storeApi<ApiCategory[]>("/categories").then((r) => r.data),
    inBatches(cards, DETAIL_CONCURRENCY, (c) =>
      storeApi<ApiProduct>(`/products/${encodeURIComponent(c.slug)}`).then((r) => r.data),
    ),
  ]);
  return { fetchedAt: Date.now(), info, categories, products };
}

function refresh(): Promise<StoreSnapshot> {
  refreshing ??= fetchSnapshot()
    .then((fresh) => {
      snapshot = fresh;
      lastFailureAt = 0;
      return fresh;
    })
    .catch((error: unknown) => {
      lastFailureAt = Date.now();
      if (process.env.NEXT_PHASE === "phase-production-build") throw error;
      logger.error("Store API catalogue refresh failed", { error });
      throw error;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

export async function storeSnapshot(): Promise<StoreSnapshot> {
  if (!snapshot) return refresh();
  const stale = Date.now() - snapshot.fetchedAt > FRESH_MS;
  const mayRetry = Date.now() - lastFailureAt > RETRY_AFTER_FAILURE_MS;
  if (stale && mayRetry && !refreshing) void refresh().catch(() => undefined);
  return snapshot;
}

export function invalidateStoreSnapshot(): void {
  snapshot = null;
}

export async function refreshStoreSnapshot(): Promise<StoreSnapshot> {
  if (refreshing) await refreshing.catch(() => undefined);
  return refresh();
}

const money = (value: string | null | undefined): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = Math.round(Number(value) * 100) / 100;
  return Number.isFinite(n) && n > 0 ? n : null;
};

export function localMatch(apiSlug: string): ProductRow | undefined {
  const slug = `-${apiSlug.toLowerCase()}-`;
  return [...localRows.products]
    .sort((a, b) => b.slug.length - a.slug.length)
    .find((p) => slug.includes(`-${p.slug}-`));
}

const sizeFromInformation = (info: ApiInformation[]): string | undefined =>
  info
    .find((s) => /spec/i.test(s.section))
    ?.items.find((i) => /^size$/i.test(i.title.trim()))
    ?.details.trim() || undefined;

const mlOf = (label: string): number | null => {
  const m = /(\d+(?:\.\d+)?)\s*ml\b/i.exec(label);
  return m ? Math.round(Number(m[1])) : null;
};

export const ingredientItems = (information: ApiInformation[]) =>
  information.find((s) => /ingredient/i.test(s.section))?.items ?? [];

const ingredientKey = (title: string) => title.trim().toLowerCase().replace(/\s+/g, " ");

export const ingredientSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const kindOf = (title: string): "oil" | "herb" => (/\boil$/i.test(title.trim()) ? "oil" : "herb");

const isBlend = (items: unknown[]) => items.length > 2;

function apiIngredientRows(products: ApiProduct[]): IngredientRow[] {
  const rows = new Map<string, IngredientRow>();
  const blendsFirst = [...products].sort(
    (a, b) =>
      Number(isBlend(ingredientItems(b.information))) - Number(isBlend(ingredientItems(a.information))),
  );
  for (const product of blendsFirst) {
    for (const item of ingredientItems(product.information)) {
      const key = ingredientKey(item.title);
      if (!key || rows.has(key)) continue;
      const photo = publicMediaUrl(item.imageUrl);
      if (!photo) {
        logger.warn("Store API ingredient has no picture; it is shown as text only", {
          product: product.slug,
          ingredient: item.title,
        });
        continue;
      }
      const slug = ingredientSlug(item.title);
      rows.set(key, {
        id: `ing_${slug}`,
        slug,
        name: item.title.trim(),
        description: item.details?.trim() ?? "",
        kind: kindOf(item.title),
        photoUrl: photo,
        photoWidth: 600,
        photoHeight: 400,
        cutoutUrl: null,
        cutoutAlt: null,
        cutoutWidth: null,
        cutoutHeight: null,
        sortOrder: rows.size,
        active: true,
      });
    }
  }
  return [...rows.values()];
}

function ingredientLinks(product: ApiProduct, ingredients: IngredientRow[]): ProductIngredientRow[] {
  const byKey = new Map(ingredients.map((i) => [ingredientKey(i.name), i]));
  const items = ingredientItems(product.information);
  const blend = isBlend(items);
  return items.flatMap((item, i) => {
    const ing = byKey.get(ingredientKey(item.title));
    if (!ing) return [];
    return [
      {
        productId: product.id,
        ingredientId: ing.id,
        role: blend ? (ing.kind === "oil" ? "blend-oil" : "blend-herb") : i === 0 ? "main" : "added",
        sortOrder: i,
      },
    ];
  });
}

export function snapshotToRows(
  snap: StoreSnapshot,
): CatalogRows & { information: Map<string, ApiInformation[]> } {
  const categoryIdBySlug = new Map(snap.categories.map((c) => [c.slug, c.id]));
  const firstCategory = snap.categories[0]?.id;
  const information = new Map<string, ApiInformation[]>();

  const products: ProductRow[] = [];
  const variants: VariantRow[] = [];
  const images: ImageRow[] = [];
  const ingredients = apiIngredientRows(snap.products);
  const productIngredients: ProductIngredientRow[] = [];
  const localToApi = new Map<string, string>();

  snap.products.forEach((p, index) => {
    const local = localMatch(p.slug);
    if (local) localToApi.set(local.id, p.id);
    const primary = p.categories.find((c) => c.primary) ?? p.categories[0];
    const categoryId = (primary && categoryIdBySlug.get(primary.slug)) ?? firstCategory;
    if (!categoryId) return;
    information.set(
      p.slug,
      p.information.map((s) => ({
        ...s,
        items: s.items.map((item) => ({ ...item, imageUrl: publicMediaUrl(item.imageUrl) })),
      })),
    );
    const size = sizeFromInformation(p.information);
    const localVariant = local && localRows.variants.find((v) => v.productId === local.id && v.isDefault);

    products.push({
      id: p.id,
      slug: p.slug,
      name: p.name,
      shortName: local?.shortName ?? p.name.replace(/^premium\s+/i, "").replace(/\s+oil.*$/i, ""),
      tagline: local?.tagline ?? "",
      shortDescription: p.shortDescription ?? "",
      longDescription: p.description || null,
      categoryId,
      status: "active",
      featured: Boolean(p.signature),
      isBestseller: Boolean(p.signature) || (local?.isBestseller ?? false),
      rating: p.rating ?? null,
      isNew: false,
      badge: p.signature ? p.signature.label || null : null,
      accentBase: local?.accentBase ?? "#1f6a0c",
      accentGlow: local?.accentGlow ?? "#d9b44a",
      accentInk: local?.accentInk ?? "#012313",
      oilColor: local?.oilColor ?? "#caa53a",
      labelClaims: local?.labelClaims ?? [],
      seoTitle: p.seo?.title || null,
      seoDescription: p.seo?.description || null,
      sortOrder: index,
      shopOrder: index,
      heroOrder: null,
    });

    p.variants.forEach((v, i) => {
      const price = money(v.price);
      if (!price) return;
      const compare = money(v.compareAtPrice);
      const label = /^default$/i.test(v.label.trim()) ? (size ?? localVariant?.label ?? "Standard") : v.label;
      variants.push({
        id: v.id,
        productId: p.id,
        sku: v.sku,
        label,
        volumeMl: mlOf(label),
        price,
        compareAtPrice: compare && compare > price ? compare : null,
        stock: !v.canBuy || v.stock.state === "out_of_stock" ? 0 : (v.stock.quantity ?? null),
        isDefault: v.isDefault,
        sortOrder: i,
        active: true,
      });
    });

    const sorted = [...p.images].sort((a, b) => Number(b.isCover) - Number(a.isCover));
    sorted.forEach((img, i) => {
      const url = publicMediaUrl(img.url);
      if (!url || !img.width || !img.height) return;
      images.push({
        id: `${p.id}-img-${i}`,
        productId: p.id,
        variantId: img.variantId,
        url,
        alt: img.alt || p.name,
        width: img.width,
        height: img.height,
        role: i === 0 ? "pack" : i === 1 ? "bottle" : i === 2 ? "box" : "gallery",
        sortOrder: i,
      });
    });

    productIngredients.push(...ingredientLinks(p, ingredients));
  });

  return {
    categories: snap.categories.map((c, i) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description || null,
      parentId: c.parentId,
      sortOrder: i,
      imageUrl: null,
      imageAlt: null,
      imageWidth: null,
      imageHeight: null,
      seoTitle: null,
      seoDescription: null,
      active: true,
    })),
    collections: localRows.collections,
    productCollections: localRows.productCollections.flatMap((pc) => {
      const productId = localToApi.get(pc.productId);
      return productId ? [{ ...pc, productId }] : [];
    }),
    products,
    variants,
    images,
    ingredients,
    productIngredients,
    information,
  };
}

import { logger } from "@/lib/logger";
import { localMatch, snapshotToRows, storeSnapshot } from "@/server/store-api/catalog";
import { assembleCatalog } from "../catalog/assemble";
import { createMockDataSource } from "../mock";
import type { DataSource } from "../types";

const INGREDIENT_FIELDS = ["ingredients", "ingredient", "addedIngredients", "blend"] as const;
type ProductPayload = { slug: string } & Partial<Record<(typeof INGREDIENT_FIELDS)[number], unknown>>;

export function createStoreApiDataSource(): DataSource {
  const content = createMockDataSource();

  async function catalog() {
    const rows = snapshotToRows(await storeSnapshot());
    const assembled = assembleCatalog(rows);
    const products = (assembled.products as { slug: string }[]).map((p) => ({
      ...p,
      information: rows.information.get(p.slug) ?? [],
    }));
    return { ...assembled, products };
  }

  async function heroProducts() {
    const local = (await content.products()) as ProductPayload[];
    let api: ProductPayload[] = [];
    try {
      api = (await catalog()).products as ProductPayload[];
    } catch (error) {
      logger.warn("Hero shown without ingredient cards: the Store API catalogue is unavailable", { error });
    }
    return local.map((p) => {
      const match = api.find((a) => localMatch(a.slug)?.slug === p.slug);
      const own = Object.fromEntries(INGREDIENT_FIELDS.map((f) => [f, match?.[f]]));
      return { ...p, ...own, ingredients: match?.ingredients ?? [] };
    });
  }

  return {
    ...content,
    products: async () => (await catalog()).products,
    categories: async () => (await catalog()).categories,
    collections: async () => (await catalog()).collections,
    ingredients: async () => (await catalog()).ingredients,
    heroProducts,
  };
}

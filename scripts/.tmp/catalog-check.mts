import { createServices } from "../../src/services";
import { createStoreApiDataSource } from "../../src/services/adapters/store-api";
const s = createServices(createStoreApiDataSource());
const [products, hero, cats, cols] = await Promise.all([s.products.list(), s.products.heroSlides(), s.catalog.categoryRecords(), s.catalog.collections()]);
for (const p of products) console.log([p.slug, p.name, p.salePrice, p.price ?? "-", p.sizeLabel, p.variants.map((v) => v.id + ":" + v.sku).join(","), p.images.card.src.slice(-40), "ing:" + p.ingredients.length, "cols:" + p.collections.join("/"), "info:" + (p.information?.length ?? 0)].join(" | "));
console.log("hero:", hero.map((p) => p.slug).join(","));
console.log("categories:", cats.map((c) => `${c.slug}(${c.productCount})`).join(", "));
console.log("collections:", cols.map((c) => `${c.slug}:${c.productSlugs.length}`).join(", "));

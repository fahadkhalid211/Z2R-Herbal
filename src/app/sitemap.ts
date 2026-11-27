import { connection } from "next/server";
import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/content/blog";
import { ingredientIndexable, isDuplicateCollection } from "@/content/seo-copy";
import { absoluteUrl } from "@/lib/site-url";
import { getServices } from "@/services";
import { subtreeSlugs } from "@/services/catalog.service";
import { storeApiEnabled } from "@/server/store-api/client";

export const revalidate = 3600;

const PAGES = [
  "/shop",
  "/ingredients",
  "/our-story",
  "/blog",
  "/contact",
  "/faqs",
  "/shipping",
  "/returns",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (storeApiEnabled()) await connection();
  const services = getServices();
  const [products, categories, collections, ingredients] = await Promise.all([
    services.products.list(),
    services.catalog.categoryRecords(),
    services.catalog.collections(),
    services.catalog.ingredients(),
  ]);
  const filledCategories = (
    await Promise.all(
      categories.map(async (c) => {
        const full = await services.catalog.category(c.slug).catch(() => null);
        if (!full) return null;
        const items = await services.products.inCategories(subtreeSlugs(full));
        return items.length > 0 && items.length < products.length ? c : null;
      }),
    )
  ).filter((c) => c !== null);

  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    ...PAGES.map((path) => ({ url: absoluteUrl(path), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...filledCategories.map((c) => ({
      url: absoluteUrl(c.href),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...collections
      .filter((c) => c.productSlugs.length > 0 && !isDuplicateCollection(c, collections))
      .map((c) => ({ url: absoluteUrl(c.href), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...products.map((p) => ({
      url: absoluteUrl(p.href),
      changeFrequency: "weekly" as const,
      priority: 0.9,
      images: [p.images.card.src, p.images.bottle.src].map(absoluteUrl),
    })),
    ...ingredients
      .filter((i) => ingredientIndexable(i.name))
      .map((i) => ({
        url: absoluteUrl(`/ingredients/${i.slug}`),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ...BLOG_POSTS.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(`${post.updatedAt}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

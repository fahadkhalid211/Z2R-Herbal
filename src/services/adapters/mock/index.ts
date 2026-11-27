import { ServiceError } from "../../errors";
import { assembleCatalog } from "../catalog/assemble";
import type { DataSource } from "../types";
import { articles } from "./data/articles";
import { catalogRows } from "./data/catalog";
import { benefits, featureStrip, heroFeatures, trustBadges } from "./data/content";
import { activeOffer, siteConfig } from "./data/site";
import { videos } from "./data/videos";

export function createMockDataSource(): DataSource {
  const copy = <T>(value: T): Promise<T> => Promise.resolve(structuredClone(value));
  const catalog = assembleCatalog(catalogRows);
  return {
    products: () => copy(catalog.products),
    trustBadges: () => copy(trustBadges),
    heroFeatures: () => copy(heroFeatures),
    featureStrip: () => copy(featureStrip),
    benefits: () => copy(benefits),
    articles: (limit) => copy(articles.slice(0, limit)),
    activeOffer: () => copy(activeOffer),
    siteConfig: () => copy(siteConfig),
    categories: () => copy(catalog.categories),
    collections: () => copy(catalog.collections),
    ingredients: () => copy(catalog.ingredients),
    videos: () => copy(videos),
    subscribe: () =>
      Promise.reject(new ServiceError("UNAVAILABLE", "Newsletter sign-up needs a live data source.")),
  };
}

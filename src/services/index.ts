import { logger } from "@/lib/logger";
import { createHttpDataSource } from "./adapters/http";
import { createMockDataSource } from "./adapters/mock";
import { createStoreApiDataSource } from "./adapters/store-api";
import { storeApiConfig } from "@/server/store-api/client";
import type { DataSource } from "./adapters/types";
import { createArticleService } from "./articles.service";
import { withCatalogCache } from "./cache";
import { createCatalogService } from "./catalog.service";
import { createContentService } from "./content.service";
import { ServiceError } from "./errors";
import { createNewsletterService } from "./newsletter.service";
import { createOfferService } from "./offers.service";
import { createProductService } from "./products.service";
import { createSiteService } from "./site.service";
import type { HomePageData } from "./types";

export function selectDataSource(env: Record<string, string | undefined> = process.env): DataSource {
  if (!env.DATA_SOURCE && storeApiConfig(env)) return createStoreApiDataSource();
  const kind = env.DATA_SOURCE ?? "json";
  if (kind === "json" || kind === "mock") return createMockDataSource();
  if (kind === "store-api") return createStoreApiDataSource();
  if (kind === "http") {
    if (!env.API_BASE_URL) throw new ServiceError("CONFIG", "DATA_SOURCE=http requires API_BASE_URL");
    return createHttpDataSource(env.API_BASE_URL);
  }
  throw new ServiceError("CONFIG", `Unknown DATA_SOURCE "${kind}" (expected "json" or "http")`);
}

export function createServices(source: DataSource) {
  return {
    products: createProductService(source),
    content: createContentService(source),
    catalog: createCatalogService(source),
    articles: createArticleService(source),
    offers: createOfferService(source),
    site: createSiteService(source),
    newsletter: createNewsletterService(source),
  };
}

export type Services = ReturnType<typeof createServices>;

let defaultServices: Services | undefined;

export function getServices(): Services {
  defaultServices ??= createServices(withCatalogCache(selectDataSource()));
  return defaultServices;
}

async function optional<T>(what: string, load: () => Promise<T>): Promise<T | null> {
  try {
    return await load();
  } catch (error) {
    logger.error(`${what} failed to load; hiding the section`, { error });
    return null;
  }
}

export async function getHomePageData(services: Services = getServices()): Promise<HomePageData> {
  const [
    site,
    products,
    heroSlides,
    trustBadges,
    heroFeatures,
    featureStrip,
    benefits,
    categories,
    ingredients,
    articles,
    offer,
    videos,
  ] = await Promise.all([
    services.site.config(),
    services.products.list(),
    services.products.heroSlides(),
    services.content.trustBadges(),
    services.content.heroFeatures(),
    services.content.featureStrip(),
    services.content.benefits(),
    services.catalog.categories(),
    services.catalog.ingredients(),
    optional("Journal articles", () => services.articles.latest(3)),
    optional("Active offer", () => services.offers.active()),
    optional("Showcase videos", () => services.content.videos()),
  ]);

  return {
    site,
    products,
    heroSlides,
    trustBadges,
    heroFeatures,
    featureStrip,
    benefits,
    categories,
    ingredients,
    articles,
    offer,
    videos: videos ?? [],
  };
}

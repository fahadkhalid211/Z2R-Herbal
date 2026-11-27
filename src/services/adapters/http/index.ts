import { ServiceError, isServiceError } from "../../errors";
import type { DataSource } from "../types";

const REVALIDATE_SECONDS = 3600;

export function createHttpDataSource(baseUrl: string, fetchImpl: typeof fetch = fetch): DataSource {
  const root = baseUrl.replace(/\/+$/, "");

  async function request(path: string, init?: RequestInit): Promise<unknown> {
    let response: Response;
    try {
      response = await fetchImpl(`${root}${path}`, {
        ...init,
        headers: { Accept: "application/json", ...init?.headers },
      });
    } catch (cause) {
      throw new ServiceError("NETWORK", `Request to ${path} failed`, { cause });
    }
    if (response.status === 404) throw new ServiceError("NOT_FOUND", `${path} not found`);
    if (!response.ok) throw new ServiceError("NETWORK", `${path} responded with ${response.status}`);
    try {
      return await response.json();
    } catch (cause) {
      throw new ServiceError("INVALID_RESPONSE", `${path} did not return JSON`, { cause });
    }
  }

  const get = (path: string) => request(path, { next: { revalidate: REVALIDATE_SECONDS } });

  return {
    products: () => get("/products"),
    trustBadges: () => get("/content/trust-badges"),
    heroFeatures: () => get("/content/hero-features"),
    featureStrip: () => get("/content/feature-strip"),
    benefits: () => get("/content/benefits"),
    articles: (limit) => get(`/articles?limit=${limit}`),
    async activeOffer() {
      try {
        return await get("/offers/active");
      } catch (error) {
        if (isServiceError(error) && error.code === "NOT_FOUND") return null;
        throw error;
      }
    },
    siteConfig: () => get("/site-config"),
    categories: () => get("/categories"),
    collections: () => get("/collections"),
    ingredients: () => get("/ingredients"),
    videos: () => get("/videos"),
    subscribe: (email) =>
      request("/newsletter", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }),
  };
}

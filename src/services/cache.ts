import { unstable_cache } from "next/cache";
import { storeApiEnabled } from "@/server/store-api/client";
import type { DataSource } from "./adapters/types";

export const CATALOG_TAG = "catalog";

const CATALOG_REVALIDATE_SECONDS = 3600;

const CATALOG_READS = ["products", "categories", "collections", "ingredients"] as const;

export function withCatalogCache(source: DataSource): DataSource {
  if (!process.env.NEXT_RUNTIME || storeApiEnabled()) return source;
  const cached: DataSource = { ...source };
  for (const read of CATALOG_READS) {
    cached[read] = unstable_cache(() => source[read](), ["catalog", read], {
      tags: [CATALOG_TAG],
      revalidate: CATALOG_REVALIDATE_SECONDS,
    });
  }
  return cached;
}

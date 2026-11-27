import type { DataSource } from "./adapters/types";
import { parseOrThrow } from "./parse";
import { siteConfigSchema } from "./schemas";
import type { SiteConfig } from "./types";

export function createSiteService(source: DataSource) {
  return {
    async config(): Promise<SiteConfig> {
      return parseOrThrow(siteConfigSchema, await source.siteConfig(), "site config");
    },
  };
}

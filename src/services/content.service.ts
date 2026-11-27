import type { DataSource } from "./adapters/types";
import { parseOrThrow } from "./parse";
import { benefitListSchema, featureListSchema, trustBadgeListSchema, videoListSchema } from "./schemas";
import type { Benefit, Feature, TrustBadge, Video } from "./types";

export function createContentService(source: DataSource) {
  return {
    async trustBadges(): Promise<TrustBadge[]> {
      return parseOrThrow(trustBadgeListSchema, await source.trustBadges(), "trust badges");
    },
    async heroFeatures(): Promise<Feature[]> {
      return parseOrThrow(featureListSchema, await source.heroFeatures(), "hero features");
    },
    async featureStrip(): Promise<Feature[]> {
      return parseOrThrow(featureListSchema, await source.featureStrip(), "feature strip");
    },
    async benefits(): Promise<Benefit[]> {
      return parseOrThrow(benefitListSchema, await source.benefits(), "benefits");
    },
    async videos(): Promise<Video[]> {
      const all = parseOrThrow(videoListSchema, await source.videos(), "videos");
      return all.filter((video) => video.enabled);
    },
  };
}

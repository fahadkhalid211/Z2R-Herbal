import type { DataSource } from "./adapters/types";
import { parseOrThrow } from "./parse";
import { offerSchema } from "./schemas";
import type { Offer } from "./types";

export function createOfferService(source: DataSource) {
  return {
    async active(): Promise<Offer | null> {
      const payload = await source.activeOffer();
      return payload === null ? null : parseOrThrow(offerSchema, payload, "offer");
    },
  };
}

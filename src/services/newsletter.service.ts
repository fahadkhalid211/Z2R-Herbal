import { z } from "zod";
import type { DataSource } from "./adapters/types";
import { ServiceError } from "./errors";
import { parseOrThrow } from "./parse";
import { subscribeResultSchema } from "./schemas";

const emailSchema = z.email();

export function createNewsletterService(source: DataSource) {
  return {
    async subscribe(rawEmail: string): Promise<{ ok: true }> {
      const email = rawEmail.trim();
      if (!emailSchema.safeParse(email).success) {
        throw new ServiceError("VALIDATION", "Please enter a valid email address.");
      }
      return parseOrThrow(subscribeResultSchema, await source.subscribe(email), "newsletter");
    },
  };
}

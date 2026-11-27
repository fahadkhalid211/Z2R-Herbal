import type { z } from "zod";
import { ServiceError } from "./errors";

export function parseOrThrow<T extends z.ZodType>(schema: T, payload: unknown, what: string): z.infer<T> {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ServiceError("INVALID_RESPONSE", `Invalid ${what} payload`, { cause: result.error.issues });
  }
  return result.data;
}

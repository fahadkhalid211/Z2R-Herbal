"use server";

import { z } from "zod";
import { storeApiEnabled } from "./store-api/client";
import { asCustomer, hasSession } from "./store-api/customer";
import { type ApiActionFailure, apiFailure } from "./store-api/results";
import { postReview } from "./store-api/reviews";

export type ReviewResult = { ok: true; status: "pending" | "approved"; message: string } | ApiActionFailure;

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(190)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const reviewSchema = z.object({
  rating: z.number().int().min(1, "Choose 1 to 5 stars.").max(5, "Choose 1 to 5 stars."),
  title: z.string().trim().max(150, "Keep the title under 150 characters.").optional(),
  body: z
    .string()
    .trim()
    .max(2000, "Keep the review under 2000 characters.")
    .refine((v) => v.length === 0 || v.length >= 10, "Write at least 10 characters, or leave it empty.")
    .optional(),
});

export type ReviewInput = z.input<typeof reviewSchema>;

export async function submitProductReview(slug: string, input: ReviewInput): Promise<ReviewResult> {
  if (!storeApiEnabled())
    return { ok: false, code: "UNAVAILABLE", message: "Reviews are not available right now." };
  const s = slugSchema.safeParse(slug);
  if (!s.success) return { ok: false, code: "NOT_FOUND", message: "Product not found." };
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[String(issue.path[0] ?? "rating")] ??= issue.message;
    return { ok: false, code: "VALIDATION", message: "Please check your review.", fields };
  }
  if (!(await hasSession()))
    return { ok: false, code: "UNAUTHORIZED", message: "Please sign in to write a review." };
  try {
    const { rating, title, body } = parsed.data;
    const created = await asCustomer((token, ip) =>
      postReview(token, ip, s.data, { rating, title: title || undefined, body: body || undefined }),
    );
    return { ok: true, status: created.status, message: created.message };
  } catch (error) {
    return apiFailure(error, "Product review");
  }
}

export async function canWriteReview(): Promise<boolean> {
  return storeApiEnabled() && (await hasSession());
}

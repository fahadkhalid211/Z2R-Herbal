import { cache } from "react";
import { logger } from "@/lib/logger";
import { storeApi, storeApiEnabled } from "./client";

export interface ReviewSummary {
  average: number;
  count: number;
  distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
}
export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string | null;
  body: string | null;
  verifiedPurchase: boolean;
  createdAt: string | null;
  reply: { text: string; at: string | null } | null;
}
export interface ProductReviewList {
  summary: ReviewSummary;
  items: ProductReview[];
}

const EMPTY: ProductReviewList = {
  summary: { average: 0, count: 0, distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
  items: [],
};

export const productReviews = cache(async (slug: string): Promise<ProductReviewList> => {
  if (!storeApiEnabled() || process.env.NEXT_PHASE === "phase-production-build") return EMPTY;
  try {
    const { data } = await storeApi<ProductReviewList>(
      `/products/${encodeURIComponent(slug)}/reviews?pageSize=20&sort=newest`,
    );
    return { summary: data.summary ?? EMPTY.summary, items: data.items ?? [] };
  } catch (error) {
    logger.warn("Product reviews unavailable", {
      slug,
      error: error instanceof Error ? error.message : String(error),
    });
    return EMPTY;
  }
});

export interface NewReview {
  rating: number;
  title?: string;
  body?: string;
}

export interface CreatedReview {
  id: string;
  status: "pending" | "approved";
  verifiedPurchase: boolean;
  message: string;
}

export async function postReview(
  token: string,
  ip: string | undefined,
  slug: string,
  review: NewReview,
): Promise<CreatedReview> {
  const { data } = await storeApi<CreatedReview>(`/products/${encodeURIComponent(slug)}/reviews`, {
    method: "POST",
    body: review,
    customerToken: token,
    endUserIp: ip,
  });
  return data;
}

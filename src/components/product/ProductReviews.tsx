import { BadgeCheck, MessageSquareText, Store } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cardSurface } from "@/components/ui/surface";
import { cn } from "@/lib/cn";
import type { ProductReviewList } from "@/server/store-api/reviews";
import { ReviewForm } from "./ReviewForm";
import { Stars } from "./Stars";

const dateFmt = new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric" });
const when = (iso: string | null) => (iso ? dateFmt.format(new Date(iso)) : "");

export function ProductReviews({
  slug,
  productName,
  reviews,
  signedIn,
}: {
  slug: string;
  productName: string;
  reviews: ProductReviewList;
  signedIn: boolean;
}) {
  const { summary, items } = reviews;
  const total = summary.count;

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="container-page scroll-mt-28 pb-16 lg:pb-24"
    >
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="reviews-title"
            eyebrow="Ratings & Reviews"
            lines={["What Customers Say"]}
            intro={`Honest words from people who use ${productName}.`}
            align="start"
          />

          <div className={cn(cardSurface, "mt-8 p-6")}>
            {total > 0 ? (
              <>
                <div className="flex items-end gap-4">
                  <span className="font-display text-[3.6rem] leading-none font-semibold text-ink">
                    {summary.average.toFixed(1)}
                  </span>
                  <div className="pb-1.5">
                    <Stars value={summary.average} size={20} />
                    <p className="mt-1 text-[0.85rem] text-ink-muted">
                      Based on {total} review{total === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <ul className="mt-6 space-y-2.5" aria-label="Rating breakdown">
                  {(["5", "4", "3", "2", "1"] as const).map((star) => {
                    const n = summary.distribution[star] ?? 0;
                    const pct = total ? Math.round((n / total) * 100) : 0;
                    return (
                      <li key={star} className="flex items-center gap-3 text-[0.85rem]">
                        <span className="w-10 shrink-0 font-semibold text-forest-800">{star} ★</span>
                        <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-forest-900/[0.07]">
                          <span
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-500 to-gold-300"
                            style={{ width: `${pct}%` }}
                          />
                        </span>
                        <span className="w-10 shrink-0 text-right text-ink-muted tabular-nums">{pct}%</span>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <div className="text-center">
                <Stars value={0} size={22} className="justify-center" />
                <p className="mt-3 font-display text-[1.2rem] font-semibold text-ink">No reviews yet</p>
                <p className="mt-1 text-[0.9rem] text-ink-muted">Be the first to share your experience.</p>
              </div>
            )}
            <div className="mt-6 border-t border-cream-200 pt-6">
              <ReviewForm slug={slug} signedIn={signedIn} />
            </div>
          </div>
        </div>

        {items.length > 0 ? (
          <ul className="space-y-4">
            {items.map((r) => (
              <li key={r.id} className={cn(cardSurface, "rounded-[22px] p-5 sm:p-6")}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="grid size-10 place-items-center rounded-full bg-forest-800 font-display text-[1.05rem] font-semibold text-lime-300"
                    >
                      {r.author.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{r.author}</p>
                      {r.verifiedPurchase && (
                        <p className="flex items-center gap-1 text-[0.78rem] font-medium text-forest-600">
                          <BadgeCheck aria-hidden="true" className="size-3.5" /> Verified purchase
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Stars value={r.rating} size={16} />
                    {r.createdAt && (
                      <p className="mt-0.5 text-[0.78rem] text-ink-muted">
                        <time dateTime={r.createdAt}>{when(r.createdAt)}</time>
                      </p>
                    )}
                  </div>
                </div>
                {r.title && (
                  <p className="mt-4 font-display text-[1.15rem] font-semibold text-ink">{r.title}</p>
                )}
                {r.body && (
                  <p
                    className={cn(
                      "leading-relaxed whitespace-pre-line text-ink-muted",
                      r.title ? "mt-1.5" : "mt-4",
                    )}
                  >
                    {r.body}
                  </p>
                )}
                {r.reply && (
                  <div className="mt-4 rounded-2xl border border-forest-600/15 bg-forest-600/[0.05] px-4 py-3.5">
                    <p className="flex items-center gap-1.5 text-[0.8rem] font-semibold tracking-wide text-forest-800 uppercase">
                      <Store aria-hidden="true" className="size-3.5" /> Reply from Z2R Herbal
                    </p>
                    <p className="mt-1.5 text-[0.92rem] leading-relaxed whitespace-pre-line text-forest-900">
                      {r.reply.text}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div
            className={cn(
              cardSurface,
              "flex flex-col items-center justify-center rounded-[22px] px-6 py-14 text-center",
            )}
          >
            <span className="feature-medal grid size-14 place-items-center rounded-full">
              <MessageSquareText aria-hidden="true" className="size-6" strokeWidth={1.5} />
            </span>
            <p className="mt-4 font-display text-[1.3rem] font-semibold text-ink">
              Your words could be the first
            </p>
            <p className="mt-1 max-w-sm text-[0.92rem] text-ink-muted">
              Reviews from customers appear here once our team has checked them.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

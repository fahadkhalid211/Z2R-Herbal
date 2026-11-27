import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RevealHeading } from "@/components/motion/RevealHeading";
import { SnapCarousel } from "@/components/product/SnapCarousel";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cssVars } from "@/lib/css-vars";
import type { Article } from "@/services/types";

const IMAGE_FOCUS: Record<string, string> = {
  "choose-right-hair-oil": "object-[50%_30%]",
};

export function JournalSection({ articles }: { articles: Article[] }) {
  return (
    <section aria-labelledby="journal-title" className="border-t border-forest-600/10 py-14 lg:py-16">
      <div className="container-page grid items-center gap-10 lg:grid-cols-[1fr_3fr] lg:gap-8">
        <div>
          <div data-reveal="fade">
            <Eyebrow>Expert Insights</Eyebrow>
          </div>
          <RevealHeading
            id="journal-title"
            lines={["Hair Care", "Journal"]}
            className="mt-3 font-display text-[2.4rem] leading-[1.02] font-bold text-ink lg:text-[2.75rem]"
          />
          <p data-reveal="fade" style={cssVars({ "--d": "250ms" })} className="mt-4 max-w-xs text-ink-muted">
            Practical tips, hair care guides and herbal remedies for naturally healthier hair.
          </p>
          <div data-reveal="fade" style={cssVars({ "--d": "400ms" })}>
            <ButtonLink href="/journal" variant="dark" className="mt-6">
              Explore Articles <ArrowRight aria-hidden="true" className="size-4" />
            </ButtonLink>
          </div>
        </div>

        <div>
          <SnapCarousel
            label="Journal articles"
            count={articles.length}
            gridQuery="(min-width: 40rem)"
            reveal="stagger"
            dotsClassName="sm:hidden"
            className="-mx-4 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {articles.map((article, i) => (
              <li
                key={article.id}
                style={cssVars({ "--i": i })}
                className="w-[78%] shrink-0 snap-center sm:w-auto"
              >
                <article className="group relative h-full overflow-hidden rounded-card bg-white shadow-card">
                  <div className="relative aspect-[2/1] overflow-hidden">
                    <Image
                      src={article.image.src}
                      alt={article.image.alt}
                      fill
                      sizes="(min-width: 1024px) 300px, (min-width: 640px) 32vw, 78vw"
                      className={`object-cover transition-transform duration-500 group-hover:scale-105 ${IMAGE_FOCUS[article.slug] ?? "object-center"}`}
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="leading-snug font-semibold text-ink">
                      <Link href={article.href} prefetch={false} className="after:absolute after:inset-0">
                        {article.title}
                      </Link>
                    </h3>
                    <p
                      aria-hidden="true"
                      className="mt-3 flex items-center gap-1.5 text-sm font-medium text-forest-700"
                    >
                      Read More
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </SnapCarousel>
        </div>
      </div>
    </section>
  );
}

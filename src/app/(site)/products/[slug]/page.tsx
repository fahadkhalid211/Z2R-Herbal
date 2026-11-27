import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowRight, BadgeCheck, ChevronDown, Leaf, Sparkles } from "lucide-react";
import { IngredientShowcase } from "@/components/product/IngredientShowcase";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductRail } from "@/components/product/ProductRail";
import { ProductReviews } from "@/components/product/ProductReviews";
import { Stars } from "@/components/product/Stars";
import {
  SelectedAddToCartPanel,
  SelectedPrice,
  SelectedStickyBuyBar,
  SizeSelector,
  VariantProvider,
} from "@/components/product/VariantSelection";
import { PageBanner } from "@/components/ui/PageBanner";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrustBar } from "@/components/ui/TrustBar";
import { cardSurface } from "@/components/ui/surface";
import { faqsWithPayments } from "@/content/faqs";
import { DELIVERY_FEE_LINE } from "@/content/seo-copy";
import { RETURN_POLICY, SHIPPING_POLICY } from "@/content/policies";
import { byShopOrder, cardPrice, productIngredients } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { cssVars } from "@/lib/css-vars";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMeta } from "@/lib/page-meta";
import { galleryAlt, productSeo } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-url";
import { productSchema } from "@/lib/structured-data";
import { getServices } from "@/services";
import { localMatch } from "@/server/store-api/catalog";
import { storeApiEnabled } from "@/server/store-api/client";
import { canWriteReview } from "@/server/review-actions";
import { productReviews } from "@/server/store-api/reviews";
import { joinMethods, paymentMethodTitles } from "@/server/store-api/orders";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const dynamic = "force-dynamic";

async function load(slug: string) {
  const services = getServices();
  const [products, ingredients, site, categories] = await Promise.all([
    services.products.list(),
    services.catalog.ingredients(),
    services.site.config(),
    services.catalog.categoryRecords(),
  ]);
  const product = products.find((p) => p.slug === slug);
  const category = categories.find((c) => c.slug === product?.category);
  return { product, products, ingredients, site, category };
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { product } = await load(slug);
  if (!product) return {};
  const price = cardPrice(product);
  const seo = productSeo({ ...product, sizeLabel: price.sizeLabel, price: price.amount });
  return pageMeta({ ...seo, path: product.href, image: absoluteUrl(product.images.card.src) });
}

const FAQ_PICKS = [7, 8, 3];
const policyText = (policy: typeof SHIPPING_POLICY, heading: string) =>
  policy.sections.find((s) => s.heading === heading)?.paragraphs?.[0] ?? "";

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { product, products, ingredients, category } = await load(slug);
  if (!product) {
    const match = storeApiEnabled() ? products.find((p) => localMatch(p.slug)?.slug === slug) : undefined;
    if (match) permanentRedirect(match.href);
    notFound();
  }

  const [reviews, signedIn, payments] = await Promise.all([
    productReviews(product.slug),
    canWriteReview(),
    storeApiEnabled() ? paymentMethodTitles() : Promise.resolve([]),
  ]);
  const rating = reviews.summary;
  const { ingredient, added, blend } = productIngredients(product, ingredients);
  const ordered = byShopOrder(products);
  const related = ordered.filter((p) => p.id !== product.id);
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...(category ? [{ label: category.name, href: category.href }] : []),
    { label: product.name },
  ];
  const cartItem = { id: product.id, name: product.name, image: product.images.bottle };
  const sizes = product.variants.map((v) => v.label).join(" / ");
  const claims = product.tagline.split("·").map((c) => c.trim());

  const structuredData = productSchema(product, { category: category?.name, rating });
  const gallery = [product.images.card, product.images.bottle, product.images.box].map((image, i) => ({
    ...image,
    alt: galleryAlt(product, image, i),
  }));

  const details = [
    {
      title: "Product information",
      body: (
        <dl className="divide-y divide-forest-900/10">
          {[
            ["Product", product.name],
            ["Volume", sizes],
            ["Type", "Hair oil"],
            ["Made in", "Pakistan"],
          ].map(([term, value]) => (
            <div key={term} className="flex justify-between gap-6 py-2.5">
              <dt className="text-ink-muted">{term}</dt>
              <dd className="text-right font-medium text-forest-900">{value}</dd>
            </div>
          ))}
        </dl>
      ),
    },
    {
      title: "Shipping & Delivery",
      body: (
        <>
          <p>{policyText(SHIPPING_POLICY, "Delivery Time")}</p>
          <p className="mt-2">{DELIVERY_FEE_LINE}</p>
          <Link
            href="/shipping"
            prefetch={false}
            className="mt-3 inline-flex items-center gap-1 font-semibold text-forest-700"
          >
            Shipping & Delivery policy <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </>
      ),
    },
    {
      title: "Returns & Refunds",
      body: (
        <>
          <p>{RETURN_POLICY.sections[0]?.paragraphs?.[0]}</p>
          <Link
            href="/returns"
            prefetch={false}
            className="mt-3 inline-flex items-center gap-1 font-semibold text-forest-700"
          >
            Return & Refund Policy <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </>
      ),
    },
  ];

  const information = product.information ?? [];
  if (information.length > 0) {
    details.splice(
      0,
      1,
      ...(product.longDescription
        ? [{ title: "About this product", body: <RichText text={product.longDescription} /> }]
        : []),
      ...information
        .filter((section) => section.items.length > 0)
        .map((section) => ({
          title: section.section,
          body: /ingredient/i.test(section.section) ? (
            <IngredientList items={section.items} />
          ) : (
            <InformationList items={section.items} />
          ),
        })),
    );
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <PageBanner crumbs={crumbs} />
      <VariantProvider variants={product.variants}>
        <section className="product-hero relative isolate" style={cssVars({ "--tint": product.accent.glow })}>
          <div className="container-page grid gap-10 py-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <ProductGallery images={gallery} glow={product.accent.glow} />
            </div>

            <div className="lg:pt-2">
              {product.isBestseller && (
                <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-forest-800 px-3.5 py-1.5 text-xs font-semibold text-lime-300">
                  <Sparkles aria-hidden="true" className="size-3.5" /> Best Seller
                </p>
              )}
              <p className="text-xs font-semibold tracking-[0.2em] text-olive-600 uppercase">
                {product.tagline}
              </p>
              <h1 className="mt-3 font-display text-[2.4rem] leading-[1.04] font-semibold text-ink sm:text-[3rem] lg:text-[3.4rem]">
                {product.name}
              </h1>
              {rating.count > 0 && (
                <a
                  href="#reviews"
                  className="mt-3 inline-flex items-center gap-2 text-[0.9rem] font-medium text-forest-800 hover:text-forest-600"
                >
                  <Stars value={rating.average} size={17} />
                  <span className="font-semibold text-ink">{rating.average.toFixed(1)}</span>
                  <span className="text-ink-muted underline-offset-4 hover:underline">
                    ({rating.count} review{rating.count === 1 ? "" : "s"})
                  </span>
                </a>
              )}
              <ul className="mt-4 flex flex-wrap gap-2 text-[0.8rem] font-medium text-forest-800">
                {[sizes, "Hair oil", "Made in Pakistan"].map((chip) => (
                  <li key={chip} className="rounded-full border border-forest-600/20 bg-white/70 px-3 py-1">
                    {chip}
                  </li>
                ))}
              </ul>
              <SelectedPrice size="lg" className="mt-6" />
              <p className="mt-2 text-[0.85rem] text-ink-muted">
                Pay with {payments.length > 0 ? joinMethods(payments) : "Cash on Delivery"}.
              </p>
              <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-ink-muted">
                {product.heroCopy}
              </p>

              <SizeSelector className="mt-6" />
              <div id="buy" className="mt-7">
                <SelectedAddToCartPanel item={cartItem} />
              </div>

              <TrustBar className="mt-8" />

              <div className="mt-8 space-y-3">
                {details.map((d, i) => (
                  <details key={d.title} open={i === 0} className={cn(cardSurface, "group rounded-[20px]")}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-[1.15rem] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                      <h2>{d.title}</h2>
                      <ChevronDown
                        aria-hidden="true"
                        className="size-5 text-forest-600 transition-transform group-open:rotate-180"
                      />
                    </summary>
                    <div className="px-5 pb-5 text-[0.92rem] leading-relaxed text-ink-muted">{d.body}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <IngredientShowcase productName={product.name} ingredient={ingredient} added={added} blend={blend} />

        <section aria-labelledby="label-title" className="container-page py-16 lg:py-24">
          <SectionHeading id="label-title" eyebrow="From the Label" lines={["Care You Can Read"]} />
          <ul className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
            {claims.map((claim) => (
              <li key={claim} className={cn(cardSurface, "flex flex-col items-center px-6 py-8 text-center")}>
                <span className="feature-medal grid size-14 place-items-center rounded-full">
                  <Leaf aria-hidden="true" className="size-6" strokeWidth={1.5} />
                </span>
                <span className="mt-4 font-display text-[1.3rem] font-semibold text-ink">{claim}</span>
              </li>
            ))}
          </ul>
          {product.labelClaims && (
            <ul className="mx-auto mt-4 grid max-w-5xl gap-4 sm:grid-cols-2">
              {product.labelClaims.map((claim) => (
                <li
                  key={claim}
                  className="flex items-center gap-3 rounded-2xl border border-forest-600/15 bg-forest-600/[0.04] px-5 py-4 text-[0.95rem] font-medium text-forest-900"
                >
                  <BadgeCheck aria-hidden="true" className="size-5 shrink-0 text-forest-600" />
                  {claim}
                </li>
              ))}
            </ul>
          )}
        </section>

        <ProductReviews
          slug={product.slug}
          productName={product.name}
          reviews={reviews}
          signedIn={signedIn}
        />

        <section aria-labelledby="pfaq-title" className="container-page pb-16 lg:pb-24">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <SectionHeading
              id="pfaq-title"
              eyebrow="Good to Know"
              lines={["Before You Order"]}
              intro="Answers from our customer support team."
              align="start"
            />
            <ul className="space-y-3">
              {FAQ_PICKS.map((i) => faqsWithPayments(payments)[i])
                .filter((f) => f !== undefined)
                .map((faq) => (
                  <li key={faq.question}>
                    <details className={cn(cardSurface, "group rounded-[20px]")}>
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-[1.1rem] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                        <h3>{faq.question}</h3>
                        <ChevronDown
                          aria-hidden="true"
                          className="size-5 shrink-0 text-forest-600 transition-transform group-open:rotate-180"
                        />
                      </summary>
                      <p className="px-5 pb-5 leading-relaxed text-ink-muted">{faq.answer}</p>
                    </details>
                  </li>
                ))}
              <li className="pt-1">
                <Link
                  href="/faqs"
                  prefetch={false}
                  className="inline-flex items-center gap-1 text-[0.92rem] font-semibold text-forest-700"
                >
                  All questions <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </li>
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="related-title"
          className="border-t border-forest-900/10 bg-cream-100/60 py-16 lg:py-24"
        >
          <SectionHeading
            id="related-title"
            eyebrow="Our Collection"
            lines={["Complete Your Routine"]}
            className="container-page"
          />
          <ProductRail label="More hair oils" className="container-page mt-10 lg:mt-12">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} {...productIngredients(p, ingredients)} blend={undefined} />
            ))}
          </ProductRail>
        </section>

        <SelectedStickyBuyBar item={cartItem} watchId="buy" />
      </VariantProvider>
    </>
  );
}

function RichText({ text }: { text: string }) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim());
        const bullets = lines.filter((l) => /^[-•]\s+/.test(l));
        if (bullets.length > 0 && bullets.length >= lines.length - 1) {
          const heading = lines.find((l) => !/^[-•]\s+/.test(l));
          return (
            <div key={i}>
              {heading && <p className="font-semibold text-forest-900">{heading}</p>}
              <ul className="mt-1.5 list-disc space-y-1 pl-5">
                {bullets.map((b) => (
                  <li key={b}>{b.replace(/^[-•]\s+/, "")}</li>
                ))}
              </ul>
            </div>
          );
        }
        return (
          <p
            key={i}
            className={lines.length === 1 && block.length < 60 ? "font-semibold text-forest-900" : undefined}
          >
            {block}
          </p>
        );
      })}
    </div>
  );
}

type InformationItem = { title: string; details: string; imageUrl?: string | null };

function InformationList({ items }: { items: InformationItem[] }) {
  return (
    <dl className="divide-y divide-forest-900/10">
      {items.map((item) => (
        <div key={item.title} className="py-2.5">
          <dt className="font-semibold text-forest-900">{item.title}</dt>
          {item.details && <dd className="mt-0.5">{item.details}</dd>}
        </div>
      ))}
    </dl>
  );
}

function IngredientRow({ item }: { item: InformationItem }) {
  return (
    <li className="flex items-center gap-3.5 rounded-2xl border border-forest-900/[0.07] bg-white/70 p-2.5">
      {item.imageUrl ? (
        <span className="relative aspect-[3/2] w-[84px] shrink-0 overflow-hidden rounded-xl bg-cream-50">
          <Image src={item.imageUrl} alt={item.title} fill sizes="84px" className="object-cover" />
        </span>
      ) : null}
      <span className="min-w-0">
        <span className="block leading-snug font-semibold text-forest-900">{item.title}</span>
        {item.details && (
          <span className="mt-0.5 block text-[0.84rem] leading-snug text-ink-muted">{item.details}</span>
        )}
      </span>
    </li>
  );
}

function IngredientList({ items }: { items: InformationItem[] }) {
  const oils = items.filter((i) => /\boil$/i.test(i.title.trim()));
  const herbs = items.filter((i) => !/\boil$/i.test(i.title.trim()));
  const groups =
    items.length > 2 && oils.length > 0 && herbs.length > 0
      ? [
          { label: `${herbs.length} Herbal Ingredients`, items: herbs },
          { label: `${oils.length} Natural Oils`, items: oils },
        ]
      : [{ label: "", items }];
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.label || "all"}>
          {group.label && (
            <p className="mb-2.5 text-[0.7rem] font-semibold tracking-[0.18em] text-olive-600 uppercase">
              {group.label}
            </p>
          )}
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {group.items.map((item) => (
              <IngredientRow key={item.title} item={item} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

import { ArrowRight, HeartHandshake, Sprout } from "lucide-react";
import { StoryBanner } from "@/components/sections/StoryBanner";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageBanner } from "@/components/ui/PageBanner";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TRUST_POINTS } from "@/components/ui/TrustBar";
import { cardSurface } from "@/components/ui/surface";
import { JsonLd } from "@/components/seo/JsonLd";
import { OUR_STORY } from "@/content/our-story";
import { cn } from "@/lib/cn";
import { pageMeta } from "@/lib/page-meta";
import { ORGANIZATION_ID, webPageSchema } from "@/lib/structured-data";
import { getServices } from "@/services";
import { storeApiEnabled } from "@/server/store-api/client";
import { joinMethods, paymentMethodTitles } from "@/server/store-api/orders";

export const metadata = pageMeta({
  title: "Our Story",
  description: OUR_STORY.intro[0],
  path: "/our-story",
});

export default async function OurStoryPage() {
  const [site, payments] = await Promise.all([
    getServices().site.config(),
    storeApiEnabled() ? paymentMethodTitles() : Promise.resolve([]),
  ]);
  const facts: [string, React.ReactNode][] = [
    ["Brand", site.brandName],
    ["What we make", "Natural hair oils: a Signature herbal blend, pure oils and oils with rosemary"],
    ["Made in", "Pakistan"],
    ["Delivery", "Across Pakistan, usually in 3–5 working days"],
    ["Payment", payments.length > 0 ? joinMethods(payments) : "Cash on Delivery"],
    [
      "Contact",
      <>
        <a href={`mailto:${site.contact.email}`} className="underline underline-offset-4">
          {site.contact.email}
        </a>
        {" · "}
        <a href={site.contact.phoneHref} className="underline underline-offset-4">
          {site.contact.phone}
        </a>
      </>,
    ],
    [
      "Follow us",
      site.socials
        .filter((s) => s.href)
        .map((s, i) => (
          <span key={s.platform}>
            {i > 0 && " · "}
            <a href={s.href} target="_blank" rel="noopener" className="underline underline-offset-4">
              {s.label}
            </a>
          </span>
        )),
    ],
  ];
  return (
    <>
      <JsonLd
        data={webPageSchema({
          type: "AboutPage",
          name: `About ${site.brandName}`,
          path: "/our-story",
          description: site.blurb,
          about: { "@id": ORGANIZATION_ID },
        })}
      />
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Our Story" }]}
        eyebrow={site.brandName}
        title={["Our Story"]}
      />
      <div className="pt-10 lg:pt-14">
        <StoryBanner brandName={site.brandName} link={false} lines={["Natural Care,", "Better Life."]}>
          {OUR_STORY.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </StoryBanner>
      </div>

      <section aria-label="Our mission and commitment" className="container-page pb-16 lg:pb-24">
        <ul className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2 lg:gap-6">
          {[
            { Icon: Sprout, eyebrow: "Our Mission", text: OUR_STORY.mission },
            { Icon: HeartHandshake, eyebrow: "Our Commitment", text: OUR_STORY.commitment },
          ].map(({ Icon, eyebrow, text }) => (
            <li key={eyebrow} className={cn(cardSurface, "flex h-full flex-col p-7 sm:p-9")}>
              <span className="feature-medal grid size-12 place-items-center rounded-full">
                <Icon aria-hidden="true" className="size-5" strokeWidth={1.6} />
              </span>
              <h2 className="mt-5 text-[0.72rem] font-semibold tracking-[0.2em] text-olive-600 uppercase">
                {eyebrow}
              </h2>
              <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-muted">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Our promise to you" className="inside-section py-16 text-cream-50 lg:py-20">
        <figure className="container-page mx-auto max-w-3xl text-center">
          <Eyebrow tone="dark" lines="both" withLeaf>
            {site.brandName}
          </Eyebrow>
          <blockquote className="mt-6 font-display text-[1.6rem] leading-snug font-semibold italic sm:text-[2rem]">
            {OUR_STORY.closing}
          </blockquote>
          <figcaption className="mt-6 text-[0.95rem] font-semibold tracking-wide text-lime-300">
            {OUR_STORY.tagline}
          </figcaption>
        </figure>
      </section>

      <section aria-labelledby="glance-title" className="container-page pt-20 lg:pt-28">
        <SectionHeading id="glance-title" eyebrow="About Us" lines={[`${site.brandName} at a Glance`]} />
        <dl className={cn(cardSurface, "mx-auto mt-10 max-w-3xl divide-y divide-forest-900/10 px-6 sm:px-8")}>
          {facts.map(([term, value]) => (
            <div key={term} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <dt className="font-semibold text-forest-900">{term}</dt>
              <dd className="text-ink-muted">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="promise-title" className="container-page py-20 lg:py-28">
        <SectionHeading id="promise-title" eyebrow="Our Promise" lines={["Shop with Confidence"]} />
        <ul className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_POINTS.map(({ Icon, title, text }) => (
            <li key={title} className={cn(cardSurface, "flex flex-col items-center px-5 py-8 text-center")}>
              <span className="feature-medal grid size-14 place-items-center rounded-full">
                <Icon aria-hidden="true" className="size-6" strokeWidth={1.5} />
              </span>
              <span className="mt-4 font-display text-[1.2rem] font-semibold text-ink">{title}</span>
              <span className="mt-1 text-[0.88rem] text-ink-muted">{text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10 text-center">
          <ButtonLink href="/shop">
            Shop the Collection <ArrowRight aria-hidden="true" className="size-4" />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

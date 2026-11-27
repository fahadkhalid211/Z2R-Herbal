import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CopySection } from "@/components/sections/CopySection";
import { PageBanner } from "@/components/ui/PageBanner";
import { GUIDE_PATH } from "@/content/seo-copy";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cardSurface } from "@/components/ui/surface";
import { cn } from "@/lib/cn";
import { pageMeta } from "@/lib/page-meta";
import { getServices } from "@/services";

const INTRO =
  "Every oil in our range is built around one botanical ingredient, chosen for traditional hair care and blended with care.";

export const metadata = pageMeta({ title: "Ingredients", description: INTRO, path: "/ingredients" });

export default async function IngredientsPage() {
  const ingredients = await getServices().catalog.ingredients();
  const oils = ingredients.filter((i) => i.kind === "oil");
  const herbs = ingredients.filter((i) => i.kind === "herb");

  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Ingredients" }]}
        eyebrow="Our Ingredients"
        title={["Powered by", "Nature’s Best"]}
        intro={INTRO}
      />
      <section aria-labelledby="oils-title" className="container-page py-14 lg:py-20">
        <SectionHeading id="oils-title" eyebrow="The Oils" lines={["Pure Botanical Oils"]} />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {oils.map((oil) => (
            <li key={oil.id}>
              <Link
                href={`/ingredients/${oil.slug}`}
                prefetch={false}
                className={cn(
                  cardSurface,
                  "group flex h-full items-center gap-5 p-5 transition-[translate] duration-(--dur-card) hover:-translate-y-1",
                )}
              >
                <span className="relative grid h-24 w-28 shrink-0 place-items-center">
                  <Image
                    src={(oil.cutout ?? oil.image).src}
                    alt=""
                    fill
                    sizes="112px"
                    className={oil.cutout ? "object-contain" : "rounded-full object-cover"}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[1.35rem] font-semibold text-ink">{oil.name}</span>
                  <span className="mt-1 block text-[0.88rem] leading-snug text-ink-muted">
                    {oil.description}
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-5 text-forest-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>
      {herbs.length > 0 && (
        <section aria-labelledby="herbs-title" className="inside-section py-16 text-cream-50 lg:py-20">
          <div className="container-page">
            <SectionHeading
              id="herbs-title"
              eyebrow="The Herbs"
              lines={["Herbs in Our Signature Blend"]}
              tone="dark"
            />
            <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {herbs.map((herb) => (
                <li key={herb.id}>
                  <Link
                    href={`/ingredients/${herb.slug}`}
                    prefetch={false}
                    className="inside-card flex flex-col items-center gap-3 rounded-[22px] px-3 py-6 text-center transition-[translate] duration-(--dur-card) hover:-translate-y-1"
                  >
                    <span className="relative size-20 overflow-hidden rounded-full bg-white ring-2 ring-cream-50/25">
                      <Image src={herb.image.src} alt="" fill sizes="80px" className="object-cover" />
                    </span>
                    <span className="font-display text-[1.1rem] font-semibold">{herb.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <CopySection
        block={{
          id: "ingredient-guide",
          eyebrow: "Ingredient Guide",
          title: "Herbs and Oils in Our Hair Oils",
          paragraphs: [
            `Every Z2R Herbal hair oil starts with a natural oil. Our [pure oils](/collections/pure-oils) are a single oil each, our [oils with rosemary](/collections/with-rosemary) have rosemary already blended in, and our [Signature blend](/collections/signature) brings together ${herbs.length} herbs and ${oils.length} oils.`,
            "Choose any herb or oil above to see what it is, its place in traditional South Asian hair care, which of our oils contain it and how to use them, with each product's own directions and warnings.",
            `To compare the oils side by side, with their prices, read our guide to the [best hair oil in Pakistan](${GUIDE_PATH}).`,
          ],
        }}
      />
    </>
  );
}

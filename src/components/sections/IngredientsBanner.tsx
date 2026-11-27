import Image from "next/image";
import { ArrowRight, ArrowUpRight, MessageCircle } from "lucide-react";
import { whatsAppHref } from "@/components/layout/WhatsAppButton";
import { BlendStrip } from "@/components/product/BlendStrip";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Ingredient, Product, SiteConfig } from "@/services/types";

interface IngredientsBannerProps {
  ingredients: Ingredient[];
  products: Product[];
  whatsapp: SiteConfig["contact"]["whatsapp"];
}

const PORTRAIT = { src: "/images/editorial/long-hair.webp", width: 896, height: 1200 };

const CUTOUTS: Record<string, { src: string; width: number; height: number }> = {
  coconut: { src: "/images/hero/props/coconut.webp", width: 49, height: 43 },
  almond: { src: "/images/hero/props/almond.webp", width: 46, height: 39 },
  "pumpkin-seed": { src: "/images/hero/props/pumpkin-seed.webp", width: 46, height: 37 },
  olive: { src: "/images/hero/props/olive.webp", width: 47, height: 40 },
  mustard: { src: "/images/hero/props/mustard.webp", width: 46, height: 40 },
  sesame: { src: "/images/hero/props/sesame.webp", width: 43, height: 34 },
};

export function IngredientsBanner({ ingredients, products, whatsapp }: IngredientsBannerProps) {
  const items = ingredients.flatMap((ingredient) => {
    const product = products.find((p) => p.slug === ingredient.productSlug);
    const cutout = CUTOUTS[ingredient.slug];
    return product && cutout ? [{ ingredient, product, cutout }] : [];
  });
  if (items.length === 0) return null;
  const bySlug = (slugs: string[] = []) =>
    slugs.flatMap((slug) => ingredients.filter((i) => i.slug === slug));
  const signature = products.find((p) => p.blend);

  return (
    <section
      id="ingredients"
      aria-labelledby="ingredients-title"
      className="ingredients-editorial relative isolate scroll-mt-24 overflow-hidden py-20 defer-render lg:py-28"
    >
      <div className="container-page grid items-center gap-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-[clamp(56px,6vw,104px)]">
        <figure data-reveal="fade" className="portrait relative mx-auto w-full max-w-[440px] lg:max-w-none">
          <span aria-hidden="true" className="portrait-outline absolute inset-0" />
          <div className="portrait-frame relative aspect-[4/5] overflow-hidden">
            <Image
              src={PORTRAIT.src}
              alt="Long, glossy black hair, cared for with natural oils"
              fill
              sizes="(min-width: 1024px) 38vw, 440px"
              className="object-cover object-[50%_18%]"
            />
          </div>
          {signature && (
            <Image
              src={signature.images.bottle.src}
              width={signature.images.bottle.width}
              height={signature.images.bottle.height}
              alt={signature.images.bottle.alt}
              sizes="(min-width: 1024px) 120px, 90px"
              className="portrait-bottle absolute bottom-[-2%] left-[-4%] h-[50%] w-auto sm:left-[-7%]"
            />
          )}
          <figcaption className="portrait-note absolute -right-3 -bottom-10 w-[min(320px,86%)] p-5 text-cream-50 sm:-right-8 sm:p-6 lg:-right-12">
            <span className="text-[0.68rem] font-semibold tracking-[0.24em] text-lime-300 uppercase">
              One Signature blend
            </span>
            <span className="mt-3 grid grid-cols-2 gap-4">
              <span>
                <span className="block font-display text-[2.4rem] leading-none font-semibold">06</span>
                <span className="mt-1 block text-[0.8rem] text-cream-50/75">Premium oils</span>
              </span>
              <span className="border-l border-cream-50/15 pl-4">
                <span className="block font-display text-[2.4rem] leading-none font-semibold">10</span>
                <span className="mt-1 block text-[0.8rem] text-cream-50/75">Powerful herbs</span>
              </span>
            </span>
            {signature?.blend && (
              <BlendStrip
                oils={bySlug(signature.blend.oils)}
                herbs={bySlug(signature.blend.herbs)}
                showNames
                className="mt-4 border-t border-cream-50/15 pt-4"
              />
            )}
          </figcaption>
        </figure>

        <div>
          <SectionHeading
            id="ingredients-title"
            eyebrow="Our Ingredients"
            lines={["Powered by", "Nature’s Best"]}
            intro="Every oil in our range is built around one botanical ingredient, chosen for traditional hair care and blended with care."
            align="start"
          />

          <ol aria-label="Our ingredients" className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:mt-12">
            {items.map(({ ingredient, product, cutout }, i) => {
              const added = bySlug(product.addedIngredients);
              return (
                <li key={ingredient.id} className="border-t border-forest-900/10">
                  <a href="#collection" className="ingredient-tile group flex items-center gap-4 py-5">
                    <span className="relative shrink-0">
                      <span className="ingredient-medal grid size-[60px] place-items-center rounded-full">
                        <Image
                          src={cutout.src}
                          width={cutout.width * 3}
                          height={cutout.height * 3}
                          alt=""
                          sizes="56px"
                          className="h-auto w-[74%]"
                        />
                      </span>
                      {added.map((a) => (
                        <span
                          key={a.id}
                          title={a.name}
                          className="absolute -right-2 -bottom-1 size-7 overflow-hidden rounded-full border-2 border-white bg-white shadow-[0_6px_12px_-6px_rgb(60_40_10/0.6)]"
                        >
                          <Image src={a.image.src} alt="" fill sizes="28px" className="object-cover" />
                        </span>
                      ))}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2.5">
                        <span className="text-[0.7rem] font-semibold tracking-[0.18em] text-olive-600 tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="ingredient-tile-name font-display text-[1.3rem] leading-tight font-semibold text-ink">
                          {ingredient.name}
                        </span>
                      </span>
                      <span className="mt-1 block text-[0.85rem] leading-snug text-ink-muted">
                        {ingredient.description}
                      </span>
                      {added.map((a) => (
                        <span key={a.id} className="mt-1 block text-[0.8rem] font-medium text-olive-600">
                          + {a.name} Extract
                        </span>
                      ))}
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[0.8rem] font-medium text-forest-600">
                        In {product.name}
                        <ArrowUpRight aria-hidden="true" className="ingredient-tile-arrow size-3.5" />
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>

          <div className="mt-10 flex flex-col items-center gap-5 border-t border-forest-900/10 pt-8 sm:flex-row sm:justify-center lg:justify-start">
            <ButtonLink href="#collection">
              Shop the Collection <ArrowRight aria-hidden="true" className="size-4" />
            </ButtonLink>
            <a
              href={whatsAppHref(whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-[0.92rem] font-medium text-forest-700 transition-colors hover:text-forest-600"
            >
              <MessageCircle aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
              <span className="underline decoration-forest-600/30 underline-offset-4 group-hover:decoration-forest-600">
                Not sure which oil? Ask us on WhatsApp
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

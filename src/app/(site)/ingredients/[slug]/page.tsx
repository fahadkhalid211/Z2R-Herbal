import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageBanner } from "@/components/ui/PageBanner";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cardSurface } from "@/components/ui/surface";
import { ingredientGuide, ingredientIndexable, productDirections } from "@/content/seo-copy";
import { productIngredients } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { cssVars } from "@/lib/css-vars";
import { pageMeta } from "@/lib/page-meta";
import { ingredientSeo } from "@/lib/seo";
import { webPageSchema } from "@/lib/structured-data";
import { getServices } from "@/services";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const dynamic = "force-dynamic";

async function load(slug: string) {
  const services = getServices();
  const [ingredients, products] = await Promise.all([
    services.catalog.ingredients(),
    services.products.list(),
  ]);
  const ingredient = ingredients.find((i) => i.slug === slug);
  const withIt = products.filter((p) => p.ingredients.some((l) => l.ingredient.slug === slug));
  return { ingredient, ingredients, products: withIt };
}

const isPlural = (name: string) => /s$/i.test(name.replace(/\s*\(.*\)$/, ""));

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { ingredient, products } = await load(slug);
  if (!ingredient) return {};
  const seo = ingredientSeo(
    ingredient,
    products.map((p) => p.name),
    ingredientGuide(ingredient.name)?.whatItIs,
  );
  return pageMeta({ ...seo, path: `/ingredients/${slug}`, index: ingredientIndexable(ingredient.name) });
}

export default async function IngredientPage({ params }: Props) {
  const { slug } = await params;
  const { ingredient, ingredients, products } = await load(slug);
  if (!ingredient) notFound();
  const art = ingredient.cutout;
  const count = products.length;
  const guide = ingredientGuide(ingredient.name);
  const verb = isPlural(ingredient.name) ? "Are" : "Is";
  const directions = products
    .map((product) => ({ product, ...productDirections(product) }))
    .filter((d) => d.howToUse.length > 0 || d.warnings.length > 0);
  const blendOnly = ingredient.kind === "herb" && products.length === 1 && Boolean(products[0]?.blend);
  const path = `/ingredients/${slug}`;

  return (
    <>
      <JsonLd
        data={webPageSchema({
          name: `What ${verb} ${ingredient.name}?`,
          path,
          description: guide?.whatItIs ?? (ingredient.description || ingredient.name),
          about: { name: ingredient.name },
        })}
      />
      <PageBanner
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Ingredients", href: "/ingredients" },
          { label: ingredient.name },
        ]}
        eyebrow={ingredient.kind === "herb" ? "Herb" : "Botanical Oil"}
        title={[ingredient.name]}
        intro={ingredient.description || undefined}
      />
      <section className="container-page grid items-center gap-10 py-14 lg:grid-cols-[1fr_1.2fr] lg:py-20">
        <div className="inside-section relative grid min-h-[280px] place-items-center overflow-hidden rounded-[32px] p-8">
          {art ? (
            <Image
              src={art.src}
              width={art.width}
              height={art.height}
              alt={art.alt}
              sizes="(min-width: 1024px) 480px, 90vw"
              className="h-auto max-h-72 w-auto max-w-full object-contain drop-shadow-[0_24px_30px_rgb(0_0_0/0.45)]"
            />
          ) : (
            <span className="relative size-48 overflow-hidden rounded-full bg-white ring-4 ring-cream-50/25">
              <Image
                src={ingredient.image.src}
                alt={ingredient.name}
                fill
                sizes="192px"
                className="object-cover"
              />
            </span>
          )}
        </div>
        <SectionHeading
          id="with-title"
          eyebrow="In Our Range"
          lines={[`Made with ${ingredient.name}`]}
          intro={
            count === 0
              ? "No product with this ingredient is available right now."
              : `${count} ${count === 1 ? "hair oil" : "hair oils"} in our range ${count === 1 ? "is" : "are"} made with ${ingredient.name}.`
          }
          align="start"
        />
      </section>
      {count > 0 && (
        <section aria-labelledby="with-title" className="container-page pb-20 lg:pb-28">
          <ul data-reveal="stagger" className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {products.map((p, i) => (
              <li key={p.id} style={cssVars({ "--i": i })}>
                <ProductCard product={p} {...productIngredients(p, ingredients)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section
        aria-labelledby="guide-title"
        className="border-t border-forest-900/10 bg-cream-100/60 py-14 lg:py-20"
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl space-y-10 text-[1.02rem] leading-relaxed text-ink-muted">
            <div>
              <h2
                id="guide-title"
                className="font-display text-[1.9rem] leading-tight font-semibold text-ink"
              >
                What {verb} {ingredient.name}?
              </h2>
              <p className="mt-4">
                {guide?.whatItIs ?? ingredient.description}
                {guide?.aka && ` Also known as ${guide.aka}.`}
              </p>
              {count > 0 && (
                <p className="mt-3">
                  You will find it in{" "}
                  {products.map((p, i) => (
                    <span key={p.id}>
                      {i > 0 && (i === products.length - 1 ? " and " : ", ")}
                      <Link
                        href={p.href}
                        prefetch={false}
                        className="font-semibold text-forest-700 underline decoration-forest-700/30 underline-offset-4 hover:decoration-forest-700"
                      >
                        {p.name}
                      </Link>
                    </span>
                  ))}
                  .
                </p>
              )}
            </div>

            {guide?.tradition && (
              <div>
                <h2 className="font-display text-[1.9rem] leading-tight font-semibold text-ink">
                  {ingredient.name} in Traditional Hair Care
                </h2>
                <p className="mt-4">{guide.tradition}</p>
              </div>
            )}

            {blendOnly && products[0] && (
              <div>
                <h2 className="font-display text-[1.9rem] leading-tight font-semibold text-ink">
                  How It Is Used in Our Oils
                </h2>
                <p className="mt-4">
                  {ingredient.name} is one of the herbs in our{" "}
                  <Link
                    href={products[0].href}
                    prefetch={false}
                    className="font-semibold text-forest-700 underline decoration-forest-700/30 underline-offset-4 hover:decoration-forest-700"
                  >
                    {products[0].name}
                  </Link>
                  , where it is combined with the other herbs and natural oils. That page gives the
                  directions, the recommended use and the warnings; do a patch test before first use.
                </p>
              </div>
            )}

            {!blendOnly && directions.length > 0 && (
              <div>
                <h2 className="font-display text-[1.9rem] leading-tight font-semibold text-ink">
                  How to Use {count === 1 ? "It" : `Our Oils with ${ingredient.name}`}
                </h2>
                <p className="mt-4">
                  Directions and warnings from each product&apos;s label. Do a patch test before first use.
                </p>
                <div className="mt-6 space-y-4">
                  {directions.map(({ product, howToUse, warnings }) => (
                    <div key={product.id} className={cn(cardSurface, "rounded-[22px] px-6 py-5")}>
                      <h3 className="font-display text-[1.3rem] font-semibold text-ink">
                        <Link href={product.href} prefetch={false} className="hover:text-forest-700">
                          {product.name}
                        </Link>
                      </h3>
                      <dl className="mt-3 space-y-3 text-[0.95rem]">
                        {[...howToUse, ...warnings].map((item) => (
                          <div key={`${item.title}-${item.details}`}>
                            <dt className="font-semibold text-forest-900">{item.title}</dt>
                            <dd className="mt-0.5">{item.details}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p>
              Explore every herb and oil in our{" "}
              <Link
                href="/ingredients"
                prefetch={false}
                className="font-semibold text-forest-700 underline decoration-forest-700/30 underline-offset-4 hover:decoration-forest-700"
              >
                ingredients guide
              </Link>
              , or compare prices in the{" "}
              <Link
                href="/shop"
                prefetch={false}
                className="font-semibold text-forest-700 underline decoration-forest-700/30 underline-offset-4 hover:decoration-forest-700"
              >
                shop
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

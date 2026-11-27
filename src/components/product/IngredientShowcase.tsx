import Image from "next/image";
import { LEAF_PATH } from "@/components/hero/StageDecor";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/cn";
import type { Ingredient } from "@/services/types";

interface IngredientShowcaseProps {
  productName: string;
  ingredient?: Ingredient;
  added: Ingredient[];
  blend?: { oils: Ingredient[]; herbs: Ingredient[] };
}

function IngredientPicture({
  item,
  sizes,
  className,
}: {
  item: Ingredient;
  sizes: string;
  className?: string;
}) {
  return (
    <span className={cn("relative block aspect-[3/2] overflow-hidden rounded-[14px] bg-cream-50", className)}>
      <Image src={item.image.src} alt={item.name} fill sizes={sizes} className="object-cover" />
    </span>
  );
}

function IngredientTile({ item, sizes }: { item: Ingredient; sizes: string }) {
  return (
    <li className="inside-card flex flex-col rounded-[20px] p-2.5 sm:p-3">
      <IngredientPicture item={item} sizes={sizes} />
      <span className="mt-2.5 px-1 pb-1 text-center font-display text-[0.98rem] leading-snug font-semibold sm:text-[1.05rem]">
        {item.name}
      </span>
    </li>
  );
}

export function IngredientShowcase({ productName, ingredient, added, blend }: IngredientShowcaseProps) {
  if (!blend && !ingredient) return null;
  return (
    <section
      aria-labelledby="inside-title"
      className="inside-section relative isolate overflow-hidden py-16 text-cream-50 lg:py-24"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 40 62"
        className="absolute -top-10 -left-10 -z-10 w-56 rotate-[40deg] text-lime-400/[0.06]"
      >
        <path d={LEAF_PATH} fill="currentColor" />
      </svg>
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow tone="dark" lines="both" withLeaf>
            What&apos;s Inside
          </Eyebrow>
          <h2
            id="inside-title"
            className="mt-4 font-display text-[2.2rem] leading-[1.08] font-semibold sm:text-[2.8rem]"
          >
            {blend ? (
              <>
                {blend.oils.length} Premium Oils,{" "}
                <span className="text-lime-300 italic">{blend.herbs.length} Powerful Herbs</span>
              </>
            ) : (
              <>
                The goodness in your <span className="text-lime-300 italic">{productName}</span>
              </>
            )}
          </h2>
        </div>

        {blend ? (
          <div className="mt-12 space-y-12 lg:mt-14">
            {blend.oils.length > 0 && (
              <div>
                <h3 className="text-center text-[0.72rem] font-semibold tracking-[0.22em] text-lime-300 uppercase">
                  {blend.oils.length} Natural Oils
                </h3>
                <ul
                  aria-label={`${blend.oils.length} natural oils`}
                  className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4"
                >
                  {blend.oils.map((oil) => (
                    <IngredientTile
                      key={oil.id}
                      item={oil}
                      sizes="(min-width: 1024px) 190px, (min-width: 640px) 30vw, 45vw"
                    />
                  ))}
                </ul>
              </div>
            )}
            {blend.herbs.length > 0 && (
              <div>
                <h3 className="text-center text-[0.72rem] font-semibold tracking-[0.22em] text-lime-300 uppercase">
                  Enriched with {blend.herbs.length} Powerful Herbs
                </h3>
                <ul
                  aria-label={`${blend.herbs.length} powerful herbs`}
                  className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4"
                >
                  {blend.herbs.map((herb) => (
                    <IngredientTile
                      key={herb.id}
                      item={herb}
                      sizes="(min-width: 1024px) 230px, (min-width: 640px) 30vw, 45vw"
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          ingredient && (
            <div className="mt-12 grid items-center gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
              <div className="inside-card rounded-[28px] p-3 sm:p-4">
                <IngredientPicture
                  item={ingredient}
                  sizes="(min-width: 1024px) 560px, 90vw"
                  className="rounded-[20px]"
                />
              </div>
              <ul className="space-y-4">
                {[ingredient, ...added].map((item, i) => (
                  <li key={item.id} className="inside-card flex items-center gap-4 rounded-[22px] p-4 sm:p-5">
                    {i > 0 && (
                      <IngredientPicture item={item} sizes="96px" className="w-24 shrink-0 rounded-[12px]" />
                    )}
                    <span className="min-w-0">
                      {i > 0 && (
                        <span className="block text-[0.68rem] font-semibold tracking-[0.2em] text-lime-300 uppercase">
                          Added
                        </span>
                      )}
                      <span className="block font-display text-[1.3rem] leading-tight font-semibold">
                        {item.name}
                      </span>
                      {item.description && (
                        <span className="mt-1 block text-[0.9rem] leading-snug text-cream-50/75">
                          {item.description}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>
    </section>
  );
}

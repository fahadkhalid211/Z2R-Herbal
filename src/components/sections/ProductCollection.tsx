import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { productIngredients } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { cssVars } from "@/lib/css-vars";
import type { Ingredient, Product } from "@/services/types";

const HOME_LIMIT = 7;

interface ProductCollectionProps {
  products: Product[];
  ingredients: Ingredient[];
}

export function ProductCollection({ products, ingredients }: ProductCollectionProps) {
  const shown = products.slice(0, HOME_LIMIT);

  return (
    <section
      id="collection"
      aria-labelledby="collection-title"
      className="scroll-mt-24 pt-20 pb-16 defer-render lg:pt-28 lg:pb-24"
    >
      <SectionHeading
        id="collection-title"
        eyebrow="Our Collection"
        lines={["Explore Our Herbal Hair Care Range"]}
        intro="Premium and signature hair oil, each built around one botanical ingredient and crafted with the purity of nature."
        className="container-page"
      />

      <div className="container-page">
        <ul
          aria-label="Hair oils"
          data-reveal="stagger"
          className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:mt-14 lg:grid-cols-12 lg:gap-6"
        >
          {shown.map((product, i) => (
            <li
              key={product.id}
              style={cssVars({ "--i": i })}
              className={cn(i === 0 ? "col-span-2 lg:col-span-6" : "col-span-1 lg:col-span-3")}
            >
              <ProductCard
                product={product}
                {...productIngredients(product, ingredients)}
                variant={i === 0 ? "feature" : "standard"}
              />
            </li>
          ))}
        </ul>

        {products.length > shown.length && (
          <div className="mt-10 text-center">
            <ButtonLink href="/shop" variant="outline-dark" className="h-12 px-6 text-sm">
              View all {products.length} products <ArrowRight aria-hidden="true" className="size-4" />
            </ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}

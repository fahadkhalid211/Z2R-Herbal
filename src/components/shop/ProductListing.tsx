import { ProductCard } from "@/components/product/ProductCard";
import { TrustBar } from "@/components/ui/TrustBar";
import { listingTags, productIngredients } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { cssVars } from "@/lib/css-vars";
import type { CategoryRecord, Collection, Ingredient, Product } from "@/services/types";
import { ShopFilters } from "./ShopFilters";

interface ProductListingProps {
  products: Product[];
  categories: CategoryRecord[];
  collections: Collection[];
  ingredients: Ingredient[];
  label: string;
}

export function ProductListing({
  products,
  categories,
  collections,
  ingredients,
  label,
}: ProductListingProps) {
  const tags = products.map(listingTags);
  const narrows = (tag: string) => {
    const matches = tags.filter((t) => t.split(" ").includes(tag)).length;
    return matches > 0 && matches < products.length;
  };
  const filters = [
    ...categories.map((c) => ({ value: `category:${c.slug}`, label: c.name })),
    ...collections.map((c) => ({ value: `collection:${c.slug}`, label: c.name })),
    ...ingredients
      .filter((i) => i.kind === "oil")
      .map((i) => ({ value: `ingredient:${i.slug}`, label: i.name })),
  ]
    .filter((f) => narrows(f.value))
    .filter((f, i, all) => {
      const same = (a: string) => tags.map((t) => t.split(" ").includes(a)).join();
      return all.findIndex((g) => same(g.value) === same(f.value)) === i;
    });

  return (
    <section aria-labelledby="listing-title" className="container-page py-10 lg:py-14">
      <h2 id="listing-title" className="sr-only">
        {label}: {products.length} {products.length === 1 ? "product" : "products"}
      </h2>
      <TrustBar layout="row" className="mb-8 justify-center gap-x-10 border-b border-forest-900/10 pb-8" />
      {products.length > 1 && (
        <ShopFilters listId="shop-grid" total={products.length} itemTags={tags} filters={filters} />
      )}
      <ul
        id="shop-grid"
        data-reveal="stagger"
        className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-12 lg:gap-6"
      >
        {products.map((product, i) => {
          const wide = Boolean(product.blend);
          return (
            <li
              key={product.id}
              data-tags={tags[i]}
              data-price={product.salePrice}
              style={cssVars({ "--i": i })}
              className={cn(wide ? "col-span-2 lg:col-span-6" : "col-span-1 lg:col-span-3")}
            >
              <ProductCard
                product={product}
                {...productIngredients(product)}
                variant={wide ? "feature" : "standard"}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

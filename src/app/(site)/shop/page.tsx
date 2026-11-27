import { CopySection } from "@/components/sections/CopySection";
import { ProductListing } from "@/components/shop/ProductListing";
import { PageBanner } from "@/components/ui/PageBanner";
import { shopCopy } from "@/content/seo-copy";
import { byShopOrder } from "@/lib/catalog";
import { pageMeta } from "@/lib/page-meta";
import { getServices } from "@/services";

const INTRO =
  "Premium and signature hair oil, each built around one botanical ingredient and crafted with the purity of nature.";

export const metadata = pageMeta({ title: "Shop", description: INTRO, path: "/shop" });

export default async function ShopPage() {
  const services = getServices();
  const [products, categories, collections, ingredients] = await Promise.all([
    services.products.list(),
    services.catalog.categoryRecords(),
    services.catalog.collections(),
    services.catalog.ingredients(),
  ]);

  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
        eyebrow="Our Collection"
        title={["Shop Hair Oils"]}
        intro={INTRO}
      />
      <ProductListing
        label="Hair oils"
        products={byShopOrder(products)}
        categories={categories}
        collections={collections}
        ingredients={ingredients}
      />
      <CopySection block={shopCopy(products)} className="border-t border-forest-900/10" />
    </>
  );
}

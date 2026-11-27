import { notFound, permanentRedirect } from "next/navigation";
import { ProductListing } from "@/components/shop/ProductListing";
import { PageBanner } from "@/components/ui/PageBanner";
import { pageMeta } from "@/lib/page-meta";
import { listingSeo } from "@/lib/seo";
import { getServices } from "@/services";
import { subtreeSlugs } from "@/services/catalog.service";
import { isServiceError } from "@/services/errors";

interface Props {
  params: Promise<{ category: string }>;
}

export const dynamicParams = true;
export const dynamic = "force-dynamic";

async function findCategory(slug: string) {
  try {
    return await getServices().catalog.category(slug);
  } catch (error) {
    if (isServiceError(error) && error.code === "NOT_FOUND") return undefined;
    throw error;
  }
}

export async function generateMetadata({ params }: Props) {
  const { category: slug } = await params;
  const category = await findCategory(slug);
  if (!category) return {};
  const [products, all] = await Promise.all([
    getServices().products.inCategories(subtreeSlugs(category)),
    getServices().products.list(),
  ]);
  const seo = listingSeo(category.name, category.description);
  return pageMeta({
    title: category.seoTitle ?? seo.title,
    description: category.seoDescription ?? seo.description,
    path: category.href,
    index: products.length > 0,
    adminSeo: Boolean(category.seoTitle),
    ...(products.length > 0 && products.length >= all.length && { canonical: "/shop" }),
  });
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const services = getServices();
  const category = await findCategory(slug);
  if (!category) {
    const product = (await services.products.list()).find((p) => p.slug === slug);
    if (product) permanentRedirect(product.href);
    notFound();
  }

  const [products, categories, collections, ingredients] = await Promise.all([
    services.products.inCategories(subtreeSlugs(category)),
    services.catalog.categoryRecords(),
    services.catalog.collections(),
    services.catalog.ingredients(),
  ]);

  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: category.name }]}
        eyebrow="Shop by Category"
        title={[category.name]}
        intro={category.description}
      />
      <ProductListing
        label={category.name}
        products={products}
        categories={categories.filter((c) => c.parentId === category.id)}
        collections={collections}
        ingredients={ingredients}
      />
    </>
  );
}

import { notFound } from "next/navigation";
import { CopySection } from "@/components/sections/CopySection";
import { JsonLd } from "@/components/seo/JsonLd";
import { plainText } from "@/components/seo/LinkedText";
import { ProductListing } from "@/components/shop/ProductListing";
import { ButtonLink } from "@/components/ui/Button";
import { PageBanner } from "@/components/ui/PageBanner";
import { collectionCopy, isDuplicateCollection } from "@/content/seo-copy";
import { pageMeta } from "@/lib/page-meta";
import { listingSeo } from "@/lib/seo";
import { collectionSchema } from "@/lib/structured-data";
import { getServices } from "@/services";
import { isServiceError } from "@/services/errors";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const dynamic = "force-dynamic";

async function load(slug: string) {
  const services = getServices();
  let collection;
  try {
    collection = await services.catalog.collection(slug);
  } catch (error) {
    if (isServiceError(error) && error.code === "NOT_FOUND") return undefined;
    throw error;
  }
  const [collections, products, ingredients] = await Promise.all([
    services.catalog.collections(),
    services.products.list(),
    services.catalog.ingredients(),
  ]);
  const listed = collection.productSlugs.flatMap((s) => products.filter((p) => p.slug === s));
  const duplicate = isDuplicateCollection(collection, collections);
  const copy = collectionCopy(slug, { listed, all: products, ingredients });
  return { collection, listed, duplicate, copy, ingredients };
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return {};
  const { collection, duplicate, copy } = data;
  const seo = listingSeo(copy?.h1 ?? collection.name, collection.description ?? copy?.lead);
  return pageMeta({
    title: collection.seoTitle ?? seo.title,
    description: collection.seoDescription ?? seo.description,
    path: collection.href,
    index: collection.productSlugs.length > 0 && !duplicate,
    adminSeo: Boolean(collection.seoTitle),
  });
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { collection, listed, copy, ingredients } = data;
  const h1 = copy?.h1 ?? collection.name;
  const lead = copy?.lead ?? collection.description;

  return (
    <>
      {listed.length > 0 && (
        <JsonLd
          data={collectionSchema({
            name: h1,
            path: collection.href,
            description: plainText(copy?.about.paragraphs[0] ?? lead ?? h1),
            products: listed,
          })}
        />
      )}
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: h1 }]}
        eyebrow="Collection"
        title={[h1]}
        intro={copy ? undefined : lead}
      />
      {listed.length > 0 ? (
        <>
          <ProductListing
            label={h1}
            products={listed}
            categories={[]}
            collections={[]}
            ingredients={ingredients}
          />
          {copy && <CopySection block={copy.about} className="border-t border-forest-900/10" />}
        </>
      ) : (
        <section aria-label={collection.name} className="container-page py-16 text-center text-ink-muted">
          <p>There are no products in this collection yet.</p>
          <ButtonLink href="/shop" className="mt-6">
            Shop All
          </ButtonLink>
        </section>
      )}
    </>
  );
}

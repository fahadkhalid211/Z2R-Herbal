import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { LinkedText } from "@/components/seo/LinkedText";
import { PageBanner } from "@/components/ui/PageBanner";
import { cardSurface } from "@/components/ui/surface";
import { BLOG_POSTS, blogPost, formatDate, type BlogBlock } from "@/content/blog";
import { DELIVERY_LINE, guideKey, oilKey, productDirections } from "@/content/seo-copy";
import { byShopOrder } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/money";
import { pageMeta } from "@/lib/page-meta";
import { blogPostingSchema, faqSchema } from "@/lib/structured-data";
import { getServices } from "@/services";
import type { Ingredient, Product } from "@/services/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = blogPost(slug);
  if (!post) return {};
  return pageMeta({
    title: post.seoTitle,
    description: post.description,
    path: `/blog/${post.slug}`,
    article: { publishedTime: post.publishedAt, modifiedTime: post.updatedAt },
  });
}

const linkClass =
  "font-semibold text-forest-700 underline decoration-forest-700/30 underline-offset-4 hover:decoration-forest-700";

function resolve(text: string, products: Product[], ingredients: Ingredient[]): string {
  return text.replace(/\{(product|ingredient):([^}]+)\}/g, (_, kind: string, key: string) => {
    if (kind === "product") {
      const p =
        key === "blend"
          ? products.find((x) => x.blend)
          : products.find((x) => !x.blend && oilKey(x.ingredient) === key && !x.addedIngredients?.length);
      return p?.href ?? "none";
    }
    const i = ingredients.find((x) => guideKey(x.name) === key);
    return i ? `/ingredients/${i.slug}` : "none";
  });
}

function Block({
  block,
  products,
  text,
}: {
  block: BlogBlock;
  products: Product[];
  text: (s: string) => string;
}) {
  switch (block.type) {
    case "p":
      return (
        <p>
          <LinkedText text={text(block.text)} />
        </p>
      );
    case "h2":
      return (
        <h2 className="pt-4 font-display text-[1.7rem] leading-tight font-semibold text-ink sm:text-[1.9rem]">
          {block.text}
        </h2>
      );
    case "ul":
    case "ol": {
      const List = block.type;
      return (
        <List className={cn("space-y-2 pl-5", block.type === "ul" ? "list-disc" : "list-decimal")}>
          {block.items.map((item) => (
            <li key={item} className="pl-1">
              <LinkedText text={text(item)} />
            </li>
          ))}
        </List>
      );
    }
    case "prices":
      return (
        <div className={cn(cardSurface, "overflow-hidden rounded-[22px]")}>
          <table className="w-full text-left text-[0.95rem]">
            <caption className="sr-only">Z2R Herbal hair oil prices in Pakistan</caption>
            <thead className="bg-forest-800 text-cream-50">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Hair oil
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Size
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-900/10">
              {products.map((p) => (
                <tr key={p.id}>
                  <th scope="row" className="px-4 py-3 font-medium">
                    <Link href={p.href} prefetch={false} className={linkClass}>
                      {p.name}
                    </Link>
                  </th>
                  <td className="px-4 py-3 whitespace-nowrap">{p.sizeLabel}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="font-semibold text-forest-900">{formatPrice(p.salePrice)}</span>
                    {p.price && p.price > p.salePrice && (
                      <span className="block text-[0.82rem] text-ink-muted">
                        <span className="sr-only">Regular price </span>
                        <s>{formatPrice(p.price)}</s>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-forest-900/10 px-4 py-3 text-[0.88rem]">
            {DELIVERY_LINE} You can pay with Cash on Delivery.
          </p>
        </div>
      );
    case "directions":
    case "recommended": {
      const rows = products.flatMap((product) => {
        const { howToUse } = productDirections(product);
        const items =
          block.type === "recommended"
            ? howToUse.filter((i) => /recommended|frequency|how often/i.test(i.title))
            : howToUse.filter((i) => !/recommended|frequency|how often/i.test(i.title));
        return items.length > 0 ? [{ product, items }] : [];
      });
      if (rows.length === 0)
        return (
          <p>
            Each product page lists its own directions: see our{" "}
            <Link href="/shop" prefetch={false} className={linkClass}>
              hair oils
            </Link>
            .
          </p>
        );
      return (
        <div className="space-y-3">
          {rows.map(({ product, items }) => (
            <div key={product.id} className={cn(cardSurface, "rounded-[22px] px-5 py-4")}>
              <h3 className="font-display text-[1.2rem] font-semibold text-ink">
                <Link href={product.href} prefetch={false} className="hover:text-forest-700">
                  {product.name}
                </Link>
              </h3>
              {items.map((item) => (
                <p key={`${item.title}-${item.details}`} className="mt-1.5 text-[0.95rem]">
                  {block.type === "directions" && (
                    <span className="font-semibold text-forest-900">{item.title}: </span>
                  )}
                  {item.details}
                </p>
              ))}
            </div>
          ))}
        </div>
      );
    }
    case "faq":
      return (
        <div className="space-y-5">
          {block.items.map((item) => (
            <div key={item.question}>
              <h3 className="font-display text-[1.25rem] font-semibold text-ink">{item.question}</h3>
              <p className="mt-1.5">{item.answer}</p>
            </div>
          ))}
        </div>
      );
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPost(slug);
  if (!post) notFound();
  const services = getServices();
  const [products, ingredients] = await Promise.all([
    services.products.list(),
    services.catalog.ingredients(),
  ]);
  const ordered = byShopOrder(products);
  const text = (s: string) => resolve(s, ordered, ingredients);
  const path = `/blog/${post.slug}`;
  const faqs = post.blocks.flatMap((b) => (b.type === "faq" ? b.items : []));
  const others = BLOG_POSTS.filter((p) => p.slug !== post.slug);

  return (
    <>
      <JsonLd
        data={[
          blogPostingSchema({
            title: post.title,
            description: post.description,
            path,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            image: "/opengraph-image",
          }),
          ...(faqs.length > 0 ? [faqSchema(faqs)] : []),
        ]}
      />
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.title }]}
        eyebrow="Hair Care Guide"
        title={[post.title]}
      />
      <article className="container-page py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[0.88rem] text-ink-muted">
            By Z2R Herbal · Published <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            {post.updatedAt !== post.publishedAt && (
              <>
                {" "}
                · Updated <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
              </>
            )}
          </p>
          <div className="mt-6 space-y-5 text-[1.04rem] leading-relaxed text-ink-muted">
            {post.blocks.map((block, i) => (
              <Block key={i} block={block} products={ordered} text={text} />
            ))}
          </div>
        </div>
      </article>
      <nav
        aria-labelledby="more-guides"
        className="border-t border-forest-900/10 bg-cream-100/60 py-12 lg:py-16"
      >
        <div className="container-page mx-auto max-w-3xl">
          <h2 id="more-guides" className="font-display text-[1.6rem] font-semibold text-ink">
            More hair care guides
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {others.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  prefetch={false}
                  className={cn(
                    cardSurface,
                    "block h-full rounded-[20px] px-5 py-4 font-display text-[1.1rem] font-semibold text-ink transition-[translate] duration-(--dur-card) hover:-translate-y-0.5",
                  )}
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}

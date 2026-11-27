import { connection } from "next/server";
import { BLOG_POSTS } from "@/content/blog";
import { ingredientIndexable, isDuplicateCollection } from "@/content/seo-copy";
import { absoluteUrl } from "@/lib/site-url";
import { getServices } from "@/services";
import { storeApiEnabled } from "@/server/store-api/client";

export const revalidate = 3600;

export async function GET() {
  if (storeApiEnabled()) await connection();
  const services = getServices();
  const [site, products, collections, ingredients] = await Promise.all([
    services.site.config(),
    services.products.list(),
    services.catalog.collections(),
    services.catalog.ingredients(),
  ]);
  const name = (slug: string) => ingredients.find((i) => i.slug === slug)?.name ?? slug;
  const productLine = (p: (typeof products)[number]) => {
    const made = p.blend
      ? `a blend of ${p.blend.herbs.length} herbs (${p.blend.herbs.map(name).join(", ")}) in ${p.blend.oils.length} oils (${p.blend.oils.map(name).join(", ")})`
      : [p.ingredient, ...(p.addedIngredients ?? [])]
          .filter((s): s is string => Boolean(s))
          .map(name)
          .join(" with ");
    return `- [${p.name}](${absoluteUrl(p.href)}): ${p.sizeLabel}${made ? `, ${made}` : ""}`;
  };

  const text = [
    `# ${site.brandName}`,
    "",
    `> ${site.brandName} is a Pakistani herbal hair-care brand that sells natural hair oils online at ${absoluteUrl("/")}: a Signature herbal blend, pure oils and oils with rosemary. Orders are delivered across Pakistan in 3–5 working days, with Cash on Delivery. The oils are for external use on the hair and scalp.`,
    "",
    "Prices are in Pakistani rupees (PKR); the current price and stock of each oil are on its product page.",
    "",
    "## Products",
    ...products.map(productLine),
    "",
    "## Collections",
    `- [All hair oils](${absoluteUrl("/shop")})`,
    ...collections
      .filter((c) => c.productSlugs.length > 0 && !isDuplicateCollection(c, collections))
      .map((c) => `- [${c.name}](${absoluteUrl(c.href)})`),
    "",
    "## Ingredients",
    `- [All ingredients](${absoluteUrl("/ingredients")})`,
    ...ingredients
      .filter((i) => ingredientIndexable(i.name))
      .map((i) => `- [${i.name}](${absoluteUrl(`/ingredients/${i.slug}`)})`),
    "",
    "## Hair care guides",
    ...BLOG_POSTS.map((p) => `- [${p.title}](${absoluteUrl(`/blog/${p.slug}`)}): ${p.description}`),
    "",
    "## Customer information",
    `- [Shipping and delivery](${absoluteUrl("/shipping")})`,
    `- [Returns and refunds](${absoluteUrl("/returns")})`,
    `- [FAQs](${absoluteUrl("/faqs")})`,
    `- [Contact](${absoluteUrl("/contact")}): ${site.contact.email}, phone and WhatsApp ${site.contact.phone}`,
    `- [Our story](${absoluteUrl("/our-story")})`,
    "",
  ].join("\n");

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}

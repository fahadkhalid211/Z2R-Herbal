import type { Product, SiteConfig } from "@/services/types";
import { BRAND, offerShipping } from "./seo";
import { SITE_URL, absoluteUrl } from "./site-url";

const CONTEXT = "https://schema.org";
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export interface Crumb {
  label: string;
  href?: string;
}

export function organizationSchema(site: SiteConfig) {
  const telephone = site.contact.phone;
  return {
    "@context": CONTEXT,
    "@type": "OnlineStore",
    "@id": ORGANIZATION_ID,
    name: BRAND,
    alternateName: ["Z2R", "z2rherbal"],
    url: SITE_URL,
    logo: absoluteUrl("/brand/logo-email.png"),
    description: site.blurb,
    email: site.contact.email,
    telephone,
    address: { "@type": "PostalAddress", addressCountry: "PK" },
    areaServed: { "@type": "Country", name: "Pakistan" },
    sameAs: site.socials.flatMap((s) => (s.href ? [s.href] : [])),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone,
      email: site.contact.email,
      areaServed: "PK",
      availableLanguage: ["en", "ur"],
    },
  };
}

export function websiteSchema() {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: BRAND,
    alternateName: ["Z2R"],
    url: SITE_URL,
    inLanguage: "en-PK",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href && { item: absoluteUrl(c.href) }),
    })),
  };
}

const IN_STOCK = "https://schema.org/InStock";
const OUT_OF_STOCK = "https://schema.org/OutOfStock";

export function productSchema(
  product: Product,
  opts: { category?: string; rating?: { average: number; count: number } } = {},
) {
  const url = absoluteUrl(product.href);
  const single = product.variants.length === 1 ? product.variants[0] : undefined;
  return {
    "@context": CONTEXT,
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.heroCopy,
    image: [product.images.card, product.images.bottle, product.images.box]
      .map((i) => absoluteUrl(i.src))
      .filter((src, i, all) => all.indexOf(src) === i),
    url,
    ...(single && { sku: single.sku }),
    ...(product.sizeLabel && { size: product.sizeLabel }),
    ...(opts.category && { category: opts.category }),
    brand: { "@type": "Brand", name: BRAND },
    ...(opts.rating &&
      opts.rating.count > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: opts.rating.average,
          reviewCount: opts.rating.count,
          bestRating: 5,
          worstRating: 1,
        },
      }),
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku,
      name: v.label,
      url,
      price: v.price,
      priceCurrency: "PKR",
      ...(v.compareAtPrice &&
        v.compareAtPrice > v.price && {
          priceSpecification: [
            { "@type": "UnitPriceSpecification", price: v.price, priceCurrency: "PKR" },
            {
              "@type": "UnitPriceSpecification",
              priceType: "https://schema.org/StrikethroughPrice",
              price: v.compareAtPrice,
              priceCurrency: "PKR",
            },
          ],
        }),
      availability: v.stock === 0 ? OUT_OF_STOCK : IN_STOCK,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": ORGANIZATION_ID },
      shippingDetails: offerShipping(v.price),
    })),
  };
}

export function collectionSchema(opts: {
  name: string;
  path: string;
  description: string;
  products: Pick<Product, "name" | "href">[];
}) {
  return {
    "@context": CONTEXT,
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(opts.path)}#page`,
    name: opts.name,
    url: absoluteUrl(opts.path),
    description: opts.description,
    inLanguage: "en-PK",
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: opts.products.length,
      itemListElement: opts.products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(p.href),
        name: p.name,
      })),
    },
  };
}

export function webPageSchema(opts: {
  type?: "WebPage" | "AboutPage";
  name: string;
  path: string;
  description: string;
  about?: { name: string } | { "@id": string };
}) {
  return {
    "@context": CONTEXT,
    "@type": opts.type ?? "WebPage",
    "@id": `${absoluteUrl(opts.path)}#page`,
    name: opts.name,
    url: absoluteUrl(opts.path),
    description: opts.description,
    inLanguage: "en-PK",
    isPartOf: { "@id": WEBSITE_ID },
    ...(opts.about && {
      about: "@id" in opts.about ? opts.about : { "@type": "Thing", name: opts.about.name },
    }),
  };
}

export function faqSchema(items: readonly { question: string; answer: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function blogPostingSchema(post: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
  image: string;
}) {
  const url = absoluteUrl(post.path);
  return {
    "@context": CONTEXT,
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: url,
    image: [absoluteUrl(post.image)],
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    inLanguage: "en-PK",
    author: { "@type": "Organization", "@id": ORGANIZATION_ID, name: BRAND, url: SITE_URL },
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}

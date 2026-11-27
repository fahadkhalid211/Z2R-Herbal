import type { Metadata } from "next";
import { PAGE_SEO } from "./seo";

interface PageMeta {
  title: string;
  description?: string;
  path: string;
  index?: boolean;
  image?: string;
  canonical?: string;
  adminSeo?: boolean;
  article?: { publishedTime: string; modifiedTime: string };
}

export function pageMeta({
  title,
  description,
  path,
  index = true,
  image,
  adminSeo,
  canonical,
  article,
}: PageMeta): Metadata {
  const seo = adminSeo ? undefined : PAGE_SEO[path];
  const finalTitle = seo?.title ?? title;
  const finalDescription = seo?.description ?? description;
  const branded = finalTitle.includes("Z2R");
  const images = [{ url: image ?? "/opengraph-image" }];
  return {
    title: branded ? { absolute: finalTitle } : finalTitle,
    ...(finalDescription && { description: finalDescription }),
    alternates: { canonical: canonical ?? path },
    openGraph: {
      ...(article
        ? {
            type: "article" as const,
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime,
          }
        : { type: "website" as const }),
      siteName: "Z2R Herbal",
      locale: "en_PK",
      title: branded ? finalTitle : `${finalTitle} | Z2R Herbal`,
      ...(finalDescription && { description: finalDescription }),
      url: canonical ?? path,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: branded ? finalTitle : `${finalTitle} | Z2R Herbal`,
      ...(finalDescription && { description: finalDescription }),
      images: images.map((i) => i.url),
    },
    ...(!index && { robots: { index: false, follow: true } }),
  };
}

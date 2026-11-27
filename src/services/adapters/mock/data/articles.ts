import manifest from "./image-manifest.json";

const sizes: Record<string, { width: number; height: number }> = manifest;

function image(src: string, alt: string) {
  const size = sizes[src];
  if (!size) throw new Error(`Image missing from image-manifest.json: ${src} (run npm run assets)`);
  return { src, alt, ...size };
}

export const articles = [
  {
    id: "art_choose-right-hair-oil",
    slug: "choose-right-hair-oil",
    title: "How to Choose the Right Hair Oil for Your Hair Type",
    excerpt: "Dry, oily or somewhere in between: a simple guide to matching an oil to your hair.",
    image: image("/images/journal/choose-right-oil.webp", "Woman with long, healthy wavy hair"),
    href: "/journal/choose-right-hair-oil",
    publishedAt: "2026-10-28",
  },
  {
    id: "art_coconut-oil-benefits",
    slug: "coconut-oil-benefits",
    title: "The Benefits of Coconut Oil for Hair Care",
    excerpt: "Why coconut oil has been a hair-care staple for generations, and how to use it well.",
    image: image("/images/journal/coconut-oil-benefits.webp", "Coconut halves with a splash of coconut oil"),
    href: "/journal/coconut-oil-benefits",
    publishedAt: "2026-10-21",
  },
  {
    id: "art_almond-oil-boost",
    slug: "almond-oil-boost",
    title: "Almond Oil: A Natural Boost for Healthy Hair",
    excerpt: "Light, nourishing and easy to work into a weekly routine.",
    image: image("/images/journal/almond-oil-boost.webp", "A pile of almonds"),
    href: "/journal/almond-oil-boost",
    publishedAt: "2026-10-14",
  },
];

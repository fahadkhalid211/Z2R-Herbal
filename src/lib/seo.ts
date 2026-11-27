export const BRAND = "Z2R Herbal";
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 155;

export interface SeoText {
  title: string;
  description: string;
}

export const PAGE_SEO: Record<string, SeoText> = {
  "/": {
    title: "Herbal Hair Oil in Pakistan | Natural Oils | Z2R Herbal",
    description:
      "Shop herbal hair oils made in Pakistan: the Signature blend of 10 herbs and 6 oils, pure oils and rosemary oils. Cash on Delivery across Pakistan.",
  },
  "/shop": {
    title: "Hair Oil Price in Pakistan: Buy Online | Z2R Herbal",
    description:
      "Shop Z2R Herbal hair oils online: Signature blend, almond, coconut with rosemary, mustard, olive, sesame and pumpkin seed. Cash on Delivery nationwide.",
  },
  "/shop/hair-oils": {
    title: "Natural Hair Oils in Pakistan | Z2R Herbal",
    description:
      "Natural hair oils in 110 ml bottles, each built around a botanical ingredient. Order online with Cash on Delivery and 3–5 day delivery across Pakistan.",
  },
  "/collections/signature": {
    title: "Herbal Blend Hair Oil: Amla, Reetha & Shikakai | Z2R Herbal",
    description:
      "What is in the Z2R Herbal Signature blend: 10 herbs including amla, reetha, shikakai and kalonji, with 6 natural oils. 110 ml, made in Pakistan.",
  },
  "/collections/pure-oils": {
    title: "Pure Hair Oils: Almond, Mustard, Olive & Sesame | Z2R Herbal",
    description:
      "Pure hair oils from Z2R Herbal: almond, mustard, olive and sesame, each in a 110 ml bottle. Order online with Cash on Delivery across Pakistan.",
  },
  "/collections/with-rosemary": {
    title: "Rosemary Hair Oils in Pakistan | Z2R Herbal",
    description:
      "Hair oils with 1% rosemary from Z2R Herbal: coconut with rosemary and pumpkin seed with rosemary, 110 ml. Cash on Delivery across Pakistan.",
  },
  "/collections/bestsellers": {
    title: "Bestselling Hair Oils | Z2R Herbal",
    description:
      "The Z2R Herbal hair oils customers order most. Shop online with Cash on Delivery and 3–5 working day delivery across Pakistan.",
  },
  "/ingredients": {
    title: "Herbs & Oils for Hair: Our Ingredients | Z2R Herbal",
    description:
      "The 6 natural oils and 10 herbs in Z2R Herbal hair oils, from amla, reetha and shikakai to kalonji and rosemary, and the oils each one is used in.",
  },
  "/our-story": {
    title: "Our Story: Pakistani Herbal Hair Care | Z2R Herbal",
    description:
      "How Z2R Herbal began: bringing natural ingredients and traditional herbal care into everyone's daily hair care routine, made in Pakistan.",
  },
  "/faqs": {
    title: "Hair Oil FAQs: Use, Delivery & Payment | Z2R Herbal",
    description:
      "Answers to common questions about Z2R Herbal hair oils: how to use them, Cash on Delivery, delivery across Pakistan, returns and support.",
  },
  "/shipping": {
    title: "Shipping & Cash on Delivery in Pakistan | Z2R Herbal",
    description:
      "Z2R Herbal delivers across Pakistan in 3–5 working days with Cash on Delivery. How delivery charges, times and order confirmation work.",
  },
  "/returns": {
    title: "Return & Refund Policy | Z2R Herbal",
    description:
      "How returns and refunds work at Z2R Herbal, including damaged or incorrect products, the conditions, and how to contact our support team.",
  },
  "/contact": {
    title: "Contact Z2R Herbal: WhatsApp & Email Support",
    description:
      "Questions about an order or our hair oils? Contact Z2R Herbal on WhatsApp at +92 313 8149292 or email support@z2rherbal.com.",
  },
  "/help": {
    title: "Help Centre: Orders, Delivery & Returns | Z2R Herbal",
    description:
      "Help with Z2R Herbal orders: FAQs, shipping and Cash on Delivery, returns and refunds, and how to reach our support team.",
  },
  "/privacy": {
    title: "Privacy Policy | Z2R Herbal",
    description:
      "How Z2R Herbal collects, uses and protects the personal information you share when you shop with us.",
  },
  "/terms": {
    title: "Terms & Conditions | Z2R Herbal",
    description:
      "The terms that apply when you browse z2rherbal.com and order Z2R Herbal products in Pakistan.",
  },
  "/blog": {
    title: "Hair Oiling Guides: Champi, Patch Test & More | Z2R Herbal",
    description:
      "Simple, practical hair-oiling guides from Z2R Herbal: how to oil your hair, how often to use each oil, and how to do a patch test before first use.",
  },
};

const OIL_TITLES: Record<string, string> = {
  almond: "Almond Oil for Hair (Roghan Badam)",
  mustard: "Mustard Oil for Hair (Sarson ka Tel)",
  olive: "Olive Oil for Hair (Zaitoon ka Tel)",
  sesame: "Sesame Oil for Hair (Til ka Tel)",
  coconut: "Coconut Oil for Hair (Nariyal ka Tel)",
  "pumpkin-seed": "Pumpkin Seed Oil for Hair",
};
const baseSlug = (slug?: string) => slug?.replace(/-oil$/, "");

export function productKeywordTitle(p: {
  name: string;
  ingredient?: string;
  addedIngredients?: string[];
  blend?: { oils: string[]; herbs: string[] };
}): string | undefined {
  if (p.blend)
    return `Signature Herbal Hair Oil, ${p.blend.herbs.length} Herbs + ${p.blend.oils.length} Oils`;
  const oil = baseSlug(p.ingredient);
  const base = oil ? OIL_TITLES[oil] : undefined;
  if (!oil || !base) return undefined;
  if (p.addedIngredients?.some((s) => /rosemary/.test(s))) {
    const percent = /\b1%/.test(p.name) ? "1% " : "";
    const name = base.replace(/ for Hair.*$/, "");
    return `${name} with ${percent}Rosemary for Hair`;
  }
  return base;
}

export function brandedTitle(...options: string[]): string {
  for (const option of options) {
    const title = option.includes("Z2R") ? option : `${option} | ${BRAND}`;
    if (title.length <= TITLE_MAX) return title;
  }
  return options.at(-1)!.slice(0, TITLE_MAX);
}

export function clipDescription(...parts: (string | undefined | null)[]): string {
  const text = parts
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");
  if (text.length <= DESCRIPTION_MAX) return text;
  const cut = text.slice(0, DESCRIPTION_MAX - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}

const ORDER_LINE = "Cash on Delivery and 3–5 day delivery across Pakistan.";

export function productSeo(p: {
  name: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  sizeLabel?: string;
  price?: number;
  heroCopy?: string;
  ingredient?: string;
  addedIngredients?: string[];
  blend?: { oils: string[]; herbs: string[] };
}): SeoText {
  const size = p.sizeLabel ? ` (${p.sizeLabel})` : "";
  const price = p.price ? ` Rs ${p.price.toLocaleString("en-PK")}.` : "";
  const keyword = productKeywordTitle(p);
  return {
    title: brandedTitle(
      ...(keyword ? [`${keyword} ${p.sizeLabel ?? ""}`.trim(), keyword] : []),
      ...(p.seoTitle ? [p.seoTitle] : []),
      `${p.name}${size}`,
      p.name,
    ),
    description:
      keyword && p.price
        ? fitDescription(
            `${keyword}: price in Pakistan Rs ${p.price.toLocaleString("en-PK")}${size}.`,
            ORDER_LINE,
            p.heroCopy,
          )
        : p.seoDescription
          ? clipDescription(p.seoDescription)
          : clipDescription(`${p.name}${size}.${price}`, ORDER_LINE, p.heroCopy),
  };
}

const HERB_ALIASES: Record<string, string> = { fenugreek: "Methi" };

export function ingredientSeo(
  i: { name: string; description: string; kind?: "oil" | "herb" },
  usedIn: string[],
  summary?: string,
): SeoText {
  const base = i.name.replace(/\s*\(.*\)$/, "");
  const verb = /s$/i.test(base) ? "Are" : "Is";
  const alias = HERB_ALIASES[base.toLowerCase().replace(/\s+seeds?$/, "")];
  const named = alias ? `${i.name} (${alias})` : i.name;
  const title =
    i.kind === "herb"
      ? brandedTitle(
          `${named} for Hair: What It Is & How It's Used`,
          `${named} for Hair: Traditional Uses`,
          `${named} for Hair`,
          i.name,
        )
      : brandedTitle(`What ${verb} ${i.name}? Hair Care Uses`, `${i.name} in Hair Care`, i.name);
  const firstSentence = summary?.match(/^.*?[.!?](\s|$)/)?.[0].trim();
  return {
    title,
    description: fitDescription(
      firstSentence ?? `${i.name} in hair care: ${i.description}`,
      usedIn.length ? `Used in ${usedIn.join(" and ")}.` : undefined,
      "How it is used in hair care.",
    ),
  };
}

export function fitDescription(...parts: (string | undefined | null)[]): string {
  const [first, ...rest] = parts.map((p) => p?.trim().replace(/\s+/g, " ")).filter((p): p is string => !!p);
  if (!first) return "";
  if (first.length > DESCRIPTION_MAX) return clipDescription(first);
  return rest.reduce(
    (acc, part) => (`${acc} ${part}`.length <= DESCRIPTION_MAX ? `${acc} ${part}` : acc),
    first,
  );
}

export function galleryAlt(
  p: { name: string; sizeLabel?: string; media?: { src: string; role: string }[] },
  image: { src: string; alt: string },
  index: number,
): string {
  const own = image.alt.trim();
  if (own && own !== p.name && own !== BRAND) return own;
  const role = p.media?.find((m) => m.src === image.src)?.role ?? ["pack", "bottle", "box"][index];
  const size = p.sizeLabel ? ` ${p.sizeLabel}` : "";
  if (role === "pack") return `${BRAND} ${p.name}${size} bottle and box`;
  if (role === "bottle") return `${p.name}${size} bottle, front label`;
  if (role === "box") return `${p.name}${size} box, front`;
  return `${p.name}${size}, photo ${index + 1}`;
}

export function listingSeo(name: string, description?: string | null): SeoText {
  return {
    title: brandedTitle(name),
    description: clipDescription(description || `${name} from ${BRAND}.`, ORDER_LINE),
  };
}

export const DELIVERY_FEE = 250;
export const FREE_DELIVERY_FROM = 2500;

export function offerShipping(price: number) {
  return {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: price >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE,
      currency: "PKR",
    },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "PK" },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 5, unitCode: "DAY" },
    },
  };
}

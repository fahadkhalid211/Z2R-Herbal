import type { CopyBlock } from "@/components/sections/CopySection";
import { formatPrice } from "@/lib/money";
import { DELIVERY_FEE, FREE_DELIVERY_FROM } from "@/lib/seo";
import type { Ingredient, Product } from "@/services/types";

export const URDU_NAMES: Record<string, string> = {
  almond: "roghan badam",
  mustard: "sarson ka tel",
  olive: "zaitoon ka tel",
  sesame: "til ka tel",
  coconut: "nariyal ka tel",
};
export const oilKey = (slug?: string) => slug?.replace(/-oil$/, "") ?? "";

const link = (p: Pick<Product, "name" | "href">) => `[${p.name}](${p.href})`;
const list = (items: string[]) =>
  items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
const count = (n: number) => ["no", "one", "two", "three", "four", "five", "six"][n] ?? String(n);
const withUrdu = (p: Product) => {
  const urdu = URDU_NAMES[oilKey(p.ingredient)];
  return urdu ? `${link(p)} (${urdu})` : link(p);
};

export const DELIVERY_FEE_LINE = `Delivery costs ${formatPrice(DELIVERY_FEE)} per order, and it is free on orders of ${formatPrice(FREE_DELIVERY_FROM)} or more.`;
export const DELIVERY_LINE = `Delivery across Pakistan takes 3–5 working days. ${DELIVERY_FEE_LINE}`;
export const GUIDE_PATH = "/blog/best-hair-oil-in-pakistan";

export interface ListingCopy {
  h1: string;
  lead: string;
  about: CopyBlock;
}

interface Context {
  listed: Product[];
  all: Product[];
  ingredients: Ingredient[];
}

export function isDuplicateCollection(
  collection: { slug: string; sortOrder: number; productSlugs: string[] },
  all: { slug: string; sortOrder: number; productSlugs: string[] }[],
): boolean {
  const key = collection.productSlugs.join();
  return (
    collection.productSlugs.length > 0 &&
    all.some(
      (c) =>
        c.slug !== collection.slug && c.sortOrder < collection.sortOrder && c.productSlugs.join() === key,
    )
  );
}

export function collectionCopy(slug: string, ctx: Context): ListingCopy | undefined {
  const signature = ctx.all.find((p) => p.blend);
  const size = ctx.listed[0]?.sizeLabel ?? "110 ml";
  const name = (s: string) => ctx.ingredients.find((i) => i.slug === s)?.name ?? s;
  const id = `about-${slug}`;

  if (slug === "signature") {
    const blend = ctx.listed.find((p) => p.blend);
    if (!blend?.blend) return undefined;
    const herbs = blend.blend.herbs.map(name);
    const oils = blend.blend.oils.map(name);
    return {
      h1: "Signature Herbal Blend",
      lead: `${herbs.length} herbs and ${oils.length} natural oils in one ${blend.sizeLabel} bottle.`,
      about: {
        id,
        eyebrow: "Inside the Blend",
        title: "What Is in Our Herbal Hair Oil",
        paragraphs: [
          `Our ${link(blend)} brings together ${herbs.length} traditional herbs used in South Asian hair care: ${list(herbs)}.`,
          `They are combined with ${count(oils.length)} natural oils: ${list(oils)}. Because the ingredients are botanical, natural variations in colour, aroma and texture can occur.`,
          `To use it, massage the oil into the scalp and hair lengths, leave it on, then wash it out with a gentle shampoo. The [${blend.name} page](${blend.href}) gives the full directions, the recommended use and the warnings, including a patch test before first use.`,
          `Read about each herb in our [ingredients guide](/ingredients). Prefer a single oil? See our [pure hair oils](/collections/pure-oils).`,
        ],
      },
    };
  }

  if (slug === "pure-oils") {
    return {
      h1: "Pure Hair Oils",
      lead: "One natural oil in each bottle, for simple everyday oiling.",
      about: {
        id,
        eyebrow: "One Oil, One Bottle",
        title: "Choosing a Pure Hair Oil",
        paragraphs: [
          `Sometimes one oil is all a hair routine needs. Each of our pure oils is a single natural oil in a ${size} bottle: ${list(ctx.listed.map(withUrdu))}.`,
          `These are oils many Pakistani households already know from champi, the traditional head massage. Each product page gives its own directions, recommended use and warnings, so read it before you start and do a patch test before first use.`,
          `Would you like herbs and oils together in one bottle? Try our ${signature ? link(signature) : "Signature Hair Oil"}, or see the [oils with rosemary](/collections/with-rosemary).`,
          `${DELIVERY_LINE} You can pay with Cash on Delivery.`,
        ],
      },
    };
  }

  if (slug === "with-rosemary") {
    const n = ctx.listed.length;
    return {
      h1: "Rosemary Hair Oils",
      lead: "Natural oils with rosemary already blended in, ready to apply.",
      about: {
        id,
        eyebrow: "Ready to Use",
        title: "Rosemary in Your Hair Oil",
        paragraphs: [
          `Rosemary is a popular ingredient in scalp and hair-care routines. In these oils it is already blended into a natural carrier oil, so you apply the oil directly instead of diluting an essential oil yourself: ${list(ctx.listed.map(link))}.`,
          `${n === 2 ? "Both come" : n === 1 ? "It comes" : "Each comes"} in a ${size} bottle. Apply a small amount to the scalp and hair, massage gently, then wash it out with a suitable shampoo. Each product page lists its recommended use and warnings, including a patch test before first use.`,
          `Rosemary is also one of the herbs in our ${signature ? link(signature) : "Signature Hair Oil"}. To learn more about the herb itself, read our [rosemary guide](/ingredients/rosemary).`,
          `${DELIVERY_LINE} You can pay with Cash on Delivery.`,
        ],
      },
    };
  }

  if (slug === "bestsellers") {
    return {
      h1: "Bestselling Hair Oils",
      lead: "Our bestsellers from the Z2R Herbal range.",
      about: {
        id,
        eyebrow: "Where to Start",
        title: "New to Z2R Herbal?",
        paragraphs: [
          `If you are trying Z2R Herbal for the first time, start with ${list(ctx.listed.map(link))}. Every bottle is ${size}.`,
          `To compare every oil and its price, see the [full hair oil range](/shop), or read our guide to [choosing the best hair oil in Pakistan](${GUIDE_PATH}).`,
          `${DELIVERY_LINE} You can pay with Cash on Delivery.`,
        ],
      },
    };
  }
  return undefined;
}

export function shopCopy(products: Product[]): ListingCopy["about"] {
  const priced = [...products].sort((a, b) => a.salePrice - b.salePrice);
  const low = priced[0];
  const high = priced.at(-1);
  const signature = products.find((p) => p.blend);
  return {
    id: "about-shop",
    eyebrow: "Buying Guide",
    title: "Hair Oil Prices in Pakistan",
    paragraphs: [
      ...(low && high
        ? [
            `Every Z2R Herbal oil comes in a ${low.sizeLabel} bottle. Prices run from ${formatPrice(low.salePrice)} for ${link(low)} to ${formatPrice(high.salePrice)} for ${link(high)}, and the price on each product is the price of the bottle before delivery.`,
          ]
        : []),
      `Choose a herbal blend such as our ${signature ? link(signature) : "Signature Hair Oil"} for herbs and oils together, a [pure oil](/collections/pure-oils) for one familiar ingredient, or an [oil with rosemary](/collections/with-rosemary). Not sure which suits you? Our guide to the [best hair oil in Pakistan](${GUIDE_PATH}) explains the differences.`,
      `${DELIVERY_LINE} You can pay with Cash on Delivery when your order arrives.`,
    ],
  };
}

export interface IngredientGuide {
  aka?: string;
  whatItIs: string;
  tradition?: string;
}

const GUIDES: Record<string, IngredientGuide> = {
  amla: {
    aka: "Indian gooseberry (Phyllanthus emblica)",
    whatItIs: "Amla is the small, sour fruit of the Indian gooseberry tree.",
    tradition:
      "It is one of the best-known ingredients in South Asian hair oils, and it is often used together with reetha and shikakai.",
  },
  reetha: {
    aka: "soapnut (Sapindus mukorossi)",
    whatItIs:
      "Reetha is the dried fruit of the soapnut tree. Its shell lathers when it is rubbed in water, which is why it has long been used as a natural cleanser.",
    tradition:
      "In South Asian homes, reetha has traditionally been used to wash hair, often with shikakai and amla.",
  },
  shikakai: {
    aka: "Acacia concinna",
    whatItIs:
      "Shikakai is the dried pod of a climbing acacia shrub that grows in South Asia. The pods are usually ground into a fine powder.",
    tradition:
      "It has been used for generations in traditional hair-washing powders, usually alongside reetha and amla.",
  },
  "curry leaves": {
    aka: "kadi patta (Murraya koenigii)",
    whatItIs:
      "Curry leaves are the fragrant leaves of the curry tree, a familiar ingredient in South Asian kitchens.",
    tradition:
      "They are also a traditional addition to homemade hair oils, where the leaves are infused in an oil.",
  },
  balchar: {
    whatItIs: "Balchar is a traditional herb used in South Asian herbal preparations.",
  },
  "black hing": {
    whatItIs: "Black hing is one of the traditional botanical ingredients in our Signature blend.",
  },
  kalonji: {
    aka: "black seed or black cumin (Nigella sativa)",
    whatItIs:
      "Kalonji are the small black seeds of the Nigella sativa plant, widely used in Pakistani kitchens.",
    tradition: "Kalonji and kalonji oil are also familiar ingredients in traditional hair-care preparations.",
  },
  fenugreek: {
    aka: "methi (Trigonella foenum-graecum)",
    whatItIs: "Fenugreek seeds, known as methi dana, are a common spice in Pakistani cooking.",
    tradition: "Methi seeds are also used in traditional hair care, usually soaked or infused in oil.",
  },
  "black had": {
    whatItIs: "Black had is one of the traditional herbs in our Signature blend.",
  },
  rosemary: {
    aka: "Salvia rosmarinus, formerly Rosmarinus officinalis",
    whatItIs:
      "Rosemary is a fragrant evergreen herb from the Mediterranean, used in cooking and in personal-care products.",
    tradition:
      "Today it is a popular ingredient in scalp and hair-care routines. In our oils with rosemary it is already blended into the carrier oil, so there is nothing to dilute.",
  },
  mustard: {
    aka: "sarson ka tel",
    whatItIs:
      "Mustard oil is pressed from mustard seeds. It has a strong, pungent aroma and is a staple oil in Pakistani homes.",
    tradition: "It is the classic oil for champi, the traditional head massage, across Pakistan.",
  },
  sesame: {
    aka: "til ka tel (Sesamum indicum)",
    whatItIs: "Sesame oil is pressed from sesame seeds.",
    tradition: "It has long been used as a massage oil in South Asia, for the scalp as well as the body.",
  },
  pumpkin: {
    whatItIs: "Pumpkin seed oil is pressed from the seeds of the pumpkin.",
    tradition: "It is a newer addition to hair care, used as a source of natural fatty acids.",
  },
  almond: {
    aka: "roghan badam, sweet almond oil",
    whatItIs: "Almond oil, known in Urdu as roghan badam, is a light oil pressed from sweet almonds.",
    tradition: "It has a long place in South Asian hair and skin care.",
  },
  coconut: {
    aka: "nariyal ka tel",
    whatItIs:
      "Coconut oil is pressed from the kernel of the coconut. It turns solid in cold weather, which is normal: stand the bottle in lukewarm water for a few minutes and it melts again.",
    tradition: "It is one of the most widely used hair oils in South Asia.",
  },
  olive: {
    aka: "zaitoon ka tel",
    whatItIs: "Olive oil is pressed from ripe olives.",
    tradition: "It is used around the world in hair and skin care.",
  },
};

export const guideKey = (name: string) =>
  name
    .toLowerCase()
    .replace(/\(.*\)/, "")
    .replace(/\b(oil|seeds?)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function ingredientGuide(name: string): IngredientGuide | undefined {
  return GUIDES[guideKey(name)];
}

export function ingredientIndexable(name: string): boolean {
  const guide = ingredientGuide(name);
  return !guide || Boolean(guide.tradition);
}

export function productDirections(product: Product) {
  const sections = product.information ?? [];
  const pick = (re: RegExp) => sections.find((s) => re.test(s.section))?.items ?? [];
  return {
    howToUse: pick(/how to use|directions|usage/i).filter((i) => i.details),
    warnings: pick(/warning|caution|precaution/i).filter((i) => i.details),
  };
}

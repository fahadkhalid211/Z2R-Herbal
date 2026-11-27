import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i, "Expected a #rrggbb colour");
const href = z
  .string()
  .regex(/^(\/|#|https?:\/\/|tel:|mailto:)/, "Expected an internal path or absolute URL");

export const imageSchema = z.object({
  src: z.string().regex(/^(\/|https?:\/\/)/),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string(),
});

export const iconNameSchema = z.enum([
  "pakistan-flag",
  "leaf",
  "leaves",
  "flask",
  "truck",
  "shield-check",
  "drop",
  "hair-sprout",
  "hair-strands",
  "sparkles",
]);

export const imageRoleSchema = z.enum(["pack", "bottle", "box", "hero-bottle", "hero-box", "gallery"]);
export const ingredientRoleSchema = z.enum(["main", "added", "blend-oil", "blend-herb"]);

export const variantSchema = z.object({
  id: z.string().min(1),
  sku: z.string().min(1),
  label: z.string().min(1),
  volumeMl: z.number().int().positive().optional(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  isDefault: z.boolean(),
  sortOrder: z.number().int(),
});

export const productImageSchema = imageSchema.extend({
  role: imageRoleSchema,
  variantId: z.string().optional(),
  sortOrder: z.number().int(),
});

export const ingredientSchema = z.object({
  id: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  description: z.string(),
  kind: z.enum(["oil", "herb"]).default("oil"),
  sortOrder: z.number().int().default(0),
  image: imageSchema,
  cutout: imageSchema.optional(),
  productSlug: z.string().optional(),
});

export const productIngredientSchema = z.object({
  role: ingredientRoleSchema,
  sortOrder: z.number().int(),
  ingredient: ingredientSchema,
});

export const productSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  shortName: z.string().min(1),
  status: z.enum(["draft", "active", "archived"]),
  featured: z.boolean(),
  category: z.string().min(1),
  collections: z.array(z.string()),
  variants: z.array(variantSchema).min(1),
  price: z.number().positive().optional(),
  salePrice: z.number().positive(),
  volumeMl: z.number().int().positive().optional(),
  sizeLabel: z.string(),
  isNew: z.boolean(),
  isBestseller: z.boolean(),
  badge: z.string().optional(),
  rating: z.object({ average: z.number().min(0).max(5), count: z.number().int().positive() }).optional(),
  ingredients: z.array(productIngredientSchema),
  ingredient: z.string().optional(),
  addedIngredients: z.array(z.string()).optional(),
  labelClaims: z.array(z.string()).optional(),
  blend: z.object({ oils: z.array(z.string()), herbs: z.array(z.string()) }).optional(),
  cardOrder: z.number().int(),
  shopOrder: z.number().int(),
  heroOrder: z.number().int().nullable(),
  tagline: z.string(),
  heroCopy: z.string(),
  longDescription: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  accent: z.object({ base: hexColor, glow: hexColor, ink: hexColor }),
  oilColor: hexColor,
  media: z.array(productImageSchema).min(1),
  images: z.object({
    card: imageSchema,
    box: imageSchema,
    bottle: imageSchema,
    heroBottle: imageSchema,
    heroBox: imageSchema,
  }),
  href,
  information: z
    .array(
      z.object({
        section: z.string(),
        items: z.array(z.object({ title: z.string(), details: z.string(), imageUrl: z.string().nullable() })),
      }),
    )
    .optional(),
});

export const trustBadgeSchema = z.object({ id: z.string(), label: z.string(), icon: iconNameSchema });

export const featureSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  icon: iconNameSchema,
});

export const benefitSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  icon: iconNameSchema,
});

export const articleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  image: imageSchema,
  href,
  publishedAt: z.iso.date(),
});

export const offerSchema = z.object({
  id: z.string(),
  title: z.string(),
  headline: z.string(),
  highlight: z.string(),
  code: z.string().regex(/^[A-Z0-9]+$/),
  discountPercent: z.number().int().min(1).max(100),
  cta: z.object({ label: z.string(), href }),
});

const linkSchema = z.object({ label: z.string(), href });

export const siteConfigSchema = z.object({
  brandName: z.string(),
  blurb: z.string(),
  nav: z.array(linkSchema.extend({ menu: z.enum(["shop", "ingredients", "help"]).optional() })),
  help: z.array(linkSchema),
  footer: z.object({ legal: z.array(linkSchema) }),
  contact: z.object({
    phone: z.string(),
    phoneHref: z.string().startsWith("tel:"),
    email: z.email(),
    location: z.string(),
    whatsapp: z.object({ number: z.string().regex(/^\d{10,15}$/), greeting: z.string() }),
  }),
  socials: z.array(
    z.object({
      platform: z.enum(["facebook", "instagram", "youtube", "tiktok"]),
      label: z.string(),
      href: z.url().optional(),
    }),
  ),
  copyright: z.string(),
});

export const subscribeResultSchema = z.object({ ok: z.literal(true) });

const mediaSrc = z
  .string()
  .regex(/^(\/(?!\/)|https:\/\/)/, "Expected a site path (/videos/…) or an https URL");

export const videoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  src: mediaSrc,
  type: z.enum(["video/mp4", "video/webm"]).default("video/mp4"),
  poster: mediaSrc,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  enabled: z.boolean().default(true),
});

export const productListSchema = z.array(productSchema);

export const categoryRecordSchema = z.object({
  id: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  description: z.string().optional(),
  parentId: z.string().nullable(),
  sortOrder: z.number().int(),
  image: imageSchema.optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  href,
  productCount: z.number().int().nonnegative(),
});

export const categorySchema = z.object({
  id: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  description: z.string().optional(),
  href,
  kind: z.enum(["category", "collection"]),
});

export const collectionSchema = z.object({
  id: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  description: z.string().optional(),
  sortOrder: z.number().int(),
  image: imageSchema.optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  href,
  productSlugs: z.array(z.string()),
});

export const categoryListSchema = z.array(categorySchema);
export const categoryRecordListSchema = z.array(categoryRecordSchema);
export const collectionListSchema = z.array(collectionSchema);
export const ingredientListSchema = z.array(ingredientSchema);
export const trustBadgeListSchema = z.array(trustBadgeSchema);
export const featureListSchema = z.array(featureSchema);
export const benefitListSchema = z.array(benefitSchema);
export const articleListSchema = z.array(articleSchema);
export const videoListSchema = z.array(videoSchema);

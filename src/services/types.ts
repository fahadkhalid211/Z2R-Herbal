import type { z } from "zod";
import type {
  articleSchema,
  categoryRecordSchema,
  categorySchema,
  collectionSchema,
  ingredientSchema,
  benefitSchema,
  featureSchema,
  iconNameSchema,
  imageSchema,
  imageRoleSchema,
  ingredientRoleSchema,
  offerSchema,
  productImageSchema,
  productIngredientSchema,
  productSchema,
  siteConfigSchema,
  trustBadgeSchema,
  variantSchema,
  videoSchema,
} from "./schemas";

export type ImageAsset = z.infer<typeof imageSchema>;
export type IconName = z.infer<typeof iconNameSchema>;
export type Product = z.infer<typeof productSchema>;
export type TrustBadge = z.infer<typeof trustBadgeSchema>;
export type Feature = z.infer<typeof featureSchema>;
export type Benefit = z.infer<typeof benefitSchema>;
export type Article = z.infer<typeof articleSchema>;
export type Offer = z.infer<typeof offerSchema>;
export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Ingredient = z.infer<typeof ingredientSchema>;
export type Video = z.infer<typeof videoSchema>;
export type Variant = z.infer<typeof variantSchema>;
export type ImageRole = z.infer<typeof imageRoleSchema>;
export type ProductImage = z.infer<typeof productImageSchema>;
export type IngredientRole = z.infer<typeof ingredientRoleSchema>;
export type ProductIngredient = z.infer<typeof productIngredientSchema>;
export type CategoryRecord = z.infer<typeof categoryRecordSchema>;
export type Collection = z.infer<typeof collectionSchema>;

export interface CategoryNode extends CategoryRecord {
  children: CategoryNode[];
}

export interface PricedVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  label: string;
  price: number;
  isDefault: boolean;
}

export interface HomePageData {
  site: SiteConfig;
  trustBadges: TrustBadge[];
  heroFeatures: Feature[];
  heroSlides: Product[];
  featureStrip: Feature[];
  products: Product[];
  benefits: Benefit[];
  categories: Category[];
  ingredients: Ingredient[];
  videos: Video[];
  articles: Article[] | null;
  offer: Offer | null;
}

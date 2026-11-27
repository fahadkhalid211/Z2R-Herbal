export const PRODUCT_STATUSES = ["draft", "active", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const IMAGE_ROLES = ["pack", "bottle", "box", "hero-bottle", "hero-box", "gallery"] as const;
export type ImageRole = (typeof IMAGE_ROLES)[number];

export const INGREDIENT_KINDS = ["oil", "herb"] as const;
export type IngredientKind = (typeof INGREDIENT_KINDS)[number];

export const INGREDIENT_ROLES = ["main", "added", "blend-oil", "blend-herb"] as const;
export type IngredientRole = (typeof INGREDIENT_ROLES)[number];

interface Listing {
  imageUrl: string | null;
  imageAlt: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  seoTitle: string | null;
  seoDescription: string | null;
  active: boolean;
}

export interface CategoryRow extends Listing {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parentId: string | null;
  sortOrder: number;
}

export interface CollectionRow extends Listing {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
}

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  shortDescription: string;
  longDescription: string | null;
  categoryId: string;
  status: ProductStatus;
  featured: boolean;
  isBestseller: boolean;
  rating?: { average: number; count: number } | null;
  isNew: boolean;
  badge: string | null;
  accentBase: string;
  accentGlow: string;
  accentInk: string;
  oilColor: string;
  labelClaims: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  sortOrder: number;
  shopOrder: number;
  heroOrder: number | null;
}

export interface VariantRow {
  id: string;
  productId: string;
  sku: string;
  label: string;
  volumeMl: number | null;
  price: number;
  compareAtPrice: number | null;
  stock: number | null;
  isDefault: boolean;
  sortOrder: number;
  active: boolean;
}

export interface ImageRow {
  id: string;
  productId: string;
  variantId: string | null;
  url: string;
  alt: string;
  width: number;
  height: number;
  role: ImageRole;
  sortOrder: number;
}

export interface ProductCollectionRow {
  productId: string;
  collectionId: string;
  sortOrder: number;
}

export interface IngredientRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  kind: IngredientKind;
  photoUrl: string;
  photoWidth: number;
  photoHeight: number;
  cutoutUrl: string | null;
  cutoutAlt: string | null;
  cutoutWidth: number | null;
  cutoutHeight: number | null;
  sortOrder: number;
  active: boolean;
}

export interface ProductIngredientRow {
  productId: string;
  ingredientId: string;
  role: IngredientRole;
  sortOrder: number;
}

export interface CatalogRows {
  categories: CategoryRow[];
  collections: CollectionRow[];
  products: ProductRow[];
  variants: VariantRow[];
  images: ImageRow[];
  productCollections: ProductCollectionRow[];
  ingredients: IngredientRow[];
  productIngredients: ProductIngredientRow[];
}

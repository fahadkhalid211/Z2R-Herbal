import type { CatalogRows } from "./rows";

export type { CatalogRows } from "./rows";

export interface CatalogPayload {
  products: unknown[];
  categories: unknown[];
  collections: unknown[];
  ingredients: unknown[];
}

type Row<K extends keyof CatalogRows> = CatalogRows[K][number];
type ImageRow = Row<"images">;

const bySort = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;
const opt = <T>(value: T | null): T | undefined => value ?? undefined;

const image = (src: string, alt: string, width: number, height: number) => ({ src, alt, width, height });

function optionalImage(row: {
  imageUrl: string | null;
  imageAlt: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
}) {
  return row.imageUrl && row.imageWidth && row.imageHeight
    ? image(row.imageUrl, row.imageAlt ?? "", row.imageWidth, row.imageHeight)
    : undefined;
}

function toIngredient(row: Row<"ingredients">, productSlug: string | undefined) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    kind: row.kind,
    sortOrder: row.sortOrder,
    image: image(row.photoUrl, row.name, row.photoWidth, row.photoHeight),
    cutout:
      row.cutoutUrl && row.cutoutWidth && row.cutoutHeight
        ? image(row.cutoutUrl, row.cutoutAlt ?? row.name, row.cutoutWidth, row.cutoutHeight)
        : undefined,
    productSlug,
  };
}

function layoutImages(media: ImageRow[]) {
  const first = (...roles: ImageRow["role"][]) =>
    roles.map((role) => media.find((m) => m.role === role)).find((m) => m !== undefined) ?? media[0]!;
  const pick = (...roles: ImageRow["role"][]) => {
    const m = first(...roles);
    return image(m.url, m.alt, m.width, m.height);
  };
  return {
    card: pick("pack", "bottle", "gallery"),
    bottle: pick("bottle", "pack"),
    box: pick("box", "pack"),
    heroBottle: pick("hero-bottle", "bottle", "pack"),
    heroBox: pick("hero-box", "box", "pack"),
  };
}

export function assembleCatalog(rows: CatalogRows): CatalogPayload {
  const categories = rows.categories.filter((c) => c.active).sort(bySort);
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const collections = rows.collections.filter((c) => c.active).sort(bySort);
  const collectionById = new Map(collections.map((c) => [c.id, c]));
  const ingredientRows = rows.ingredients.filter((i) => i.active).sort(bySort);
  const ingredientById = new Map(ingredientRows.map((i) => [i.id, i]));

  const live = rows.products
    .filter((p) => p.status === "active" && categoryById.has(p.categoryId))
    .flatMap((p) => {
      const variants = rows.variants.filter((v) => v.productId === p.id && v.active).sort(bySort);
      const media = rows.images.filter((m) => m.productId === p.id).sort(bySort);
      return variants.length > 0 && media.length > 0 ? [{ row: p, variants, media }] : [];
    });
  const liveById = new Map(live.map((p) => [p.row.id, p.row]));

  const mainProductOf = new Map<string, string>();
  for (const link of rows.productIngredients) {
    const product = liveById.get(link.productId);
    if (link.role !== "main" || !product) continue;
    const current = mainProductOf.get(link.ingredientId);
    const currentOrder = current ? live.find((p) => p.row.slug === current)?.row.shopOrder : undefined;
    if (currentOrder === undefined || product.shopOrder < currentOrder)
      mainProductOf.set(link.ingredientId, product.slug);
  }
  const ingredients = ingredientRows.map((row) => toIngredient(row, mainProductOf.get(row.id)));
  const ingredientPayload = new Map(ingredients.map((i) => [i.id, i]));

  const products = live.map(({ row: p, variants, media }) => {
    const fallback = variants[0]!;
    const preferred = variants.find((v) => v.isDefault) ?? fallback;
    const links = rows.productIngredients
      .filter((l) => l.productId === p.id && ingredientById.has(l.ingredientId))
      .sort(bySort)
      .map((l) => ({
        role: l.role,
        sortOrder: l.sortOrder,
        ingredient: ingredientPayload.get(l.ingredientId)!,
      }));
    const slugsFor = (role: (typeof links)[number]["role"]) =>
      links.filter((l) => l.role === role).map((l) => l.ingredient.slug);
    const added = slugsFor("added");
    const oils = slugsFor("blend-oil");
    const herbs = slugsFor("blend-herb");
    const productCollections = rows.productCollections
      .filter((pc) => pc.productId === p.id && collectionById.has(pc.collectionId))
      .map((pc) => collectionById.get(pc.collectionId)!)
      .sort(bySort);

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      shortName: p.shortName,
      status: p.status,
      featured: p.featured,
      category: categoryById.get(p.categoryId)!.slug,
      collections: productCollections.map((c) => c.slug),
      variants: variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        label: v.label,
        volumeMl: opt(v.volumeMl),
        price: v.price,
        compareAtPrice: opt(v.compareAtPrice),
        stock: opt(v.stock),
        isDefault: v.id === preferred.id,
        sortOrder: v.sortOrder,
      })),
      price: opt(preferred.compareAtPrice),
      salePrice: preferred.price,
      volumeMl: opt(preferred.volumeMl),
      sizeLabel: preferred.label,
      isNew: p.isNew,
      isBestseller: p.isBestseller,
      badge: opt(p.badge),
      rating:
        p.rating && p.rating.count > 0 ? { average: p.rating.average, count: p.rating.count } : undefined,
      ingredients: links,
      ingredient: slugsFor("main")[0],
      addedIngredients: added.length > 0 ? added : undefined,
      labelClaims: p.labelClaims.length > 0 ? p.labelClaims : undefined,
      blend: oils.length + herbs.length > 0 ? { oils, herbs } : undefined,
      cardOrder: p.sortOrder,
      shopOrder: p.shopOrder,
      heroOrder: p.heroOrder,
      tagline: p.tagline,
      heroCopy: p.shortDescription,
      longDescription: opt(p.longDescription),
      seoTitle: opt(p.seoTitle),
      seoDescription: opt(p.seoDescription),
      accent: { base: p.accentBase, glow: p.accentGlow, ink: p.accentInk },
      oilColor: p.oilColor,
      media: media.map((m) => ({
        src: m.url,
        alt: m.alt,
        width: m.width,
        height: m.height,
        role: m.role,
        variantId: opt(m.variantId),
        sortOrder: m.sortOrder,
      })),
      images: layoutImages(media),
      href: `/products/${p.slug}`,
    };
  });

  return {
    products,
    ingredients,
    categories: categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: opt(c.description),
      parentId: c.parentId && categoryById.has(c.parentId) ? c.parentId : null,
      sortOrder: c.sortOrder,
      image: optionalImage(c),
      seoTitle: opt(c.seoTitle),
      seoDescription: opt(c.seoDescription),
      href: `/shop/${c.slug}`,
      productCount: live.filter((p) => p.row.categoryId === c.id).length,
    })),
    collections: collections.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: opt(c.description),
      sortOrder: c.sortOrder,
      image: optionalImage(c),
      seoTitle: opt(c.seoTitle),
      seoDescription: opt(c.seoDescription),
      href: `/collections/${c.slug}`,
      productSlugs: rows.productCollections
        .filter((pc) => pc.collectionId === c.id && liveById.has(pc.productId))
        .sort(bySort)
        .map((pc) => liveById.get(pc.productId)!.slug),
    })),
  };
}

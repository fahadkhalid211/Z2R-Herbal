import type { CategoryNode, Collection, ImageAsset, Ingredient, Product, SiteConfig } from "@/services/types";

export interface MenuLink {
  label: string;
  href: string;
  image?: ImageAsset;
  count?: number;
  children?: MenuLink[];
}

export interface MenuGroup {
  id: string;
  title: string;
  links: MenuLink[];
  more?: MenuLink;
  columns?: 1 | 2;
}

export interface MenuFeature {
  eyebrow: string;
  name: string;
  href: string;
  price: number;
  sizeLabel: string;
  note?: string;
  benefits: string[];
  image: ImageAsset;
}

export interface ShopMenu {
  groups: MenuGroup[];
  feature?: MenuFeature;
}

export interface HeaderMenus {
  shop: ShopMenu;
  ingredients: MenuGroup[];
  help: MenuGroup[];
}

export interface SearchItem {
  id: string;
  name: string;
  href: string;
  sizeLabel: string;
  price: number;
  ingredients: string[];
}

export const MERCHANDISING_COLLECTIONS = ["bestsellers", "new-arrivals"] as const;
const isMerchandising = (c: Collection) => (MERCHANDISING_COLLECTIONS as readonly string[]).includes(c.slug);

const ALL_INGREDIENTS: MenuLink = { label: "All ingredients", href: "/ingredients" };
const ingredientHref = (slug: string) => `/ingredients/${slug}`;

export const subtreeCount = (node: CategoryNode): number =>
  node.productCount + node.children.reduce((sum, c) => sum + subtreeCount(c), 0);

export function categoryLinks(tree: CategoryNode[]): MenuLink[] {
  return tree
    .filter((node) => subtreeCount(node) > 0)
    .map((node) => {
      const children = categoryLinks(node.children);
      return {
        label: node.name,
        href: node.href,
        count: subtreeCount(node),
        ...(children.length > 0 && { children }),
      };
    });
}

export function ingredientsInProducts(
  ingredients: Ingredient[],
  products: Product[],
  { defining = false }: { defining?: boolean } = {},
): Ingredient[] {
  const used = new Set(
    products.flatMap((p) =>
      p.ingredients
        .filter((l) => !defining || l.role === "main" || l.role === "added")
        .map((l) => l.ingredient.slug),
    ),
  );
  const kindOrder = { oil: 0, herb: 1 } as const;
  return ingredients
    .filter((i) => used.has(i.slug))
    .sort((a, b) => kindOrder[a.kind] - kindOrder[b.kind] || a.sortOrder - b.sortOrder);
}

const nonEmpty = (groups: MenuGroup[]) => groups.filter((g) => g.links.length > 0);

function blendNote(product: Product): string | undefined {
  const oils = product.ingredients.filter((l) => l.role === "blend-oil").length;
  const herbs = product.ingredients.filter((l) => l.role === "blend-herb").length;
  if (oils + herbs > 0) return `${oils} Premium Oils + ${herbs} Powerful Herbs`;
  if (product.blend)
    return `${product.blend.oils.length} Premium Oils + ${product.blend.herbs.length} Powerful Herbs`;
  return undefined;
}

export function buildShopMenu(input: {
  tree: CategoryNode[];
  collections: Collection[];
  ingredients: Ingredient[];
  products: Product[];
  featured?: Product;
}): ShopMenu {
  const { tree, collections, ingredients, products, featured } = input;
  const withProducts = collections.filter((c) => c.productSlugs.length > 0);
  const toLink = (c: Collection): MenuLink => ({ label: c.name, href: c.href });

  const categories = categoryLinks(tree);
  const families = withProducts.filter((c) => !isMerchandising(c)).map(toLink);
  const lists = withProducts.filter(isMerchandising).map(toLink);
  const single =
    products.length > 0 && categories.length === 1 && !categories[0]!.children ? categories[0]! : undefined;

  const groups = nonEmpty([
    ...(single || products.length === 0
      ? []
      : [
          {
            id: "category",
            title: "Shop by Category",
            links: [...categories, { label: "Shop all", href: "/shop", count: products.length }],
          },
        ]),
    {
      id: "collections",
      title: "Collections",
      links: [...(single ? [{ ...single, label: `All ${single.label}` }] : []), ...families, ...lists],
    },
    {
      id: "ingredient",
      title: "Shop by Ingredient",
      links: ingredientsInProducts(ingredients, products, { defining: true }).map((i) => ({
        label: i.name,
        href: ingredientHref(i.slug),
        image: i.cutout ?? i.image,
      })),
      more: ALL_INGREDIENTS,
    },
  ]);

  return {
    groups,
    ...(featured && {
      feature: {
        eyebrow: featured.isBestseller ? "Best Seller" : "Featured",
        name: featured.name,
        href: featured.href,
        price: featured.salePrice,
        sizeLabel: featured.sizeLabel,
        note: blendNote(featured),
        benefits: featured.tagline
          .split("·")
          .map((b) => b.trim())
          .filter(Boolean),
        image: featured.images.bottle,
      },
    }),
  };
}

export function buildIngredientsMenu(ingredients: Ingredient[], products: Product[]): MenuGroup[] {
  const used = ingredientsInProducts(ingredients, products);
  const links = (kind: Ingredient["kind"]) =>
    used.filter((i) => i.kind === kind).map((i) => ({ label: i.name, href: ingredientHref(i.slug) }));
  const herbs = links("herb");
  return nonEmpty([
    { id: "oils", title: "Oils", links: links("oil") },
    { id: "herbs", title: "Herbs", links: herbs, ...(herbs.length > 6 && { columns: 2 as const }) },
  ]);
}

export function buildHelpMenu(site: Pick<SiteConfig, "help">): MenuGroup[] {
  return nonEmpty([{ id: "help", title: "Customer Care", links: site.help }]);
}

export function buildHeaderMenus(
  input: Parameters<typeof buildShopMenu>[0] & { site: SiteConfig },
): HeaderMenus {
  return {
    shop: buildShopMenu(input),
    ingredients: buildIngredientsMenu(input.ingredients, input.products),
    help: buildHelpMenu(input.site),
  };
}

export function footerShopLinks(menu: ShopMenu): MenuLink[] {
  const pick = (id: string) => menu.groups.find((g) => g.id === id)?.links ?? [];
  const categories = pick("category");
  const all = categories.find((l) => l.href === "/shop");
  return [
    { label: "Shop All", href: all?.href ?? "/shop" },
    ...categories.filter((l) => l !== all).map(({ label, href }) => ({ label, href })),
    ...pick("collections").map(({ label, href }) => ({ label, href })),
  ];
}

export function toSearchItems(products: Product[]): SearchItem[] {
  return [...products]
    .sort((a, b) => a.shopOrder - b.shopOrder)
    .map((p) => ({
      id: p.id,
      name: p.name,
      href: p.href,
      sizeLabel: p.sizeLabel,
      price: p.salePrice,
      ingredients: p.ingredients.map((l) => l.ingredient.name),
    }));
}

export interface SearchResult extends SearchItem {
  matchedIngredient?: string;
}

export function searchProducts(items: SearchItem[], query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  const byName = items.filter((i) => i.name.toLowerCase().includes(q));
  const byIngredient = items.flatMap((i) => {
    if (byName.includes(i)) return [];
    const hit = i.ingredients.find((name) => name.toLowerCase().includes(q));
    return hit ? [{ ...i, matchedIngredient: hit }] : [];
  });
  return [...byName, ...byIngredient];
}

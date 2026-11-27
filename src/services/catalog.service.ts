import type { DataSource } from "./adapters/types";
import { ServiceError } from "./errors";
import { parseOrThrow } from "./parse";
import { categoryRecordListSchema, collectionListSchema, ingredientListSchema } from "./schemas";
import type { Category, CategoryNode, CategoryRecord, Collection, Ingredient } from "./types";

export function buildCategoryTree(records: CategoryRecord[]): CategoryNode[] {
  const nodes = new Map(records.map((r) => [r.id, { ...r, children: [] as CategoryNode[] }]));
  const roots: CategoryNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    (parent ? parent.children : roots).push(node);
  }
  const sort = (list: CategoryNode[]) => {
    list.sort((a, b) => a.sortOrder - b.sortOrder);
    list.forEach((n) => sort(n.children));
  };
  sort(roots);
  return roots;
}

export function subtreeSlugs(node: CategoryNode): string[] {
  return [node.slug, ...node.children.flatMap(subtreeSlugs)];
}

const subtreeCount = (node: CategoryNode): number =>
  node.productCount + node.children.reduce((sum, c) => sum + subtreeCount(c), 0);

export function createCatalogService(source: DataSource) {
  async function categoryRecords(): Promise<CategoryRecord[]> {
    const records = parseOrThrow(categoryRecordListSchema, await source.categories(), "categories");
    return records.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async function categoryTree(): Promise<CategoryNode[]> {
    return buildCategoryTree(await categoryRecords());
  }

  async function category(slug: string): Promise<CategoryNode> {
    const find = (nodes: CategoryNode[]): CategoryNode | undefined =>
      nodes.map((n) => (n.slug === slug ? n : find(n.children))).find(Boolean);
    const node = find(await categoryTree());
    if (!node) throw new ServiceError("NOT_FOUND", `No category with slug "${slug}"`);
    return node;
  }

  async function collections(): Promise<Collection[]> {
    const list = parseOrThrow(collectionListSchema, await source.collections(), "collections");
    return list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async function collection(slug: string): Promise<Collection> {
    const found = (await collections()).find((c) => c.slug === slug);
    if (!found) throw new ServiceError("NOT_FOUND", `No collection with slug "${slug}"`);
    return found;
  }

  async function ingredients(): Promise<Ingredient[]> {
    const list = parseOrThrow(ingredientListSchema, await source.ingredients(), "ingredients");
    return list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async function categories(): Promise<Category[]> {
    const [tree, groups] = await Promise.all([categoryTree(), collections()]);
    return [
      ...tree
        .filter((c) => subtreeCount(c) > 0)
        .map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          description: c.description,
          href: c.href,
          kind: "category" as const,
        })),
      ...groups
        .filter((c) => c.productSlugs.length > 0)
        .map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          description: c.description,
          href: c.href,
          kind: "collection" as const,
        })),
    ];
  }

  return { categories, categoryRecords, categoryTree, category, collections, collection, ingredients };
}

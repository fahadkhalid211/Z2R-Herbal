export const CART_STORAGE_KEY = "z2r.cart.v2";
export const LEGACY_CART_STORAGE_KEY = "z2r.cart.v1";
export const MAX_QUANTITY = 99;

export interface CartLine {
  variantId: string;
  quantity: number;
}

export interface LegacyCartLine {
  productId: string;
  quantity: number;
}

export interface CartState {
  lines: CartLine[];
}

export type CartAction =
  | { type: "add"; variantId: string; quantity?: number }
  | { type: "setQuantity"; variantId: string; quantity: number }
  | { type: "remove"; variantId: string }
  | { type: "clear" }
  | { type: "hydrate"; lines: CartLine[] };

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(quantity)));
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { lines: action.lines };
    case "clear":
      return { lines: [] };
    case "remove":
      return { lines: state.lines.filter((l) => l.variantId !== action.variantId) };
    case "setQuantity":
      return {
        lines: state.lines.map((l) =>
          l.variantId === action.variantId ? { ...l, quantity: clampQuantity(action.quantity) } : l,
        ),
      };
    case "add": {
      const amount = clampQuantity(action.quantity ?? 1);
      const exists = state.lines.some((l) => l.variantId === action.variantId);
      return {
        lines: exists
          ? state.lines.map((l) =>
              l.variantId === action.variantId ? { ...l, quantity: clampQuantity(l.quantity + amount) } : l,
            )
          : [...state.lines, { variantId: action.variantId, quantity: amount }],
      };
    }
  }
}

export const cartCount = (state: CartState): number => state.lines.reduce((sum, l) => sum + l.quantity, 0);

interface PricedEntry {
  id: string;
  productId: string;
  isDefault: boolean;
  salePrice: number;
}

function findEntry<T extends PricedEntry>(line: CartLine | LegacyCartLine, catalogue: T[]): T | undefined {
  return "variantId" in line
    ? catalogue.find((v) => v.id === line.variantId)
    : catalogue.find((v) => v.productId === line.productId && v.isDefault);
}

export function pricedLines<T extends PricedEntry>(
  lines: (CartLine | LegacyCartLine)[],
  catalogue: T[],
): { product: T; quantity: number; lineTotal: number }[] {
  return lines.flatMap((line) => {
    const product = findEntry(line, catalogue);
    return product
      ? [{ product, quantity: line.quantity, lineTotal: product.salePrice * line.quantity }]
      : [];
  });
}

export const cartSubtotal = (lines: { lineTotal: number }[]): number =>
  lines.reduce((sum, l) => sum + l.lineTotal, 0);

export function migrateCartLines(
  lines: (CartLine | LegacyCartLine)[],
  defaultVariants: Record<string, string>,
): CartLine[] {
  let state: CartState = { lines: [] };
  for (const line of lines) {
    const variantId = "variantId" in line ? line.variantId : defaultVariants[line.productId];
    if (variantId) state = cartReducer(state, { type: "add", variantId, quantity: line.quantity });
  }
  return state.lines;
}

const validQuantity = (value: unknown): boolean =>
  Number.isInteger(value) && (value as number) > 0 && (value as number) <= MAX_QUANTITY;

function isLine(value: unknown): value is CartLine | LegacyCartLine {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Partial<CartLine & LegacyCartLine>;
  const id = typeof line.variantId === "string" || typeof line.productId === "string";
  return id && validQuantity(line.quantity);
}

export function parseStoredCart(raw: string | null): (CartLine | LegacyCartLine)[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(isLine)
      ? parsed.map((l) =>
          "variantId" in l && typeof l.variantId === "string"
            ? { variantId: l.variantId, quantity: l.quantity }
            : { productId: (l as LegacyCartLine).productId, quantity: l.quantity },
        )
      : [];
  } catch {
    return [];
  }
}

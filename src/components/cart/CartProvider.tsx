"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  CART_STORAGE_KEY,
  type CartLine,
  LEGACY_CART_STORAGE_KEY,
  cartCount,
  cartReducer,
  migrateCartLines,
  parseStoredCart,
} from "@/lib/cart";
import { trackAddToCart } from "@/lib/analytics";
import { logger } from "@/lib/logger";

export interface CartItem {
  id: string;
  variantId: string;
  name: string;
  image: { src: string; width: number; height: number };
  price?: number;
  variantLabel?: string;
}

interface CartContextValue {
  count: number;
  lines: CartLine[];
  ready: boolean;
  add: (item: CartItem, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  addedTick: number;
  lastAdded: CartItem | null;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export function CartProvider({
  children,
  defaultVariants,
}: {
  children: React.ReactNode;
  defaultVariants: Record<string, string>;
}) {
  const [state, dispatch] = useReducer(cartReducer, { lines: [] });
  const [lastAdded, setLastAdded] = useState<CartItem | null>(null);
  const [addedTick, setAddedTick] = useState(0);
  const [ready, markReady] = useReducer(() => true, false);

  const migration = useRef(defaultVariants);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY) ?? localStorage.getItem(LEGACY_CART_STORAGE_KEY);
      dispatch({ type: "hydrate", lines: migrateCartLines(parseStoredCart(stored), migration.current) });
    } catch (error) {
      logger.warn("Cart storage unavailable", { error });
    }
    markReady();
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.lines));
      localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } catch (error) {
      logger.warn("Could not save cart", { error });
    }
  }, [ready, state.lines]);

  const add = useCallback((item: CartItem, quantity = 1) => {
    dispatch({ type: "add", variantId: item.variantId, quantity });
    trackAddToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      variant: item.variantLabel,
      quantity,
    });
    setLastAdded(item);
    setAddedTick((t) => t + 1);
  }, []);

  const setQuantity = useCallback(
    (variantId: string, quantity: number) => dispatch({ type: "setQuantity", variantId, quantity }),
    [],
  );
  const remove = useCallback((variantId: string) => dispatch({ type: "remove", variantId }), []);
  const clear = useCallback(() => {
    dispatch({ type: "clear" });
    try {
      localStorage.setItem(CART_STORAGE_KEY, "[]");
    } catch (error) {
      logger.warn("Could not save cart", { error });
    }
  }, []);

  const value = useMemo(
    () => ({
      count: cartCount(state),
      lines: state.lines,
      ready,
      add,
      setQuantity,
      remove,
      clear,
      addedTick,
      lastAdded,
    }),
    [state, ready, add, setQuantity, remove, clear, addedTick, lastAdded],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { Heart } from "lucide-react";
import clsx from "clsx";
import { logger } from "@/lib/logger";

const STORAGE_KEY = "z2r.wishlist.v1";

type Action = { type: "hydrate"; ids: string[] } | { type: "toggle"; id: string };

function reducer(ids: string[], action: Action): string[] {
  if (action.type === "hydrate") return action.ids;
  return ids.includes(action.id) ? ids.filter((x) => x !== action.id) : [...ids, action.id];
}

const parse = (raw: string | null): string[] => {
  try {
    const value: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) && value.every((v) => typeof v === "string") ? value : [];
  } catch {
    return [];
  }
};

interface WishlistValue {
  count: number;
  ids: string[];
  ready: boolean;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
}

const WishlistContext = createContext<WishlistValue | null>(null);

export function useWishlist(): WishlistValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, dispatch] = useReducer(reducer, []);
  const hydrated = useRef(false);
  const [ready, markReady] = useReducer(() => true, false);

  useEffect(() => {
    try {
      dispatch({ type: "hydrate", ids: parse(localStorage.getItem(STORAGE_KEY)) });
    } catch (error) {
      logger.warn("Wishlist storage unavailable", { error });
    }
    hydrated.current = true;
    markReady();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (error) {
      logger.warn("Could not save wishlist", { error });
    }
  }, [ids]);

  const toggle = useCallback((id: string) => dispatch({ type: "toggle", id }), []);
  const value = useMemo(
    () => ({ count: ids.length, ids, ready, has: (id: string) => ids.includes(id), toggle }),
    [ids, ready, toggle],
  );
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function WishlistLink({ className }: { className?: string }) {
  const { count } = useWishlist();
  return (
    <Link
      href="/wishlist"
      prefetch={false}
      aria-label={`Wishlist, ${count} items`}
      className={clsx(className, "relative")}
    >
      <Heart className="nav-icon" strokeWidth={1.7} />
      {count > 0 && (
        <span className="absolute top-0.5 right-0 grid size-[18px] place-items-center rounded-full bg-forest-600 text-[0.65rem] font-semibold text-cream-50">
          {count}
        </span>
      )}
    </Link>
  );
}

export function WishlistButton({ id, name, className }: { id: string; name: string; className?: string }) {
  const { has, toggle } = useWishlist();
  const saved = has(id);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`Save ${name} to wishlist`}
      onClick={() => toggle(id)}
      className={clsx(
        "wish-btn grid size-10 place-items-center rounded-full bg-white/90 shadow-[0_4px_12px_-4px_rgb(1_35_19/0.35)] transition-[color,background-color,box-shadow] duration-(--dur-fast) hover:bg-white hover:shadow-[0_8px_18px_-6px_rgb(1_35_19/0.45)]",
        saved ? "text-brand-red" : "text-forest-800 hover:text-brand-red",
        className,
      )}
    >
      <Heart className={clsx("size-[18px]", saved && "fill-current")} strokeWidth={1.8} />
    </button>
  );
}

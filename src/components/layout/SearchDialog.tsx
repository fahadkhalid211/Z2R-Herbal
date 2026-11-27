"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { trackSearch } from "@/lib/analytics";
import { searchProducts, type SearchItem } from "@/lib/menu";
import { formatPrice } from "@/lib/money";

export function SearchDialog({ items, buttonClass }: { items: SearchItem[]; buttonClass: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = searchProducts(items, query);
  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const term = query.trim();
    if (term.length < 3) return;
    const timer = setTimeout(() => trackSearch(term), 1000);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        aria-haspopup="dialog"
        className={buttonClass}
        onClick={() => {
          setOpen(true);
          dialogRef.current?.showModal();
        }}
      >
        <Search className="nav-icon" strokeWidth={1.7} />
      </button>
      <dialog
        ref={dialogRef}
        aria-label="Search products"
        onClose={() => {
          setOpen(false);
          setQuery("");
        }}
        className="drawer header-surface m-0 mx-auto mt-20 w-[min(640px,92vw)] rounded-3xl p-0 text-[#1d1a16] shadow-[0_40px_80px_-30px_rgb(1_35_19/0.6)] ring-1 ring-[#e9d9c4]"
      >
        <div className="flex items-center gap-3 border-b border-[#e3d3bd] px-5 py-4">
          <Search aria-hidden="true" className="size-5 text-forest-600" />
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <input
            id="site-search"
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hair oils or ingredients…"
            className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-[#6b6156]"
          />
          <button
            type="button"
            aria-label="Close search"
            onClick={close}
            className="rounded-full p-1.5 hover:bg-forest-600/10"
          >
            <X className="size-5" />
          </button>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto p-3" aria-live="polite">
          {open &&
            results.map((p) => (
              <li key={p.id}>
                <Link
                  href={p.href}
                  prefetch={false}
                  onClick={close}
                  className="group flex items-center justify-between gap-4 rounded-2xl px-4 py-3 hover:bg-forest-600/[0.06]"
                >
                  <span className="min-w-0">
                    <span className="block font-display text-[1.08rem] font-semibold text-forest-900">
                      {p.name}
                    </span>
                    <span className="mt-0.5 block text-[0.8rem] text-ink-muted">
                      {p.sizeLabel}
                      {p.matchedIngredient && ` · Contains ${p.matchedIngredient}`}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="font-semibold text-forest-700 tabular-nums">{formatPrice(p.price)}</span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 text-forest-600 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </span>
                </Link>
              </li>
            ))}
          {open && results.length === 0 && (
            <li className="px-3 py-6 text-center text-[#5c544a]">No products match “{query}”.</li>
          )}
        </ul>
      </dialog>
    </>
  );
}

"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductRailProps {
  label: string;
  className?: string;
  children: React.ReactNode;
}

const ARROW =
  "grid size-11 place-items-center rounded-full border border-forest-600/25 bg-white text-forest-800 shadow-[0_10px_24px_-14px_rgb(1_35_19/0.6)] transition-[background-color,color,opacity,scale] hover:bg-forest-600 hover:text-cream-50 active:scale-95 disabled:pointer-events-none disabled:opacity-35";

export function ProductRail({ label, className, children }: ProductRailProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const update = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const max = list.scrollWidth - list.clientWidth;
    setEdges({ start: list.scrollLeft <= 2, end: list.scrollLeft >= max - 2 });
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    update();
    list.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(list);
    return () => {
      list.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  const page = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({ left: direction * list.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  const scrollable = !(edges.start && edges.end);

  return (
    <div className={className}>
      <ul
        ref={listRef}
        aria-label={label}
        className="product-rail -mt-3 -mb-8 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pt-3 pb-8 sm:gap-5 lg:gap-6"
      >
        {Children.map(children, (child) => (
          <li className="product-rail-item shrink-0 snap-start">{child}</li>
        ))}
      </ul>
      {scrollable && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Previous products"
            disabled={edges.start}
            onClick={() => page(-1)}
            className={ARROW}
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next products"
            disabled={edges.end}
            onClick={() => page(1)}
            className={ARROW}
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}

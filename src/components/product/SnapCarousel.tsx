"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

interface SnapCarouselProps {
  label: string;
  count: number;
  gridQuery: string;
  className?: string;
  dotsClassName?: string;
  reveal?: "stagger";
  children: React.ReactNode;
}

export function SnapCarousel({
  label,
  count,
  gridQuery,
  className,
  dotsClassName,
  reveal,
  children,
}: SnapCarouselProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = Array.from(list.children) as HTMLElement[];
    const grid = window.matchMedia(gridQuery);
    let io: IntersectionObserver | undefined;

    const setup = () => {
      io?.disconnect();
      items.forEach((el) => delete el.dataset.centered);
      if (grid.matches) return;
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const index = items.indexOf(entry.target as HTMLElement);
            items.forEach((el, i) => (el.dataset.centered = String(i === index)));
            setActive(index);
          }
        },
        { root: list, rootMargin: "0px -45% 0px -45%" },
      );
      items.forEach((el) => io?.observe(el));
    };

    setup();
    grid.addEventListener("change", setup);
    return () => {
      grid.removeEventListener("change", setup);
      io?.disconnect();
    };
  }, [gridQuery]);

  const scrollTo = (i: number) => {
    const item = listRef.current?.children[i] as HTMLElement | undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    item?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", inline: "center", block: "nearest" });
  };

  return (
    <>
      <ul ref={listRef} aria-label={label} data-reveal={reveal} className={className}>
        {children}
      </ul>
      <div className={clsx("flex justify-center gap-1", dotsClassName)}>
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show item ${i + 1} of ${count}`}
            aria-current={i === active ? "true" : undefined}
            onClick={() => scrollTo(i)}
            className="grid h-6 min-w-6 place-items-center"
          >
            <span
              aria-hidden="true"
              className={clsx(
                "block h-1.5 rounded-full transition-all duration-500",
                i === active ? "w-5 bg-forest-600" : "w-1.5 bg-forest-600/25",
              )}
            />
          </button>
        ))}
      </div>
    </>
  );
}

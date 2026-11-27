"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import clsx from "clsx";

interface ShopFiltersProps {
  listId: string;
  filters: { value: string; label: string }[];
  total: number;
  itemTags: string[];
}

type Sort = "featured" | "asc" | "desc";

const SORTS: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "asc", label: "Price: low to high" },
  { value: "desc", label: "Price: high to low" },
];

function SortMenu({ value, onChange }: { value: Sort; onChange: (v: Sort) => void }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const current = SORTS.find((s) => s.value === value)!;

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const pick = (v: Sort) => {
    onChange(v);
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative flex items-center gap-2.5">
      <span id={`${id}-label`} className="text-[0.84rem] text-ink-muted">
        Sort by
      </span>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => {
          setActive(SORTS.indexOf(current));
          setOpen((o) => !o);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setActive(SORTS.indexOf(current));
            setOpen(true);
          }
        }}
        className={clsx(
          "inline-flex h-11 min-w-[13.5rem] items-center justify-between gap-3 rounded-full border bg-white pr-3.5 pl-5 text-[0.9rem] font-medium text-forest-900 shadow-[0_6px_18px_-12px_rgb(1_35_19/0.45)] transition-colors duration-(--dur-fast)",
          open ? "border-forest-600" : "border-forest-600/20 hover:border-forest-600/50",
        )}
      >
        <span id={`${id}-value`}>{current.label}</span>
        <ChevronDown
          aria-hidden="true"
          className={clsx(
            "size-4 text-forest-600 transition-transform duration-(--dur-fast)",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={`${id}-label`}
          aria-activedescendant={`${id}-${SORTS[active]!.value}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => (a + 1) % SORTS.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => (a - 1 + SORTS.length) % SORTS.length);
            } else if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              pick(SORTS[active]!.value);
            } else if (e.key === "Escape" || e.key === "Tab") {
              setOpen(false);
              if (e.key === "Escape") buttonRef.current?.focus();
            }
          }}
          className="sort-menu absolute top-[calc(100%+8px)] right-0 z-30 w-60 overflow-hidden rounded-2xl border border-[#e9d9c4] bg-white p-1.5 shadow-[0_30px_60px_-24px_rgb(1_35_19/0.5)] outline-none"
        >
          {SORTS.map((s, i) => {
            const selected = s.value === value;
            return (
              <li
                key={s.value}
                id={`${id}-${s.value}`}
                role="option"
                aria-selected={selected}
                onPointerEnter={() => setActive(i)}
                onClick={() => pick(s.value)}
                className={clsx(
                  "flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-[0.9rem] transition-colors",
                  i === active ? "bg-forest-600/[0.07] text-forest-900" : "text-ink",
                  selected && "font-semibold text-forest-800",
                )}
              >
                {s.label}
                {selected && <Check aria-hidden="true" className="size-4 text-forest-600" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function ShopFilters({ listId, filters, total, itemTags }: ShopFiltersProps) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<Sort>("featured");
  const shown = filter === "all" ? total : itemTags.filter((tags) => tags.split(" ").includes(filter)).length;

  useEffect(() => {
    const list = document.getElementById(listId);
    if (!list) return;
    const items = Array.from(list.children) as HTMLElement[];
    const byPrice = [...items].sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
    items.forEach((item, i) => {
      const match = filter === "all" || (item.dataset.tags ?? "").split(" ").includes(filter);
      item.hidden = !match;
      const rank =
        sort === "featured"
          ? i
          : sort === "asc"
            ? byPrice.indexOf(item)
            : byPrice.length - byPrice.indexOf(item);
      item.style.order = String(rank);
    });
  }, [listId, filter, sort]);

  return (
    <div>
      <div
        role="group"
        aria-label="Filter products"
        className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {[{ value: "all", label: "All" }, ...filters].map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={clsx(
              "h-10 shrink-0 rounded-full border px-[1.1rem] text-[0.88rem] font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow] duration-(--dur-fast)",
              filter === f.value
                ? "border-forest-700 bg-forest-700 text-cream-50 shadow-[0_8px_18px_-10px_rgb(26_94_7/0.9)]"
                : "border-forest-600/15 bg-white text-forest-900 hover:border-forest-600/45",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-forest-900/10 pt-5">
        <p role="status" className="flex items-center gap-2.5 text-[0.9rem] whitespace-nowrap text-ink-muted">
          <SlidersHorizontal aria-hidden="true" className="size-4 text-forest-600" />
          <span>
            Showing <span className="font-semibold text-forest-900 tabular-nums">{shown}</span> of{" "}
            <span className="tabular-nums">{total}</span> hair oils
          </span>
        </p>
        <SortMenu value={sort} onChange={setSort} />
      </div>
    </div>
  );
}

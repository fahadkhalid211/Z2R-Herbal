import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Ingredient } from "@/services/types";

interface BlendStripProps {
  oils: Ingredient[];
  herbs: Ingredient[];
  tone?: "dark" | "light";
  showNames?: boolean;
  className?: string;
}

const SHOWN = 6;

function Row({
  label,
  items,
  dark,
  showNames,
}: {
  label: string;
  items: Ingredient[];
  dark: boolean;
  showNames: boolean;
}) {
  const shown = items.slice(0, SHOWN);
  const more = items.length - shown.length;
  return (
    <div>
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p
          className={cn(
            "text-[0.64rem] font-semibold tracking-[0.18em] whitespace-nowrap uppercase",
            dark ? "text-lime-300" : "text-olive-600",
          )}
        >
          {label}
        </p>
        <ul aria-label={label} className="flex items-center">
          {shown.map((item, i) => (
            <li
              key={item.id}
              title={item.name}
              className={cn(
                "relative size-9 shrink-0 overflow-hidden rounded-full border-2 bg-white shadow-[0_6px_14px_-6px_rgb(0_0_0/0.6)]",
                dark ? "border-forest-800" : "border-white",
                i > 0 && "-ml-2.5",
              )}
              style={{ zIndex: SHOWN - i }}
            >
              <Image src={item.image.src} alt={item.name} fill sizes="36px" className="object-cover" />
            </li>
          ))}
          {items.slice(SHOWN).map((item) => (
            <li key={item.id} className="sr-only">
              {item.name}
            </li>
          ))}
          {more > 0 && (
            <li
              aria-hidden="true"
              title={items
                .slice(SHOWN)
                .map((i) => i.name)
                .join(", ")}
              className={cn(
                "-ml-2.5 grid size-9 shrink-0 place-items-center rounded-full border-2 text-[0.7rem] font-semibold",
                dark
                  ? "border-forest-800 bg-lime-300 text-forest-900"
                  : "border-white bg-forest-600 text-cream-50",
              )}
            >
              +{more}
            </li>
          )}
        </ul>
      </div>
      {showNames && (
        <p
          aria-hidden="true"
          className={cn("mt-1.5 text-[0.7rem] leading-snug", dark ? "text-cream-50/70" : "text-ink-muted")}
        >
          {items.map((item) => item.name).join(" · ")}
        </p>
      )}
    </div>
  );
}

export function BlendStrip({ oils, herbs, tone = "dark", showNames = false, className }: BlendStripProps) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "space-y-2.5 rounded-2xl px-4 py-3",
        dark
          ? "bg-cream-50/[0.06] ring-1 ring-cream-50/10"
          : "bg-forest-600/[0.04] ring-1 ring-forest-600/10",
        className,
      )}
    >
      {oils.length > 0 && (
        <Row label={`${oils.length} Premium Oils`} items={oils} dark={dark} showNames={showNames} />
      )}
      {herbs.length > 0 && (
        <Row label={`${herbs.length} Powerful Herbs`} items={herbs} dark={dark} showNames={showNames} />
      )}
    </div>
  );
}

import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/money";

interface ProductPriceProps {
  from?: boolean;
  amount: number;
  compareAt?: number;
  tone?: "light" | "dark";
  size?: "sm" | "lg";
  layout?: "inline" | "card";
  className?: string;
}

export function ProductPrice({
  amount,
  compareAt,
  from = false,
  tone = "light",
  size = "sm",
  layout = "inline",
  className,
}: ProductPriceProps) {
  const dark = tone === "dark";
  const saving = compareAt && compareAt > amount ? Math.round(((compareAt - amount) / compareAt) * 100) : 0;
  if (layout === "card") {
    return (
      <div className={className}>
        <p
          className={cn(
            "text-[0.6rem] font-semibold tracking-[0.14em] whitespace-nowrap uppercase",
            dark ? "text-lime-300" : "text-olive-600",
          )}
        >
          {from ? "From" : "Sale Price"}
        </p>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span
            className={cn(
              "text-[1.02rem] font-semibold lining-nums tabular-nums sm:text-[1.1rem]",
              dark ? "text-cream-50" : "text-forest-900",
            )}
          >
            {formatPrice(amount)}
          </span>
          {saving > 0 && (
            <span
              className={cn(
                "text-[0.8rem] tabular-nums line-through",
                dark ? "text-cream-50/55" : "text-ink-muted",
              )}
            >
              <span className="sr-only">Regular price </span>
              {formatPrice(compareAt!)}
            </span>
          )}
        </p>
        <p className="mt-1.5 flex min-h-[1.25rem] items-center">
          {saving > 0 && (
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[0.64rem] font-semibold whitespace-nowrap",
                dark ? "bg-lime-300 text-forest-900" : "bg-forest-600 text-cream-50",
              )}
            >
              Save {saving}%
            </span>
          )}
        </p>
      </div>
    );
  }
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span
        className={cn(
          "font-semibold tracking-[0.14em] uppercase",
          size === "lg" ? "text-[0.72rem]" : "text-[0.6rem]",
          dark ? "text-lime-300" : "text-olive-600",
        )}
      >
        {from ? "From" : "Sale Price"}
      </span>
      <span
        className={cn(
          "font-semibold lining-nums tabular-nums",
          size === "lg" ? "font-display text-[2rem] leading-none" : "text-[1rem] sm:text-[1.05rem]",
          dark ? "text-cream-50" : "text-forest-900",
        )}
      >
        {formatPrice(amount)}
      </span>
      {saving > 0 && (
        <>
          <span
            className={cn(
              "tabular-nums line-through",
              size === "lg" ? "text-[1rem]" : "text-[0.82rem]",
              dark ? "text-cream-50/55" : "text-ink-muted",
            )}
          >
            <span className="sr-only">Regular price </span>
            {formatPrice(compareAt!)}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-semibold",
              size === "lg" ? "text-[0.74rem]" : "text-[0.66rem]",
              dark ? "bg-lime-300 text-forest-900" : "bg-forest-600 text-cream-50",
            )}
          >
            Save {saving}%
          </span>
        </>
      )}
    </p>
  );
}

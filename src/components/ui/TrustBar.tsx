import { Banknote, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/cn";

export const TRUST_POINTS = [
  { Icon: Banknote, title: "Cash on Delivery", text: "Pay when your order arrives" },
  { Icon: Truck, title: "3–5 Working Days", text: "Delivery across Pakistan" },
  { Icon: ShieldCheck, title: "100% Money-Back", text: "On damaged or incorrect products" },
  { Icon: MessageCircle, title: "WhatsApp Support", text: "Real people, quick answers" },
] as const;

interface TrustBarProps {
  tone?: "light" | "dark";
  layout?: "row" | "grid";
  className?: string;
}

export function TrustBar({ tone = "light", layout = "grid", className }: TrustBarProps) {
  const dark = tone === "dark";
  return (
    <ul
      aria-label="Our promises"
      className={cn(
        layout === "row" ? "flex flex-wrap gap-x-8 gap-y-3" : "grid grid-cols-2 gap-3",
        className,
      )}
    >
      {TRUST_POINTS.map(({ Icon, title, text }) => (
        <li
          key={title}
          className={cn(
            "flex items-center gap-3",
            layout === "grid" &&
              (dark
                ? "rounded-2xl border border-cream-50/12 bg-cream-50/[0.04] p-3"
                : "rounded-2xl border border-cream-200 bg-white/80 p-3"),
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-full",
              dark ? "bg-lime-300/12 text-lime-300" : "feature-medal",
            )}
          >
            <Icon className="size-[19px]" strokeWidth={1.7} />
          </span>
          <span className="min-w-0 leading-tight">
            <span
              className={cn("block text-[0.86rem] font-semibold", dark ? "text-cream-50" : "text-forest-900")}
            >
              {title}
            </span>
            <span className={cn("mt-0.5 block text-[0.76rem]", dark ? "text-cream-50/65" : "text-ink-muted")}>
              {text}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

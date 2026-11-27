import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function Stars({ value, size = 18, className }: { value: number; size?: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i + 1));
        return (
          <span key={i} className="relative inline-block shrink-0" style={{ width: size, height: size }}>
            <Star
              aria-hidden="true"
              className="absolute inset-0 text-forest-900/15"
              fill="currentColor"
              strokeWidth={0}
              style={{ width: size, height: size }}
            />
            <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star
                aria-hidden="true"
                className="text-gold-500"
                fill="currentColor"
                strokeWidth={0}
                style={{ width: size, height: size, maxWidth: "none" }}
              />
            </span>
          </span>
        );
      })}
    </span>
  );
}

import { cn } from "@/lib/cn";
import { LOGO_HEIGHT, LOGO_MARK_HEIGHT, LOGO_WIDTH } from "./logo-size.generated";

interface LogoProps {
  className?: string;
  variant?: "full" | "mark";
  tone?: "red" | "cream";
  alt?: string;
  loading?: "eager" | "lazy";
}

const FILES = {
  full: { red: "/brand/logo-red.svg", cream: "/brand/logo-cream.svg" },
  mark: { red: "/brand/logo-red.svg", cream: "/brand/logo-mark-cream.svg" },
} as const;

export function Logo({ className, variant = "full", tone = "red", alt = "Z2R Herbal", loading }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG; next/image adds nothing here
    <img
      src={FILES[variant][tone]}
      width={LOGO_WIDTH}
      height={variant === "full" ? LOGO_HEIGHT : LOGO_MARK_HEIGHT}
      alt={alt}
      loading={loading}
      decoding="async"
      className={cn("block w-auto", className)}
    />
  );
}

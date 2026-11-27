import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost-light" | "dark" | "outline-dark";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-lime-400 text-forest-900 shadow-[0_8px_24px_-10px_rgb(187_226_26/0.7)] hover:bg-lime-300 hover:shadow-[0_14px_30px_-10px_rgb(187_226_26/0.85)] active:bg-lime-500",
  "ghost-light": "border border-cream-50/45 text-cream-50 hover:border-cream-50 hover:bg-cream-50/10",
  dark: "bg-forest-600 text-cream-50 hover:bg-forest-700 hover:shadow-[0_12px_26px_-12px_rgb(1_35_19/0.7)]",
  "outline-dark":
    "border border-forest-600/40 bg-white/60 text-forest-800 hover:border-forest-600 hover:bg-forest-600/5 hover:shadow-[0_10px_22px_-14px_rgb(1_35_19/0.5)]",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-3.5 text-xs",
  md: "h-12 gap-2.5 px-6 text-[0.95rem]",
};

const BASE =
  "inline-flex shrink-0 items-center justify-center rounded-full font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,translate] duration-(--dur-fast) ease-out hover:-translate-y-px active:translate-y-0 motion-reduce:hover:translate-y-0";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: Omit<CommonProps, "children">) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

export function ButtonLink({ href, ...props }: CommonProps & { href: string }) {
  return (
    <Link href={href} prefetch={false} className={buttonClasses(props)}>
      {props.children}
    </Link>
  );
}

export function Button({
  variant,
  size,
  className,
  children,
  type = "button",
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClasses({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
}

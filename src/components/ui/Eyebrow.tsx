import { cn } from "@/lib/cn";
import { BotanicalIcon } from "@/components/icons/BotanicalIcon";

interface EyebrowProps {
  children: React.ReactNode;
  tone?: "light" | "dark";
  lines?: "end" | "both";
  withLeaf?: boolean;
  className?: string;
}

export function Eyebrow({ children, tone = "light", lines = "end", withLeaf, className }: EyebrowProps) {
  const color = tone === "dark" ? "text-lime-300" : "text-olive-600";
  const line = <span aria-hidden="true" className="h-px w-8 bg-current opacity-70" />;
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-xs font-semibold tracking-[0.18em] uppercase sm:text-[0.8rem]",
        color,
        lines === "both" && "justify-center",
        className,
      )}
    >
      {lines === "both" && line}
      {withLeaf && <BotanicalIcon name="leaf" className="size-4" strokeWidth={1.8} />}
      <span>{children}</span>
      {line}
    </p>
  );
}

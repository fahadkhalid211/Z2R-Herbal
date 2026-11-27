import { RevealHeading } from "@/components/motion/RevealHeading";
import { cn } from "@/lib/cn";
import { cssVars } from "@/lib/css-vars";
import { Eyebrow } from "./Eyebrow";

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  lines: string[];
  intro?: React.ReactNode;
  tone?: "light" | "dark";
  align?: "center" | "start";
  className?: string;
}

export function SectionHeading({
  id,
  eyebrow,
  lines,
  intro,
  tone = "light",
  align = "center",
  className,
}: SectionHeadingProps) {
  const dark = tone === "dark";
  const center = align === "center";
  return (
    <div className={cn("text-center", center ? "mx-auto max-w-4xl" : "lg:text-left", className)}>
      <div data-reveal="fade">
        <Eyebrow
          tone={tone}
          lines={center ? "both" : "end"}
          withLeaf={dark}
          className={center ? undefined : "justify-center lg:justify-start"}
        >
          {eyebrow}
        </Eyebrow>
      </div>
      <RevealHeading
        id={id}
        lines={lines}
        className={cn(
          "mt-4 font-display text-[2.1rem] leading-[1.08] font-semibold tracking-[-0.01em] sm:text-[2.6rem] lg:text-[3rem]",
          dark ? "text-cream-50" : "text-ink",
        )}
      />
      {intro && (
        <p
          data-reveal="fade"
          style={cssVars({ "--d": "160ms" })}
          className={cn(
            "mt-4 max-w-xl text-[1.02rem] leading-relaxed",
            dark ? "text-cream-50/75" : "text-ink-muted",
            center ? "mx-auto" : "mx-auto lg:mx-0",
          )}
        >
          {intro}
        </p>
      )}
    </div>
  );
}

import { BotanicalIcon } from "@/components/icons/BotanicalIcon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cssVars } from "@/lib/css-vars";
import type { Benefit } from "@/services/types";

export function BenefitsRow({ benefits, brandName }: { benefits: Benefit[]; brandName: string }) {
  return (
    <section aria-labelledby="why-title" className="container-page py-20 defer-render lg:py-28">
      <SectionHeading id="why-title" eyebrow="Why Choose Us" lines={[`Why Choose ${brandName}?`]} />

      <ul
        data-reveal="draw"
        className="mt-14 grid grid-cols-2 gap-3 sm:gap-5 lg:mt-16 lg:grid-cols-4 lg:gap-6"
      >
        {benefits.map((benefit, i) => (
          <li
            key={benefit.id}
            style={cssVars({ "--i": i })}
            className="group flex flex-col items-center rounded-[24px] border border-cream-200 bg-gradient-to-b from-white to-cream-100 px-3 py-8 text-center shadow-[0_14px_40px_-28px_rgb(1_35_19/0.45)] transition-[translate,box-shadow,border-color] duration-(--dur-card) hover:-translate-y-1 hover:border-forest-600/25 hover:shadow-[0_24px_50px_-28px_rgb(1_35_19/0.55)] motion-reduce:hover:translate-y-0 sm:px-6 sm:py-10"
          >
            <span className="benefit-medal grid size-20 place-items-center rounded-full sm:size-24 lg:size-28">
              <span className="grid size-[84%] place-items-center rounded-full bg-cream-50 shadow-[inset_0_2px_10px_rgb(1_35_19/0.08)]">
                <BotanicalIcon
                  name={benefit.icon}
                  className="size-10 text-forest-600 lg:size-11"
                  strokeWidth={1.3}
                />
              </span>
            </span>
            <div className="draw-label">
              <h3 className="mx-auto mt-5 flex min-h-[2.75em] max-w-[11rem] items-start justify-center font-display text-lg leading-snug font-semibold text-forest-800">
                {benefit.title}
              </h3>
              {benefit.description && (
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{benefit.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

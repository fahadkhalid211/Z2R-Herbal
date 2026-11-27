import { BotanicalIcon } from "@/components/icons/BotanicalIcon";
import { cssVars } from "@/lib/css-vars";
import type { Feature } from "@/services/types";

export function FeatureStrip({ features }: { features: Feature[] }) {
  return (
    <section aria-label="Why our oils" className="feature-float relative z-10 container-page">
      <ul
        data-reveal="draw"
        className="feature-card grid grid-cols-2 gap-x-4 gap-y-6 px-5 py-6 sm:px-8 sm:py-7 lg:grid-cols-4 lg:gap-0 lg:px-3 lg:py-0 xl:flex"
      >
        {features.map((feature, i) => (
          <li
            key={feature.id}
            style={cssVars({ "--i": i })}
            className="feature-item flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4 lg:gap-3.5 lg:px-5 lg:py-8 xl:flex-auto xl:justify-center xl:px-6"
          >
            <span className="feature-medal grid size-12 shrink-0 place-items-center rounded-full lg:size-[52px]">
              <BotanicalIcon name={feature.icon} className="size-6" strokeWidth={1.5} />
            </span>
            <div className="draw-label min-w-0">
              <h2 className="text-[0.9rem] leading-snug font-semibold text-forest-900 sm:text-[0.98rem] xl:whitespace-nowrap">
                {feature.title}
              </h2>
              {feature.description && (
                <p className="mt-1 text-[0.78rem] leading-snug text-ink-muted sm:text-[0.84rem] xl:whitespace-nowrap">
                  {feature.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

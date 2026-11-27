import { ArrowRight, Gift } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import type { Offer } from "@/services/types";
import { CopyCodeButton } from "./CopyCodeButton";

export function OfferBar({ offer }: { offer: Offer }) {
  return (
    <section
      aria-label={offer.title}
      data-reveal="loop"
      className="offer-shimmer relative overflow-hidden bg-forest-900 text-cream-50"
    >
      <div className="container-page flex flex-col items-center gap-4 py-6 text-center lg:flex-row lg:justify-between lg:gap-6 lg:py-5 lg:text-left">
        <p className="flex items-center gap-3 font-display text-2xl font-semibold text-gold-300">
          <Gift aria-hidden="true" className="size-7" strokeWidth={1.5} />
          <span className="gold-shimmer">{offer.title}</span>
        </p>
        <span aria-hidden="true" className="hidden h-8 w-px bg-cream-50/20 lg:block" />
        <p className="text-lg">
          Get <strong className="font-semibold">{offer.highlight}</strong> {offer.headline}
        </p>
        <div className="flex flex-col items-center gap-1">
          <CopyCodeButton code={offer.code} />
        </div>
        <ButtonLink href={offer.cta.href} size="sm" className="h-10 px-5 text-sm">
          {offer.cta.label} <ArrowRight aria-hidden="true" className="size-4" />
        </ButtonLink>
      </div>
    </section>
  );
}

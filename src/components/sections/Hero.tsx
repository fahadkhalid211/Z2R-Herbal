import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { HeroSliderProvider, type HeroSlide } from "@/components/hero/HeroSlider";
import { HeroStage } from "@/components/hero/HeroStage";
import { PRODUCT_SPOT as P, sceneProps } from "@/components/hero/scene";
import { BotanicalIcon } from "@/components/icons/BotanicalIcon";
import type { Feature, Ingredient, Product } from "@/services/types";

interface HeroProps {
  slides: Product[];
  features: Feature[];
  ingredients: Ingredient[];
}

function toCallout(p: Product, ingredients: Ingredient[]): HeroSlide["callout"] {
  const pick = (slugs: string[]) =>
    slugs.flatMap((slug) =>
      ingredients.filter((i) => i.slug === slug).map((i) => ({ name: i.name, src: i.image.src })),
    );
  if (p.blend) {
    const items = pick(p.blend.herbs);
    return items.length
      ? { eyebrow: "Enriched with", title: `${items.length} Powerful Herbs`, items }
      : undefined;
  }
  const [added] = pick(p.addedIngredients ?? []);
  return added && { eyebrow: "Enriched with", title: `${added.name} Extract`, items: [added] };
}

function toSlide(p: Product, ingredients: Ingredient[]): HeroSlide {
  const bottle = p.images.heroBottle;
  const box = p.images.heroBox;
  const bottleWidth = (P.bottleHeight * bottle.width) / bottle.height;
  const boxWidth = (P.boxHeight * box.width) / box.height;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    href: p.href,
    bottle,
    box,
    props: sceneProps(p.slug),
    callout: toCallout(p, ingredients),
    layout: {
      bottleLeft: P.bottleCenterX - bottleWidth / 2,
      bottleWidth,
      boxLeft: P.boxRight - boxWidth,
      boxWidth,
    },
    glow: p.accent.glow,
  };
}

function LeafMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 32" aria-hidden="true" className={className}>
      <path d="M26 30C13 30 4 21 3 7c12 0 22 8 23 23Z" fill="#2f7d2a" />
      <path d="M26 30C20 22 12 14 6 10" stroke="#a8d85a" strokeWidth="1.3" fill="none" opacity=".7" />
      <path
        d="M47 30C46 15 56 4 86 2c1 17-12 28-39 28Z"
        fill="none"
        stroke="#d4fb1e"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M47 30C55 21 66 13 80 7"
        stroke="#d4fb1e"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Hero({ slides, features, ingredients }: HeroProps) {
  if (slides.length === 0) return null;

  return (
    <HeroSliderProvider
      slides={slides.map((p) => toSlide(p, ingredients))}
      labelledBy="hero-title"
      className="hero-intro hero-ref relative isolate overflow-hidden bg-[#012514] text-cream-50"
    >
      <div className="hero-frame relative lg:aspect-[16/9]">
        <div className="hero-copy relative z-10 px-5 pt-[104px] pb-9 sm:px-10 sm:pt-[118px] lg:absolute lg:top-[17.3%] lg:left-[9.25%] lg:w-[33%] lg:p-0">
          <div data-intro className="hero-eyebrow">
            <LeafMark className="hero-leafmark" />
            <p className="flex items-center gap-[1.2em] text-[0.78rem] font-semibold tracking-[0.3em] whitespace-nowrap text-[#ece4c0] uppercase lg:text-[1.14cqw]">
              <span aria-hidden="true" className="h-px w-10 bg-[#9ba96e] lg:w-[3.75cqw]" />
              Natural Hair Care
              <span aria-hidden="true" className="h-px w-10 bg-[#9ba96e] lg:w-[3.75cqw]" />
            </p>
          </div>

          <h1
            id="hero-title"
            data-intro="lift"
            className="hero-title mt-4 font-display text-[2.9rem] leading-[0.95] font-semibold italic sm:text-[3.6rem] lg:mt-0 lg:leading-[0.84]"
          >
            <span className="block text-white lg:text-[5.05cqw] lg:tracking-[0.02em]">The Power of</span>{" "}
            <span className="hero-lime block pb-[0.08em] lg:text-[5.5cqw] lg:tracking-[0.035em]">
              Herbal Oils
            </span>
          </h1>

          <p
            data-intro="lift"
            className="mt-5 max-w-[30rem] text-[1rem] leading-[1.55] text-[#f3f1e9] lg:mt-[0.75cqw] lg:max-w-none lg:text-[1.14cqw] lg:leading-[1.4]"
          >
            A premium and signature range of 100% natural hair oils, <br className="hidden lg:inline" />
            crafted from pure botanical ingredients to <br className="hidden lg:inline" />
            nourish, strengthen and revive your hair naturally.
          </p>

          <div
            data-intro="lift"
            className="mt-7 flex flex-wrap items-center gap-3 lg:mt-[1.6cqw] lg:gap-[1.7cqw]"
          >
            <a href="#collection" className="hero-btn hero-btn--primary">
              Shop the Collection
              <ArrowRight aria-hidden="true" className="size-[1.15em]" strokeWidth={2} />
            </a>
            <a href="#watch" className="hero-btn hero-btn--ghost">
              <span aria-hidden="true" className="hero-btn-play">
                <Play className="size-[0.55em] fill-current" />
              </span>
              Watch Our Story
            </a>
          </div>

          <ul data-intro className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4 sm:flex sm:gap-0 lg:mt-[2.15cqw]">
            {features.map((feature, i) => (
              <li
                key={feature.id}
                data-sep={i > 0}
                className="flex items-center gap-2.5 text-[0.82rem] leading-tight text-[#f3f1e9] sm:pr-4 sm:data-[sep=true]:border-l sm:data-[sep=true]:border-cream-50/25 sm:data-[sep=true]:pl-4 lg:gap-[0.45cqw] lg:pr-[0.8cqw] lg:text-[0.88cqw] lg:data-[sep=true]:pl-[0.8cqw]"
              >
                <BotanicalIcon
                  name={feature.icon}
                  className="size-8 shrink-0 text-[#c8ec35] lg:size-[1.95cqw]"
                  strokeWidth={1.4}
                />
                <span className="max-w-[6.2em]">{feature.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-view relative aspect-[960/720] overflow-hidden lg:absolute lg:inset-0 lg:aspect-auto">
          <div className="scene-plate">
            <Image
              src="/images/hero/scene.webp"
              alt=""
              fill
              priority
              quality={88}
              sizes="(min-width: 1024px) 100vw, 170vw"
              className="object-cover"
            />
          </div>
          <HeroStage />
        </div>
      </div>
    </HeroSliderProvider>
  );
}

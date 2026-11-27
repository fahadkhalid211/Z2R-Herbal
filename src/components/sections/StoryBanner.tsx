import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cssVars } from "@/lib/css-vars";

const STORY_ART = { src: "/images/story/banner.webp", width: 2172, height: 724 };

export function StoryBanner({
  brandName,
  link = true,
  lines = ["Nature’s Care", "for Healthier Hair"],
  children,
}: {
  brandName: string;
  link?: boolean;
  lines?: string[];
  children?: React.ReactNode;
}) {
  return (
    <section id="story" aria-labelledby="story-title" className="container-page scroll-mt-24 pb-20 lg:pb-28">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div className="relative pb-16 sm:pb-20 lg:pr-14 lg:pb-12" data-reveal="fade">
          <span
            aria-hidden="true"
            className="absolute -top-8 -left-8 size-40 rounded-full border border-gold-500/35 lg:size-56"
          />
          <div
            className="parallax relative aspect-square overflow-hidden rounded-[32px] bg-forest-800 shadow-[0_40px_70px_-40px_rgb(1_35_19/0.6)]"
            style={cssVars({ "--shift": "12px" })}
          >
            <Image
              src={STORY_ART.src}
              fill
              alt="Smiling woman with long, glossy hair"
              sizes="(min-width: 1280px) 2100px, (min-width: 1024px) 165vw, 345vw"
              className="origin-[0%_51%] scale-[1.27] object-cover object-[3%_50%]"
            />
          </div>
          <div
            className="parallax absolute right-0 bottom-0 aspect-[4/3] w-[52%] overflow-hidden rounded-[24px] border-[6px] border-cream-50 bg-forest-800 shadow-float"
            style={cssVars({ "--shift": "-30px" })}
          >
            <Image
              src={STORY_ART.src}
              fill
              alt="A drop of oil falling from a leaf into a glass bowl"
              sizes="(min-width: 1280px) 840px, (min-width: 1024px) 66vw, 152vw"
              className="origin-[100%_51%] scale-[1.27] object-cover object-[98%_50%]"
            />
          </div>
        </div>

        <div className="text-center lg:text-left">
          <SectionHeading
            id="story-title"
            eyebrow={`The ${brandName} Story`}
            lines={lines}
            intro={
              children
                ? undefined
                : "A Pakistani Z2R herbal hair care brand offering a premium and signature range of natural oils for strong, shinier and more manageable hair."
            }
            align="start"
          />
          {children && (
            <div
              data-reveal="fade"
              style={cssVars({ "--d": "160ms" })}
              className="mx-auto mt-5 max-w-xl space-y-4 text-left text-[1.02rem] leading-relaxed text-ink-muted lg:mx-0"
            >
              {children}
            </div>
          )}
          {link && (
            <div data-reveal="fade" style={cssVars({ "--d": "240ms" })} className="mt-8">
              <ButtonLink href="/our-story" variant="dark" className="h-12 px-6 text-sm">
                Our Story <ArrowRight aria-hidden="true" className="size-4" />
              </ButtonLink>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

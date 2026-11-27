import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LEAF_PATH } from "@/components/hero/StageDecor";
import { RevealHeading } from "@/components/motion/RevealHeading";
import { cssVars } from "@/lib/css-vars";
import { BreadcrumbJsonLd } from "./Breadcrumbs";
import { Eyebrow } from "./Eyebrow";

interface Crumb {
  label: string;
  href?: string;
}

interface PageBannerProps {
  crumbs: Crumb[];
  eyebrow?: string;
  title?: string[];
  intro?: React.ReactNode;
}

export function PageBanner({ crumbs, eyebrow, title, intro }: PageBannerProps) {
  return (
    <section className="page-banner relative isolate overflow-hidden bg-forest-800 bg-[radial-gradient(70%_120%_at_12%_0%,#1d5528_0%,transparent_62%),radial-gradient(60%_110%_at_100%_100%,#0b3d22_0%,transparent_70%)] text-cream-50">
      <BreadcrumbJsonLd crumbs={crumbs} />
      <svg
        aria-hidden="true"
        viewBox="0 0 40 62"
        className="absolute -bottom-14 -left-6 -z-10 w-36 rotate-[35deg] text-lime-400/10 lg:w-52"
      >
        <path d={LEAF_PATH} fill="currentColor" />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 40 62"
        className="absolute -top-8 right-[8%] -z-10 w-28 rotate-[205deg] text-lime-400/[0.07] lg:w-44"
      >
        <path d={LEAF_PATH} fill="currentColor" />
      </svg>

      <div
        className={
          title
            ? "container-page pt-[112px] pb-12 text-center lg:pt-[168px] lg:pb-16"
            : "container-page pt-[96px] pb-6 lg:pt-[148px] lg:pb-8"
        }
      >
        <nav aria-label="Breadcrumb" className={title ? "flex justify-center" : "flex"}>
          <ol className="flex flex-wrap items-center gap-1.5 text-[0.82rem] text-cream-50/70">
            {crumbs.map((crumb, i) => (
              <li key={crumb.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight aria-hidden="true" className="size-3.5 text-cream-50/45" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    prefetch={false}
                    className="transition-colors duration-(--dur-fast) hover:text-lime-300"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-cream-50">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {title && (
          <>
            {eyebrow && (
              <div data-reveal="fade" className="mt-6">
                <Eyebrow tone="dark" lines="both" withLeaf>
                  {eyebrow}
                </Eyebrow>
              </div>
            )}
            <RevealHeading
              as="h1"
              lines={title}
              className="mt-4 font-display text-[2.5rem] leading-[1.04] font-semibold italic sm:text-[3.2rem] lg:text-[3.8rem]"
            />
            {intro && (
              <p
                data-reveal="fade"
                style={cssVars({ "--d": "160ms" })}
                className="mx-auto mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-cream-50/80"
              >
                {intro}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

import Image from "next/image";
import { TRUST_POINTS } from "@/components/ui/TrustBar";
import { cardSurface } from "@/components/ui/surface";
import { cn } from "@/lib/cn";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="container-page py-12 lg:py-16">
      <div className="grid overflow-hidden rounded-[32px] shadow-[0_40px_80px_-50px_rgb(1_35_19/0.7)] lg:grid-cols-[1fr_1.05fr]">
        <div className="auth-side relative isolate hidden min-h-full overflow-hidden p-10 text-cream-50 lg:flex lg:flex-col lg:justify-end">
          <Image
            src="/images/editorial/long-hair.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 1px"
            className="-z-10 object-cover object-[50%_18%]"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent_25%,rgb(1_21_13/0.92)_82%)]"
          />
          <p className="font-display text-[2rem] leading-tight font-semibold italic">
            Pure herbal hair care, delivered to your door.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-3">
            {TRUST_POINTS.map(({ Icon, title }) => (
              <li key={title} className="flex items-center gap-2.5 text-[0.88rem]">
                <Icon aria-hidden="true" className="size-[18px] text-lime-300" strokeWidth={1.7} /> {title}
              </li>
            ))}
          </ul>
        </div>
        <div className={cn(cardSurface, "rounded-none border-0 p-6 sm:p-10 lg:p-12")}>{children}</div>
      </div>
    </section>
  );
}

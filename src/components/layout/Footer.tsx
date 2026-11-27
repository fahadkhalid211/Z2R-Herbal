import Link from "next/link";
import { ArrowRight, Banknote, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LEAF_PATH } from "@/components/hero/StageDecor";
import { SocialIcon } from "@/components/icons/SocialIcon";
import { ButtonLink } from "@/components/ui/Button";
import { TRUST_POINTS } from "@/components/ui/TrustBar";
import type { SiteConfig } from "@/services/types";
import { whatsAppHref } from "./WhatsAppButton";

const columnHeading = "text-[0.7rem] font-semibold tracking-[0.22em] text-lime-300 uppercase";
const footerLink =
  "group inline-flex items-center gap-2 text-[0.92rem] text-cream-50/70 transition-colors duration-(--dur-fast) hover:text-cream-50";

function LinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <nav aria-label={title}>
      <h2 className={columnHeading}>{title}</h2>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} prefetch={false} className={footerLink}>
              <span
                aria-hidden="true"
                className="h-px w-0 bg-lime-300 transition-[width] duration-(--dur-card) group-hover:w-3"
              />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface FooterProps {
  site: SiteConfig;
  products: { name: string; href: string }[];
  payments?: string[];
}

export function Footer({ site, products, payments = [] }: FooterProps) {
  const { contact } = site;
  return (
    <footer
      data-reveal="loop"
      className="site-footer relative isolate overflow-hidden text-cream-50/75 defer-render"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 40 62"
        className="absolute top-40 -right-16 -z-10 w-72 rotate-[150deg] text-lime-400/[0.05]"
      >
        <path d={LEAF_PATH} fill="currentColor" />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 40 62"
        className="absolute bottom-24 -left-20 -z-10 w-80 rotate-[30deg] text-lime-400/[0.045]"
      >
        <path d={LEAF_PATH} fill="currentColor" />
      </svg>

      <div className="border-b border-cream-50/10">
        <ul aria-label="Our promises" className="container-page grid grid-cols-2 gap-y-6 py-9 lg:grid-cols-4">
          {TRUST_POINTS.map(({ Icon, title, text }) => (
            <li
              key={title}
              className="flex items-center gap-3.5 lg:justify-center lg:border-l lg:border-cream-50/10 lg:first:border-l-0"
            >
              <span className="footer-medal grid size-12 shrink-0 place-items-center rounded-full">
                <Icon aria-hidden="true" className="size-[21px] text-lime-300" strokeWidth={1.6} />
              </span>
              <span className="leading-tight">
                <span className="block font-display text-[1.05rem] font-semibold text-cream-50">{title}</span>
                <span className="mt-0.5 block text-[0.8rem] text-cream-50/60">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="container-page pt-14 lg:pt-16">
        <div className="footer-news relative isolate grid items-center gap-6 overflow-hidden rounded-[30px] px-6 py-9 sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:px-14 lg:py-11">
          <div>
            <p className={columnHeading}>Stay in the Loop</p>
            <h2 className="mt-3 font-display text-[1.9rem] leading-[1.1] font-semibold text-cream-50 italic sm:text-[2.3rem]">
              Hair care tips, updates and exclusive offers.
            </h2>
            <p className="mt-3 max-w-md text-[0.92rem] text-cream-50/70">
              Get hair care tips, updates and exclusive offers from {site.brandName}.
            </p>
          </div>
          <div className="lg:justify-self-end">
            <p className="max-w-sm font-display text-[1.4rem] leading-snug font-semibold text-cream-50 sm:text-[1.55rem]">
              Ready to make natural hair care part of your routine?
            </p>
            <ButtonLink href="/shop" className="mt-5 h-12 px-6 text-sm">
              Explore the Collection <ArrowRight aria-hidden="true" className="size-4" />
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-x-8 gap-y-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1.25fr] lg:py-16">
        <div>
          <Logo tone="cream" loading="lazy" className="h-[92px]" />
          <p className="mt-5 max-w-xs text-[0.88rem] leading-relaxed">{site.blurb}</p>
          <ul className="mt-6 flex gap-2.5" aria-label="Social media">
            {site.socials.map((social) => (
              <li key={social.platform}>
                {social.href ? (
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="grid size-10 place-items-center rounded-full text-cream-50 ring-1 ring-cream-50/20 transition-colors duration-(--dur-fast) hover:bg-cream-50/10 hover:text-lime-300 hover:ring-lime-300/50"
                  >
                    <SocialIcon platform={social.platform} className="size-[18px]" />
                  </a>
                ) : (
                  <span
                    role="img"
                    aria-label={`${social.label} (coming soon)`}
                    title="Coming soon"
                    className="grid size-10 place-items-center rounded-full text-cream-50/70 ring-1 ring-cream-50/12"
                  >
                    <SocialIcon platform={social.platform} className="size-[18px]" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <LinkColumn
          title="Shop"
          links={[
            { label: "Shop All", href: "/shop" },
            ...products.map((p) => ({ label: p.name, href: p.href })),
          ]}
        />
        <LinkColumn title="Customer Support" links={site.help} />

        <div>
          <h2 className={columnHeading}>Get in Touch</h2>
          <ul className="mt-5 space-y-4 text-[0.92rem]">
            <li>
              <a
                href={whatsAppHref(contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-[#25d366]/12 px-4 py-3 text-cream-50 ring-1 ring-[#25d366]/30 transition-colors duration-(--dur-fast) hover:bg-[#25d366]/20"
              >
                <MessageCircle aria-hidden="true" className="size-5 text-[#4ae58a]" strokeWidth={1.8} />
                <span>
                  <span className="block font-semibold">Chat on WhatsApp</span>
                  <span className="block text-[0.78rem] text-cream-50/65">Our support team will help</span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={contact.phoneHref}
                className="flex items-center gap-3 transition-colors hover:text-lime-300"
              >
                <Phone aria-hidden="true" className="size-4 text-lime-400" /> {contact.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-3 break-all transition-colors hover:text-lime-300"
              >
                <Mail aria-hidden="true" className="size-4 shrink-0 text-lime-400" /> {contact.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin aria-hidden="true" className="size-4 text-lime-400" /> {contact.location}
            </li>
          </ul>
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-cream-50/12 px-4 py-3">
            <Banknote aria-hidden="true" className="size-5 text-lime-300" strokeWidth={1.6} />
            <span className="text-[0.82rem]">
              <span className="block text-[0.66rem] font-semibold tracking-[0.18em] text-cream-50/50 uppercase">
                Payment
              </span>
              <span className="font-semibold text-cream-50">
                {payments.length > 0 ? payments.join(" · ") : "Cash on Delivery"}
              </span>
            </span>
          </div>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="footer-watermark pointer-events-none -mt-4 text-center font-display text-[clamp(4.5rem,15vw,14rem)] leading-[0.82] font-bold whitespace-nowrap italic select-none lg:-mt-8"
      >
        Z2R Herbal
      </p>
      <div className="relative border-t border-cream-50/10 bg-forest-950/70">
        <div className="container-page flex flex-col gap-4 py-6 text-[0.84rem] lg:flex-row lg:items-center lg:justify-between">
          <p className="text-cream-50/60">
            Developed by{" "}
            <a
              href="https://aligessential.com/"
              target="_blank"
              rel="noopener"
              className="transition-colors duration-(--dur-fast) hover:text-cream-50"
            >
              aligessential.com
            </a>
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {site.footer.legal.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch={false}
                  className="text-cream-50/60 transition-colors duration-(--dur-fast) hover:text-cream-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

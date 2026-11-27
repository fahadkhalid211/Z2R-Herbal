import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { whatsAppHref } from "@/components/layout/WhatsAppButton";
import { PageBanner } from "@/components/ui/PageBanner";
import { cardSurface } from "@/components/ui/surface";
import { cn } from "@/lib/cn";
import { pageMeta } from "@/lib/page-meta";
import { getServices } from "@/services";

export const metadata = pageMeta({
  title: "Help",
  description: "Shipping and delivery, returns, FAQs and contact details for Z2R Herbal.",
  path: "/help",
  index: false,
});

export default async function HelpPage() {
  const site = await getServices().site.config();
  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Help" }]}
        eyebrow="Customer Care"
        title={["How Can We Help?"]}
      />
      <section aria-label="Help topics" className="container-page py-14 lg:py-20">
        <ul className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {site.help.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch={false}
                className={cn(
                  cardSurface,
                  "group flex items-center justify-between gap-4 rounded-[22px] p-6 transition-[translate] duration-(--dur-card) hover:-translate-y-1",
                )}
              >
                <span className="font-display text-[1.3rem] font-semibold text-ink">{item.label}</span>
                <ArrowUpRight aria-hidden="true" className="size-5 text-forest-600" />
              </Link>
            </li>
          ))}
          <li className="sm:col-span-2">
            <a
              href={whatsAppHref(site.contact.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-[22px] bg-forest-800 p-6 text-cream-50 transition-colors hover:bg-forest-700"
            >
              <MessageCircle aria-hidden="true" className="size-7 text-lime-300" strokeWidth={1.6} />
              <span>
                <span className="block font-display text-[1.3rem] font-semibold">Chat on WhatsApp</span>
                <span className="block text-[0.9rem] text-cream-50/75">We will be happy to assist you.</span>
              </span>
            </a>
          </li>
        </ul>
      </section>
    </>
  );
}

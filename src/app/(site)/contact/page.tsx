import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/layout/ContactForm";
import { whatsAppHref } from "@/components/layout/WhatsAppButton";
import { PageBanner } from "@/components/ui/PageBanner";
import { cardSurface } from "@/components/ui/surface";
import { cn } from "@/lib/cn";
import { pageMeta } from "@/lib/page-meta";
import { getServices } from "@/services";

const INTRO =
  "You can contact us through our WhatsApp, social media pages, or the contact details provided on our website. We will be happy to assist you.";

export const metadata = pageMeta({ title: "Contact", description: INTRO, path: "/contact" });

export default async function ContactPage() {
  const { contact } = await getServices().site.config();
  const ways = [
    {
      Icon: MessageCircle,
      label: "WhatsApp",
      value: "Chat with our customer support team",
      href: whatsAppHref(contact.whatsapp),
      external: true,
    },
    { Icon: Phone, label: "Phone", value: contact.phone, href: contact.phoneHref },
    { Icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { Icon: MapPin, label: "Location", value: contact.location },
  ];

  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        eyebrow="Customer Support"
        title={["Contact Us"]}
        intro={INTRO}
      />
      <section
        aria-label="Contact details"
        className="container-page grid items-start gap-6 py-14 lg:grid-cols-[1fr_1.15fr] lg:gap-10 lg:py-20"
      >
        <ul className="grid gap-4">
          {ways.map(({ Icon, label, value, href, external }) => {
            const body = (
              <>
                <span className="feature-medal grid size-12 shrink-0 place-items-center rounded-full">
                  <Icon aria-hidden="true" className="size-[22px]" strokeWidth={1.6} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold tracking-[0.16em] text-olive-600 uppercase">
                    {label}
                  </span>
                  <span className="mt-1 block font-display text-[1.2rem] leading-snug font-semibold break-words text-ink lining-nums">
                    {value}
                  </span>
                </span>
              </>
            );
            const box = cn(cardSurface, "flex h-full items-center gap-4 rounded-[22px] p-5 sm:p-6");
            return (
              <li key={label}>
                {href ? (
                  <a
                    href={href}
                    {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                    className={cn(
                      box,
                      "transition-[translate,box-shadow,border-color] duration-(--dur-card) hover:-translate-y-1 hover:border-forest-600/25",
                    )}
                  >
                    {body}
                  </a>
                ) : (
                  <div className={box}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
        <div className={cn(cardSurface, "p-6 sm:p-9")}>
          <h2 className="font-display text-[1.7rem] font-semibold text-ink">Send us a message</h2>
          <p className="mt-2 mb-6 text-[0.92rem] text-ink-muted">We will reply by email as soon as we can.</p>
          <ContactForm />
        </div>
      </section>
    </>
  );
}

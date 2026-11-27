import type { SiteConfig } from "@/services/types";

type WhatsApp = SiteConfig["contact"]["whatsapp"];

export function whatsAppHref({ number, greeting }: WhatsApp): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(greeting)}`;
}

export function WhatsAppButton({ whatsapp }: { whatsapp: WhatsApp }) {
  return (
    <a
      href={whatsAppHref(whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="wa-fab group fixed right-4 bottom-4 isolate z-40 grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_12px_28px_-10px_rgb(1_35_19/0.6)] sm:right-6 sm:bottom-6"
    >
      <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
        <path
          d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M9.2 8.1c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.6 1.1 2.8c.1.2 1.9 3 4.7 4.1 2.3.9 2.8.7 3.3.7.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3l-1.8-.9c-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.4-.5.3-.5c.1-.2 0-.3 0-.5l-.8-1.9z"
          fill="currentColor"
        />
      </svg>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-full mr-3 hidden rounded-full bg-forest-900 px-3 py-1.5 text-sm whitespace-nowrap text-cream-50 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:block"
      >
        Chat with us
      </span>
    </a>
  );
}

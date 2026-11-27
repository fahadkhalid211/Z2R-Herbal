"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cardSurface } from "@/components/ui/surface";
import { cn } from "@/lib/cn";

export function FaqList({ faqs }: { faqs: readonly { question: string; answer: string }[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = faqs
    .map((faq, i) => ({ ...faq, number: i + 1 }))
    .filter((faq) => !q || `${faq.question} ${faq.answer}`.toLowerCase().includes(q));

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Search the questions</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-forest-600"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search: delivery, Cash on Delivery, results…"
          className="h-14 w-full rounded-full border border-cream-200 bg-white pr-5 pl-13 text-[0.98rem] text-ink shadow-[0_18px_40px_-28px_rgb(1_35_19/0.5)] placeholder:text-ink-muted/60 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/12 focus:outline-none"
        />
      </label>
      <p role="status" className="sr-only">
        {shown.length} questions
      </p>
      <ul className="mt-6 space-y-3.5">
        {shown.map((faq) => (
          <li key={faq.question}>
            <details className={cn(cardSurface, "group rounded-[22px]")}>
              <summary className="flex cursor-pointer list-none items-center gap-4 rounded-[22px] px-5 py-5 sm:px-7 [&::-webkit-details-marker]:hidden">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-forest-600/10 text-[0.85rem] font-semibold text-forest-700 tabular-nums"
                >
                  {String(faq.number).padStart(2, "0")}
                </span>
                <h2 className="flex-1 font-display text-[1.12rem] leading-snug font-semibold text-ink sm:text-[1.25rem]">
                  {faq.question}
                </h2>
                <ChevronDown
                  aria-hidden="true"
                  className="size-5 shrink-0 text-forest-600 transition-transform duration-(--dur-card) group-open:rotate-180"
                />
              </summary>
              <p className="px-5 pb-6 pl-[4.25rem] leading-relaxed text-ink-muted sm:px-7 sm:pl-[5rem]">
                {faq.answer}
              </p>
            </details>
          </li>
        ))}
        {shown.length === 0 && (
          <li className="py-8 text-center text-ink-muted">No question matches “{query}”.</li>
        )}
      </ul>
    </div>
  );
}

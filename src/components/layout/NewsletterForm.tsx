"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { subscribeToNewsletter, type NewsletterState } from "@/app/actions";
import clsx from "clsx";

const initial: NewsletterState = { status: "idle" };

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeToNewsletter, initial);

  return (
    <form action={action} className="mt-4" noValidate>
      <div className="flex max-w-sm items-center rounded-full bg-cream-50 p-1 pl-1 shadow-[0_12px_30px_-18px_rgb(0_0_0/0.8)] ring-1 ring-cream-50/20 transition-shadow duration-(--dur-fast) focus-within:ring-2 focus-within:ring-lime-400">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email address"
          aria-describedby="newsletter-status"
          className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Subscribe"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-lime-400 text-forest-900 transition-[background-color,scale] duration-(--dur-fast) hover:bg-lime-300 active:scale-95 disabled:opacity-60"
        >
          <ArrowRight className="size-5" />
        </button>
      </div>
      <p
        id="newsletter-status"
        role="status"
        className={clsx("mt-2 min-h-5 text-sm", state.status === "error" ? "text-gold-300" : "text-lime-300")}
      >
        {state.message}
      </p>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { PenLine, Star } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { TextAreaField, TextField } from "@/components/ui/TextField";
import { cn } from "@/lib/cn";
import { submitProductReview } from "@/server/review-actions";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

export function ReviewForm({ slug, signedIn }: { slug: string; signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!signedIn) {
    return (
      <div className="rounded-[22px] border border-forest-600/15 bg-forest-600/[0.04] px-5 py-5">
        <p className="font-display text-[1.15rem] font-semibold text-ink">Used this product?</p>
        <p className="mt-1 text-[0.9rem] leading-relaxed text-ink-muted">
          Sign in to share your experience with other customers.
        </p>
        <Link
          href={`/login?next=${encodeURIComponent(`/products/${slug}#reviews`)}`}
          prefetch={false}
          className={buttonClasses({ variant: "dark", className: "mt-4 w-full sm:w-auto" })}
        >
          <PenLine aria-hidden="true" className="size-4" /> Sign in to write a review
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <Notice tone="success" title="Thank you for your review" role="status">
        {done}
      </Notice>
    );
  }

  if (!open) {
    return (
      <Button variant="dark" className="w-full sm:w-auto" onClick={() => setOpen(true)}>
        <PenLine aria-hidden="true" className="size-4" /> Write a review
      </Button>
    );
  }

  const shown = hover || rating;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (rating < 1) {
      setFields({ rating: "Choose 1 to 5 stars." });
      return;
    }
    start(async () => {
      const r = await submitProductReview(slug, { rating, title, body });
      if (r.ok) {
        setDone(r.message);
        return;
      }
      setFields(r.fields ?? {});
      setError(r.code === "CONFLICT" ? "You have already reviewed this product." : r.message);
    });
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-[22px] border border-cream-200 bg-white/80 p-5 sm:p-6"
    >
      <p className="font-display text-[1.2rem] font-semibold text-ink">Your review</p>

      <fieldset className="mt-4">
        <legend className="mb-1.5 block text-sm font-medium text-forest-900">Your rating</legend>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1" role="radiogroup" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n > 1 ? "s" : ""}, ${LABELS[n]}`}
                onMouseEnter={() => setHover(n)}
                onFocus={() => setHover(n)}
                onBlur={() => setHover(0)}
                onClick={() => {
                  setRating(n);
                  setFields((f) => ({ ...f, rating: "" }));
                }}
                className="grid size-10 place-items-center rounded-full transition-transform duration-(--dur-fast) hover:scale-110 focus-visible:ring-4 focus-visible:ring-forest-600/15 focus-visible:outline-none"
              >
                <Star
                  aria-hidden="true"
                  strokeWidth={1.4}
                  className={cn(
                    "size-7 transition-colors",
                    n <= shown ? "fill-gold-500 text-gold-500" : "fill-transparent text-forest-900/25",
                  )}
                />
              </button>
            ))}
          </div>
          <span className="text-[0.9rem] font-semibold text-forest-800" aria-live="polite">
            {LABELS[shown]}
          </span>
        </div>
        {fields.rating && <p className="mt-1.5 text-[0.82rem] text-[#b3261e]">{fields.rating}</p>}
      </fieldset>

      <TextField
        className="mt-5"
        label="Headline (optional)"
        maxLength={150}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Sum it up in a few words"
        error={fields.title}
      />
      <TextAreaField
        className="mt-4"
        label="Your experience (optional)"
        rows={4}
        maxLength={2000}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="How did it work for your hair? How long have you used it?"
        hint={`${body.trim().length}/2000`}
        error={fields.body}
      />

      {error && (
        <Notice tone="error" role="alert" className="mt-4">
          {error}
        </Notice>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Submit review"}
        </Button>
        <Button type="button" variant="outline-dark" onClick={() => setOpen(false)} disabled={pending}>
          Cancel
        </Button>
      </div>
      <p className="mt-3 text-[0.8rem] text-ink-muted">
        Reviews may be checked by our team before they appear. Your first name and last initial are shown.
      </p>
    </form>
  );
}

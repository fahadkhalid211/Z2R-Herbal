"use client";

import { Banknote, Check, Smartphone } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PaymentMethod } from "@/server/store-api/orders";

const isCod = (title: string) => /\bcod\b|on\s*delivery/i.test(title);

function detailRows(details: string) {
  return details
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const at = line.indexOf(":");
      return at > 0 && at < 40
        ? { label: line.slice(0, at).trim(), value: line.slice(at + 1).trim() }
        : { label: "", value: line };
    });
}

export function PaymentMethodPicker({
  methods,
  value,
  onChange,
  error,
}: {
  methods: PaymentMethod[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  return (
    <div role="radiogroup" aria-labelledby="payment-title" className="mt-6 space-y-3">
      {methods.map((m) => {
        const selected = m.id === value;
        const cod = isCod(m.title);
        const Icon = cod ? Banknote : Smartphone;
        const rows = m.accountDetails ? detailRows(m.accountDetails) : [];
        const fields = rows.filter((r) => r.label);
        const note = rows
          .filter((r) => !r.label)
          .map((r) => r.value)
          .join(" ");
        return (
          <div
            key={m.id}
            className={cn(
              "overflow-hidden rounded-[20px] border transition-[border-color,box-shadow,background-color] duration-300",
              selected
                ? "border-forest-600 bg-gradient-to-b from-forest-600/[0.06] to-white shadow-[0_18px_40px_-28px_rgb(1_35_19/0.55)]"
                : "border-cream-200 bg-white hover:border-forest-600/35",
            )}
          >
            <label className="flex cursor-pointer items-center gap-4 p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-[-2px] has-[:focus-visible]:outline-forest-600 sm:p-5">
              <input
                type="radio"
                name="paymentMethodId"
                value={m.id}
                checked={selected}
                onChange={() => onChange(m.id)}
                className="sr-only"
              />
              <span
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-2xl transition-colors duration-300",
                  selected ? "bg-forest-600 text-lime-300" : "bg-cream-100 text-forest-700",
                )}
              >
                <Icon aria-hidden="true" className="size-[22px]" strokeWidth={1.7} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[1.02rem] font-semibold tracking-[0.01em] text-forest-900">
                  {m.title}
                </span>
                {(note || cod) && (
                  <span className="mt-0.5 block text-[0.84rem] leading-snug text-ink-muted">
                    {note || "Pay in cash when your order arrives."}
                  </span>
                )}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300",
                  selected
                    ? "border-forest-600 bg-forest-600 text-cream-50"
                    : "border-forest-900/20 bg-white",
                )}
              >
                <Check
                  className={cn("size-3.5 transition-transform", selected ? "scale-100" : "scale-0")}
                  strokeWidth={3}
                />
              </span>
            </label>

            {selected && fields.length > 0 && (
              <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                <dl className="divide-y divide-forest-900/[0.07] rounded-2xl border border-forest-900/[0.08] bg-white">
                  {fields.map((row, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <dt className="text-[0.68rem] font-semibold tracking-[0.14em] text-olive-600 uppercase">
                          {row.label}
                        </dt>
                        <dd className="mt-0.5 text-[0.98rem] font-semibold break-words text-forest-900 tabular-nums">
                          {row.value}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        );
      })}
      {error && (
        <p role="alert" className="text-[0.85rem] text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

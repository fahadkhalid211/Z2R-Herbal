"use client";

import { Minus, Plus } from "lucide-react";
import clsx from "clsx";
import { MAX_QUANTITY, clampQuantity } from "@/lib/cart";

interface QuantityStepperProps {
  value: number;
  onChange: (quantity: number) => void;
  label: string;
  size?: "sm" | "md";
}

const step =
  "grid place-items-center rounded-full text-forest-800 transition-[background-color,scale] duration-(--dur-fast) hover:bg-forest-600/10 active:scale-95 disabled:opacity-35 disabled:hover:bg-transparent";

export function QuantityStepper({ value, onChange, label, size = "md" }: QuantityStepperProps) {
  const box = size === "md" ? "size-10" : "size-8";
  return (
    <div
      role="group"
      aria-label={`Quantity: ${label}`}
      className={clsx(
        "inline-flex items-center rounded-full border border-forest-600/25 bg-white p-1",
        size === "md" ? "h-12" : "h-10",
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(clampQuantity(value - 1))}
        className={clsx(step, box)}
      >
        <Minus aria-hidden="true" className="size-4" />
      </button>
      <input
        aria-label="Quantity"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "");
          if (digits) onChange(clampQuantity(Number(digits)));
        }}
        className="w-10 bg-transparent text-center text-[0.95rem] font-semibold text-forest-900 tabular-nums focus:outline-none"
      />
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= MAX_QUANTITY}
        onClick={() => onChange(clampQuantity(value + 1))}
        className={clsx(step, box)}
      >
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}

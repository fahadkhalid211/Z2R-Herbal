import { Check, CircleX, PackageCheck, Truck } from "lucide-react";
import clsx from "clsx";
import { type OrderStatusFacts, orderProgress } from "@/lib/order-status";

const formatDate = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
};

export function OrderProgress({ order }: { order: OrderStatusFacts }) {
  const { cancelled, steps } = orderProgress(order);
  const shipments = (order.shipments ?? []).filter((s) => s.courier || s.trackingNumber);

  if (cancelled) {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-[#f3e1dd] px-4 py-3 text-[0.88rem] font-medium text-[#8a2b17]">
        <CircleX aria-hidden="true" className="size-4" /> This order was cancelled.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-forest-900/10 bg-forest-600/[0.03] p-4 sm:p-5">
      <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-olive-600 uppercase">Order tracking</p>
      <ol aria-label="Order progress" className="mt-4 grid grid-cols-3 gap-2">
        {steps.map((step, i) => {
          const Icon = step.key === "delivered" ? PackageCheck : step.key === "dispatched" ? Truck : Check;
          return (
            <li key={step.key} className="relative flex flex-col items-center text-center">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={clsx(
                    "absolute top-4 right-1/2 h-0.5 w-full -translate-y-1/2",
                    step.done ? "bg-forest-600" : "bg-forest-900/15",
                  )}
                />
              )}
              <span
                className={clsx(
                  "relative grid size-8 place-items-center rounded-full",
                  step.done
                    ? "bg-forest-600 text-cream-50"
                    : "border-2 border-forest-900/15 bg-white text-ink-muted",
                )}
              >
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <span
                className={clsx(
                  "mt-2 text-[0.8rem] font-semibold",
                  step.done ? "text-forest-900" : "text-ink-muted",
                )}
              >
                {step.label}
              </span>
              <span className="text-[0.74rem] text-ink-muted">
                {step.done ? formatDate(step.at) : "Not yet"}
              </span>
              <span className="sr-only">{step.done ? "done" : "not reached yet"}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-[0.84rem] text-ink-muted">
        Current status: <span className="font-semibold text-forest-900">{order.status}</span>
      </p>
      {shipments.map((s, i) => (
        <p key={i} className="mt-1.5 text-[0.84rem] text-ink-muted">
          {s.courier && <span className="font-medium text-forest-900">{s.courier}</span>}
          {s.courier && s.trackingNumber && " · "}
          {s.trackingNumber && (
            <>
              Tracking number <span className="font-semibold text-forest-900">{s.trackingNumber}</span>
            </>
          )}
        </p>
      ))}
    </div>
  );
}

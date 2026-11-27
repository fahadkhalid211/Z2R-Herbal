import { formatPrice } from "@/lib/money";
import type { Order } from "@/lib/customer-api";

const formatDate = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" });
};

export function OrderCard({ order }: { order: Order }) {
  return (
    <article className="rounded-2xl border border-cream-200 bg-white p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-olive-600 uppercase">Order ID</p>
          <p className="mt-0.5 font-semibold text-forest-900">{order.id}</p>
          <p className="mt-0.5 text-[0.85rem] text-ink-muted">Placed on {formatDate(order.placedAt)}</p>
        </div>
        <p className="rounded-full bg-forest-600 px-3.5 py-1.5 text-xs font-semibold text-cream-50">
          {order.status}
        </p>
      </header>
      {order.delivery && <p className="mt-4 text-[0.92rem] text-forest-900">{order.delivery}</p>}
      <ul className="mt-4 divide-y divide-forest-900/10 border-y border-forest-900/10 text-[0.92rem]">
        {order.items.map((item) => (
          <li key={`${item.name} ${item.variantLabel ?? ""}`} className="flex justify-between gap-4 py-2.5">
            <span>
              {item.quantity} × {item.name}
              {item.variantLabel && <span className="text-ink-muted"> · {item.variantLabel}</span>}
            </span>
            <span className="font-medium tabular-nums">{formatPrice(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1.5 text-[0.92rem]">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
        </div>
        {order.shipping !== undefined && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Shipping charges</dt>
            <dd className="tabular-nums">{formatPrice(order.shipping)}</dd>
          </div>
        )}
        {order.paymentMethod && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">Payment</dt>
            <dd>{order.paymentMethod}</dd>
          </div>
        )}
        {order.total !== undefined && (
          <div className="flex justify-between gap-4 font-semibold text-forest-900">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(order.total)}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}

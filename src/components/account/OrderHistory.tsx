"use client";

import { useEffect, useState } from "react";
import { ChevronDown, PackageOpen, Search, X } from "lucide-react";
import clsx from "clsx";
import { OrderCard } from "@/components/order/OrderCard";
import { OrderProgress } from "@/components/order/OrderProgress";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { TextField } from "@/components/ui/TextField";
import { type Order, customerApi, describeApiError, errorFields } from "@/lib/customer-api";
import { formatPrice } from "@/lib/money";
import { isDispatched } from "@/lib/order-status";

const formatDate = (value: string) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
};

const STATUS_TONE: Record<string, string> = {
  canceled: "bg-[#f3e1dd] text-[#8a2b17]",
  cancelled: "bg-[#f3e1dd] text-[#8a2b17]",
  delivered: "bg-forest-600 text-cream-50",
  dispatched: "bg-lime-300 text-forest-900",
  shipped: "bg-lime-300 text-forest-900",
};
const statusClass = (code?: string) => STATUS_TONE[code ?? ""] ?? "bg-forest-600/10 text-forest-800";

function OrderDetails({ order, onChange }: { order: Order; onChange: (o: Order) => void }) {
  const [detail, setDetail] = useState<Order | null>(order.summary ? null : order);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (detail || !order.ref) return;
    let live = true;
    customerApi
      .myOrder(order.ref)
      .then((d) => live && setDetail(d))
      .catch((e: unknown) => live && setError(describeApiError(e, "account")));
    return () => {
      live = false;
    };
  }, [detail, order.ref]);

  if (error)
    return (
      <Notice tone="error" role="alert">
        {error}
      </Notice>
    );
  if (!detail)
    return (
      <p role="status" className="py-3 text-[0.9rem] text-ink-muted">
        Loading order details…
      </p>
    );

  const cancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail.ref) return;
    setPending(true);
    setReasonError("");
    try {
      const updated = await customerApi.cancelOrder(detail.ref, reason);
      setDetail(updated);
      onChange(updated);
      setCancelling(false);
    } catch (err) {
      setReasonError(errorFields(err).reason ?? describeApiError(err, "account"));
    } finally {
      setPending(false);
    }
  };

  const dispatched = isDispatched(detail);
  const canCancel = detail.canCancel === true && !dispatched;

  return (
    <div className="space-y-4">
      <OrderProgress order={detail} />
      <OrderCard order={detail} />
      {detail.shippingAddress && (
        <p className="text-[0.88rem] text-ink-muted">
          <span className="font-medium text-forest-900">Delivering to:</span> {detail.shippingAddress}
        </p>
      )}
      {canCancel ? (
        cancelling ? (
          <form
            onSubmit={cancel}
            noValidate
            className="space-y-3 rounded-2xl border border-[#e9d9c4] bg-white p-4"
          >
            <TextField
              label="Why would you like to cancel?"
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              error={reasonError}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={pending}
                className={buttonClasses({
                  variant: "dark",
                  className: "h-10 px-5 text-sm disabled:opacity-60",
                })}
              >
                {pending ? "Cancelling…" : "Cancel this order"}
              </button>
              <button
                type="button"
                onClick={() => setCancelling(false)}
                className={buttonClasses({ variant: "outline-dark", className: "h-10 px-5 text-sm" })}
              >
                Keep my order
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setCancelling(true)}
            className="text-[0.88rem] font-semibold text-[#8a2b17] underline decoration-[#8a2b17]/30 underline-offset-4 hover:decoration-[#8a2b17]"
          >
            Cancel order
          </button>
        )
      ) : dispatched ? (
        <p className="text-[0.84rem] text-ink-muted">
          This order has been dispatched, so it can no longer be cancelled.
        </p>
      ) : (
        detail.cancelBlockedReason && (
          <p className="text-[0.84rem] text-ink-muted">{detail.cancelBlockedReason}</p>
        )
      )}
    </div>
  );
}

export function OrderHistory() {
  const [page, setPage] = useState(1);
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState<{
    orders: Order[];
    total: number;
    pageSize: number;
    page: number;
    all: number;
    key: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const requestKey = `${page}|${query}`;
  const loading = data?.key !== requestKey;

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(input.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [input]);

  useEffect(() => {
    let live = true;
    customerApi
      .myOrders(page, query)
      .then((r) => {
        if (!live) return;
        setData({ ...r, key: `${page}|${query}` });
        setError("");
      })
      .catch((e: unknown) => live && setError(describeApiError(e, "account")));
    return () => {
      live = false;
    };
  }, [page, query]);

  if (error)
    return (
      <Notice tone="error" role="alert">
        {error}
      </Notice>
    );
  if (!data)
    return (
      <p role="status" className="text-ink-muted">
        Loading your orders…
      </p>
    );
  if (data.all === 0)
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-forest-900/15 bg-white/60 px-6 py-12 text-center">
        <span className="feature-medal grid size-14 place-items-center rounded-full">
          <PackageOpen aria-hidden="true" className="size-6" strokeWidth={1.5} />
        </span>
        <p className="mt-4 font-display text-[1.25rem] font-semibold text-ink">No orders yet</p>
        <p className="mt-1 max-w-xs text-[0.9rem] text-ink-muted">
          When you place an order, it will appear here with its tracking.
        </p>
        <ButtonLink href="/shop" className="mt-6 h-11 px-6 text-sm">
          Shop the Collection
        </ButtonLink>
      </div>
    );

  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const replace = (o: Order) =>
    setData(
      (d) =>
        d && {
          ...d,
          orders: d.orders.map((x) =>
            x.ref === o.ref ? { ...x, status: o.status, statusCode: o.statusCode } : x,
          ),
        },
    );

  return (
    <div className="space-y-4">
      <div role="search" className="relative">
        <label htmlFor="order-search" className="sr-only">
          Search your orders
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-ink-muted"
        />
        <input
          id="order-search"
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by order number, status or date"
          autoComplete="off"
          className="block h-12 w-full rounded-2xl border border-cream-200 bg-white pr-11 pl-11 text-[0.95rem] text-ink shadow-[inset_0_1px_2px_rgb(1_35_19/0.05)] placeholder:text-ink-muted/70 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/12 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {input && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setInput("")}
            className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-muted hover:bg-forest-600/10 hover:text-forest-700"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>

      <p role="status" className="text-[0.82rem] text-ink-muted">
        {loading
          ? "Updating…"
          : query
            ? `${data.total} of ${data.all} ${data.all === 1 ? "order" : "orders"} match “${query}”.`
            : `${data.all} ${data.all === 1 ? "order" : "orders"}, newest first.`}
      </p>

      {data.orders.length === 0 ? (
        <p className="rounded-2xl border border-[#e9d9c4] bg-white px-5 py-6 text-center text-[0.92rem] text-ink-muted">
          No orders match your search.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.orders.map((o) => {
            const key = o.ref ?? o.id;
            const isOpen = open === key;
            return (
              <li key={key} className="overflow-hidden rounded-2xl border border-[#e9d9c4] bg-white">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : key)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-forest-600/[0.03]"
                >
                  <span className="min-w-0">
                    <span className="block font-semibold text-forest-900">{o.id}</span>
                    <span className="mt-0.5 block text-[0.82rem] text-ink-muted">
                      {formatDate(o.placedAt)}
                      {o.units !== undefined && ` · ${o.units} ${o.units === 1 ? "item" : "items"}`}
                      {o.total !== undefined && ` · ${formatPrice(o.total)}`}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span
                      className={clsx(
                        "rounded-full px-3 py-1 text-[0.74rem] font-semibold",
                        statusClass(o.statusCode),
                      )}
                    >
                      {o.status}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={clsx("size-4 text-forest-600 transition-transform", isOpen && "rotate-180")}
                    />
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-[#e9d9c4] p-4 sm:p-5">
                    <OrderDetails order={o} onChange={replace} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {pages > 1 && (
        <nav aria-label="Order pages" className="flex items-center justify-between pt-2 text-[0.88rem]">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className={buttonClasses({
              variant: "outline-dark",
              className: "h-9 px-4 text-xs disabled:opacity-40",
            })}
          >
            Newer
          </button>
          <span className="text-ink-muted">
            Page {data.page} of {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className={buttonClasses({
              variant: "outline-dark",
              className: "h-9 px-4 text-xs disabled:opacity-40",
            })}
          >
            Older
          </button>
        </nav>
      )}
    </div>
  );
}

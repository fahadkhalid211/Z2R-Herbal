import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Logo } from "@/components/brand/Logo";
import { buttonClasses } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { cardSurface } from "@/components/ui/surface";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/money";
import { ADMIN_COOKIE, adminConfigured, verifyAdminSession } from "@/server/admin-session";
import { getStore } from "@/server/json-store";
import { listOrders, ORDER_STATUSES } from "@/server/orders";
import { adminLogin, adminLogout, updateOrderStatus } from "../actions";

export const metadata: Metadata = { title: "Order desk", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    dateStyle: "medium",
    timeStyle: "short",
  });

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function OrdersDesk({ searchParams }: Props) {
  const signedIn = verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value);
  const { error } = await searchParams;

  if (!signedIn) {
    return (
      <main className="grid min-h-dvh place-items-center bg-forest-900 px-5">
        <form action={adminLogin} className={cn(cardSurface, "w-full max-w-sm p-8")}>
          <Logo className="mx-auto h-20" />
          <h1 className="mt-6 text-center font-display text-[1.7rem] font-semibold text-ink">Order desk</h1>
          {!adminConfigured() ? (
            <Notice className="mt-6">
              Set ADMIN_PASSWORD in the server environment to open the order desk.
            </Notice>
          ) : (
            <>
              {error && (
                <Notice tone="error" role="alert" className="mt-6">
                  The password is incorrect.
                </Notice>
              )}
              <label className="mt-6 block text-sm font-medium text-forest-900" htmlFor="admin-password">
                Password
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1.5 h-12 w-full rounded-2xl border border-cream-200 bg-white px-4 focus:border-forest-600 focus:outline-none"
              />
              <button type="submit" className={buttonClasses({ className: "mt-5 w-full" })}>
                Sign in
              </button>
            </>
          )}
        </form>
      </main>
    );
  }

  const orders = await listOrders(getStore());

  return (
    <main className="min-h-dvh bg-cream-50">
      <header className="bg-forest-900 text-cream-50">
        <div className="container-page flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <Logo tone="cream" variant="mark" className="h-10" />
            <h1 className="font-display text-[1.4rem] font-semibold">Order desk</h1>
          </div>
          <form action={adminLogout}>
            <button
              type="submit"
              className="text-sm text-cream-50/80 underline underline-offset-4 hover:text-cream-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <section className="container-page py-8">
        <p className="text-sm text-ink-muted">
          {orders.length} order{orders.length === 1 ? "" : "s"} · newest first · Cash on Delivery
        </p>
        <ul className="mt-5 space-y-4">
          {orders.map((o) => (
            <li key={o.id} className={cn(cardSurface, "rounded-[22px] p-5")}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-forest-900">{o.id}</p>
                  <p className="text-[0.85rem] text-ink-muted">{when(o.createdAt)}</p>
                </div>
                <form action={updateOrderStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={o.id} />
                  <label className="sr-only" htmlFor={`status-${o.id}`}>
                    Status of {o.id}
                  </label>
                  <select
                    id={`status-${o.id}`}
                    name="status"
                    defaultValue={o.status}
                    className="h-10 rounded-full border border-forest-600/25 bg-white px-4 text-sm font-medium"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className={buttonClasses({ variant: "dark", size: "sm", className: "h-10 px-4" })}
                  >
                    Save
                  </button>
                </form>
              </div>
              <div className="mt-4 grid gap-4 text-[0.92rem] md:grid-cols-[1fr_1.2fr]">
                <dl className="space-y-1">
                  <div>
                    <dt className="sr-only">Customer</dt>
                    <dd className="font-semibold">{o.name}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Phone</dt>
                    <dd>
                      <a href={`tel:${o.phone}`} className="text-forest-700 underline underline-offset-4">
                        {o.phone}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Email</dt>
                    <dd className="break-all">{o.email}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Address</dt>
                    <dd>
                      {o.address}, {o.city}
                    </dd>
                  </div>
                  {o.notes && (
                    <div>
                      <dt className="sr-only">Notes</dt>
                      <dd className="text-ink-muted italic">“{o.notes}”</dd>
                    </div>
                  )}
                </dl>
                <ul className="divide-y divide-forest-900/10 border-y border-forest-900/10">
                  {o.items.map((l) => (
                    <li key={l.variantId ?? l.productId} className="flex justify-between gap-4 py-2">
                      <span>
                        {l.quantity} × {l.name}
                        {l.variantLabel && <span className="text-ink-muted"> · {l.variantLabel}</span>}
                        {l.sku && <span className="block text-[0.75rem] text-ink-muted">SKU {l.sku}</span>}
                      </span>
                      <span className="tabular-nums">{formatPrice(l.unitPrice * l.quantity)}</span>
                    </li>
                  ))}
                  <li className="flex justify-between gap-4 py-2 font-semibold">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatPrice(o.subtotal)}</span>
                  </li>
                </ul>
              </div>
            </li>
          ))}
          {orders.length === 0 && <li className="py-16 text-center text-ink-muted">No orders yet.</li>}
        </ul>
      </section>
    </main>
  );
}

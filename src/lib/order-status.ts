export interface OrderStatusFacts {
  status: string;
  statusCode?: string;
  placedAt: string;
  shipments?: { dispatchedAt?: string; deliveredAt?: string; courier?: string; trackingNumber?: string }[];
}

const text = (o: OrderStatusFacts) => `${o.statusCode ?? ""} ${o.status}`;

export const isCancelled = (o: OrderStatusFacts) => /cancel/i.test(text(o));

export const isDelivered = (o: OrderStatusFacts) =>
  Boolean(o.shipments?.some((s) => s.deliveredAt)) || /\bdelivered\b/i.test(text(o));

export const isDispatched = (o: OrderStatusFacts) =>
  isDelivered(o) ||
  Boolean(o.shipments?.some((s) => s.dispatchedAt)) ||
  /dispatch|ship|transit|out[_\s-]?for[_\s-]?delivery/i.test(text(o));

const firstDate = (dates: (string | undefined)[]) => dates.filter((d): d is string => Boolean(d)).sort()[0];

export function orderProgress(o: OrderStatusFacts) {
  const dispatchedAt = firstDate(o.shipments?.map((s) => s.dispatchedAt) ?? []);
  const deliveredAt = firstDate(o.shipments?.map((s) => s.deliveredAt) ?? []);
  return {
    cancelled: isCancelled(o),
    steps: [
      { key: "placed", label: "Order placed", done: true, at: o.placedAt },
      { key: "dispatched", label: "Dispatched", done: isDispatched(o), at: dispatchedAt },
      { key: "delivered", label: "Delivered", done: isDelivered(o), at: deliveredAt },
    ],
  };
}

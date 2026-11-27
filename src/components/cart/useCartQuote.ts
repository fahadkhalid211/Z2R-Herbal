"use client";

import { useEffect, useState } from "react";
import { type CartQuote, customerApi } from "@/lib/customer-api";

export function useCartQuote(lines: { variantId: string; quantity: number }[], live: boolean) {
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [failed, setFailed] = useState(false);
  const key = lines.map((l) => `${l.variantId}x${l.quantity}`).join(",");

  useEffect(() => {
    if (!live || !key) return;
    let current = true;
    const timer = setTimeout(() => {
      customerApi
        .quoteCart(lines)
        .then((q) => {
          if (!current) return;
          setQuote(q);
          setFailed(false);
        })
        .catch(() => current && setFailed(true));
    }, 400);
    return () => {
      current = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, live]);

  const fresh =
    quote && quote.lines.map((l) => `${l.variantId}x${l.quantity}`).join(",") === key ? quote : null;
  return {
    quote: live && key ? fresh : null,
    failed: live && failed,
    loading: live && Boolean(key) && !fresh && !failed,
  };
}

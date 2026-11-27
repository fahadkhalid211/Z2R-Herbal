"use client";

import { useEffect } from "react";
import { type TrackedItem, trackViewItem } from "@/lib/analytics";

export function ViewItemTracker({ item }: { item: TrackedItem }) {
  const { id, name, price, variant } = item;
  useEffect(() => {
    trackViewItem({ id, name, price, variant });
  }, [id, name, price, variant]);
  return null;
}

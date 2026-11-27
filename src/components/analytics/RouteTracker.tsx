"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackRoutePageView } from "@/lib/analytics";

/** Fires Meta PageView on client-side navigation. GA4 handles history changes itself. */
export function RouteTracker() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    trackRoutePageView();
  }, [pathname]);
  return null;
}

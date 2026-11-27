"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cardSurface } from "@/components/ui/surface";
import { logger } from "@/lib/logger";

export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    logger.error("Page failed to render", { error });
  }, [error]);

  return (
    <section className="container-page py-16 lg:py-24">
      <div className={`${cardSurface} mx-auto max-w-xl px-6 py-12 text-center`}>
        <h1 className="font-display text-[1.9rem] font-semibold text-ink">Something went wrong</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-muted">
          This page could not be shown. Please try again.
        </p>
        <p className="mx-auto mt-3 max-w-md text-[0.92rem] text-ink-muted">
          Placed an order just now? It may already be confirmed. Please check My Orders before ordering again.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button onClick={() => retry()}>Try Again</Button>
          <ButtonLink href="/account" variant="outline-dark">
            My Orders
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

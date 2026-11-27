"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { logger } from "@/lib/logger";
import { initReveal } from "@/lib/reveal";
import { canSmoothScroll, startSmoothScroll } from "@/lib/smooth-scroll";

export function MotionRuntime() {
  const sentinel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("reveal-ready");
    return initReveal();
  }, [pathname]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const root = document.documentElement;
    const io = new IntersectionObserver(([entry]) => {
      root.dataset.scrolled = String(!entry?.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const matches = (q: string) => window.matchMedia(q).matches;
    if (!canSmoothScroll(matches)) return;

    let stop: (() => void) | undefined;
    let cancelled = false;
    startSmoothScroll()
      .then((s) => (cancelled ? s() : (stop = s)))
      .catch((error: unknown) => logger.warn("Smooth scroll unavailable", { error }));

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      if (reduce.matches) stop?.();
    };
    reduce.addEventListener("change", onChange);
    return () => {
      cancelled = true;
      reduce.removeEventListener("change", onChange);
      stop?.();
    };
  }, []);

  return (
    <div
      ref={sentinel}
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 h-[120px] w-px"
    />
  );
}

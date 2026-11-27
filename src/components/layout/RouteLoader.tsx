"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";

const START = "z2r:route-start";
const SHOW_AFTER_MS = 150;
const GIVE_UP_MS = 10_000;

export const startRouteLoader = () => window.dispatchEvent(new Event(START));

function isPageLink(e: MouseEvent): boolean {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return false;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return false;
  return url.pathname !== location.pathname || url.search !== location.search;
}

export function RouteLoader() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const url = `${pathname}?${search}`;
  const [from, setFrom] = useState<string | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let showTimer = 0;
    let giveUp = 0;
    const start = () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(giveUp);
      setFrom(`${location.pathname}?${location.search.replace(/^\?/, "")}`);
      setShown(false);
      showTimer = window.setTimeout(() => setShown(true), SHOW_AFTER_MS);
      giveUp = window.setTimeout(() => setFrom(null), GIVE_UP_MS);
    };
    const onClick = (e: MouseEvent) => {
      if (isPageLink(e)) start();
    };
    document.addEventListener("click", onClick);
    window.addEventListener(START, start);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener(START, start);
      window.clearTimeout(showTimer);
      window.clearTimeout(giveUp);
    };
  }, []);

  useEffect(() => {
    if (from === null || from === url) return;
    const t = window.setTimeout(() => {
      setFrom(null);
      setShown(false);
    }, 0);
    return () => window.clearTimeout(t);
  }, [url, from]);

  const visible = from === url && shown;
  return (
    <div aria-hidden={!visible} data-visible={visible} className="route-loader">
      <span className="route-loader-bar" />
      <div role={visible ? "status" : undefined} className="route-loader-card">
        <span className="route-loader-ring" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" className="route-loader-track" />
            <circle cx="60" cy="60" r="54" className="route-loader-arc" />
          </svg>
          <Logo alt="" className="route-loader-logo" />
        </span>
        <span className="route-loader-text">{visible ? "Loading…" : ""}</span>
      </div>
    </div>
  );
}

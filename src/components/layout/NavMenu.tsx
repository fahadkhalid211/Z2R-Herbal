"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown, Star } from "lucide-react";
import clsx from "clsx";
import { TrustBar } from "@/components/ui/TrustBar";
import type { MenuFeature, MenuGroup } from "@/lib/menu";
import { formatPrice } from "@/lib/money";

interface NavMenuProps {
  label: string;
  activePrefixes: string[];
  groups: MenuGroup[];
  feature?: MenuFeature;
  lead?: { title: string; text: string; link: { label: string; href: string } };
  size?: "wide" | "compact";
}

const CLOSE_DELAY_MS = 250;

const eyebrow = "text-[0.68rem] font-semibold tracking-[0.22em] text-olive-600 uppercase";

export function NavMenu({ label, activePrefixes, groups, feature, lead, size = "compact" }: NavMenuProps) {
  const id = useId();
  const panelId = `menu-${id.replace(/:/g, "")}`;
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const active = activePrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const rootRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hoverOpened = useRef(false);
  const [mounted, setMounted] = useState(false);
  const close = () => setOpen(false);
  const wide = size === "wide";
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelLeave = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    leaveTimer.current = null;
  };
  useEffect(() => cancelLeave, []);

  useEffect(() => {
    const onOther = (e: Event) => {
      if ((e as CustomEvent<string>).detail === panelId) return;
      cancelLeave();
      setOpen(false);
    };
    window.addEventListener("navmenu:open", onOther);
    return () => window.removeEventListener("navmenu:open", onOther);
  }, [panelId]);
  useEffect(() => {
    if (open) window.dispatchEvent(new CustomEvent("navmenu:open", { detail: panelId }));
  }, [open, panelId]);

  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const linkClass =
    "group inline-flex items-center gap-2 py-[0.4rem] font-display text-[1.08rem] font-medium text-forest-900 transition-colors duration-(--dur-fast) hover:text-forest-600";
  const withImages = (group: MenuGroup) => group.links.some((l) => l.image);

  const columns = groups.map((group) => (
    <nav key={group.id} aria-label={group.title} className="min-w-0">
      <p className={eyebrow}>{group.title}</p>
      <ul
        className={clsx(
          "mt-4",
          withImages(group)
            ? "grid grid-cols-2 gap-x-3 gap-y-1"
            : group.columns === 2
              ? "columns-2 gap-x-8"
              : "space-y-0.5",
        )}
      >
        {group.links.map((link) => (
          <li key={link.href} className="break-inside-avoid">
            {link.image ? (
              <Link href={link.href} prefetch={false} onClick={close} className="mega-chip group">
                <span className="mega-chip-medal">
                  <Image src={link.image.src} alt="" fill sizes="36px" className="object-contain p-[3px]" />
                </span>
                <span className="truncate">{link.label}</span>
              </Link>
            ) : (
              <Link href={link.href} prefetch={false} onClick={close} className={linkClass}>
                <span>{link.label}</span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-3.5 -translate-x-1 text-forest-600 opacity-0 transition-[opacity,translate] duration-(--dur-fast) group-hover:translate-x-0 group-hover:opacity-100"
                />
              </Link>
            )}
            {link.children && (
              <ul className="mb-1 border-l border-[#e3d3bd] pl-3">
                {link.children.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      prefetch={false}
                      onClick={close}
                      className="block py-1 text-[0.9rem] text-ink-muted hover:text-forest-600"
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      {group.more && (
        <Link
          href={group.more.href}
          prefetch={false}
          onClick={close}
          className="mt-3 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-forest-700 hover:text-forest-600"
        >
          {group.more.label} <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      )}
    </nav>
  ));

  return (
    <li
      ref={rootRef}
      className={clsx(!wide && "relative")}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        cancelLeave();
        if (!open) hoverOpened.current = true;
        setMounted(true);
        setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        cancelLeave();
        leaveTimer.current = setTimeout(() => {
          hoverOpened.current = false;
          setOpen(false);
        }, CLOSE_DELAY_MS);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setMounted(true);
          if (hoverOpened.current) {
            hoverOpened.current = false;
            setOpen(true);
          } else setOpen((o) => !o);
        }}
        className={clsx(
          "flex items-center gap-[0.3em] rounded-full px-[1.3em] py-[0.42em] leading-[1.5] whitespace-nowrap transition-colors",
          active
            ? "bg-[linear-gradient(180deg,#257a0f,#1a5e07)] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_6px_14px_-8px_rgb(26_94_7/0.9)]"
            : "text-[#2a241d] hover:text-forest-600 aria-expanded:text-forest-600",
        )}
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={clsx("size-[1em] transition-transform", open && "rotate-180")}
        />
      </button>

      {wide && (
        <span
          aria-hidden="true"
          data-open={open}
          className="mega-scrim pointer-events-none fixed inset-0 -z-10"
        />
      )}

      <div
        id={panelId}
        data-open={open}
        className={clsx(
          "mega-panel-wrap absolute",
          wide
            ? "inset-x-0 top-full pt-[10px] xl:pt-[calc(1.2vw+10px)]"
            : "top-full left-1/2 -translate-x-1/2 pt-[calc(1.25vw+10px)]",
        )}
      >
        <div
          className={clsx(
            "mega-panel overflow-hidden rounded-[28px] text-[#1d1a16]",
            !wide && "w-max min-w-[300px]",
          )}
          data-open={open}
        >
          {mounted && (
            <>
              <div
                className={clsx(
                  "grid gap-10",
                  wide ? "p-9 2xl:p-10" : "p-7",
                  wide && "grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)_minmax(340px,1.3fr)] gap-12",
                  !wide && "auto-cols-max grid-flow-col",
                )}
              >
                {lead && (
                  <div className="w-[220px]">
                    <p className={eyebrow}>{lead.title}</p>
                    <p className="mt-4 text-[0.88rem] leading-relaxed text-ink-muted">{lead.text}</p>
                    <Link
                      href={lead.link.href}
                      prefetch={false}
                      onClick={close}
                      className="mt-4 inline-flex items-center gap-1 text-[0.84rem] font-semibold text-forest-700 hover:text-forest-600"
                    >
                      {lead.link.label} <ArrowRight aria-hidden="true" className="size-3.5" />
                    </Link>
                  </div>
                )}
                {columns}
                {feature && (
                  <Link
                    href={feature.href}
                    prefetch={false}
                    onClick={close}
                    className="mega-feature group relative isolate grid min-h-[260px] grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-[24px] text-cream-50"
                  >
                    <span className="flex min-w-0 flex-col p-7 pr-2">
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-lime-300/15 px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.2em] text-lime-300 uppercase ring-1 ring-lime-300/30">
                        <Star aria-hidden="true" className="size-3 fill-current" />
                        {feature.eyebrow}
                      </span>
                      <span className="mt-4 block font-display text-[1.7rem] leading-[1.05] font-semibold italic">
                        {feature.name}
                      </span>
                      {feature.note && (
                        <span className="mt-2 block text-[0.82rem] text-cream-50/75">{feature.note}</span>
                      )}
                      {feature.benefits.length > 0 && (
                        <span className="mt-4 flex flex-wrap gap-1.5">
                          {feature.benefits.map((b) => (
                            <span
                              key={b}
                              className="rounded-full bg-cream-50/10 px-2.5 py-1 text-[0.72rem] font-medium text-cream-50/90 ring-1 ring-cream-50/15"
                            >
                              {b}
                            </span>
                          ))}
                        </span>
                      )}
                      <span className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-3 pt-6">
                        <span className="font-display text-[1.45rem] leading-none font-semibold lining-nums">
                          {formatPrice(feature.price)}
                          <span className="ml-1.5 font-sans text-[0.76rem] font-normal text-cream-50/60">
                            / {feature.sizeLabel}
                          </span>
                        </span>
                        <span className="inline-flex h-10 items-center gap-1.5 rounded-full bg-lime-400 px-4 text-[0.82rem] font-semibold text-forest-900 shadow-[0_10px_22px_-10px_rgb(187_226_26/0.8)] transition-colors group-hover:bg-lime-300">
                          View product
                          <ArrowUpRight
                            aria-hidden="true"
                            className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </span>
                      </span>
                    </span>
                    <span className="mega-feature-stage relative flex w-[150px] items-end justify-center pr-5 pb-4">
                      <Image
                        src={feature.image.src}
                        width={feature.image.width}
                        height={feature.image.height}
                        alt=""
                        sizes="130px"
                        className="relative z-10 h-auto max-h-[230px] w-[118px] object-contain drop-shadow-[0_22px_20px_rgb(0_0_0/0.5)] transition-transform duration-500 group-hover:-translate-y-1.5"
                      />
                    </span>
                  </Link>
                )}
              </div>
              {wide && (
                <div className="border-t border-[#e9d9c4] bg-white/45 px-9 py-4 2xl:px-10">
                  <TrustBar layout="row" className="justify-between" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </li>
  );
}

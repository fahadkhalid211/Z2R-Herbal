"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { whenIdle } from "@/lib/idle";
import { cssVars } from "@/lib/css-vars";
import { useHeroSlider } from "./HeroSlider";
import { PRODUCT_SPOT as P, place } from "./scene";

const SWIPE_PX = 40;

const RING = { x: 754, y: 114, size: 600 };

const MOTES = [
  { x: 790, y: 560, s: 7, d: 0, t: 9 },
  { x: 860, y: 470, s: 4, d: 2.4, t: 11 },
  { x: 1120, y: 520, s: 6, d: 1.1, t: 10 },
  { x: 1270, y: 430, s: 4, d: 3.6, t: 12 },
  { x: 940, y: 600, s: 5, d: 5.2, t: 9.5 },
  { x: 1210, y: 600, s: 8, d: 4.3, t: 13 },
  { x: 1010, y: 380, s: 3, d: 6.5, t: 10.5 },
  { x: 1320, y: 540, s: 5, d: 7.4, t: 11.5 },
];

function usePointerDrift(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!el || !fine.matches || reduce.matches) return;
    let frame = 0;
    let tx = 0,
      ty = 0,
      x = 0,
      y = 0;
    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const host = el.closest("[data-hero-slider]") ?? el;
    host.addEventListener("pointermove", onMove as EventListener);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove as EventListener);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [ref]);
}

export function HeroStage() {
  const { slides, state, go } = useHeroSlider();
  const [warm, setWarm] = useState<Set<number>>(() => new Set([0]));
  const startX = useRef<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  usePointerDrift(ref);
  const current = slides[state.index];

  useEffect(() => {
    const next = (state.index + 1) % slides.length;
    return whenIdle(() => setWarm((prev) => (prev.has(next) ? prev : new Set(prev).add(next))));
  }, [state.index, slides.length]);

  return (
    <div
      ref={ref}
      className="hero-stage absolute inset-0 touch-pan-y"
      style={current ? cssVars({ "--slide-glow": current.glow }) : undefined}
      onPointerDown={(e) => (startX.current = e.clientX)}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) >= SWIPE_PX) go({ type: dx < 0 ? "next" : "prev" }, true);
      }}
      onPointerCancel={() => (startX.current = null)}
    >
      <span aria-hidden="true" className="stage-glow absolute" style={place(800, 150, 520, 520)} />
      <span
        aria-hidden="true"
        className="stage-ring absolute"
        style={place(RING.x, RING.y, RING.size, RING.size)}
      />
      <span aria-hidden="true" className="stage-motes absolute inset-0">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="stage-mote absolute"
            style={{ ...place(m.x, m.y, m.s, m.s), ...cssVars({ "--d": `${m.d}s`, "--t": `${m.t}s` }) }}
          />
        ))}
      </span>

      {slides.map((slide, i) => {
        const role =
          i === state.index
            ? state.previous === null
              ? "current"
              : "enter"
            : i === state.previous
              ? "exit"
              : "idle";
        if (role === "idle" && !warm.has(i)) return null;
        const { bottleLeft, bottleWidth, boxLeft, boxWidth } = slide.layout;
        const right = boxLeft + boxWidth;
        const first = i === 0;
        const live = role === "current" || role === "enter";
        return (
          <div
            key={slide.id}
            data-state={role}
            aria-hidden={i !== state.index}
            className="ref-scene pointer-events-none absolute inset-0"
          >
            <span
              aria-hidden="true"
              className="ref-cast absolute"
              style={place(bottleLeft - 60, P.bottleBottom - 22, right - bottleLeft + 50, 34)}
            />
            <span
              aria-hidden="true"
              className="ref-contact absolute"
              style={place(bottleLeft - 8, P.bottleBottom - 9, right - bottleLeft + 14, 16)}
            />
            {slide.props.map((prop, k) => (
              <div
                key={prop.src}
                className="ref-anim ref-anim--prop absolute isolate"
                style={{
                  ...place(prop.left, prop.top, prop.width, prop.height),
                  rotate: prop.rotate ? `${prop.rotate}deg` : undefined,
                  ...cssVars({ "--k": k }),
                }}
              >
                <span
                  aria-hidden="true"
                  className="ref-prop-shadow absolute inset-x-[6%] -bottom-[4%] h-[18%]"
                />
                <Image
                  src={prop.src}
                  alt={prop.alt}
                  fill
                  loading={first ? "eager" : undefined}
                  sizes={`(min-width: 1024px) ${Math.ceil(prop.width / 12)}vw, ${Math.ceil(prop.width / 7)}vw`}
                  className="object-contain object-bottom"
                />
              </div>
            ))}
            <div
              className="ref-anim ref-anim--box absolute"
              style={place(boxLeft, P.boxBottom - P.boxHeight, boxWidth, P.boxHeight)}
            >
              <Image
                src={slide.box.src}
                width={slide.box.width}
                height={slide.box.height}
                alt={slide.box.alt}
                priority={first}
                sizes="(min-width: 1024px) 13vw, 24vw"
                className="block size-full"
              />
              {live && (
                <span
                  aria-hidden="true"
                  className="ref-sheen"
                  style={{ maskImage: `url(${slide.box.src})` }}
                />
              )}
            </div>
            <div
              className="ref-anim ref-anim--bottle absolute"
              style={place(bottleLeft, P.bottleBottom - P.bottleHeight, bottleWidth, P.bottleHeight)}
            >
              <Image
                src={slide.bottle.src}
                width={slide.bottle.width}
                height={slide.bottle.height}
                alt={slide.bottle.alt}
                priority={first}
                sizes="(min-width: 1024px) 10vw, 18vw"
                className="block size-full"
              />
              {live && (
                <span
                  aria-hidden="true"
                  className="ref-sheen"
                  style={{ maskImage: `url(${slide.bottle.src})` }}
                />
              )}
            </div>
            {slide.callout && (
              <div className="hero-callout ref-anim" data-single={slide.callout.items.length === 1}>
                <p className="hero-callout-eyebrow">{slide.callout.eyebrow}</p>
                <p className="hero-callout-title">{slide.callout.title}</p>
                <ul>
                  {slide.callout.items.map((item, k) => (
                    <li key={item.name} style={cssVars({ "--k": k })}>
                      <span className="hero-callout-medal">
                        <Image src={item.src} alt="" fill sizes="48px" className="object-cover" />
                      </span>
                      <span className="hero-callout-name">{item.name}</span>
                    </li>
                  ))}
                </ul>
                {slide.callout.items.length > 5 && (
                  <span aria-hidden="true" className="hero-callout-more">
                    +{slide.callout.items.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

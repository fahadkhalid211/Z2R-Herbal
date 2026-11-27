"use client";

import { useEffect, useRef } from "react";

const FAILSAFE_MS = 3800; // the CSS timeline ends at ~2.7s

const LEAF = "M2 40 C40 2 118 -6 198 40 C118 86 40 78 2 40 Z";
const RIB = "M8 40 C70 36 130 37 192 40";

const LEAVES: [string, number, "a" | "b"][] = [
  ["intro-leaf intro-leaf--tl-far", 32, "b"],
  ["intro-leaf intro-leaf--tl-near", 48, "a"],
  ["intro-leaf intro-leaf--tr", 152, "b"],
  ["intro-leaf intro-leaf--br-near", -150, "a"],
  ["intro-leaf intro-leaf--br-far", -128, "b"],
  ["intro-leaf intro-leaf--bl", -28, "b"],
];

export function BrandIntro() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const html = document.documentElement;
    if (!el || !html.classList.contains("intro-play")) return;

    const end = () => html.classList.remove("intro-play");
    const onAnimationEnd = (e: AnimationEvent) => {
      if (e.target === el && (e.animationName === "intro-exit" || e.animationName === "intro-skip")) end();
    };
    const skip = () => {
      if (el.dataset.state) return;
      el.dataset.state = "leaving";
      html.classList.remove("intro-offset");
    };
    const failsafe = window.setTimeout(end, FAILSAFE_MS);
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    el.addEventListener("animationend", onAnimationEnd);
    for (const type of events) window.addEventListener(type, skip, { passive: true });
    return () => {
      window.clearTimeout(failsafe);
      el.removeEventListener("animationend", onAnimationEnd);
      for (const type of events) window.removeEventListener(type, skip);
    };
  }, []);

  return (
    <div ref={ref} className="brand-intro" aria-hidden="true">
      <svg className="intro-defs" width="0" height="0" focusable="false">
        <defs>
          <linearGradient id="intro-leaf-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5f9a2c" />
            <stop offset="0.55" stopColor="#2f6b1c" />
            <stop offset="1" stopColor="#163f12" />
          </linearGradient>
          <linearGradient id="intro-leaf-b" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3f7a24" />
            <stop offset="1" stopColor="#0f2f10" />
          </linearGradient>
          <radialGradient id="intro-drop-grad" cx="0.38" cy="0.62" r="0.7">
            <stop offset="0" stopColor="#fff4c8" />
            <stop offset="0.35" stopColor="#f1c757" />
            <stop offset="0.8" stopColor="#b8821e" />
            <stop offset="1" stopColor="#8a5c12" />
          </radialGradient>
        </defs>
      </svg>

      <span className="intro-light" />
      <span className="intro-rays" />
      <span className="intro-vignette" />

      {LEAVES.map(([className, rotate, tone]) => (
        <span key={className} className={className}>
          <svg viewBox="0 0 200 80" style={{ rotate: `${rotate}deg` }}>
            <path d={LEAF} fill={`url(#intro-leaf-${tone})`} />
            <path d={RIB} className="intro-leaf-rib" />
          </svg>
        </span>
      ))}

      <span className="intro-pollen">
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} />
        ))}
      </span>

      <div className="intro-stage">
        <div className="intro-logo">
          <span className="intro-logo-gold" />
          <span className="intro-logo-sheen" />
        </div>

        <span className="intro-drop">
          <svg viewBox="0 0 20 28">
            <path
              d="M10 1 C10 1 2 12 2 18.5 A8 8 0 0 0 18 18.5 C18 12 10 1 10 1 Z"
              fill="url(#intro-drop-grad)"
            />
            <ellipse cx="7.2" cy="17" rx="1.6" ry="2.6" fill="#fffbe8" opacity="0.7" />
          </svg>
        </span>
        <span className="intro-ripple">
          <i />
          <i />
          <i />
        </span>

        <p className="intro-tagline">
          <span className="intro-tagline-line" />
          Pure Herbal Hair Care
          <span className="intro-tagline-line" />
        </p>
      </div>
    </div>
  );
}

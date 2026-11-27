"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { cssVars } from "@/lib/css-vars";
import { HERO_AUTOPLAY_MS } from "@/lib/motion-constants";
import { initSlider, isPlaying, sliderReducer, type SliderAction, type SliderState } from "@/lib/slider";
import type { ImageAsset } from "@/services/types";
import type { HeroProp } from "./scene";

export interface HeroSlide {
  id: string;
  slug: string;
  name: string;
  href: string;
  bottle: ImageAsset;
  box: ImageAsset;
  props: HeroProp[];
  callout?: { eyebrow: string; title: string; items: { name: string; src: string }[] };
  layout: { bottleLeft: number; bottleWidth: number; boxLeft: number; boxWidth: number };
  glow: string;
}

interface SliderContextValue {
  slides: HeroSlide[];
  state: SliderState;
  go: (action: SliderAction, announce?: boolean) => void;
  announce: boolean;
}

const SliderContext = createContext<SliderContextValue | null>(null);

export function useHeroSlider(): SliderContextValue {
  const ctx = useContext(SliderContext);
  if (!ctx) throw new Error("useHeroSlider must be used inside <HeroSliderProvider>");
  return ctx;
}

interface ProviderProps {
  slides: HeroSlide[];
  className?: string;
  labelledBy: string;
  children: React.ReactNode;
}

export function HeroSliderProvider({ slides, className, labelledBy, children }: ProviderProps) {
  const [state, dispatch] = useReducer(sliderReducer, slides.length, initSlider);
  const [announce, setAnnounce] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const playing = isPlaying(state);

  const go = useCallback((action: SliderAction, userInitiated = false) => {
    setAnnounce(userInitiated);
    dispatch(action);
  }, []);

  useEffect(() => {
    if (!playing || slides.length < 2) return;
    const timer = setTimeout(() => go({ type: "next" }), HERO_AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [playing, state.index, slides.length, go]);

  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = (reason: "reduced-motion" | "hidden", paused: boolean) =>
      dispatch({ type: paused ? "pause" : "resume", reason });
    const onReduce = () => sync("reduced-motion", reduce.matches);
    const onVisibility = () => sync("hidden", document.hidden);
    onReduce();
    onVisibility();
    reduce.addEventListener("change", onReduce);
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(([entry]) =>
      dispatch({ type: entry?.isIntersecting ? "resume" : "pause", reason: "offscreen" }),
    );
    if (el) io.observe(el);
    return () => {
      reduce.removeEventListener("change", onReduce);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
    };
  }, []);

  const value = useMemo(() => ({ slides, state, go, announce }), [slides, state, go, announce]);

  return (
    <SliderContext.Provider value={value}>
      <section
        ref={ref}
        aria-labelledby={labelledBy}
        data-hero-slider
        className={className}
        style={cssVars({ "--dir": state.direction })}
        onFocus={(e) => {
          if (e.target instanceof Element && e.target.matches(":focus-visible")) {
            dispatch({ type: "pause", reason: "focus" });
          }
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            dispatch({ type: "resume", reason: "focus" });
          }
        }}
      >
        {children}
      </section>
    </SliderContext.Provider>
  );
}

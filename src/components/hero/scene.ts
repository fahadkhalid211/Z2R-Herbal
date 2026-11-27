import type { CSSProperties } from "react";
import ART from "./ingredient-art.generated.json";

export function place(x: number, y: number, width: number, height: number): CSSProperties {
  return {
    left: `calc((${x} - var(--vx)) / var(--vw) * 100%)`,
    top: `calc((${y} - var(--vy)) / var(--vh) * 100%)`,
    width: `calc(${width} / var(--vw) * 100%)`,
    height: `calc(${height} / var(--vh) * 100%)`,
  };
}

type Art = keyof typeof ART;

const ART_NAMES: Record<Art, string> = {
  coconut: "Coconut",
  almond: "Almonds",
  "pumpkin-seed": "Pumpkin and pumpkin seeds",
  olive: "Olives",
  mustard: "Mustard flowers",
  sesame: "Sesame seeds",
  rosemary: "Rosemary",
};

interface PropSpot {
  art: Art;
  x: number;
  bottom: number;
  width: number;
  rotate?: number;
}

export interface HeroProp {
  src: string;
  alt: string;
  left: number;
  top: number;
  width: number;
  height: number;
  rotate: number;
}

const single = (art: Art, width: number): PropSpot[] => [{ art, x: 944 - width, bottom: 657, width }];
const withRosemary = (art: Art, width: number): PropSpot[] => [
  { art: "rosemary", x: 652, bottom: 648, width: 118, rotate: -7 },
  ...single(art, width),
];

const SCENE_PROPS: Record<string, PropSpot[]> = {
  coconut: withRosemary("coconut", 272),
  "pumpkin-seed": withRosemary("pumpkin-seed", 262),
  almond: single("almond", 270),
  olive: single("olive", 264),
  mustard: single("mustard", 272),
  sesame: single("sesame", 252),
  signature: [
    { art: "pumpkin-seed", x: 654, bottom: 640, width: 150 },
    { art: "coconut", x: 776, bottom: 642, width: 168 },
    { art: "mustard", x: 706, bottom: 652, width: 132 },
    { art: "olive", x: 650, bottom: 664, width: 118 },
    { art: "sesame", x: 838, bottom: 664, width: 110 },
    { art: "almond", x: 744, bottom: 667, width: 122 },
  ],
};

export function sceneProps(slug: string): HeroProp[] {
  return (SCENE_PROPS[slug] ?? []).map(({ art, x, bottom, width, rotate = 0 }) => {
    const height = (width * ART[art].height) / ART[art].width;
    return {
      src: `/images/hero/ingredients/${art}.webp`,
      alt: ART_NAMES[art],
      left: x,
      top: bottom - height,
      width,
      height,
      rotate,
    };
  });
}

export const PRODUCT_SPOT = {
  bottleCenterX: 982.5,
  bottleBottom: 630,
  bottleHeight: 435,
  boxRight: 1241,
  boxBottom: 627,
  boxHeight: 472,
} as const;

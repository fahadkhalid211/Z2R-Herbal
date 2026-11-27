export interface Pose {
  x: number;
  rotY: number;
  alpha: number;
  scale: number;
}

const SLIDE_X = 0.18;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smoothstep = (a: number, b: number, t: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function transitionPoses(progress: number, dir: 1 | -1): { outgoing: Pose; incoming: Pose } {
  const e = easeInOut(clamp01(progress));
  const z = (v: number) => v + 0; // normalise -0 → 0
  return {
    outgoing: {
      x: z(-dir * SLIDE_X * e),
      rotY: z(dir * Math.PI * e),
      alpha: 1 - smoothstep(0.1, 0.6, e),
      scale: 1 - 0.08 * e,
    },
    incoming: {
      x: z(dir * SLIDE_X * (1 - e)),
      rotY: z(-dir * Math.PI * (1 - e)),
      alpha: smoothstep(0.35, 0.9, e),
      scale: 0.92 + 0.08 * e,
    },
  };
}

export class FrameBudget {
  private samples: number[] = [];
  private fired = false;

  constructor(
    private readonly window = 90,
    private readonly slowMs = 26,
  ) {}

  push(frameMs: number): boolean {
    if (this.fired) return false;
    this.samples.push(frameMs);
    if (this.samples.length < this.window) return false;
    if (this.samples.length > this.window) this.samples.shift();
    const sorted = [...this.samples].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)]!;
    if (median > this.slowMs) {
      this.fired = true;
      return true;
    }
    return false;
  }
}

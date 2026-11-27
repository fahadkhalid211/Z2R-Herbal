const ANCHOR_OFFSET = -96;

type MediaMatcher = (query: string) => boolean;

export function canSmoothScroll(matches: MediaMatcher): boolean {
  return matches("(hover: hover) and (pointer: fine)") && !matches("(prefers-reduced-motion: reduce)");
}

export async function startSmoothScroll(): Promise<() => void> {
  const { default: Lenis } = await import("lenis");
  const lenis = new Lenis({ autoRaf: true, lerp: 0.12, anchors: { offset: ANCHOR_OFFSET } });
  return () => lenis.destroy();
}

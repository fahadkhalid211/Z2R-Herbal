export interface RenderEnv {
  matches: (query: string) => boolean;
  search: string;
  saveData?: boolean;
  deviceMemory?: number;
  hasWebGL2: boolean;
}

export function shouldRenderBottle(env: RenderEnv): boolean {
  if (new URLSearchParams(env.search).get("webgl") === "0") return false;
  return (
    env.hasWebGL2 &&
    env.matches("(min-width: 64rem)") &&
    env.matches("(hover: hover) and (pointer: fine)") &&
    !env.matches("(prefers-reduced-motion: reduce)") &&
    !env.saveData &&
    (env.deviceMemory === undefined || env.deviceMemory >= 4)
  );
}

export function browserEnv(): RenderEnv {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  return {
    matches: (q) => window.matchMedia(q).matches,
    search: window.location.search,
    saveData: nav.connection?.saveData,
    deviceMemory: nav.deviceMemory,
    hasWebGL2: typeof WebGL2RenderingContext !== "undefined",
  };
}

export function whenIdle(fn: () => void, fallbackMs = 200): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn);
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(fn, fallbackMs);
  return () => clearTimeout(id);
}

const ENGAGE_EVENTS = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;

export function whenEngaged(fn: () => void, delayMs = 2000): () => void {
  let done = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cancelIdle = () => {};

  const unlisten = () => ENGAGE_EVENTS.forEach((e) => window.removeEventListener(e, go));
  function go() {
    if (done) return;
    done = true;
    unlisten();
    clearTimeout(timer);
    cancelIdle = whenIdle(fn);
  }
  const arm = () => {
    ENGAGE_EVENTS.forEach((e) => window.addEventListener(e, go, { passive: true }));
    timer = setTimeout(go, delayMs);
  };

  if (document.readyState === "complete") arm();
  else window.addEventListener("load", arm, { once: true });

  return () => {
    done = true;
    window.removeEventListener("load", arm);
    unlisten();
    clearTimeout(timer);
    cancelIdle();
  };
}

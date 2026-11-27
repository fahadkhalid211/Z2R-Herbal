const ROOT_MARGIN = "0px 0px -5% 0px";
const THRESHOLD = 0.08;

let observer: IntersectionObserver | null = null;

function handle(entries: IntersectionObserverEntry[]) {
  for (const entry of entries) {
    const el = entry.target as HTMLElement;
    if (el.dataset.reveal === "loop") {
      el.dataset.inview = String(entry.isIntersecting);
    } else if (entry.isIntersecting) {
      el.dataset.inview = "true";
      observer?.unobserve(el);
    }
  }
}

export function observeReveal(el: HTMLElement): void {
  if (typeof IntersectionObserver === "undefined") {
    el.dataset.inview = "true";
    return;
  }
  observer ??= new IntersectionObserver(handle, { rootMargin: ROOT_MARGIN, threshold: THRESHOLD });
  observer.observe(el);
}

export function initReveal(root: ParentNode = document): () => void {
  root.querySelectorAll<HTMLElement>("[data-reveal]").forEach(observeReveal);
  return () => {
    observer?.disconnect();
    observer = null;
  };
}

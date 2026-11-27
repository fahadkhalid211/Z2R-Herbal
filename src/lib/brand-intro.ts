export const INTRO_SEEN_KEY = "z2r-intro";

export function shouldPlayIntro(
  search: string,
  webdriver: boolean,
  seen: boolean,
  reducedMotion: boolean,
): boolean {
  if (reducedMotion || /[?&]intro=0\b/.test(search)) return false;
  if (/[?&]intro=1\b/.test(search)) return true;
  return !webdriver && !seen;
}

export const HEAD_SCRIPT = `(function(){var d=document.documentElement;d.classList.add("js");try{var s=sessionStorage;if((${shouldPlayIntro.toString()})(location.search,!!navigator.webdriver,!!s.getItem("${INTRO_SEEN_KEY}"),matchMedia("(prefers-reduced-motion: reduce)").matches)){d.classList.add("intro-play","intro-offset");s.setItem("${INTRO_SEEN_KEY}","1")}}catch(e){}})()`;

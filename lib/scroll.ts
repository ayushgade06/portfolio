// One handle on the smooth-scroll instance, so dialogs can pause it and links can use it.
import type Lenis from "lenis";

export const scroll: { lenis: Lenis | null } = { lenis: null };

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 0;
  if (scroll.lenis) scroll.lenis.scrollTo(el, { offset: id === "top" ? 0 : -navH + 1 });
  else el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

export const lock = (on: boolean) => (on ? scroll.lenis?.stop() : scroll.lenis?.start());

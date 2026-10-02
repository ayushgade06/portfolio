"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { states } from "@/content/site";
import { scroll } from "@/lib/scroll";
import { log, setItem, setState, trace } from "@/lib/trace";
import { field } from "./Field";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin);

const LOOSE = { "--wdth": 125, "--wght": 300 };
const pad3 = (n: number) => String(Math.round(n)).padStart(3, "0");
const cssPx = (name: string) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;

// Everything that moves is set up here, once, against plain server-rendered markup.
// Principle: things arrive loose and settle exact. Ease-out only, no overshoot.
export default function Motion() {
  useGSAP(() => {
    const root = document.documentElement;
    const all = <T extends HTMLElement = HTMLElement>(s: string) => gsap.utils.toArray<T>(s);
    const one = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector<T>(s)!;
    const mm = gsap.matchMedia();

    mm.add(
      { any: "all", motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 960px)", fine: "(pointer: fine)" },
      (ctx) => {
        const { motion, desktop, fine } = ctx.conditions as Record<string, boolean>;
        const undo: (() => void)[] = [];
        const on = <K extends keyof DocumentEventMap>(t: EventTarget, type: K | string, fn: (e: any) => void, opts?: AddEventListenerOptions) => {
          t.addEventListener(type, fn, opts);
          undo.push(() => t.removeEventListener(type, fn, opts));
        };

        const nav = one(".nav");
        const edge = one(".edge");
        const traceBar = one(".trace");
        const scrollOut = one("[data-scroll]");
        const navLinks = all(".nav-links a");
        const nodes = all(".edge .node");
        const sections = states.map((s) => document.getElementById(s.id)!);

        /* ── smooth scroll: desktop pointers only ── */
        if (motion && desktop && fine) {
          const lenis = new Lenis();
          scroll.lenis = lenis;
          lenis.on("scroll", ScrollTrigger.update);
          const raf = (t: number) => lenis.raf(t * 1000);
          gsap.ticker.add(raf);
          gsap.ticker.lagSmoothing(0);
          undo.push(() => {
            gsap.ticker.remove(raf);
            lenis.destroy();
            scroll.lenis = null;
          });
        }

        /* ── statement: reading is the animation. Created first: it pins, and every trigger below must be measured with its spacer ── */
        if (motion) {
        const st = one("[data-scrub]");
        const words = SplitText.create(st, { type: "words" }).words;
        gsap.fromTo(
          words,
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.5,
            scrollTrigger: { trigger: st.closest("section"), start: "top top", end: desktop ? "+=130%" : "+=85%", pin: true, scrub: 0.4 },
          },
        );
        }

        /* ── the sheet stack: each sheet sticks so that all of it stays readable ── */
        const sheets = all("[data-sheet]");
        const setTops = () => {
          const ideal = (i: number) => cssPx("--nav-h") + 8 + i * 44;
          const room = innerHeight - cssPx("--trace-h") - 10;
          const shift = Math.min(0, ...sheets.map((s, i) => room - s.offsetHeight - ideal(i)));
          sheets.forEach((s, i) => s.style.setProperty("--top", `${ideal(i) + shift}px`));
        };
        if (desktop) {
          setTops();
          ScrollTrigger.addEventListener("refreshInit", setTops);
          undo.push(() => ScrollTrigger.removeEventListener("refreshInit", setTops));
        }

        /* ── state: the nav token, the lit nodes, the run log ── */
        let nodeX: number[] = [];
        let tops: number[] = [];
        let at = -1;
        const measure = () => {
          const er = edge.getBoundingClientRect();
          nodeX = navLinks.map((a, i) =>
            i === 0 ? 0 : i === navLinks.length - 1 ? er.width - 7 : a.getBoundingClientRect().left + a.offsetWidth / 2 - er.left - 3.5,
          );
          nodes.forEach((n, i) => n.style.setProperty("--x", `${nodeX[i]}px`));
          edge.dataset.ready = "";
          // a state begins when its section reaches the reading line, 45% down the viewport
          tops = sections.map((s, i) => (i === 0 ? 0 : s.getBoundingClientRect().top + scrollY - innerHeight * 0.45));
          one(".ground").style.setProperty("--gx", `${er.right - 3}px`);
          one(".ground").style.setProperty("--gy", `${er.top + 3}px`);
          const max = ScrollTrigger.maxScroll(window);
          sync(scrollY, max ? scrollY / max : 0);
        };
        let refreshing = false;
        const busy = () => (refreshing = true);
        const settled = () => ((refreshing = false), measure());
        ScrollTrigger.addEventListener("refreshInit", busy);
        ScrollTrigger.addEventListener("refresh", settled);
        undo.push(() => (ScrollTrigger.removeEventListener("refreshInit", busy), ScrollTrigger.removeEventListener("refresh", settled)));
        let h = document.body.scrollHeight;
        const ro = new ResizeObserver(() => {
          if (Math.abs(document.body.scrollHeight - h) < 2) return;
          h = document.body.scrollHeight;
          ScrollTrigger.refresh();
        });
        ro.observe(one("main"));
        undo.push(() => ro.disconnect());

        // where the page is → token position, lit nodes, current state, scroll read-out
        const sync = (y: number, progress: number) => {
            let i = 0;
            while (i < tops.length - 1 && y >= tops[i + 1]) i++;
            const f = i < tops.length - 1 ? gsap.utils.clamp(0, 1, (y - tops[i]) / (tops[i + 1] - tops[i])) : 0;
            edge.style.setProperty("--tx", `${nodeX[i] + (i < nodeX.length - 1 ? (nodeX[i + 1] - nodeX[i]) * f : 0)}px`);
            edge.style.setProperty("--p", String(progress));
            if (root.classList.contains("ready")) scrollOut.textContent = `${pad3(progress * 100)}%`;
            if (i !== at) {
              at = i;
              nodes.forEach((n, j) => n.classList.toggle("on", j <= i));
              navLinks.forEach((a, j) => (j === i ? a.setAttribute("aria-current", "step") : a.removeAttribute("aria-current")));
              setState(states[i].state);
            }
        };
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate(self) {
            // a refresh briefly rewinds the page to measure it; that is not the visitor scrolling
            if (refreshing) return;
            sync(self.scroll(), self.progress);
            // the field loosens with scroll speed and settles when you stop
            if (motion) {
              const v = Math.min(0.55, Math.abs(self.getVelocity()) / 7000);
              if (v > field.loosen) gsap.to(field, { loosen: v, duration: 0.15, overwrite: true, onComplete: () => gsap.to(field, { loosen: 0, duration: 0.9 }) });
            }
          },
        });

        all("[data-item]").forEach((el) => {
          const label = el.dataset.item!;
          ScrollTrigger.create({
            trigger: el,
            start: "top 60%",
            end: "bottom 45%",
            onToggle: (self) => (self.isActive ? setItem(label) : trace.item === label && setItem("")),
          });
        });

        // nav and trace take the colours of whatever section is under them
        all("main > [data-theme]").forEach((sec) => {
          const theme = sec.dataset.theme!;
          ScrollTrigger.create({
            trigger: sec,
            start: () => `top ${cssPx("--nav-h")}px`,
            end: () => `bottom ${cssPx("--nav-h")}px`,
            onToggle: (self) => self.isActive && (nav.dataset.theme = theme),
          });
          ScrollTrigger.create({
            trigger: sec,
            start: () => `top bottom-=${cssPx("--trace-h")}px`,
            end: () => `bottom bottom-=${cssPx("--trace-h")}px`,
            onToggle: (self) => self.isActive && (traceBar.dataset.theme = theme),
          });
        });

        on(document, "click", (e: MouseEvent) => {
          const a = (e.target as HTMLElement).closest<HTMLElement>("a[data-src]");
          if (a) log("source.open", a.dataset.src!);
        });

        /* ── without motion: land in the final state and stop here ── */
        if (!motion) {
          root.classList.add("ready");
          field.order = 1;
          measure();
          return () => undo.forEach((f) => f());
        }

        /* ── hero: noise and loose letters resolve into an exact wordmark ── */
        const chars = all(".wordmark .ch");
        const wide = matchMedia("(min-width: 600px)").matches;
        const rest = (el: Element) => (!wide && el.closest(".wm-line + .wm-line") ? 86.3 : 75);
        const label = scrollOut.previousSibling;
        const intro = gsap.timeline({
          paused: true,
          defaults: { ease: "expo.out" },
          onComplete() {
            root.classList.add("ready");
            chars.forEach((c) => (c.style.removeProperty("--wdth"), c.style.removeProperty("--wght")));
            if (label) label.textContent = " · Scroll ";
            scrollOut.textContent = `${pad3(ScrollTrigger.maxScroll(window) ? (scrollY / ScrollTrigger.maxScroll(window)) * 100 : 0)}%`;
          },
        });
        if (label) label.textContent = " · Load ";
        const count = { v: 0 };
        intro
          // the loader is the trace line's own slot; it becomes the scroll read-out
          .to(count, { v: 100, duration: 0.7, ease: "power1.in", onUpdate: () => (scrollOut.textContent = `${pad3(count.v)}%`) }, 0)
          .fromTo(chars, LOOSE, { "--wdth": (_: number, el: Element) => rest(el), "--wght": 800, duration: 0.8, stagger: 0.022 }, 0.3)
          .to(field, { order: 1, duration: 1.1, ease: "expo.inOut" }, 0.35)
          .fromTo(
            ".hero [data-in]",
            { clipPath: "inset(0 0 100% 0)", y: 12 },
            { clipPath: "inset(0 0 0% 0)", y: 0, duration: 0.6, stagger: 0.07, clearProps: "clipPath,transform" },
            0.8,
          );
        document.fonts.ready.then(() => {
          ScrollTrigger.refresh();
          intro.play();
        });

        gsap.to(".hero-word", {
          yPercent: -16,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
        });

        /* ── lock-in: section titles and numerals compress into place ── */
        all("[data-lock]").forEach((el) => {
          const split = SplitText.create(el, { type: "chars" });
          gsap.fromTo(split.chars, LOOSE, {
            "--wdth": 75,
            "--wght": 800,
            duration: 0.8,
            ease: "expo.out",
            stagger: 0.022,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
        all("[data-num]").forEach((el) => {
          gsap.fromTo(el, { "--wdth": 125 }, { "--wdth": 75, duration: 0.6, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
        });

        /* ── small text: a mask opens, nothing fades up from nowhere ── */
        gsap.set("[data-reveal]", { clipPath: "inset(0 0 100% 0)" });
        ScrollTrigger.batch("[data-reveal]", {
          start: "top 90%",
          once: true,
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { clipPath: "inset(0 0 100% 0)", y: 16 },
              { clipPath: "inset(0 0 0% 0)", y: 0, duration: 0.6, ease: "power3.out", stagger: 0.08, clearProps: "clipPath,transform" },
            ),
        });

        /* ── diagrams: lines draw, then nodes land on them ── */
        all("svg[data-draw]").forEach((svg) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: "top 84%", once: true } });
          tl.from(svg.querySelectorAll(".d:not(.dash)"), { drawSVG: 0, duration: 0.6, ease: "power2.out", stagger: 0.035 })
            .from(svg.querySelectorAll(".n"), { scale: 0, transformOrigin: "50% 50%", duration: 0.22, ease: "power2.out", stagger: 0.02 }, 0.2)
            .from(svg.querySelectorAll(".dash, text"), { opacity: 0, duration: 0.3, stagger: 0.012 }, 0.3);
        });

        /* ── chain: the workflow travels sideways as the page moves down ── */
        const track = one("[data-chain]");
        const cw = track.querySelectorAll(".chain-word");
        const ce = track.querySelectorAll(".chain-edge");
        gsap.set(track.parentElement, { overflow: "hidden" });
        track.dataset.live = "";
        undo.push(() => delete track.dataset.live);
        gsap.to(track, {
          x: () => -Math.max(0, track.scrollWidth - innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: track.parentElement,
            start: "top 88%",
            end: "bottom 12%",
            scrub: 0.3,
            invalidateOnRefresh: true,
            onUpdate(self) {
              const n = Math.floor(self.progress * (cw.length + 0.999));
              cw.forEach((w, i) => w.classList.toggle("on", i < n));
              ce.forEach((e, i) => e.classList.toggle("on", i < n - 1));
            },
          },
        });

        /* ── stack: the sheet underneath steps back as the next one arrives ── */
        if (desktop)
          sheets.forEach((s, i) => {
            const next = sheets[i + 1];
            if (!next) return;
            const st = { trigger: next, start: "top bottom", end: () => `top ${parseFloat(getComputedStyle(next).top) || 0}px`, scrub: true };
            gsap.to(s, { scale: 0.965, ease: "none", scrollTrigger: st });
            gsap.to(s.querySelector(".sheet-in"), { opacity: 0.3, ease: "none", scrollTrigger: st });
          });

        /* ── contact: the accent floods in from the nav token ── */
        root.classList.add("flood");
        undo.push(() => root.classList.remove("flood"));
        const ground = one(".ground");
        ScrollTrigger.create({
          trigger: "#contact",
          start: "top bottom",
          end: "top 25%",
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress;
            ground.style.setProperty("--r", p ? `${innerHeight * 0.7 + p * p * 1.5 * Math.hypot(innerWidth, innerHeight)}px` : "0px");
          },
        });

        /* ── pointer: letters loosen near the cursor; the line is conserved ── */
        if (fine && desktop) {
          const word = one(".wordmark");
          const cur = chars.map(() => ({ w: 75, g: 800 }));
          const tgt = chars.map(() => ({ w: 75, g: 800 }));
          let running = false;
          const step = () => {
            let moving = false;
            chars.forEach((c, i) => {
              cur[i].w += (tgt[i].w - cur[i].w) * 0.16;
              cur[i].g += (tgt[i].g - cur[i].g) * 0.16;
              if (Math.abs(tgt[i].w - cur[i].w) > 0.05) moving = true;
              c.style.setProperty("--wdth", cur[i].w.toFixed(2));
              c.style.setProperty("--wght", cur[i].g.toFixed(0));
            });
            // whatever the near letters gain, the whole line gives back
            word.style.transform = "none";
            const k = word.clientWidth / word.scrollWidth;
            word.style.transform = k < 0.999 ? `scaleX(${k})` : "none";
            if (!moving) {
              running = false;
              gsap.ticker.remove(step);
              if (tgt.every((t) => t.w === 75)) {
                chars.forEach((c) => (c.style.removeProperty("--wdth"), c.style.removeProperty("--wght")));
                word.style.transform = "";
              }
            }
          };
          const aim = (e: PointerEvent | null) => {
            if (!root.classList.contains("ready")) return;
            chars.forEach((c, i) => {
              let k = 0;
              if (e) {
                const r = c.getBoundingClientRect();
                const d = Math.hypot(e.clientX - (r.left + r.width / 2), (e.clientY - (r.top + r.height / 2)) * 0.6);
                k = Math.max(0, 1 - d / (innerWidth * 0.2)) ** 1.5;
              }
              tgt[i] = { w: 75 + 34 * k, g: 800 - 430 * k };
            });
            if (!running) {
              running = true;
              gsap.ticker.add(step);
            }
          };
          const heroEl = one(".hero");
          on(heroEl, "pointermove", aim, { passive: true });
          on(heroEl, "pointerleave", () => aim(null));
          undo.push(() => gsap.ticker.remove(step));
        }

        /* ── pointer: one magnetic button, and a label beside the cursor on three kinds of target ── */
        if (fine) {
          all("[data-magnetic]").forEach((el) => {
            const x = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
            const y = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
            on(window, "pointermove", (e: PointerEvent) => {
              const r = el.getBoundingClientRect();
              const dx = e.clientX - (r.left + r.width / 2);
              const dy = e.clientY - (r.top + r.height / 2);
              const near = Math.abs(dx) < r.width / 2 + 50 && Math.abs(dy) < r.height / 2 + 50;
              x(near ? dx * 0.22 : 0);
              y(near ? dy * 0.22 : 0);
            });
          });

          const tag = one(".cursor-label");
          const tx = gsap.quickTo(tag, "x", { duration: 0.12, ease: "power2.out" });
          const ty = gsap.quickTo(tag, "y", { duration: 0.12, ease: "power2.out" });
          on(window, "pointermove", (e: PointerEvent) => {
            tx(e.clientX + 14);
            ty(e.clientY + 16);
            const t = (e.target as HTMLElement).closest?.<HTMLElement>("[data-cursor]");
            if (t && !tag.dataset.hold) tag.textContent = t.dataset.cursor!;
            tag.classList.toggle("on", !!t);
          });
          on(document, "click", (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('[data-cursor="Copy"]')) return;
            tag.textContent = "Copied";
            tag.dataset.hold = "1";
            setTimeout(() => delete tag.dataset.hold, 1600);
          });
        }

        return () => undo.forEach((f) => f());
      },
    );
  });

  return (
    <>
      <div className="ground" aria-hidden="true" />
      <div className="cursor-label" aria-hidden="true" />
    </>
  );
}

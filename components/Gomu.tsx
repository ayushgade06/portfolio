"use client";

// module paths rather than the package root: the root pulls in parts of anime.js this page never uses
import { animate } from "animejs/animation";
import { createDrawable } from "animejs/svg";
import { createTimeline } from "animejs/timeline";
import { createTimer } from "animejs/timer";
import * as utils from "animejs/utils";
import { useEffect, useRef } from "react";
import { subscribe, trace } from "@/lib/trace";
import { field } from "./Field";
import { gomuArt } from "./gomuArt";

type Form = "base" | "g2" | "g3" | "g4" | "haki" | "g5";

// Each state of the page is a form, and each form has a move it throws at that section's title.
const FORMS: Record<string, { form: Form; tag: string; target: string }> = {
  INIT: { form: "base", tag: "", target: ".wordmark, .statement p" },
  EXPERIENCE: { form: "g2", tag: "Gear 2", target: "#experience h2" },
  WORK: { form: "g3", tag: "Gear 3", target: "#work h2" },
  "OPEN SOURCE": { form: "g4", tag: "Gear 4", target: "#upstream h2" },
  ABOUT: { form: "haki", tag: "Haki", target: "#about h2" },
  CONTACT: { form: "g5", tag: "Gear 5", target: "#contact h2" },
};

// A punch: times in ms; `fist` is the size it lands at (× the resting fist, or a share of the short side of the screen).
type Move = { wind: number; out: number; hold: number; back: number; fist?: number; screen?: number; whip: number; sfx: string; hits?: number; rings?: number; flash?: boolean; stars?: boolean };
const MOVES: Partial<Record<Form, Move>> = {
  base: { wind: 240, out: 300, hold: 90, back: 520, fist: 3, whip: 70, sfx: "DON!" },
  g2: { wind: 110, out: 110, hold: 40, back: 300, fist: 2.6, whip: 26, sfx: "JET!", hits: 3 },
  g3: { wind: 460, out: 460, hold: 420, back: 620, screen: 0.19, whip: 46, sfx: "DON!!", flash: true, rings: 1 },
  g4: { wind: 420, out: 150, hold: 160, back: 460, fist: 7, whip: 14, sfx: "KONG!", rings: 2, flash: true },
  g5: { wind: 320, out: 400, hold: 240, back: 800, screen: 0.1, whip: 150, sfx: "BOING!", rings: 3, stars: true },
};

const NS = "http://www.w3.org/2000/svg";
const star = (n: number, inner: number) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const r = i % 2 ? inner : 1, t = (i * Math.PI) / n;
    return `${(Math.cos(t) * r).toFixed(3)},${(Math.sin(t) * r).toFixed(3)}`;
  }).join(" ");

// The companion: always in the corner, runs while the page scrolls, changes form with the state,
// and stretches an arm across the screen to hit each title as it arrives. Drawn in gomuArt.ts; moved with anime.js.
export default function Gomu() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const q = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s)!;
    const html = document.documentElement;
    const motion = matchMedia("(prefers-reduced-motion: no-preference)").matches;
    let state = trace.state;
    root.dataset.form = FORMS[state].form;

    // Without motion it only changes clothes.
    if (!motion) return subscribe(() => (root.dataset.form = FORMS[trace.state].form));

    const lite = !matchMedia("(min-width: 960px) and (pointer: fine)").matches;
    const body = q(".gomu-body"), pop = q(".gomu-pop"), tag = q(".gomu-tag");
    const fx = q(".gomu-fx"), focus = q<SVGPathElement>(".gx-focus"), flash = q(".gx-flash"), sfx = q(".gx-sfx"), sfxText = q(".gx-sfx b");
    const arm = q<SVGPathElement>(".gx-arm"), fist = q<SVGGElement>(".gx-fist"), bolts = q<SVGGElement>(".gx-bolts");
    const ghosts = Array.from(root.querySelectorAll<SVGPathElement>(".gx-ghost"));
    const burst = q<SVGGElement>(".gx-burst"), mail = q<SVGGElement>(".gx-mail"), rings = Array.from(root.querySelectorAll<SVGGElement>(".gx-ring"));
    const legL = q(".gm-legL"), legR = q(".gm-legR"), armN = q(".gm-armN"), armF = q(".gm-armF"), allG = q(".gm-all"), pupils = q(".gm-pupils");
    const clamp = utils.clamp;

    /* ── geometry: everything is measured from the shoulder of the near arm ── */
    let k = 1; // screen px per drawing unit
    const S = { x: 0, y: 0 };
    const measure = () => {
      const r = body.getBoundingClientRect();
      k = r.width / 120;
      S.x = r.left + 45 * k;
      S.y = r.top + 98 * k;
    };
    const a = { ext: 0, back: 0, bend: 0, fist: 1 }; // the arm: how far out, how far wound back, how bowed, how big the fist
    const F = { x: 0, y: 0 };
    let target: Element | null = null, point: { x: number; y: number } | null = null, side = 0, holding = false;
    let hist: string[] = [];
    const aim = () => {
      if (point || !target) return point ?? S;
      const r = target.getBoundingClientRect();
      return { x: clamp(r.left + r.width * (0.5 + side), 36, innerWidth - 36), y: clamp(r.top + r.height * 0.5, 84, innerHeight - 70) };
    };
    const draw = () => {
      const T = aim();
      let dx = T.x - S.x, dy = T.y - S.y;
      const L = Math.hypot(dx, dy) || 1;
      dx /= L;
      dy /= L;
      const reach = L * a.ext - a.back;
      F.x = S.x + dx * reach;
      F.y = S.y + dy * reach;
      const cx = (S.x + F.x) / 2 - dy * a.bend, cy = (S.y + F.y) / 2 + dx * a.bend;
      const r = 5.6 * k * a.fist;
      // rubber: the arm thins as it stretches and swells into the fist
      const w0 = 3.4 * k * clamp(((70 * k) / (Math.abs(reach) || 1)) ** 0.15, 0.72, 1.25);
      const w1 = Math.max(w0, r * 0.5);
      const up: string[] = [], dn: string[] = [];
      for (let i = 0; i <= 14; i++) {
        const t = i / 14, u = 1 - t;
        const x = u * u * S.x + 2 * u * t * cx + t * t * F.x, y = u * u * S.y + 2 * u * t * cy + t * t * F.y;
        let tx = u * (cx - S.x) + t * (F.x - cx), ty = u * (cy - S.y) + t * (F.y - cy);
        const tl = Math.hypot(tx, ty) || 1;
        tx /= tl;
        ty /= tl;
        const w = w0 + (w1 - w0) * t ** 5;
        up.push(`${(x - ty * w).toFixed(1)} ${(y + tx * w).toFixed(1)}`);
        dn.push(`${(x + ty * w).toFixed(1)} ${(y - tx * w).toFixed(1)}`);
      }
      const d = `M${up.join("L")}L${dn.reverse().join("L")}Z`;
      arm.setAttribute("d", d);
      if (root.dataset.form === "g2" && !lite) {
        ghosts.forEach((g, i) => g.setAttribute("d", hist[i * 2 + 1] ?? ""));
        hist = [d, ...hist].slice(0, 6);
      }
      const ang = (Math.atan2(F.y - cy, F.x - cx) * 180) / Math.PI + 90;
      fist.setAttribute("transform", `translate(${F.x.toFixed(1)} ${F.y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${(r / 10).toFixed(3)})`);
      fist.style.strokeWidth = `${clamp(r * 0.075, 1.6, 7)}px`;
      if (holding) mail.setAttribute("transform", `translate(${F.x.toFixed(1)} ${F.y.toFixed(1)}) rotate(${(ang - 90).toFixed(1)})`);
    };

    /* ── moves ── */
    let tl: ReturnType<typeof createTimeline> | null = null;
    let wait = 0, tagT = 0, sleepT = 0, entered = false;
    // the full-screen layer only exists while something is happening on it
    const wake = () => {
      clearTimeout(sleepT);
      fx.classList.add("live");
    };
    const blink = () => {
      if (lite) return;
      flash.classList.add("on");
      setTimeout(() => flash.classList.remove("on"), 85);
    };
    const rest = () => {
      sleepT = window.setTimeout(() => fx.classList.remove("live"), 1300);
      root.classList.remove("atk", "reach");
      fx.classList.remove("on");
      ghosts.forEach((g) => g.setAttribute("d", ""));
      hist = [];
      target = point = null;
      holding = false;
      side = 0;
    };
    const stop = () => {
      clearTimeout(wait);
      tl?.cancel();
      tl = null;
      rest();
      animate(pop, { rotate: 0, duration: 200 });
    };
    const theme = () => document.querySelector<HTMLElement>(".trace")?.dataset.theme ?? "dark";

    const impact = (m: Move, big: number) => {
      const r = 5.6 * k * big;
      fx.dataset.theme = theme();
      // manga focus lines: thin wedges pointing at the hit, from a clear middle out past the edges
      const far = Math.hypot(innerWidth, innerHeight);
      let lines = "";
      for (let t = 0; t < Math.PI * 2; t += utils.random(0.05, 0.13, 3)) {
        const r0 = r + far * utils.random(0.1, 0.24, 3), w = utils.random(0.003, 0.012, 4);
        lines += `M${(F.x + Math.cos(t) * r0).toFixed(0)} ${(F.y + Math.sin(t) * r0).toFixed(0)}L${(F.x + Math.cos(t - w) * far).toFixed(0)} ${(F.y + Math.sin(t - w) * far).toFixed(0)}L${(F.x + Math.cos(t + w) * far).toFixed(0)} ${(F.y + Math.sin(t + w) * far).toFixed(0)}Z`;
      }
      focus.setAttribute("d", lines);
      animate(focus, { opacity: [m.flash ? 0.7 : 0.4, 0], duration: m.flash ? 900 : 560, ease: "outQuad" });
      burst.setAttribute("transform", `translate(${F.x} ${F.y})`);
      animate(burst.firstElementChild!, { scale: [r * 0.8, r * 2 + 44], rotate: [utils.random(-30, 30), utils.random(20, 60)], opacity: [1, 0], duration: 460, ease: "outExpo" });
      rings.slice(0, m.rings ?? 0).forEach((g, i) => {
        g.setAttribute("transform", `translate(${F.x} ${F.y})`);
        animate(g.firstElementChild!, { scale: [r / 12, (r * 2.4 + 90 + i * 60) / 10], opacity: [0.9, 0], duration: 620 + i * 160, delay: i * 90, ease: "outQuart" });
      });
      if (m.stars)
        root.querySelectorAll<SVGElement>(".gx-star").forEach((s, i, all) => {
          const t = (i / all.length) * Math.PI * 2 + 0.4;
          (s.parentNode as SVGGElement).setAttribute("transform", `translate(${F.x} ${F.y})`);
          animate(s, { x: [0, Math.cos(t) * (r + 110)], y: [0, Math.sin(t) * (r + 110)], scale: [0, 16, 0], rotate: [0, 220], duration: 820, ease: "outQuart" });
        });
      if (m.flash) blink();
      sfxText.textContent = m.sfx;
      sfx.style.left = `${clamp(F.x, 120, innerWidth - 120)}px`;
      sfx.style.top = `${clamp(F.y - r - 34 * k, 96, innerHeight - 120)}px`;
      animate(sfxText, { scale: [2.6, 1], rotate: [-16, -7], opacity: [{ to: 1, duration: 50 }, { to: 1, duration: 380 }, { to: 0, duration: 240 }], duration: 670, ease: "outExpo" });
      // what gets hit feels it: a title jumps, the halftone field behind the name shakes loose
      const el = target as HTMLElement | null;
      if (el?.matches("h2")) animate(el, { scale: [1.05, 1], duration: 700, ease: "outElastic(1, .4)", onComplete: () => el.style.removeProperty("transform") });
      else animate(field, { loosen: [0.6, 0], duration: 1100, ease: "outQuad" });
      animate(pop, { scaleX: [1.14, 1], scaleY: [0.88, 1], duration: 620, ease: "outElastic(1, .45)" });
    };

    const punch = (m: Move, el: Element) => {
      measure();
      target = el;
      const restFist = root.dataset.form === "g3" ? 3.1 : 1;
      const big = m.screen ? (Math.min(innerWidth, innerHeight) * m.screen) / (5.6 * k) : m.fist!;
      const hits = lite ? 1 : (m.hits ?? 1);
      Object.assign(a, { ext: 0, back: 0, bend: 0, fist: restFist });
      root.classList.add("atk", "reach");
      wake();
      fx.classList.add("on");
      const t = createTimeline({ onUpdate: draw, onComplete: rest });
      t.add(a, { back: 40 * k, bend: -m.whip * 0.5, duration: m.wind, ease: "outQuad" }).add(pop, { rotate: 9, duration: m.wind, ease: "outQuad" }, 0);
      for (let h = 0; h < hits; h++) {
        const last = h === hits - 1;
        t.call(() => (side = hits > 1 ? (h - 1) * 0.3 : 0))
          .add(a, { ext: 1, back: 0, fist: big, duration: m.out, ease: m.screen ? "inOutQuart" : "outExpo" })
          .add(a, { bend: [{ to: m.whip, duration: m.out * 0.45, ease: "outQuad" }, { to: 0, duration: m.out * 0.55, ease: "inQuad" }] }, "<<")
          .add(pop, { rotate: -8, duration: m.out, ease: "outExpo" }, "<<")
          .call(() => impact(m, big))
          .add(a, { bend: [{ to: -m.whip * 0.25, duration: m.hold / 2 }, { to: m.whip * 0.12, duration: m.hold / 2 }] });
        if (last) t.add(a, { ext: 0, fist: restFist, duration: m.back, ease: "outElastic(1, .7)" }).add(a, { bend: [{ to: m.whip * 0.8, duration: m.back * 0.3 }, { to: 0, duration: m.back * 0.7, ease: "outElastic(1, .3)" }] }, "<<").add(pop, { rotate: 0, duration: m.back, ease: "outElastic(1, .5)" }, "<<");
        else t.add(a, { ext: 0.45, fist: restFist, duration: m.out, ease: "inQuad" });
      }
      tl = t;
    };

    // No punch here: the will of the thing. Lightning leaves him and crosses the screen.
    const haki = (el: Element | null) => {
      measure();
      const ax = S.x + 15 * k, ay = S.y - 26 * k;
      const far = Math.hypot(innerWidth, innerHeight);
      bolts.replaceChildren();
      const n = lite ? 4 : 7;
      for (let i = 0; i < n; i++) {
        const ang = Math.PI * (0.98 + (i / (n - 1)) * 0.62) + utils.random(-0.06, 0.06, 3);
        const len = far * utils.random(0.3, 0.72, 3), steps = Math.round(len / 46);
        const pts = [[ax, ay]];
        for (let s = 1; s <= steps; s++) {
          const along = (len * s) / steps, off = s === steps ? 0 : utils.random(-1, 1, 3) * 30;
          pts.push([ax + Math.cos(ang) * along - Math.sin(ang) * off, ay + Math.sin(ang) * along + Math.cos(ang) * off]);
        }
        let d = "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L");
        // one fork, leaving from a corner part of the way along
        const turn = ang + utils.random(0.35, 0.7, 2) * (i % 2 ? 1 : -1);
        let [fx0, fy0] = pts[Math.round(steps * utils.random(0.3, 0.6, 2))];
        d += `M${fx0.toFixed(1)} ${fy0.toFixed(1)}`;
        for (let s = 1; s <= 4; s++) {
          fx0 += Math.cos(turn) * len * 0.06 + utils.random(-14, 14);
          fy0 += Math.sin(turn) * len * 0.06 + utils.random(-14, 14);
          d += `L${fx0.toFixed(1)} ${fy0.toFixed(1)}`;
        }
        for (const cls of ["gx-bolt-g", "gx-bolt-c"]) {
          const p = document.createElementNS(NS, "path");
          p.setAttribute("class", cls);
          p.setAttribute("d", d);
          bolts.append(p);
        }
      }
      root.classList.add("atk");
      wake();
      fx.dataset.theme = theme();
      F.x = ax;
      F.y = ay;
      rings.forEach((g, i) => {
        g.setAttribute("transform", `translate(${ax} ${ay})`);
        animate(g.firstElementChild!, { scale: [2, far / (14 - i * 3)], opacity: [0.8, 0], duration: 900 + i * 200, delay: i * 110, ease: "outQuart" });
      });
      blink();
      animate(createDrawable(bolts.querySelectorAll("path")), {
        draw: ["0 0", "0 1", "1 1"],
        duration: 760,
        delay: ((_: unknown, i: number) => (i >> 1) * 55) as never, // both strokes of a bolt leave together
        ease: "inOutQuad",
        onComplete: () => (bolts.replaceChildren(), rest()),
      });
      const h = el as HTMLElement | null;
      if (h) animate(h, { x: [0, -7, 6, -4, 3, 0], duration: 520, delay: 160, ease: "linear", onComplete: () => h.style.removeProperty("transform") });
      animate(pop, { scaleX: [0.9, 1], scaleY: [1.16, 1], duration: 800, ease: "outElastic(1, .4)" });
    };

    // The message is in the post: he reaches over, takes it, and throws it off the screen.
    const toss = (e: Event) => {
      stop();
      measure();
      point = (e as CustomEvent<{ x: number; y: number }>).detail;
      Object.assign(a, { ext: 0, back: 0, bend: 0, fist: 1.5 });
      root.classList.add("reach");
      wake();
      fx.classList.add("on");
      const fly = { x: 0, y: 0, r: 0 };
      tl = createTimeline({ onUpdate: draw, onComplete: rest })
        .add(a, { ext: 1, duration: 320, ease: "outExpo" })
        .add(a, { bend: [{ to: 60, duration: 150 }, { to: 0, duration: 170 }] }, "<<")
        .call(() => ((holding = true), mail.classList.add("on")))
        .add(a, { ext: -0.12, duration: 300, ease: "inQuad" }, "+=120")
        .call(() => {
          holding = false;
          Object.assign(fly, { x: F.x, y: F.y, r: 0 });
          animate(fly, {
            x: F.x - innerWidth * 0.5,
            y: -90,
            r: -540,
            duration: 720,
            ease: "inQuad",
            onUpdate: () => mail.setAttribute("transform", `translate(${fly.x} ${fly.y}) rotate(${fly.r})`),
            onComplete: () => mail.classList.remove("on"),
          });
        })
        .add(a, { ext: 0, duration: 380, ease: "outElastic(1, .6)" })
        .add(pop, { y: [0, -34 * k, 0], duration: 620, ease: "outQuad" }, "<<");
    };

    const attack = (st: string) => {
      const f = FORMS[st];
      // only hit what is on screen
      const el = Array.from(document.querySelectorAll(f.target)).find((e) => {
        const r = e.getBoundingClientRect();
        return r.bottom > 70 && r.top < innerHeight - 60;
      });
      if (f.form === "haki") haki(el ?? null);
      else if (el) punch(MOVES[f.form]!, el);
    };

    const change = () => {
      if (trace.state === state) return;
      state = trace.state;
      const f = FORMS[state];
      stop();
      // squash, change, spring back
      createTimeline()
        .add(pop, { scaleY: 0.7, scaleX: 1.22, duration: 110, ease: "outQuad" })
        .call(() => {
          root.dataset.form = f.form;
          tag.textContent = f.tag;
          tag.classList.toggle("on", !!f.tag);
          clearTimeout(tagT);
          tagT = window.setTimeout(() => tag.classList.remove("on"), 2400);
        })
        .add(pop, { scaleY: 1, scaleX: 1, duration: 720, ease: "outElastic(1, .45)" });
      // a fast scroll passes through states; only the one you stop in gets its move
      wait = window.setTimeout(() => entered && attack(state), 320);
    };
    const unsub = subscribe(change);

    /* ── arriving: he springs up from under the page once the name has settled ── */
    const enter = () => {
      if (entered) return;
      entered = true;
      animate(pop, { y: ["150%", "0%"], duration: 900, ease: "outElastic(1, .6)", onComplete: () => attack(state) });
    };
    const mo = new MutationObserver(() => html.classList.contains("ready") && enter());
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    if (html.classList.contains("ready")) enter();

    /* ── running: the page scrolls, he runs; the faster it goes the further he leans ── */
    let last = scrollY, vel = 0, dist = 0, still = true;
    const run = createTimer({
      onUpdate: () => {
        const y = scrollY, dy = y - last;
        last = y;
        vel += (dy - vel) * 0.22;
        dist += Math.abs(dy);
        const go = Math.min(1, Math.abs(vel) / 12);
        if (go < 0.01) {
          if (still) return;
          still = true;
        } else still = false;
        const ph = dist / 24, s = Math.sin(ph) * go;
        legL.style.transform = `rotate(${(s * 36).toFixed(1)}deg)`;
        legR.style.transform = `rotate(${(-s * 36).toFixed(1)}deg)`;
        armF.style.transform = `rotate(${(s * 34).toFixed(1)}deg)`;
        armN.style.transform = `rotate(${(-s * 34).toFixed(1)}deg)`;
        allG.style.transform = `translateY(${(-Math.abs(s) * 5).toFixed(1)}px) rotate(${clamp(vel * 0.45, -13, 13).toFixed(1)}deg)`;
      },
    });

    // his eyes follow the pointer
    const look = (e: PointerEvent) => {
      const r = body.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.45);
      const d = Math.hypot(dx, dy) || 1;
      pupils.style.transform = `translate(${((dx / d) * 2.4).toFixed(2)}px, ${((dy / d) * 2).toFixed(2)}px)`;
    };
    window.addEventListener("pointermove", look, { passive: true });
    window.addEventListener("gomu:toss", toss);
    return () => {
      unsub();
      stop();
      clearTimeout(tagT);
      clearTimeout(sleepT);
      mo.disconnect();
      run.cancel();
      window.removeEventListener("pointermove", look);
      window.removeEventListener("gomu:toss", toss);
    };
  }, []);

  return (
    <div className="gomu" ref={rootRef} data-form="base" aria-hidden="true">
      <div className="gomu-body">
        <span className="gomu-tag mono" />
        <div className="gomu-pop" dangerouslySetInnerHTML={{ __html: gomuArt }} />
      </div>
      <div className="gomu-fx">
        <div className="gx-flash" />
        <svg className="gx" focusable="false">
          <path className="gx-focus" />
          <g className="gx-bolts" />
          <g className="gx-ring">
            <circle r="10" />
          </g>
          <g className="gx-ring">
            <circle r="10" />
          </g>
          <g className="gx-ring">
            <circle r="10" />
          </g>
          <path className="gx-ghost" />
          <path className="gx-ghost" />
          <path className="gx-ghost" />
          <g className="gx-mail">
            <rect x="-24" y="-16" width="48" height="32" />
            <path className="ln" d="M-24 -16 L0 4 L24 -16" />
          </g>
          {/* the burst sits behind the fist, so its points show around it */}
          <g className="gx-burst">
            <polygon points={star(11, 0.52)} />
          </g>
          <g className="gx-reach">
            <path className="gx-arm" />
            {/* a fist, knuckles first */}
            <g className="gx-fist">
              <path d="M-9.4 -3 Q-10 -10 -4.8 -10 Q-2.4 -11.4 0 -10 Q2.4 -11.4 4.8 -10 Q10 -10 9.4 -3 L9.6 5 Q9 10 0 10 Q-9 10 -9.6 5 Z" />
              <path className="ln" d="M-4.8 -10 V-1.5 M0 -10 V-1 M4.8 -10 V-1.5 M-9.2 -1.6 Q0 0.8 9.2 -1.6" />
              <path d="M-9.6 2.4 Q-1 0.6 6.6 2.8 Q9.4 5.6 6.2 7.4 Q-1.6 5 -9.6 7 Z" />
            </g>
          </g>
          <g>
            {Array.from({ length: 7 }, (_, i) => (
              <polygon className="gx-star" points={star(4, 0.36)} key={i} />
            ))}
          </g>
        </svg>
        <span className="gx-sfx">
          <b />
        </span>
      </div>
    </div>
  );
}

"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

type Mood = "idle" | "link" | "src" | "copy" | "curious" | "read" | "sleep";

// The pointer is a small character with a blob behind it. Fine pointers only; never under reduced motion.
// The blob grows on things you can press and shrinks on text; the character reacts to what it is over:
// it walks when you move, grins at links, peers at diagrams, reads paragraphs, and dozes off when left alone.
export default function Cursor() {
  const blobRef = useRef<HTMLDivElement>(null);
  const avRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const blob = blobRef.current!;
    const av = avRef.current!;
    const q = <T extends Element>(s: string) => av.querySelector<T>(s)!;
    const rig = q(".rig"), eyes = q(".eyes"), eyeL = q(".el"), eyeR = q(".er"), mouth = q(".mouth"), ant = q(".ant"), bubble = q<HTMLElement>(".bubble");
    const feet = [q(".fl"), q(".fr")];
    const size = blob.querySelector(".blob-s")!;
    const root = document.documentElement;
    root.classList.add("cur");

    gsap.set([blob, av], { xPercent: 0, yPercent: 0 });
    gsap.set(rig, { transformOrigin: "29px 34px" });
    gsap.set([eyeL, eyeR, mouth], { transformOrigin: "50% 50%" });
    gsap.set(ant, { transformOrigin: "29px 15px" });

    // the blob trails the pointer and stretches the way it is going
    const bx = gsap.quickTo(blob, "x", { duration: 0.5, ease: "power3.out" });
    const by = gsap.quickTo(blob, "y", { duration: 0.5, ease: "power3.out" });
    const tilt = gsap.quickTo(rig, "rotation", { duration: 0.4, ease: "power3.out" });
    const lookX = gsap.quickTo(eyes, "x", { duration: 0.3, ease: "power2.out" });
    const lookY = gsap.quickTo(eyes, "y", { duration: 0.3, ease: "power2.out" });
    // …and it is always breathing a little
    const breathe = gsap.to(blob.querySelector(".blob-i"), { scale: 1.14, duration: 1.1, ease: "sine.inOut", yoyo: true, repeat: -1 });

    let mood: Mood = "idle";
    let act: gsap.core.Animation | null = null; // the looping part of the current mood
    let px = 0, py = 0, walked = 0, shown = false, down = false, idle = 0, hold = 0;

    const say = (text: string) => {
      bubble.textContent = text;
      bubble.classList.toggle("on", !!text);
    };
    const face = (eyeY: number, eyeScale: number, smile: number) => {
      gsap.to([eyeL, eyeR], { scaleY: eyeY, scaleX: eyeScale, duration: 0.18, overwrite: "auto" });
      gsap.to(mouth, { scaleX: smile, scaleY: smile, duration: 0.18, overwrite: "auto" });
    };
    const blobTo = (s: number) => gsap.to(size, { scale: s, duration: 0.45, ease: "back.out(2.2)", overwrite: true });

    const set = (next: Mood) => {
      if (next === mood) return;
      mood = next;
      act?.kill();
      act = null;
      gsap.to([rig, ant, eyes], { y: 0, rotation: 0, scale: 1, duration: 0.2, overwrite: "auto" });
      if (performance.now() > hold) say("");
      switch (next) {
        case "link":
          face(0.45, 1.15, 1.5);
          blobTo(2.1);
          act = gsap.to(rig, { y: -5, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1 }); // a hop
          break;
        case "src":
          face(0.9, 1.1, 1.3);
          blobTo(2.1);
          say("open ↗");
          break;
        case "copy":
          face(0.9, 1.1, 1.3);
          blobTo(2.1);
          say("copy");
          break;
        case "curious":
          face(1.25, 1.25, 0.7);
          blobTo(1.5);
          act = gsap.to(ant, { rotation: 22, duration: 0.22, ease: "sine.inOut", yoyo: true, repeat: -1 });
          break;
        case "read":
          face(0.8, 0.9, 0.8);
          blobTo(0.55);
          act = gsap.fromTo(eyes, { x: -1.8 }, { x: 1.8, duration: 0.7, ease: "sine.inOut", yoyo: true, repeat: -1 });
          break;
        case "sleep":
          face(0.12, 1.1, 0.6);
          blobTo(0.8);
          say("z z z");
          act = gsap.to(rig, { scale: 1.05, duration: 1.3, ease: "sine.inOut", yoyo: true, repeat: -1 });
          break;
        default:
          face(1, 1, 1);
          blobTo(1);
      }
    };

    const moodAt = (t: Element | null): Mood => {
      if (!t) return "idle";
      if (t.closest('[data-cursor="copy"]')) return "copy";
      if (t.closest('[data-cursor="src"]')) return "src";
      if (t.closest("a, button, summary")) return "link";
      if (t.closest(".dg, .plate, .diff, .meter, .dial, .field")) return "curious";
      if (t.closest("p, li, h3, figcaption")) return "read";
      return "idle";
    };

    const move = (e: PointerEvent) => {
      const dx = e.clientX - px, dy = e.clientY - py;
      px = e.clientX;
      py = e.clientY;
      idle = performance.now();
      if (!shown) {
        shown = true;
        gsap.set(blob, { x: px, y: py });
        blob.classList.add("on");
        av.classList.add("on");
      }
      gsap.set(av, { x: px, y: py }); // the character is the pointer: no lag
      bx(px);
      by(py);
      const speed = Math.hypot(dx, dy);
      gsap.to(blob, { rotation: (Math.atan2(dy, dx) * 180) / Math.PI, scaleX: 1 + Math.min(0.7, speed / 60), scaleY: 1 - Math.min(0.3, speed / 140), duration: 0.25, overwrite: "auto" });
      tilt(gsap.utils.clamp(-22, 22, dx * 1.1));
      if (mood !== "read") {
        lookX(gsap.utils.clamp(-2, 2, dx * 0.35));
        lookY(gsap.utils.clamp(-1.5, 1.5, dy * 0.35));
      }
      // it walks: the feet alternate with distance covered
      walked += speed;
      feet.forEach((f, k) => gsap.set(f, { y: Math.max(0, Math.sin(walked / 9 + k * Math.PI)) * -3 }));
      const el = e.target as Element;
      av.dataset.theme = el.closest?.<HTMLElement>("[data-theme]")?.dataset.theme || "dark";
      if (!down) set(moodAt(el));
    };

    const press = () => {
      down = true;
      gsap.to(rig, { scaleX: 1.16, scaleY: 0.8, duration: 0.1, overwrite: "auto" });
      gsap.to([eyeL, eyeR], { scaleY: 0.12, duration: 0.08, overwrite: "auto" });
      blobTo(0.5);
    };
    const release = (e: PointerEvent) => {
      down = false;
      gsap.to(rig, { scaleX: 1, scaleY: 1, duration: 0.35, ease: "back.out(3)", overwrite: "auto" });
      const was = mood;
      mood = "idle"; // force the mood to re-apply
      set(moodAt(e.target as Element));
      if (was === "copy") {
        hold = performance.now() + 1500;
        say("copied!");
        gsap.to(eyeL, { scaleY: 0.1, duration: 0.1, yoyo: true, repeat: 1 }); // a wink
        setTimeout(() => mood !== "copy" && say(""), 1500);
      }
    };

    // left alone, the blob settles round, it blinks, and after a while it nods off
    const tick = () => {
      const still = performance.now() - idle;
      if (still > 120) {
        gsap.to(blob, { scaleX: 1, scaleY: 1, duration: 0.5, overwrite: "auto" });
        tilt(0);
      }
      if (shown && still > 6000 && mood !== "sleep" && !down) set("sleep");
    };
    gsap.ticker.add(tick);
    const blink = setInterval(() => {
      if (mood === "sleep" || down) return;
      gsap.to([eyeL, eyeR], { scaleY: 0.1, duration: 0.07, yoyo: true, repeat: 1, overwrite: false });
    }, 3400);
    const leave = () => {
      shown = false;
      blob.classList.remove("on");
      av.classList.remove("on");
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", press, { passive: true });
    window.addEventListener("pointerup", release, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      root.classList.remove("cur");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      document.removeEventListener("pointerleave", leave);
      gsap.ticker.remove(tick);
      clearInterval(blink);
      breathe.kill();
      act?.kill();
    };
  }, []);

  return (
    <>
      <div className="blob" ref={blobRef} aria-hidden="true">
        <div className="blob-s">
          <div className="blob-i" />
        </div>
      </div>
      <div className="avatar" ref={avRef} aria-hidden="true" data-theme="dark">
        <svg viewBox="0 0 48 48" width="46" height="46">
          {/* the tip is the real pointer position */}
          <path className="nub" d="M2 2 L16 8 L8 16 Z" />
          <g className="rig">
            <g className="ant">
              <line x1="29" y1="16" x2="29" y2="9" />
              <rect x="26.5" y="4" width="5" height="5" />
            </g>
            <rect className="fl foot" x="19" y="40" width="7" height="5" rx="2" />
            <rect className="fr foot" x="32" y="40" width="7" height="5" rx="2" />
            <rect className="body" x="13" y="15" width="32" height="27" rx="8" />
            <g className="eyes">
              <ellipse className="eye el" cx="23" cy="27" rx="2.6" ry="3.4" />
              <ellipse className="eye er" cx="35" cy="27" rx="2.6" ry="3.4" />
            </g>
            <path className="mouth" d="M26 34 q3 2.6 6 0" />
          </g>
        </svg>
        <span className="bubble mono" />
      </div>
    </>
  );
}

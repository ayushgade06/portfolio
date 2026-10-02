"use client";

import { createTimeline } from "animejs/timeline";
import { random, remove, stagger } from "animejs/utils";
import { useEffect, useRef, useState } from "react";

// 5 × 7 letters, only the ones the words use.
const GLYPH: Record<string, string> = {
  S: "01111 10000 10000 01110 00001 00001 11110",
  P: "11110 10001 10001 11110 10000 10000 10000",
  E: "11111 10000 10000 11110 10000 10000 11111",
  C: "01111 10000 10000 10000 10000 10000 01111",
  O: "01110 10001 10001 10001 10001 10001 01110",
  D: "11110 10001 10001 10001 10001 10001 11110",
  T: "11111 00100 00100 00100 00100 00100 00100",
  H: "10001 10001 10001 11111 10001 10001 10001",
  I: "11111 00100 00100 00100 00100 00100 11111",
};
// where each block of a word sits, left to right: [column, row]
const cells = (word: string) =>
  [...word].flatMap((ch, n) => GLYPH[ch].split(" ").flatMap((row, y) => [...row].flatMap((bit, x) => (bit === "1" ? [[n * 6 + x, y]] : []))));

// anime.js takes (target, index) functions as values; its types only admit one argument
const each = (f: (k: number) => number) => ((_: unknown, k: number) => f(k)) as never;

const PILE = [11, 8.4]; // where a block waits when the word does not need it

// One pool of blocks keeps building the next word: they drop to the floor, then go up again one at a time.
export default function Builder({ words }: { words: string[] }) {
  const ref = useRef<SVGSVGElement>(null);
  const [now, setNow] = useState(0);
  const all = words.map(cells);
  const n = Math.max(...all.map((c) => c.length));

  useEffect(() => {
    if (!matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
    const svgEl = ref.current!;
    const blocks = svgEl.querySelectorAll("rect");
    const layout = words.map(cells);
    let i = 0, timer = 0;
    const next = () => {
      i = (i + 1) % layout.length;
      const to = layout[i];
      setNow(i);
      createTimeline()
        .add(blocks, { x: () => random(1, 21, 1), y: () => random(7.6, 8.8, 1), rotate: () => random(-140, 140), opacity: 1, duration: 520, delay: stagger(5, { from: "random" }), ease: "inQuad" })
        .add(
          blocks,
          { x: each((k) => (to[k] ?? PILE)[0]), y: each((k) => (to[k] ?? PILE)[1]), rotate: 0, opacity: each((k) => (to[k] ? 1 : 0)), duration: 760, delay: stagger(9), ease: "outElastic(1, .8)" },
          "-=80",
        );
    };
    const io = new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting) timer = window.setInterval(next, 3400);
    });
    io.observe(svgEl);
    return () => {
      io.disconnect();
      clearInterval(timer);
      remove(blocks);
    };
  }, [words]);

  return (
    <>
      <svg className="bd" ref={ref} viewBox="-0.6 -0.6 24.2 10.4" role="img" aria-label={words.join(", ").toLowerCase()}>
        <path className="bd-floor" d="M-0.4 9.5 H23.4" />
        {Array.from({ length: n }, (_, k) => (
          <rect key={k} className={k % 7 === 3 ? "a" : undefined} width="0.84" height="0.84" x={(all[0][k] ?? PILE)[0]} y={(all[0][k] ?? PILE)[1]} opacity={all[0][k] ? 1 : 0} />
        ))}
      </svg>
      <ol className="bd-steps mono" aria-hidden="true">
        {words.map((w, k) => (
          <li key={w} className={k === now ? "on" : undefined}>
            {w}
          </li>
        ))}
      </ol>
    </>
  );
}

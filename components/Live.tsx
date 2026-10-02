"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { links } from "@/content/site";
import { dwellTimes, elapsed, getVersion, log, subscribe, trace } from "@/lib/trace";

/* ── local time in Pune ── */
export function PuneTime() {
  const [t, setT] = useState("--:--");
  useEffect(() => {
    const f = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
    const tick = () => setT(f.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return <>{t}</>;
}

/* ── the Layer5 fix, running: both versions of the hook listen to this page's scroll ── */
const attaches = { before: 0, after: 0 };

// As it was upstream: the throttle flag is state and sits in the dependency list, so whenever a render
// lands between its two flips the effect re-runs and the listener is torn down and attached again.
// flushSync renders each flip as it happens — the condition under which that shows. Under React's
// batched rendering the two flips usually land in one batch and the churn hides (measured on this page:
// without flushSync this hook attaches once). The fix does not depend on either.
function Before() {
  const out = useRef<HTMLSpanElement>(null);
  const [, setScrollPosition] = useState(0);
  const [ticking, setTicking] = useState(false);
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    if (out.current) out.current.textContent = String(++attaches.before);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [ticking]);
  function handleScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        flushSync(() => {
          setScrollPosition(window.scrollY);
          setTicking(false);
        });
      });
      flushSync(() => setTicking(true));
    }
  }
  return <span ref={out}>0</span>;
}

// As merged: the flag is a local variable, the listener attaches once.
function After() {
  const out = useRef<HTMLSpanElement>(null);
  const [, setScrollPosition] = useState(0);
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          setScrollPosition(window.scrollY);
          ticking = false;
        });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    if (out.current) out.current.textContent = String(++attaches.after);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return <span ref={out}>0</span>;
}

export function Meter() {
  const box = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  useEffect(() => {
    // Mounted only while the section is on screen, and counted from zero each time you arrive.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) attaches.before = attaches.after = 0;
      setLive(e.isIntersecting);
    });
    io.observe(box.current!);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={box}>
      <div className="meter">
        <div className="bad">
          <span className="mono">Before · listener attaches</span>
          <b className="numeral">{live ? <Before /> : 17}</b>
        </div>
        <div className="good">
          <span className="mono">After · listener attaches</span>
          <b className="numeral">{live ? <After /> : 1}</b>
        </div>
      </div>
      <p className="mono" style={{ marginTop: 10 }}>
        {live ? "Counted since you arrived here, each state change rendered as it happens. Keep scrolling." : "From the test harness in the pull request"}
      </p>
    </div>
  );
}

/* ── contact ── */
export function CopyEmail() {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      data-cursor="Copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(links.email);
          setDone(true);
          log("copy", "email");
          setTimeout(() => setDone(false), 1600);
        } catch {
          location.href = `mailto:${links.email}`;
        }
      }}
    >
      <span>Email</span>
      <span aria-live="polite" style={{ textTransform: "none", letterSpacing: "0.02em" }}>
        {done ? "Copied" : links.email}
      </span>
    </button>
  );
}

const nice = (k: string) => (k === k.toUpperCase() ? k[0] + k.slice(1).toLowerCase() : k);
const spell = (s: number) => {
  const m = Math.floor(s / 60), r = Math.round(s % 60);
  return m ? `${m} minute${m > 1 ? "s" : ""} ${r} second${r === 1 ? "" : "s"}` : `${r} seconds`;
};

// The site reads the visit back. Before the run ends (or without scripts) it says the plain thing.
export function RunSummary() {
  useSyncExternalStore(subscribe, getVersion, () => 0);
  const [sum, setSum] = useState<{ total: number; top?: [string, number] } | null>(null);
  const done = trace.done;
  useEffect(() => {
    if (!done) return;
    const top = dwellTimes().find(([k]) => k !== "CONTACT" && k !== "INIT");
    setSum({ total: elapsed(), top });
  }, [done]);

  if (!sum)
    return (
      <div>
        <p className="aside">Email is the fastest way to reach me.</p>
        <p className="lead">GitHub and LinkedIn work too.</p>
      </div>
    );
  return (
    <div>
      <p className="aside">You were here for {spell(sum.total)}.</p>
      <p className="lead">
        {sum.total < 20 || !sum.top
          ? "The index is the fastest way in."
          : `Longest stop: ${nice(sum.top[0])}, ${Math.round(sum.top[1])} seconds. That is a good place to start the conversation.`}
      </p>
    </div>
  );
}

export function RunFacts() {
  useSyncExternalStore(subscribe, getVersion, () => 0);
  return (
    <ul className="kv">
      <li>
        <div>
          <span>States visited</span>
          <span suppressHydrationWarning>{trace.visited.size} / 6</span>
        </div>
      </li>
      <li>
        <div>
          <span>Sources opened</span>
          <span suppressHydrationWarning>{trace.sources}</span>
        </div>
      </li>
      <li>
        <div>
          <span>Sent anywhere</span>
          <span>Nothing</span>
        </div>
      </li>
      <li>
        <div>
          <span>Local time, Pune</span>
          <span>
            <PuneTime />
          </span>
        </div>
      </li>
    </ul>
  );
}

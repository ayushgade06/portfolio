"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { demo, dwellTimes, elapsed, fmt, getVersion, start, subscribe, trace } from "@/lib/trace";
import { lock } from "@/lib/scroll";

// The signature interaction: one mono line that reports the visit as a run, and a drawer with the full log.
// Per-second and per-scroll values are written straight to the DOM; React only renders the drawer.
export default function Trace() {
  const dialog = useRef<HTMLDialogElement>(null);
  const clock = useRef<HTMLElement>(null);
  const run = useRef<HTMLElement>(null);
  const state = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  useSyncExternalStore(subscribe, getVersion, () => 0);

  useEffect(() => {
    start();
    if (process.env.NODE_ENV !== "production") demo();
    if (run.current) run.current.textContent = trace.id;
    const tick = () => {
      if (clock.current) clock.current.textContent = fmt(elapsed());
    };
    const id = setInterval(tick, 1000);
    const paint = () => {
      if (state.current) state.current.textContent = trace.item ? `${trace.state} / ${trace.item}` : trace.state;
    };
    const off = subscribe(paint);
    const key = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key.toLowerCase() !== "t" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (el.closest("input, textarea, select, [contenteditable]")) return;
      toggle();
    };
    window.addEventListener("keydown", key);
    return () => {
      clearInterval(id);
      off();
      window.removeEventListener("keydown", key);
    };
  }, []);

  const toggle = () => {
    const d = dialog.current;
    if (!d) return;
    if (d.open) return d.close();
    setOpen(true);
    d.showModal();
    lock(true);
  };

  const times = open ? dwellTimes() : [];
  const max = times[0]?.[1] ?? 1;

  return (
    <>
      <button type="button" className="trace mono" data-theme="dark" aria-label="Open the log of this visit" onClick={toggle}>
        <span aria-hidden="true">
          Run <b ref={run}>0000</b>
        </span>
        <span className="mid" aria-hidden="true">
          State <b ref={state}>INIT</b>
        </span>
        <span aria-hidden="true">
          T+<b ref={clock}>00:00</b> · Scroll <b data-scroll>000%</b>
        </span>
      </button>

      <dialog
        ref={dialog}
        className="drawer mono"
        aria-label="Log of this visit"
        onClose={() => {
          setOpen(false);
          lock(false);
        }}
      >
        <div className="drawer-hd">
          <span>
            Run <b style={{ color: "var(--fg)" }}>{trace.id}</b> · this visit, kept in this tab only · nothing is sent anywhere
          </span>
          <button type="button" onClick={() => dialog.current?.close()} style={{ color: "var(--fg)" }}>
            Close (T)
          </button>
        </div>
        {open && (
          <div className="drawer-grid">
            <div>
              <p style={{ marginBottom: 8 }}>Time per stop</p>
              <ul className="bars">
                {times.slice(0, 8).map(([k, s], i) => (
                  <li key={k} className={i === 0 ? "max" : ""}>
                    <span>{k}</span>
                    <i style={{ transform: `scaleX(${Math.max(0.02, s / max)})` }} />
                    <span>{fmt(s)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p style={{ marginBottom: 8 }}>Events · newest first</p>
              <table className="log">
                <tbody>
                  {[...trace.events]
                    .reverse()
                    .slice(0, 60)
                    .map((e, i) => (
                      <tr key={i}>
                        <td>{fmt(e.t)}</td>
                        <td>{e.type}</td>
                        <td>{e.label}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

"use client";

import { createDrawable } from "animejs/svg";
import { createTimeline } from "animejs/timeline";
import { set, stagger } from "animejs/utils";
import { useEffect, useRef, useState } from "react";
import { inbox, intents, links } from "@/content/site";
import { log } from "@/lib/trace";

type Phase = "idle" | "sending" | "sent" | "failed";
const MAX = 2000;

// A message box that lands in the inbox. Without scripts it is a plain form that posts to the same relay.
// Only what is typed is sent. If the relay fails, the same message is offered as a mail link, so nothing typed is lost.
export default function MessageBox() {
  const box = useRef<HTMLFormElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState(0);
  const [mailto, setMailto] = useState("");

  // the card builds itself the first time it comes on screen: the frame draws, then the parts drop in
  useEffect(() => {
    const el = box.current!;
    if (!matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
    const parts = el.querySelectorAll("[data-b]");
    const chips = el.querySelectorAll(".chip");
    const frame = createDrawable(el.querySelectorAll(".mb-frame rect"));
    set(parts, { opacity: 0 });
    set(chips, { scale: 0 });
    set(frame, { draw: "0 0" });
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        createTimeline({ defaults: { ease: "outExpo" } })
          .add(frame, { draw: "0 1", duration: 900, ease: "inOutQuart" })
          .add(parts, { opacity: [0, 1], y: [26, 0], duration: 700, delay: stagger(70) }, 150)
          .add(chips, { scale: [0, 1], duration: 700, delay: stagger(60), ease: "outElastic(1, .6)" }, 300);
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const d = Object.fromEntries(new FormData(f)) as Record<string, string>;
    if (d._honey) return; // only a bot fills the hidden field
    const subject = `Portfolio · ${d.about} · ${d.name}`;
    setMailto(`mailto:${links.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${d.message}\n\n${d.name}\n${d.email}`)}`);
    setPhase("sending");
    try {
      const r = await fetch(inbox.ajax, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: d.name, email: d.email, about: d.about, message: d.message, _subject: subject, _template: "table", _captcha: "false" }),
      });
      const j = await r.json();
      if (!r.ok || String(j.success) !== "true") throw new Error(j.message);
      const b = f.querySelector(".mb-send")!.getBoundingClientRect();
      setPhase("sent");
      setCount(0);
      f.reset();
      log("message.sent", d.about);
      window.dispatchEvent(new CustomEvent("gomu:toss", { detail: { x: b.left + b.width / 2, y: b.top + b.height / 2 } }));
    } catch {
      setPhase("failed");
    }
  }

  const busy = phase === "sending";
  return (
    <form
      className="mb"
      ref={box}
      data-theme="dark"
      data-item="Message box"
      action={inbox.post}
      method="post"
      onSubmit={send}
      onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === "Enter" && e.currentTarget.requestSubmit()}
    >
      <svg className="mb-frame" aria-hidden="true" focusable="false">
        <rect width="100%" height="100%" />
      </svg>
      <div className="mb-hd mono" data-b>
        <span>
          <i />
          New message
        </span>
        <span>To Ayush</span>
      </div>

      {phase === "sent" ? (
        <div className="mb-done" role="status">
          <p className="display">Sent</p>
          <p className="aside">It is in my inbox. I reply by email.</p>
          <button type="button" className="pill" onClick={() => setPhase("idle")}>
            Write another
          </button>
        </div>
      ) : (
        <>
          <fieldset className="mb-chips" data-b>
            <legend className="mono">About</legend>
            {intents.map((t, i) => (
              <label className="chip" key={t}>
                <input type="radio" name="about" value={t} defaultChecked={i === 0} />
                <span>{t}</span>
              </label>
            ))}
          </fieldset>
          <div className="mb-two">
            <label className="fld" data-b>
              <span className="mono">Name</span>
              <input name="name" required maxLength={80} autoComplete="name" placeholder="Who is writing" />
            </label>
            <label className="fld" data-b>
              <span className="mono">Email</span>
              <input name="email" type="email" required maxLength={120} autoComplete="email" placeholder="Where I reply" />
            </label>
          </div>
          <label className="fld" data-b>
            <span className="mono">Message</span>
            <textarea name="message" required rows={4} maxLength={MAX} placeholder="Say hello" onChange={(e) => setCount(e.target.value.length)} />
          </label>
          <input className="mb-honey" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <input type="hidden" name="_subject" value="Portfolio message" />
          <div className="mb-ft" data-b>
            <span className="mono">
              {count} / {MAX}
              <span className="keys"> · Ctrl ↵ sends</span>
            </span>
            <button className="mb-send" disabled={busy}>
              <span>{busy ? "Sending" : "Send"}</span>
              <i aria-hidden="true">↗</i>
            </button>
          </div>
          <p className="mb-note mono" role="status">
            {phase === "failed" ? (
              <>
                That did not go through.{" "}
                <a href={mailto} data-cursor="src">
                  Send it from your mail app ↗
                </a>
              </>
            ) : (
              "Only what you type is sent · relayed by FormSubmit"
            )}
          </p>
        </>
      )}
    </form>
  );
}

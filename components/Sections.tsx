import { about, chain, diff, experience, hero, indexRows, links, loop, projects, rules, statement, upstream } from "@/content/site";
import Builder from "./Builder";
import { Plate, RuleDiagram } from "./Diagrams";
import Field from "./Field";
import { CopyEmail, Meter, PuneTime, RunFacts, RunSummary } from "./Live";
import MessageBox from "./MessageBox";

const num = (i: number) => String(i + 1).padStart(2, "0");
const day = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const ext = { target: "_blank", rel: "noreferrer" } as const;
const css = (v: Record<string, string | number>) => v as React.CSSProperties;

function Label({ left, right }: { left: string; right: string }) {
  return (
    <div className="label mono">
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}

// Text that rolls over on hover: the copy underneath comes up to replace it.
function Roll({ children }: { children: string }) {
  return (
    <span className="roll-clip">
      <span className="roll" data-text={children}>
        {children}
      </span>
    </span>
  );
}

// A strip that keeps moving; Motion.tsx drives it and lets scroll speed push it along.
function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const run = (hidden: boolean) => (
    <div className="marquee-run" aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <span key={t} className="marquee-item">
          {t}
          <i className="sq" aria-hidden="true" />
        </span>
      ))}
    </div>
  );
  return (
    <div className={`marquee ${className}`} data-marquee>
      <div className="marquee-track">
        {run(false)}
        {run(true)}
        {run(true)}
        {run(true)}
      </div>
    </div>
  );
}

/* ───────── 00 INIT ───────── */
export function Hero() {
  return (
    <section id="top" className="hero" data-theme="dark" data-state="INIT">
      <Field />
      <div className="hero-word">
        <h1 className="wordmark" aria-label="Ayush Gade">
          {["Ayush", "Gade"].map((w) => (
            <span className="wm-line" aria-hidden="true" key={w}>
              {[...w].map((c, i) => (
                <span className="ch" key={i}>
                  {c}
                </span>
              ))}
            </span>
          ))}
        </h1>
        {/* three nodes in orbit around the name; they pass behind it on the far side */}
        <div className="orbit" aria-hidden="true" data-orbit>
          <i />
          <i />
          <i className="sig" />
        </div>
      </div>
      <div className="hero-foot">
        <div>
          <p className="caption" data-in>
            {hero.caption}
          </p>
          <p className="aside" data-in>
            {hero.aside}
          </p>
        </div>
        <div className="hero-cta">
          <span className="mono status" data-in>
            <i />
            Pune · <PuneTime /> IST
          </span>
          <a className="badge" href="#contact" data-in data-magnetic aria-label="Get in touch">
            <svg viewBox="0 0 120 120" aria-hidden="true" data-spin>
              <defs>
                <path id="ring" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
              </defs>
              <text>
                <textPath href="#ring" textLength="286">
                  GET IN TOUCH · GET IN TOUCH ·
                </textPath>
              </text>
            </svg>
            <span className="badge-core" aria-hidden="true">
              ↘
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

export function Statement() {
  return (
    <section className="sec statement" data-theme="dark" aria-label="What I do">
      <p data-scrub>{statement}</p>
    </section>
  );
}

// design.md's marquee, re-purposed: what the work is made of, as nodes on one edge, travelling with the scroll.
export function Chain() {
  return (
    <section className="sec chain" data-theme="dark" aria-label="What the work is made of" style={{ paddingInline: 0 }}>
      <div className="chain-track" data-chain>
        {chain.map((w, i) => (
          <span key={w} style={{ display: "contents" }}>
            <span className="display chain-word">{w}</span>
            {i < chain.length - 1 && <i className="chain-edge" aria-hidden="true" />}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ───────── 01 EXPERIENCE ───────── */
export function Experience() {
  return (
    <section id="experience" className="sec" data-theme="light" data-state="EXPERIENCE">
      <Label left="01 — Experience" right={experience.meta} />
      <div className="head">
        <h2 className="display clipx" data-lock style={css({ "--n": 6 })}>
          Pluvus
        </h2>
        <div>
          <p className="aside" data-reveal>
            {experience.aside}
          </p>
          <p className="body" data-reveal>
            {experience.intro}
          </p>
        </div>
      </div>
      <Marquee items={experience.stack} className="marquee-sm" />
      <div className="index-hd">
        <h3 className="title">How I build</h3>
        <p className="mono">Three rules, drawn</p>
      </div>
      <ol className="rows">
        {rules.map((r, i) => (
          <li className="rule" key={r.title} data-item={`Rule ${num(i)}`} data-come={i % 2 ? "right" : "left"}>
            <div className="numeral" aria-hidden="true">
              <span data-roll>{num(i)}</span>
            </div>
            <div>
              <h3 className="title">{r.title}</h3>
              <p className="body">{r.body}</p>
              <p className="mono src">{r.tag}</p>
            </div>
            <RuleDiagram i={i} alt={r.alt} />
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ───────── 02 WORK ───────── */
export function Work() {
  return (
    <section id="work" className="sec" data-theme="dark" data-state="WORK">
      <Label left="02 — Work" right={`${projects.length} builds · ${indexRows.length} more in the index`} />
      <div className="head">
        <h2 className="display clipx" data-lock style={css({ "--n": 4 })}>
          Work
        </h2>
        <p className="aside" data-reveal>
          Four builds. Each lists its gaps.
        </p>
      </div>

      <div className="sheets" data-sheets>
        {projects.map((p, i) => (
          <article className="sheet" key={p.key} data-item={p.name} data-sheet>
            <div className="sheet-tab mono" aria-hidden="true">
              <span>
                {num(i)} / {num(projects.length - 1)}
              </span>
              <b>{p.name}</b>
            </div>
            <div className="sheet-in">
              <header className="sheet-hd">
                <div className="numeral" aria-hidden="true">
                  <span data-roll>{num(i)}</span>
                </div>
                <div className="sheet-meta mono">{p.meta}</div>
                <h3
                  className="display sheet-name"
                  style={css({ "--n": p.name.length, "--w": Math.max(...p.name.split(" ").map((w) => w.length)) })}
                >
                  {p.name}
                </h3>
                <div className="sheet-pills">
                  {p.pills.map((pl) => (
                    <a className="pill" href={pl.href} {...ext} key={pl.label} data-cursor="src" data-src={`${p.name} · ${pl.label.toLowerCase()}`}>
                      <Roll>{`${pl.label} ↗`}</Roll>
                    </a>
                  ))}
                </div>
              </header>
              <div className="sheet-bd">
                <div>
                  <p className="lead">{p.what}</p>
                  <div className="gaps">
                    <h4 className="mono">Known gaps</h4>
                    <ul>
                      {p.gaps.map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <figure className="plate">
                  <figcaption className="cap mono">
                    Fig. {num(i)} — {p.fig}
                  </figcaption>
                  <Plate k={p.key} />
                </figure>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="index-hd">
        <h3 className="title">Index</h3>
        <p className="mono">Everything else, with where it came from</p>
      </div>
      <ul className="rows">
        {indexRows.map((r, i) => {
          const row = (
            <>
              <span className="mono">{r.year}</span>
              <span className="name">{r.name}</span>
              <span className="line">{r.line}</span>
              <span className="mono origin">{r.origin}</span>
              <span className="mono go">{r.href ? "Repo ↗" : "Private"}</span>
            </>
          );
          return (
            <li key={r.name} data-come={i % 2 ? "right" : "left"}>
              {r.href ? (
                <a className="irow" href={r.href} {...ext} data-cursor="src" data-src={`${r.name} · repo`}>
                  {row}
                </a>
              ) : (
                <div className="irow">{row}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ───────── 03 OPEN SOURCE ───────── */
export function Upstream() {
  const f = upstream.featured;
  return (
    <section id="upstream" className="sec" data-theme="dark" data-state="OPEN SOURCE">
      <Label left="03 — Open source" right={`Layer5 · ${upstream.merged} merged · ${upstream.open} in review`} />
      <div className="head">
        <h2 className="display clipx" data-lock style={css({ "--n": 8 })}>
          Upstream
        </h2>
        <div>
          <p className="aside" data-reveal>
            This demo runs on your scroll.
          </p>
          <p className="body" data-reveal>
            A scroll hook that kept re-attaching its own listener. Both versions are mounted here.
          </p>
        </div>
      </div>
      <div className="fix" data-item="PR #8164">
        <div>
          <a className="mono src" href={f.url} {...ext} data-cursor="src" data-src="PR #8164">
            PR #{f.number} · merged {day(f.date)} · +{f.additions} −{f.deletions}
          </a>
          <h3 className="title">The flag never needed to be state</h3>
          <Meter />
          <p className="mono note">Batched rendering usually hides the churn. The fix does not rely on that.</p>
        </div>
        <pre className="diff" aria-label="The change, as merged" tabIndex={0}>
          {diff.map((l, i) => (
            <span key={i} className={l[0] === "+" ? "add" : l[0] === "-" ? "del" : undefined}>
              {l}
            </span>
          ))}
        </pre>
      </div>
      <ul className="ledger rows">
        {upstream.ledger.map((p, i) => (
          <li key={p.number} data-come={i % 2 ? "right" : "left"}>
            <a href={p.url} {...ext} data-cursor="src" data-src={`PR #${p.number}`}>
              <span className="mono">#{p.number}</span>
              <span>{p.text}</span>
              <span className="mono when">{day(p.date)}</span>
              <span className={`mono st ${p.state}`}>{p.state === "merged" ? "Merged" : p.state === "open" ? "In review" : "Closed"}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────── 04 ABOUT ───────── */
export function About() {
  return (
    <section id="about" className="sec about" data-theme="light" data-state="ABOUT">
      <Label left="04 — About" right="Pune, India · UTC+5:30" />
      <div className="head">
        <h2 className="display clipx" data-lock style={css({ "--n": 5 })}>
          About
        </h2>
        <p className="aside" data-reveal>
          {about.bio}
        </p>
      </div>
      <div className="about-grid">
        {/* the bio, as blocks that keep building the next word */}
        <figure className="build" data-item="The loop">
          <figcaption className="mono">Fig. — the loop</figcaption>
          <Builder words={loop} />
        </figure>
        <ul className="paper rows">
          {about.paper.map((r, i) => (
            <li key={r.k} data-come={i % 2 ? "right" : "left"}>
              <span className="mono src">{r.k}</span>
              <span className="v">{r.v}</span>
            </li>
          ))}
        </ul>
      </div>
      <Marquee items={about.tools} className="marquee-lg" />
    </section>
  );
}

/* ───────── 05 CONTACT ───────── */
export function Contact() {
  const row = (label: string, value: string, href: string) => (
    <li>
      <a href={href} {...ext} data-src={label} data-cursor="src">
        <span>{label}</span>
        <span>{value} ↗</span>
      </a>
    </li>
  );
  return (
    <section id="contact" className="sec contact" data-theme="signal" data-state="CONTACT">
      <Label left="05 — Contact" right="Run complete" />
      <h2 className="display clipx" data-lock>
        Say <br className="br-sm" />
        hello
      </h2>
      <div className="sum">
        <MessageBox />
        <div className="side">
          <RunSummary />
          <ul className="kv">
            <li>
              <CopyEmail />
            </li>
            {row("GitHub", "ayushgade06", links.github)}
            {row("LinkedIn", "ayushgade", links.linkedin)}
            {row("Résumé", "PDF", links.resume)}
          </ul>
          <RunFacts />
        </div>
      </div>
      <footer className="foot mono">
        <span>© 2026 Ayush Gade</span>
        <span>
          Built from commit {process.env.NEXT_PUBLIC_COMMIT} · {process.env.NEXT_PUBLIC_BUILD_DATE}
        </span>
        <span>Mona Sans · Instrument Serif · Geist Mono</span>
      </footer>
    </section>
  );
}

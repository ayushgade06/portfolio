import { about, chain, diff, experience, hero, indexRows, links, projects, rules, statement, upstream } from "@/content/site";
import { Plate, RuleDiagram } from "./Diagrams";
import Field from "./Field";
import { CopyEmail, Meter, PuneTime, RunFacts, RunSummary } from "./Live";

const num = (i: number) => String(i + 1).padStart(2, "0");
const day = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const ext = { target: "_blank", rel: "noreferrer" } as const;
const SQL = "WHERE state = expected";

function Label({ left, right }: { left: string; right: string }) {
  return (
    <div className="label mono">
      <span>{left}</span>
      <span>{right}</span>
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
          <a className="pill" href="#contact" data-in data-magnetic>
            Get in touch
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

// design.md's marquee, re-purposed: the workflow as nodes on one edge, travelling with the scroll.
export function Chain() {
  return (
    <section className="sec chain" data-theme="dark" aria-label="The workflow, end to end" style={{ paddingInline: 0 }}>
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
        <h2 className="display clipx" data-lock style={{ "--n": 6 } as React.CSSProperties}>
          Pluvus
        </h2>
        <div>
          <p className="aside" data-reveal>
            {experience.aside}
          </p>
          <p className="body" data-reveal>
            {experience.intro[0]}
            <b>{experience.intro[1]}</b>
            {experience.intro[2]}
          </p>
        </div>
      </div>
      <ol className="rows">
        {rules.map((r, i) => (
          <li className="rule" key={r.title} data-item={`Rule ${num(i)}`}>
            <div className="numeral" data-num aria-hidden="true">
              {num(i)}
            </div>
            <div>
              <h3 className="title">{r.title}</h3>
              <p className="body">
                {r.body.split(SQL).flatMap((t, k) => (k ? [<code key={k}>{SQL}</code>, t] : [t]))}
              </p>
              <p className="mono src private">{r.tag}</p>
            </div>
            <RuleDiagram i={i} alt={r.alt} />
          </li>
        ))}
      </ol>
      <p className="mono stackline">{experience.stack}</p>
    </section>
  );
}

/* ───────── 02 WORK ───────── */
export function Work() {
  return (
    <section id="work" className="sec" data-theme="dark" data-state="WORK">
      <Label left="02 — Work" right={`${projects.length} selected · ${indexRows.length} more in the index`} />
      <div className="head">
        <h2 className="display clipx" data-lock style={{ "--n": 4 } as React.CSSProperties}>
          Work
        </h2>
        <div>
          <p className="aside" data-reveal>
            Each one lists what it doesn&rsquo;t do yet.
          </p>
          <p className="caption" data-reveal>
            Built outside the day job. Sorted by how much of the thinking is mine.
          </p>
        </div>
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
                <div className="numeral" data-num aria-hidden="true">
                  {num(i)}
                </div>
                <div className="sheet-meta mono">
                  {p.meta.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
                <h3
                  className="display sheet-name"
                  style={{ "--n": p.name.length, "--w": Math.max(...p.name.split(" ").map((w) => w.length)) } as React.CSSProperties}
                >
                  {p.name}
                </h3>
                <div className="sheet-pills">
                  {p.pills.map((pl) =>
                    pl.href ? (
                      <a className="pill" href={pl.href} {...ext} key={pl.label} data-cursor="Src ↗" data-src={`${p.name} · source`}>
                        {pl.label} ↗
                      </a>
                    ) : (
                      <span className="pill q" key={pl.label}>
                        {pl.label}
                      </span>
                    ),
                  )}
                </div>
              </header>
              <div className="sheet-bd">
                <div>
                  <h4 className="mono">What it is</h4>
                  <p className="body">
                    {p.what[0]}
                    <b>{p.what[1]}</b>
                  </p>
                  <h4 className="mono">The part worth reading</h4>
                  <p className="body">{p.part}</p>
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
                  <span className="cap2 mono" aria-hidden="true">
                    Drawn from the code
                  </span>
                </figure>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="index-hd">
        <h3 className="title">Index</h3>
        <p className="mono">Everything else that is mine, with where it came from</p>
      </div>
      <ul className="rows">
        {indexRows.map((r) => {
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
            <li key={r.name}>
              {r.href ? (
                <a className="irow" href={r.href} {...ext} data-cursor="Src ↗" data-src={`${r.name} · repo`}>
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
        <h2 className="display clipx" data-lock style={{ "--n": 8 } as React.CSSProperties}>
          Upstream
        </h2>
        <div>
          <p className="aside" data-reveal>
            The demo below is running on this page&rsquo;s scroll.
          </p>
          <p className="body" data-reveal>
            A scroll hook on layer5.io kept its throttle flag in React state, and in its effect&rsquo;s dependency list. Each
            time a render lands between the flag&rsquo;s two flips, the listener is torn down and attached again. Both versions
            are mounted here. Scroll, and watch the left number.
          </p>
        </div>
      </div>
      <div className="fix" data-item="PR #8164">
        <div>
          <a className="mono src" href={f.url} {...ext} data-cursor="Src ↗" data-src="PR #8164">
            PR #{f.number} · merged {day(f.date)} 2026 · +{f.additions} −{f.deletions}
          </a>
          <h3 className="title">A throttle flag that lived in state</h3>
          <p className="body">
            The flag flips twice a frame and nothing on screen reads it, so it never needed to be state. Moving it into a
            local variable is the whole fix: one listener, attached once.
          </p>
          <Meter />
          <p className="mono" style={{ marginTop: 8, textTransform: "none", letterSpacing: "0.02em" }}>
            Under React&rsquo;s batched rendering the two flips often land in one batch and the churn hides. The fix does not
            depend on that.
          </p>
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
        {upstream.ledger.map((p) => (
          <li key={p.number}>
            <a href={p.url} {...ext} data-cursor="Src ↗" data-src={`PR #${p.number}`}>
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
    <section id="about" className="sec" data-theme="light" data-state="ABOUT">
      <Label left="04 — About" right="Pune, India · UTC+5:30" />
      <div className="head">
        <h2 className="display clipx" data-lock style={{ "--n": 5 } as React.CSSProperties}>
          About
        </h2>
        <p className="aside" data-reveal>
          The short version, with sources.
        </p>
      </div>
      <div className="about-grid">
        <div className="bio body">
          {about.bio.map((p) => (
            <p key={p} data-reveal>
              {p}
            </p>
          ))}
        </div>
        <div>
          <h3 className="mono" style={{ paddingBottom: 10 }}>
            On paper
          </h3>
          <ul className="paper">
            {about.paper.map((r) => (
              <li key={r.k}>
                {r.href ? (
                  <a className="mono src" href={r.href} {...ext} data-cursor="Src ↗" data-src={r.k}>
                    {r.k} ↗
                  </a>
                ) : (
                  <span className={`mono src${r.public ? "" : " private"}`}>{r.k}</span>
                )}
                <span className="v">{r.v}</span>
              </li>
            ))}
          </ul>
          <div className="minor">
            <div>
              <h3 className="mono">Currently</h3>
              {about.currently.map((c) => (
                <p className="body" key={c}>
                  {c}
                </p>
              ))}
            </div>
            <div>
              <h3 className="mono">Tools</h3>
              <p className="body">{about.tools}</p>
            </div>
          </div>
          <p className="mono legend">
            <span className="src">A filled square opens a public source.</span>
            <span className="src private">A hollow one is private work, described.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ───────── 05 CONTACT ───────── */
export function Contact() {
  return (
    <section id="contact" className="sec contact" data-theme="signal" data-state="CONTACT">
      <Label left="05 — Contact" right="Run complete" />
      <h2 className="display clipx" data-lock>
        Say <br className="br-sm" />
        hello
      </h2>
      <div className="sum">
        <RunSummary />
        <ul className="kv">
          <li>
            <CopyEmail />
          </li>
          <li>
            <a href={links.github} {...ext} data-src="GitHub">
              <span>GitHub</span>
              <span>ayushgade06 ↗</span>
            </a>
          </li>
          <li>
            <a href={links.linkedin} {...ext} data-src="LinkedIn">
              <span>LinkedIn</span>
              <span>ayushgade ↗</span>
            </a>
          </li>
          <li>
            <a href={links.leetcode} {...ext} data-src="LeetCode">
              <span>LeetCode</span>
              <span>ayush_gade ↗</span>
            </a>
          </li>
          <li>
            <a href={links.resume} {...ext} data-src="Résumé">
              <span>Résumé</span>
              <span>PDF ↗</span>
            </a>
          </li>
        </ul>
        <RunFacts />
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

// Every word on the site lives here. One place to correct a fact.
import upstreamData from "./upstream.json";

export const states = [
  { id: "top", n: "00", label: "Ayush Gade", state: "INIT" },
  { id: "experience", n: "01", label: "Experience", state: "EXPERIENCE" },
  { id: "work", n: "02", label: "Work", state: "WORK" },
  { id: "upstream", n: "03", label: "Open source", state: "OPEN SOURCE" },
  { id: "about", n: "04", label: "About", state: "ABOUT" },
  { id: "contact", n: "05", label: "Contact", state: "CONTACT" },
] as const;

export const links = {
  email: "ayushgade23@gmail.com",
  github: "https://github.com/ayushgade06",
  linkedin: "https://www.linkedin.com/in/ayushgade/",
  leetcode: "https://leetcode.com/u/ayush_gade/",
  resume: "https://drive.google.com/file/d/18tI9mzD41MlUAsCMoyRbQcwmYLRq_PSj/view?usp=sharing",
};

export const hero = {
  caption: "Engineer on the unglamorous half of AI products: state, retries, guards, and the hand-off to a human.",
  aside: "Third-year at PICT Pune. Founding engineering intern at Pluvus.",
};

export const statement =
  "Most of an AI product is not the model. It is the state machine around it, the retries, the guard that stops a wrong number leaving the building, and the queue where a person takes over. That is the part I build.";

export const chain = ["Outreach", "Follow-up", "Read the reply", "Negotiate", "Escalate", "Agree", "Onboard"];

export const experience = {
  meta: "Founding engineering intern · Jun 2026 → now · remote",
  aside: "Four months in, these are the rules I'd keep.",
  intro: [
    "Pluvus runs creator campaigns with AI agents: outreach, negotiation, onboarding. I wrote the first version of the engine underneath — ",
    "a state machine, a queue, a scheduler",
    " — and have been building on it since.",
  ],
  stack: "TypeScript · React · Node · PostgreSQL · Redis queues · Python · LangGraph",
};

export const rules = [
  {
    title: "The model is an untrusted advisor",
    body: "Deterministic checks run before it and after it. When a guard is too strict, widen what counts as authorised by source. Never loosen the scan.",
    tag: "Guards · output allow-lists",
    alt: "A reply enters, passes a gate, the model, then a guard, and leaves as an email. The guard can divert it to a human.",
  },
  {
    title: "The lock is an optimisation",
    body: "The conditional write is the guarantee. Two workers can both believe they hold the lock; only one WHERE state = expected succeeds. The loser is a no-op.",
    tag: "Optimistic concurrency · fencing tokens",
    alt: "Two workers race to update one record. Worker A's write moves the version from 41 to 42. Worker B's write matches nothing and is a no-op.",
  },
  {
    title: "Make the leak a type error",
    body: "One context builder, two views. The view that writes the email has no field for the private limit, so it cannot be passed by mistake.",
    tag: "Typed projections · golden tests",
    alt: "One context splits into two views. The decide view carries the private limit. The write view has no such field.",
  },
  {
    title: "No quote, no value",
    body: "The model fills a loose form. A value is accepted only when its supporting quote is found in the source. The output is a list of candidates with evidence; a person applies them.",
    tag: "Grounded extraction",
    alt: "Two values extracted from a source document. The one whose quote is found in the source is accepted. The one with no quote is dropped.",
  },
  {
    title: "If it can't be made safe, delete it",
    body: "A page fetcher had a headless-browser fallback. I could not close the request-forgery path through it, so the fallback is gone and the limit is written down.",
    tag: "Bounded crawling · every redirect hop checked",
    alt: "A URL is fetched through redirect hops, each one checked. A browser fallback branch is crossed out and marked removed.",
  },
];

export type Pill = { label: string; href?: string };

export const projects = [
  {
    key: "negotiation",
    name: "Negotiation workflow",
    meta: ["Backend · Jun 2026 · solo · a day's work", "Node · Express · MongoDB · local model in JSON mode"],
    pills: [
      { label: "Take-home" },
      { label: "Source", href: "https://github.com/ayushgade06/creator-negotiation-workflow" },
    ] as Pill[],
    what: [
      "Reads a creator's message in a brand-deal negotiation and returns a decision and a draft reply. Written as a take-home for Pluvus, ",
      "the same month I started there.",
    ],
    part: "The model never decides. Six small model calls classify the message; an 84-line ordered rules file chooses approve, counter, or hand to a human. Every run appends an audit record.",
    gaps: ["Classifier calls run in series", "Manual test scripts, no runner", "One unauthenticated route", "Needs a local model, so no hosted demo"],
    fig: "The gate",
  },
  {
    key: "axiom",
    name: "Axiom",
    meta: ["Research pipeline · Sep 2026 · solo", "Python · PostgreSQL · WebSockets · two runtime dependencies"],
    pills: [{ label: "Private repo" }] as Pill[],
    what: [
      "A market-data and paper-trading pipeline built to answer one question honestly: does any of this make money after costs? ",
      "It never places a real order.",
    ],
    part: "Six pre-trade checks in a fixed order, each with a typed reason for saying no. Model-written proposals go through the same gate as everything else. 639 tests. The answer so far is no: 0 of 6 market regimes survive fees.",
    gaps: ["The model client is a stub; proposals were evaluated with a scripted stand-in", "Paper trading only", "No interface"],
    fig: "Six checks, first failure wins",
  },
  {
    key: "internly",
    name: "Internly",
    meta: ["Extension + web app · Jan 2026 · solo", "Manifest V3 · Next.js · Prisma · PostgreSQL"],
    pills: [{ label: "Not deployed" }, { label: "Source", href: "https://github.com/ayushgade06/internly" }] as Pill[],
    what: [
      "A tracker that notices when you are on a job-application page, records it, and keeps a dashboard in step — ",
      "including deletions made on either side.",
    ],
    part: "The sync. The extension pulls first, drops anything the server no longer has, then pushes. The server upserts on a composite key, so replaying a sync changes nothing.",
    gaps: ["Runs against localhost only; not published", "Edit and delete routes check the session, not the owner", "Page detection is tuned on one job site"],
    fig: "Two-way sync",
  },
  {
    key: "agroguard",
    name: "AgroGuard",
    meta: ["Full-stack app · Dec 2025 – Mar 2026", "FastAPI · PostgreSQL · React · six served models"],
    pills: [{ label: "Source", href: "https://github.com/ayushgade06/agroguard" }] as Pill[],
    what: [
      "Photograph a leaf, get a disease classification and next steps. Nearby users are alerted; a map shows weather-driven risk for 15 cities in Maharashtra. ",
      "The engineering is the plumbing, not the models.",
    ],
    part: "One endpoint routes each photo to one of four models, each with its own input contract. A detection fans out to every user within 15 km.",
    gaps: ["No training code or accuracy numbers in the repo", "One weather model, relabelled per crop", "Alerts load on page open, not pushed", "Not deployed"],
    fig: "Route, store, fan out",
  },
];

export const indexRows: { year: string; name: string; line: string; origin: string; href?: string }[] = [
  { year: "2026", name: "NetrAI", line: "Diabetic-retinopathy screening pipeline in MATLAB: nine stages, rule-based routing, first match wins.", origin: "Hackathon", href: "https://github.com/ayushgade06/NetrAI" },
  { year: "2026", name: "Katalyst", line: "Gamified learning platform, built with a team in one hackathon day.", origin: "Hackathon · team" },
  { year: "2026", name: "env-doctor", line: "Read-only CLI that diagnoses a dev environment: ten checks, JSON output, CI exit codes.", origin: "Own tool", href: "https://github.com/ayushgade06/env-doctor" },
  { year: "2026", name: "GraphRAG vs VectorRAG", line: "Dense and entity-graph retrieval written from scratch. The committed run indexes a quarter of the corpus: a harness, not yet a result.", origin: "Experiment", href: "https://github.com/ayushgade06/graphrag-vs-vectorrag" },
  { year: "2026", name: "ACIRA", line: "Log triage: anomaly score, attack-chain rules, a composite score and a local-model playbook, on synthetic logs.", origin: "Team project", href: "https://github.com/ayushgade06/acira" },
  { year: "2026", name: "secure-tx", line: "Envelope encryption — a per-record key wrapped by a master key — with tamper tests.", origin: "Take-home", href: "https://github.com/ayushgade06/secure-tx" },
  { year: "2026", name: "Compensation Intelligence", line: "Normalised pay-comparison API and a minimal interface.", origin: "Take-home", href: "https://github.com/ayushgade06/compensation-intelligence" },
  { year: "2026", name: "tap2eat", line: "Canteen pre-order: payment signature check, a 30-minute QR token, staff scan. The backend is mine.", origin: "College · two people", href: "https://github.com/ayushgade06/tap2eat" },
  { year: "2026", name: "RTCMeet", line: "Mesh WebRTC calls. The base is from a course; my part is the ICE-candidate race fix and the move off deprecated stream APIs.", origin: "Course base + fixes", href: "https://github.com/ayushgade06/rtcmeet" },
  { year: "2025", name: "StaySphere", line: "Listings, reviews, uploads and a map, server-rendered.", origin: "Course project", href: "https://github.com/ayushgade06/staysphere" },
];

const upstreamText: Record<number, string> = {
  8132: "“Vacant” maintainers rendered as links back to the same page",
  8140: "A stray character on every course overview page",
  8148: "Broken links in the contributor docs",
  8150: "A build warning traced to webpack reading externals before aliases",
  8163: "Back arrows invisible in dark mode",
  8162: "A stray border on a callout card",
};

export const upstream = {
  featured: upstreamData.find((p) => p.number === 8164)!,
  ledger: upstreamData.filter((p) => p.number !== 8164).map((p) => ({ ...p, text: upstreamText[p.number] })),
  merged: upstreamData.filter((p) => p.state === "merged").length,
  open: upstreamData.filter((p) => p.state === "open").length,
};

// The fix, verbatim from the pull request. "-" removed, "+" added, " " context.
export const diff = [
  " const [scrollPosition, setScrollPosition] = useState(0);",
  "-const [ticking, setTicking] = useState(false);",
  " ",
  " useEffect(() => {",
  "+  let ticking = false;",
  "+  const handleScroll = () => {",
  "+    if (!ticking) {",
  "+      ticking = true;",
  "+      window.requestAnimationFrame(() => {",
  "+        setScrollPosition(window.scrollY);",
  "+        ticking = false;",
  "+      });",
  "+    }",
  "+  };",
  '+  window.addEventListener("scroll", handleScroll, { passive: true });',
  '+  return () => window.removeEventListener("scroll", handleScroll);',
  "-}, [ticking]);",
  "+}, []);",
];

export const about = {
  bio: [
    "I'm a third-year IT student at PICT Pune and, since June 2026, a founding engineering intern at Pluvus, working on its workflow platform.",
    "In April 2025 I finished an introductory Python course. Between then and Pluvus: a full-stack course, a run of small projects of uneven quality (the index is honest about which), and a one-day take-home about keeping a negotiating model on a leash.",
    "How I work: I write the spec, an AI coding agent writes much of the code, and I trust neither of us. So there are tests that fail when the fix is reverted, golden files, and a “known gaps” section in my pull requests.",
  ],
  // public: true = a source anyone can open; false = private or first-person.
  paper: [
    { k: "PICT Pune", v: "B.Tech Information Technology, 2024–28 · CGPA 9.63", public: false },
    { k: "LeetCode", v: "370 solved · contest rating 1661, top 17% · C++", public: true, href: links.leetcode },
    { k: "Mastercard Code for Change 3.0", v: "Finalist team", public: false },
    { k: "Coursework", v: "Machine-learning courses on Coursera, 2026 · NPTEL Python for Data Science, 2025", public: false },
    { k: "Outside engineering", v: "TEDxPICT curations and branding · PICT Finance Society tech team, 2025–26", public: false },
  ],
  currently: ["Shipping at Pluvus.", "Sending small, measured fixes to Layer5."],
  tools: "TypeScript · Python · React · Node · PostgreSQL · Redis · C++",
};

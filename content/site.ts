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
  resume: "https://drive.google.com/file/d/18tI9mzD41MlUAsCMoyRbQcwmYLRq_PSj/view?usp=sharing",
};

export const hero = {
  caption: "State, retries, guards, and the hand-off to a human.",
  aside: "Third-year at PICT Pune. Founding engineering intern at Pluvus.",
};

export const statement =
  "Most of an AI product is not the model. It is the state machine around it, the retries, the guard that stops a wrong answer leaving the building, and the queue where a person takes over. That is the part I build.";

// Generic on purpose: what the work is made of, not what any employer's product does.
export const chain = ["State", "Retries", "Guards", "Queues", "Evidence", "A human in the loop"];

// Kept to what is already public on the resume. Nothing about how the product works inside.
export const experience = {
  meta: "Jun 2026 → now · remote",
  aside: "Founding engineering intern.",
  intro: "Backend, frontend and AI workflows.",
  stack: ["TypeScript", "React", "Node.js", "Express", "PostgreSQL", "Python", "LangGraph", "LLMs"],
};

// How I build, in general terms. Each has a diagram, in the same order, in Diagrams.tsx.
export const rules = [
  {
    title: "The model is an untrusted advisor",
    body: "Deterministic checks before it and after it.",
    tag: "Guards",
    alt: "An input passes a gate, the model, then a guard, and leaves as an output. The guard can divert it to a human.",
  },
  {
    title: "The lock is an optimisation",
    body: "The conditional write is the guarantee. The loser is a no-op.",
    tag: "Optimistic concurrency",
    alt: "Two workers race to update one record. Worker A's write moves the version from 41 to 42. Worker B's write matches nothing and is a no-op.",
  },
  {
    title: "No quote, no value",
    body: "A value is kept only if its quote is in the source.",
    tag: "Grounded extraction",
    alt: "Two values extracted from a source document. The one whose quote is found in the source is accepted. The one with no quote is dropped.",
  },
];

export type Pill = { label: string; href?: string };

// In the order he wants them seen.
export const projects = [
  {
    key: "staysphere",
    name: "StaySphere",
    meta: "Full-stack · 2025 · Express · EJS · MongoDB",
    pills: [
      { label: "Live", href: "https://staysphere-backend-iw7z.onrender.com/listings" },
      { label: "Source", href: "https://github.com/ayushgade06/staysphere" },
    ] as Pill[],
    what: "List a place, find one, review it.",
    gaps: ["Built on a course project", "Server-rendered: no JSON API", "No tests"],
    fig: "One request, end to end",
  },
  {
    key: "rtcmeet",
    name: "RTCMeet",
    meta: "Realtime · 2026 · React · Socket.IO · WebRTC",
    pills: [{ label: "Source", href: "https://github.com/ayushgade06/rtcmeet" }] as Pill[],
    what: "Group video calls, peer to peer.",
    gaps: ["Mesh only: no media server", "Course base; the connection fixes are mine", "Deep links 404 when deployed"],
    fig: "Signal, then mesh",
  },
  {
    key: "internly",
    name: "Internly",
    meta: "Extension + web app · 2026 · Manifest V3 · Next.js · Prisma",
    pills: [{ label: "Source", href: "https://github.com/ayushgade06/internly" }] as Pill[],
    what: "Notices job applications as you make them, and keeps a dashboard in step.",
    gaps: ["Localhost only", "Routes check the session, not the owner", "Tuned on one job site"],
    fig: "Two-way sync",
  },
  {
    key: "agroguard",
    name: "AgroGuard",
    meta: "Full-stack · 2025–26 · FastAPI · PostgreSQL · React",
    pills: [{ label: "Source", href: "https://github.com/ayushgade06/agroguard" }] as Pill[],
    what: "Photograph a leaf, get the disease, warn farmers nearby.",
    gaps: ["No accuracy numbers in the repo", "One weather model, relabelled per crop", "Not deployed"],
    fig: "Route, store, fan out",
  },
];

export const indexRows: { year: string; name: string; line: string; origin: string; href?: string }[] = [
  { year: "2026", name: "Negotiation workflow", line: "The model classifies; an 84-line rules file decides.", origin: "Take-home", href: "https://github.com/ayushgade06/creator-negotiation-workflow" },
  { year: "2026", name: "Axiom", line: "Trading research pipeline. 639 tests. 0 of 6 regimes survive fees.", origin: "Own research" },
  { year: "2026", name: "NetrAI", line: "Retinopathy screening pipeline in MATLAB.", origin: "Hackathon", href: "https://github.com/ayushgade06/NetrAI" },
  { year: "2026", name: "Katalyst", line: "Gamified learning platform, built in a day.", origin: "Hackathon · team" },
  { year: "2026", name: "env-doctor", line: "CLI that diagnoses a dev environment.", origin: "Own tool", href: "https://github.com/ayushgade06/env-doctor" },
  { year: "2026", name: "GraphRAG vs VectorRAG", line: "Retrieval harness, from scratch. Not yet a result.", origin: "Experiment", href: "https://github.com/ayushgade06/graphrag-vs-vectorrag" },
  { year: "2026", name: "ACIRA", line: "Log triage on synthetic logs.", origin: "Team project", href: "https://github.com/ayushgade06/acira" },
  { year: "2026", name: "secure-tx", line: "Envelope encryption with tamper tests.", origin: "Take-home", href: "https://github.com/ayushgade06/secure-tx" },
  { year: "2026", name: "Compensation Intelligence", line: "Pay-comparison API.", origin: "Take-home", href: "https://github.com/ayushgade06/compensation-intelligence" },
  { year: "2026", name: "tap2eat", line: "Canteen pre-orders with QR pickup.", origin: "College · two people", href: "https://github.com/ayushgade06/tap2eat" },
];

const upstreamText: Record<number, string> = {
  8132: "“Vacant” maintainers linked back to the same page",
  8140: "A stray character on every course page",
  8148: "Broken links in the contributor docs",
  8150: "A build warning: webpack reads externals before aliases",
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
  bio: "I write the spec, an AI agent writes much of the code, and the tests keep us both honest.",
  paper: [
    { k: "PICT Pune", v: "B.Tech IT, 2024–28 · CGPA 9.63" },
    { k: "Mastercard Code for Change 3.0", v: "Finalist team" },
    { k: "Outside engineering", v: "TEDxPICT · PICT Finance Society" },
  ],
  tools: ["TypeScript", "Python", "React", "Node", "PostgreSQL", "C++"],
};

// The message box posts here (FormSubmit relays it to the inbox). The address is already public on the resume.
export const inbox = { post: `https://formsubmit.co/${links.email}`, ajax: `https://formsubmit.co/ajax/${links.email}` };
export const intents = ["A role", "A project", "Open source", "Just hi"];

// About: blocks build these, in a loop. Four letters each.
export const loop = ["SPEC", "CODE", "TEST", "SHIP"];

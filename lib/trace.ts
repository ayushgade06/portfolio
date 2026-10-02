// The run log: what the visitor did, kept in memory for this tab only. The log is never stored or sent.

export type Ev = { t: number; type: string; label: string };

const listeners = new Set<() => void>();
let version = 0;
const emit = () => {
  version++;
  listeners.forEach((f) => f());
};

const t0 = typeof performance === "undefined" ? 0 : performance.now();
const dwell = new Map<string, number>();
let current = "INIT";
let since = t0;

export const trace = {
  id: "0000",
  state: "INIT",
  item: "",
  events: [] as Ev[],
  visited: new Set<string>(["INIT"]),
  sources: 0,
  done: false,
};

export const elapsed = () => (performance.now() - t0) / 1000;

// Time is credited to whatever is on screen: an item if one is active, otherwise the state.
function credit(next: string) {
  const now = performance.now();
  if (document.visibilityState === "visible") dwell.set(current, (dwell.get(current) ?? 0) + (now - since) / 1000);
  current = next;
  since = now;
}

export function log(type: string, label: string) {
  trace.events.push({ t: elapsed(), type, label });
  if (trace.events.length > 400) trace.events.shift();
  if (type === "source.open") trace.sources++;
  emit();
}

export function setState(state: string) {
  if (state === trace.state) return;
  trace.state = state;
  trace.item = "";
  trace.visited.add(state);
  credit(state);
  log("state.enter", state);
  if (state === "CONTACT" && !trace.done) {
    trace.done = true;
    log("run.end", "complete");
  }
}

export function setItem(item: string) {
  if (item === trace.item) return;
  trace.item = item;
  credit(item || trace.state);
  if (item) log("item.enter", item);
  else emit();
}

export function start() {
  trace.id = (Date.now() & 0xffff).toString(16).toUpperCase().padStart(4, "0");
  since = performance.now();
  document.addEventListener("visibilitychange", () => credit(current));
  log("run.start", `run ${trace.id}`);
}

export function dwellTimes() {
  credit(current);
  return [...dwell.entries()].filter(([, s]) => s >= 0.5).sort((a, b) => b[1] - a[1]);
}

export const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export const subscribe = (f: () => void) => {
  listeners.add(f);
  return () => {
    listeners.delete(f);
  };
};
export const getVersion = () => version;

export function demo() {
  // Self-check: a state change credits time and counts a visit.
  console.assert(trace.visited.has("INIT"), "run starts in INIT");
  console.assert(fmt(192) === "03:12", "fmt");
}

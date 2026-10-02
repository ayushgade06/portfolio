// Visual QA: serves ./out and screenshots the page at four viewports, section by section.
// usage: node scripts/shots.mjs [viewport ...] [--reduced]     (after `npm run build`)
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { chromium } from "playwright";

const OUT = ".scratch/shots";
const BASE = process.env.BASE_PATH || "";
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json", ".txt": "text/plain" };

const server = createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length) || "/";
  if (p.endsWith("/")) p += "index.html";
  try {
    const body = await readFile(join("out", p));
    res.writeHead(200, { "content-type": types[extname(p)] || "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
}).listen(4173);

const viewports = {
  desktop: { width: 1440, height: 900 },
  laptop: { width: 1280, height: 720 },
  tablet: { width: 820, height: 1180, hasTouch: true },
  phone: { width: 390, height: 844, deviceScaleFactor: 2, hasTouch: true, isMobile: true },
};
const args = process.argv.slice(2);
const reduced = args.includes("--reduced");
const want = args.filter((a) => !a.startsWith("--"));
const stops = ["top", "statement", "chain", "experience", "rules", "work", "sheet2", "sheet4", "index", "upstream", "about", "contact", "end"];

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
for (const [name, vp] of Object.entries(viewports)) {
  if (want.length && !want.includes(name)) continue;
  const dir = `${OUT}/${name}${reduced ? "-reduced" : ""}`;
  await mkdir(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, ...vp, reducedMotion: reduced ? "reduce" : "no-preference" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`http://localhost:4173${BASE}/`, { waitUntil: "commit" });
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${dir}/00a-entrance.jpg`, type: "jpeg", quality: 72 });
  await page.waitForTimeout(3200);

  const y = (stop) =>
    page.evaluate((stop) => {
      const top = (sel, off = 0) => {
        const el = document.querySelector(sel);
        return el ? el.getBoundingClientRect().top + scrollY + off : null;
      };
      const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"));
      switch (stop) {
        case "top": return 0;
        case "statement": return top(".statement", innerHeight * 0.55);
        case "chain": return top(".chain", -innerHeight * 0.45);
        case "experience": return top("#experience", -nav);
        case "rules": return top(".rule:nth-child(2)", -nav - 40);
        case "work": return top("#work", -nav);
        case "sheet2": return top("[data-sheet]:nth-child(2)", -nav - 60);
        case "sheet4": return top("[data-sheet]:nth-child(4)", -nav - 150);
        case "index": return top(".index-hd", -nav - 20);
        case "upstream": return top("#upstream", -nav);
        case "about": return top("#about", -nav);
        case "contact": return top("#contact", -innerHeight * 0.55);
        case "end": return document.documentElement.scrollHeight;
      }
    }, stop);

  let i = 0;
  for (const stop of stops) {
    const target = await y(stop);
    if (target == null) continue;
    await page.evaluate((t) => window.scrollTo(0, t), target);
    await page.waitForTimeout(stop === "top" ? 300 : 1500);
    await page.screenshot({ path: `${dir}/${String(++i).padStart(2, "0")}-${stop}.jpg`, type: "jpeg", quality: 72 });
  }
  const info = await page.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    overflowX: document.documentElement.scrollWidth - innerWidth,
    nodes: document.querySelectorAll("*").length,
    state: document.querySelector(".trace")?.textContent,
  }));
  console.log(name, reduced ? "(reduced)" : "", JSON.stringify(info), errors.length ? `\n  ERRORS: ${errors.slice(0, 6).join("\n  ")}` : "· no console errors");
  await ctx.close();
}
await browser.close();
server.close();

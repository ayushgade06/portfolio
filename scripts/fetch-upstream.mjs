// Refreshes the state of the Layer5 pull requests shown in the Upstream ledger,
// so "merged / in review" on the site is whatever GitHub says at build time.
// If GitHub can't be reached the committed file is left as it is.
import { readFile, writeFile } from "node:fs/promises";

const FILE = new URL("../content/upstream.json", import.meta.url);
const numbers = [8164, 8132, 8140, 8148, 8150, 8163, 8162];
const headers = process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};

try {
  const prs = await Promise.all(
    numbers.map(async (n) => {
      const r = await fetch(`https://api.github.com/repos/layer5io/layer5/pulls/${n}`, { headers });
      if (!r.ok) throw new Error(`#${n}: HTTP ${r.status}`);
      const p = await r.json();
      return {
        number: n,
        state: p.merged_at ? "merged" : p.state === "open" ? "open" : "closed",
        date: (p.merged_at || p.created_at).slice(0, 10),
        url: p.html_url,
        additions: p.additions,
        deletions: p.deletions,
      };
    }),
  );
  const next = JSON.stringify(prs, null, 2) + "\n";
  const prev = await readFile(FILE, "utf8").catch(() => "");
  if (next !== prev) await writeFile(FILE, next);
  console.log(`upstream: ${prs.filter((p) => p.state === "merged").length} merged, ${prs.filter((p) => p.state === "open").length} open`);
} catch (e) {
  console.warn(`upstream: keeping committed data (${e.message})`);
}

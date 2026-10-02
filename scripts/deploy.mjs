// Builds for GitHub Pages and publishes ./out to the gh-pages branch.
// usage: npm run deploy
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

const sh = (cmd, opts = {}) => execSync(cmd, { stdio: "inherit", ...opts });
const read = (cmd) => execSync(cmd).toString().trim();

const remote = read("git remote get-url origin");
const repo = remote.replace(/\.git$/, "").split("/").pop();
const sha = read("git rev-parse --short HEAD");

sh("npm run build", { env: { ...process.env, BASE_PATH: `/${repo}` } });

// The generated branch has no history worth keeping: one commit, replaced on every deploy.
const out = { cwd: "out" };
sh("git init -q -b gh-pages", out);
sh("git add -A", out);
sh(`git commit -q -m "Deploy ${sha}"`, out);
sh(`git push -q -f "${remote}" gh-pages`, out);
rmSync("out/.git", { recursive: true, force: true });
console.log(`deployed ${sha} to gh-pages`);

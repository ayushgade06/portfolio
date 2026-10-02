import type { NextConfig } from "next";
import { execSync } from "node:child_process";

// Truthful footer: the commit and date this build was made from.
const git = (cmd: string) => {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
};

const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  // GitHub Pages serves the site under /portfolio; other hosts leave this unset.
  basePath: process.env.BASE_PATH || "",
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_COMMIT: git("git rev-parse --short HEAD") || "local",
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().slice(0, 10),
  },
};

export default config;

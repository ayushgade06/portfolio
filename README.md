# portfolio

Ayush Gade's portfolio — one page, six states: `INIT · EXPERIENCE · WORK · OPEN SOURCE · ABOUT · CONTACT`.

The idea: a site that behaves like the systems it describes. It has explicit state (the nav is a state machine with a token), it shows its sources, every project lists its known gaps, and it keeps a log of the visit in the browser and reads it back at the end. Nothing is sent anywhere; there is no analytics.

## Stack

- Next.js (App Router, static export), TypeScript, Tailwind CSS 4
- GSAP (`ScrollTrigger`, `SplitText`, `DrawSVG`) and Lenis for motion
- One hand-written WebGL fragment shader for the halftone field; every diagram is inline SVG
- Mona Sans (variable width axis), Instrument Serif, Geist Mono

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in ./out
npm run shots      # screenshots at four viewports into .scratch/shots (after a build)
```

`npm run build` first refreshes `content/upstream.json` from the GitHub API, so the open-source ledger shows whatever state the pull requests are really in.

## Where things are

| | |
|---|---|
| `content/site.ts` | every word on the site — one place to correct a fact |
| `components/Sections.tsx` | the six sections, as plain markup |
| `components/Motion.tsx` | everything that moves, set up once against that markup |
| `components/Diagrams.tsx` | the node-and-edge diagrams |
| `components/Trace.tsx`, `lib/trace.ts` | the visit log |
| `components/Field.tsx` | the shader |
| `components/Live.tsx` | the live pieces: clock, listener counter, run summary |

## Known gaps

- The cursor-following label and the letter response need a fine pointer; phones get neither.
- The halftone shader runs on desktop only; phones and reduced-motion get static dots.
- First-load JavaScript is about 196 kB gzipped, over the 170 kB the design aimed for.
- No automated tests beyond type-checking and the screenshot script.

## Deploy

`npm run deploy` builds with the repository name as base path and publishes `./out` to the `gh-pages` branch, which GitHub Pages serves. The base path comes from `BASE_PATH`, so any other static host works without changes.

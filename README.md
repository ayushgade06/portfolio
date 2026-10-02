# portfolio

Ayush Gade's portfolio — one page, six states: `INIT · EXPERIENCE · WORK · OPEN SOURCE · ABOUT · CONTACT`.

The idea: a site that behaves like the systems it describes. It has explicit state (the nav is a state machine with a token), it shows its sources, every project lists its known gaps, and it keeps a log of the visit in the browser and reads it back at the end. There is no analytics; the only thing that ever leaves the page is a message you type into the contact box and send.

A companion stands in the corner the whole way down: a rubber kid in a straw hat, drawn from scratch as one SVG (a homage, not official artwork). He runs while the page scrolls, changes form with each state, and stretches an arm across the screen to hit each title as it arrives.

## Stack

- Next.js (App Router, static export), TypeScript, Tailwind CSS 4
- GSAP (`ScrollTrigger`, `SplitText`, `DrawSVG`) and Lenis for the page's motion
- anime.js for the companion, the block builder in About and the message box
- FormSubmit relays the contact form to email; with scripts off it is a plain form posting to the same relay
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
| `components/Cursor.tsx` | the pointer character and its moods |
| `components/Gomu.tsx`, `components/gomuArt.ts`, `app/gomu.css` | the companion: his moves, his drawing, his six forms |
| `components/Builder.tsx` | blocks that keep building the next word |
| `components/MessageBox.tsx` | the contact form |

## Known gaps

- The avatar cursor (a small character with a blob behind it) and the letter response need a fine pointer; phones get neither.
- The companion's moves are skipped under reduced motion (he only changes form), and are lighter on phones.
- The contact form depends on a third-party relay; if it fails, the same message is offered as a mail link.
- The halftone shader runs on desktop only; phones and reduced-motion get static dots.
- The page references about 264 kB of JavaScript gzipped, well over the 170 kB the design aimed for; anime.js and the companion account for about 24 kB of it.
- No automated tests beyond type-checking and the screenshot script.

## Deploy

`npm run deploy` builds with the repository name as base path and publishes `./out` to the `gh-pages` branch, which GitHub Pages serves. The base path comes from `BASE_PATH`, so any other static host works without changes.

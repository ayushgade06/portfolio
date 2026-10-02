// Nodes and edges: the one drawing language used for every diagram on the site.
// Classes: s = line, sg = the path taken (signal), dash = optional/rejected, box / solid / fg = nodes.
// "d" marks strokes that draw in; "n" marks nodes that land after them.

const ruleDiagrams = [
  // 01 — the model is an untrusted advisor
  <>
    <text x="6" y="24">Reply in</text>
    <path className="s d" d="M10 62 H450" />
    <rect className="solid n" x="6" y="58" width="8" height="8" />
    <rect className="box n" x="92" y="36" width="52" height="52" />
    <rect className="solid n" x="204" y="36" width="52" height="52" />
    <rect className="box n" x="316" y="36" width="52" height="52" />
    <rect className="fg n" x="446" y="58" width="8" height="8" />
    <text x="92" y="106">Gate</text>
    <text x="204" y="106">Model</text>
    <text x="316" y="106">Guard</text>
    <text x="446" y="86">Email out</text>
    <path className="sg dash d" d="M342 36 V14 H400" />
    <text className="tg" x="408" y="18">Human</text>
  </>,
  // 02 — the lock is an optimisation
  <>
    <text x="6" y="30">Worker A</text>
    <text x="6" y="98">Worker B</text>
    <path className="sg d" d="M84 26 H260 V60 H330" />
    <path className="s dash d" d="M84 94 H260 V60" />
    <rect className="fg n" x="330" y="46" width="28" height="28" />
    <text x="372" y="56">State</text>
    <text className="t" x="372" y="72">v41 → v42</text>
    <text x="182" y="112">No-op</text>
  </>,
  // 03 — make the leak a type error
  <>
    <rect className="box n" x="6" y="42" width="96" height="40" />
    <text className="t" x="20" y="66">Context</text>
    <path className="s d" d="M102 62 H170 V30 H250" />
    <path className="s d" d="M170 62 V94 H250" />
    <rect className="box n" x="250" y="14" width="200" height="32" />
    <rect className="box n" x="250" y="78" width="200" height="32" />
    <text className="t" x="262" y="34">Decide</text>
    <text className="t" x="262" y="98">Write</text>
    <rect className="fg n" x="384" y="24" width="56" height="12" />
    <text x="352" y="98">— no field</text>
  </>,
  // 04 — no quote, no value
  <>
    <rect className="box n" x="6" y="12" width="170" height="100" />
    <text x="18" y="32">Source</text>
    <path className="s d" d="M18 48 H150" />
    <path className="s d" d="M18 62 H124" />
    <path className="sg d" d="M18 76 H108" />
    <path className="s d" d="M18 90 H140" />
    <path className="sg d" d="M108 76 H236 V40 H300" />
    <rect className="box n" x="300" y="26" width="120" height="28" />
    <text className="t" x="312" y="44">Value A</text>
    <rect className="fg n" x="400" y="34" width="12" height="12" />
    <text className="tg" x="432" y="44">Kept</text>
    <path className="s dash d" d="M236 96 H300" />
    <rect className="box n" x="300" y="82" width="120" height="28" />
    <text x="312" y="100">Value B</text>
    <text x="432" y="100">Dropped</text>
    <text x="190" y="116">No quote</text>
  </>,
  // 05 — if it can't be made safe, delete it
  <>
    <text x="6" y="30">URL</text>
    <rect className="solid n" x="6" y="44" width="8" height="8" />
    <path className="s d" d="M14 48 H110" />
    <rect className="box n" x="110" y="41" width="14" height="14" />
    <path className="s d" d="M124 48 H222" />
    <rect className="box n" x="222" y="41" width="14" height="14" />
    <path className="sg d" d="M236 48 H334" />
    <rect className="fg n" x="334" y="34" width="28" height="28" />
    <text x="92" y="30">Hop · checked</text>
    <text x="206" y="30">Hop · checked</text>
    <text className="t" x="374" y="52">Page</text>
    <path className="s dash d" d="M60 48 V96 H186" />
    <rect className="box n" x="186" y="82" width="158" height="28" />
    <text x="198" y="100">Browser fallback</text>
    <path className="sg d" d="M178 112 L352 80" />
    <text className="tg" x="364" y="100">Removed</text>
  </>,
];

export function RuleDiagram({ i, alt }: { i: number; alt: string }) {
  return (
    <svg className="dg" viewBox="0 0 520 124" role="img" aria-label={alt} data-draw>
      {ruleDiagrams[i]}
    </svg>
  );
}

const plates: Record<string, { alt: string; body: React.ReactNode }> = {
  staysphere: {
    alt: "A browser request passes the routes, then three middleware checks in order, then a controller that talks to MongoDB and to image storage, and comes back as a server-rendered page.",
    body: (
      <>
        <text className="t" x="24" y="186">Browser</text>
        <rect className="solid n" x="24" y="196" width="8" height="8" />
        <path className="sg d" d="M32 200 H120" />
        <rect className="box n" x="120" y="183" width="110" height="34" />
        <text className="t" x="134" y="204">Routes</text>
        <path className="sg d" d="M230 200 H530" />
        <text x="286" y="160">Middleware, in order</text>
        {["Logged in", "Valid", "Owner"].map((l, k) => (
          <g key={l}>
            <rect className="box n" x={290 + k * 84} y="178" width="14" height="44" />
            <text x={270 + k * 84} y="246">{l}</text>
          </g>
        ))}
        <rect className="box n" x="530" y="183" width="120" height="34" />
        <text className="t" x="544" y="204">Controller</text>
        <path className="s d" d="M650 200 H700 V112 H740" />
        <path className="s d" d="M700 200 V288 H740" />
        <rect className="box n" x="740" y="95" width="136" height="34" />
        <text className="t" x="754" y="116">Image store</text>
        <rect className="box n" x="740" y="271" width="136" height="34" />
        <text className="t" x="754" y="292">MongoDB</text>
        <text x="740" y="324">Listing · reviews · map point</text>
        <path className="s dash d" d="M590 217 V344 H28 V210" />
        <text x="250" y="336">Server-rendered page</text>
      </>
    ),
  },
  rtcmeet: {
    alt: "Four peers. Offers, answers and ICE candidates go through a relay server; media then flows directly between every pair of peers. ICE candidates are queued until the remote description is set.",
    body: (
      <>
        <path className="sg d" d="M340 107 H560" />
        <path className="sg d" d="M605 124 V276" />
        <path className="sg d" d="M560 293 H340" />
        <path className="sg d" d="M295 276 V124" />
        <path className="sg d" d="M340 124 L560 276" />
        <path className="sg d" d="M560 124 L340 276" />
        {[["Peer A", 250, 90], ["Peer B", 560, 90], ["Peer C", 560, 276], ["Peer D", 250, 276]].map(([l, x, y]) => (
          <g key={l as string}>
            <path className="s dash d" d={`M${(x as number) + 45} ${(y as number) + 17} L450 200`} />
            <rect className="box n" x={x as number} y={y as number} width="90" height="34" />
            <text className="t" x={(x as number) + 14} y={(y as number) + 21}>{l}</text>
          </g>
        ))}
        <rect className="box n" x="385" y="180" width="130" height="40" />
        <text className="t" x="399" y="204">Relay server</text>
        <text x="24" y="150">ICE queue</text>
        {[0, 1, 2, 3].map((k) => (
          <rect key={k} className="box n" x={24 + k * 14} y="162" width="8" height="8" />
        ))}
        <path className="sg d" d="M84 166 H132" />
        <rect className="fg n" x="132" y="162" width="8" height="8" />
        <text x="24" y="194">Held until the remote</text>
        <text x="24" y="210">description is set</text>
        <path className="s dash d" d="M700 60 H740" />
        <text x="752" y="64">Signal · via relay</text>
        <path className="sg d" d="M700 84 H740" />
        <text className="tg" x="752" y="88">Media · direct</text>
      </>
    ),
  },
  internly: {
    alt: "A sequence between page, content script, service worker and API. The service worker pulls, reconciles by dropping what the server deleted, then pushes. The server upserts idempotently.",
    body: (
      <>
        {["Page", "Content script", "Service worker", "API + DB"].map((l, k) => {
          const x = [70, 270, 500, 720][k];
          return (
            <g key={l}>
              <text className="t" x={x - 16} y="56">{l}</text>
              <path className="life" d={`M${x} 76 V372`} />
              <rect className="box n" x={x - 4} y="68" width="8" height="8" />
            </g>
          );
        })}
        <text x="84" y="106">DOM mutation · 600 ms debounce</text>
        <path className="s d" d="M70 114 H264" />
        <path className="s d" d="M258 110 l6 4 -6 4" />
        <text x="284" y="146">Detected · score ≥ threshold</text>
        <path className="s d" d="M270 154 H494" />
        <path className="s d" d="M488 150 l6 4 -6 4" />
        <text x="514" y="186">Session → 1 h token</text>
        <path className="s d" d="M500 194 H714" />
        <path className="s d" d="M708 190 l6 4 -6 4" />
        <text className="tg" x="514" y="226">1 · Pull</text>
        <path className="sg d" d="M720 234 H506" />
        <path className="sg d" d="M512 230 l-6 4 6 4" />
        <rect className="fg n" x="496" y="256" width="8" height="8" />
        <text className="tg" x="514" y="264">2 · Reconcile</text>
        <text x="514" y="282">Drop what the server deleted</text>
        <text className="tg" x="514" y="310">3 · Push</text>
        <path className="sg d" d="M500 318 H714" />
        <path className="sg d" d="M708 314 l6 4 -6 4" />
        <text x="734" y="336">Upsert on</text>
        <text x="734" y="352">(user, application)</text>
        <text x="734" y="368">Replay = no change</text>
      </>
    ),
  },
  agroguard: {
    alt: "A photo goes to a router, then to one of four crop models, then into a detection store. The detection fans out to users within 15 kilometres. A separate branch turns a weather forecast into a risk map.",
    body: (
      <>
        <text className="t" x="24" y="120">Photo</text>
        <rect className="solid n" x="24" y="131" width="8" height="8" />
        <path className="s d" d="M32 135 H110" />
        <rect className="box n" x="110" y="118" width="110" height="34" />
        <text className="t" x="124" y="139">Router</text>
        <path className="s d" d="M220 135 H258 V63 H290" />
        <path className="s d" d="M258 111 H290" />
        <path className="sg d" d="M220 135 H258 V159 H290" />
        <path className="s d" d="M258 159 V207 H290" />
        {["Rice", "Corn", "Potato", "Wheat"].map((l, k) => (
          <g key={l}>
            <rect className="box n" x="290" y={48 + k * 48} width="110" height="30" />
            <text className={k === 2 ? "tg" : "t"} x="304" y={67 + k * 48}>{l}</text>
            <path className={k === 2 ? "sg d" : "s d"} d={`M400 ${63 + k * 48} H436`} />
          </g>
        ))}
        <text x="290" y="34">Four models, four input contracts</text>
        <path className="s d" d="M436 63 V207" />
        <path className="sg d" d="M436 135 H478" />
        <rect className="box n" x="478" y="118" width="116" height="34" />
        <text className="t" x="492" y="139">Detection</text>
        <path className="sg d" d="M594 135 H752" />
        <circle className="s dash d" cx="760" cy="135" r="96" />
        <line className="sg sweep" x1="760" y1="135" x2="760" y2="39" />
        <rect className="fg n" x="752" y="127" width="16" height="16" />
        <rect className="fg n" x="716" y="84" width="8" height="8" />
        <rect className="fg n" x="800" y="170" width="8" height="8" />
        <rect className="fg n" x="790" y="92" width="8" height="8" />
        <rect className="box n" x="652" y="238" width="8" height="8" />
        <rect className="box n" x="868" y="52" width="8" height="8" />
        <text x="716" y="254">15 km · alerted</text>
        <text className="t" x="24" y="316">Forecast</text>
        <rect className="solid n" x="24" y="327" width="8" height="8" />
        <path className="s d" d="M32 331 H110" />
        <rect className="box n" x="110" y="314" width="190" height="34" />
        <text className="t" x="124" y="335">Scaler + classifier</text>
        <path className="s d" d="M300 331 H360" />
        <rect className="box n" x="360" y="314" width="190" height="34" />
        <text className="t" x="374" y="335">Risk map · 15 cities</text>
      </>
    ),
  },
};

export function Plate({ k }: { k: string }) {
  const p = plates[k];
  return (
    <svg className="dg" viewBox="0 0 900 400" role="img" aria-label={p.alt} data-draw>
      {p.body}
    </svg>
  );
}

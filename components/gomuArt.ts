// The scroll companion, drawn from scratch as one SVG: a rubber kid in a straw hat. A homage, not official artwork.
// Every colour is a CSS variable and every part a group, so one drawing serves all six forms (see app/gomu.css).
// Kept as a string so the same markup can be previewed outside React.

const cloud = `<circle cx="27" cy="84" r="9"/><circle cx="33" cy="97" r="10"/><circle cx="46" cy="103" r="8"/><circle cx="93" cy="84" r="9"/><circle cx="87" cy="97" r="10"/><circle cx="74" cy="103" r="8"/><circle cx="60" cy="105" r="8"/>`;

export const gomuArt = `<svg class="gm" viewBox="0 0 120 150" focusable="false">
<defs>
  <filter id="gm-edge" x="-25%" y="-25%" width="150%" height="150%">
    <feMorphology in="SourceAlpha" operator="dilate" radius="1.6" result="fat"/>
    <feFlood class="gm-edge-c"/>
    <feComposite in2="fat" operator="in" result="edge"/>
    <feMerge><feMergeNode in="edge"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<ellipse class="gm-shadow" cx="60" cy="145" rx="27" ry="3.6"/>
<g class="gm-all">
  <g class="gm-aura">
    <path d="M14 96 L22 84 L17 80 L27 66"/><path d="M106 100 L99 88 L105 83 L96 70"/><path d="M24 128 L31 118 L26 115"/><path d="M100 132 L94 123 L99 119"/>
  </g>
  <g class="gm-cloud"><g class="cl-ol">${cloud}</g><g class="cl-f">${cloud}</g></g>
  <g class="gm-armF">
    <path class="limb-ol" d="M75 98 Q88 101 88 113"/><path class="limb" d="M75 98 Q88 101 88 113"/>
    <circle class="fist" cx="88" cy="115" r="5.6"/>
  </g>
  <g class="gm-legL">
    <path class="limb-ol" d="M52 127 V139"/><path class="limb" d="M52 127 V139"/>
    <ellipse class="sandal" cx="50" cy="142" rx="7.5" ry="3"/>
  </g>
  <g class="gm-legR">
    <path class="limb-ol" d="M68 127 V139"/><path class="limb" d="M68 127 V139"/>
    <ellipse class="sandal" cx="70" cy="142" rx="7.5" ry="3"/>
  </g>
  <g class="gm-torso">
    <path class="sk" d="M46 92 Q60 88 74 92 L76 120 H44 Z"/>
    <path class="xscar" d="M56 99 l8 8 M64 99 l-8 8"/>
    <path class="g4-mark" d="M49 96 q4 4 0 8 q-4 4 0 8 M71 96 q-4 4 0 8 q4 4 0 8"/>
    <path class="vest" d="M45 92 Q50 90 55.5 91 L52 119 H43 Z"/>
    <path class="vest" d="M75 92 Q70 90 64.5 91 L68 119 H77 Z"/>
    <path class="shorts" d="M43 117 H77 L79.5 131 H63 L60 125 L57 131 H40.5 Z"/>
    <path class="cuff" d="M41.5 131 H56.5 M63.5 131 H78.5"/>
    <path class="sash" d="M42.5 113.5 H77.5 V120 H42.5 Z"/>
    <path class="sash" d="M71 120 L77 130 L69.5 127 Z"/>
  </g>
  <g class="gm-head">
    <path class="hair5" d="M22 52 q-7 -9 1 -15 q-2 9 5 10 q-5 -11 5 -17 q-2 10 5 13 Z M98 52 q7 -9 -1 -15 q2 9 -5 10 q5 -11 -5 -17 q2 10 -5 13 Z"/>
    <circle class="sk" cx="31" cy="67" r="5"/><circle class="sk" cx="89" cy="67" r="5"/>
    <ellipse class="sk" cx="60" cy="64" rx="29" ry="27"/>
    <path class="blush" d="M36 77 h7 M77 77 h7"/>
    <path class="hair" d="M31 45 L27 63 L35 54 L37 66 L44 53 L49 62 L55 52 L61 61 L66 52 L72 62 L77 53 L83 66 L86 54 L93 63 L89 45 Z"/>
    <g class="gm-eyes">
      <circle class="eye" cx="48" cy="70" r="7.4"/><circle class="eye" cx="72" cy="70" r="7.4"/>
      <g class="gm-pupils"><circle class="pupil" cx="48" cy="70" r="2.5"/><circle class="pupil" cx="72" cy="70" r="2.5"/></g>
    </g>
    <path class="brows" d="M40 59.5 L55 64 M80 59.5 L65 64"/>
    <path class="scar" d="M67 80.5 Q72 82.5 77 80.5 M70.3 79.3 v3.6 M73.7 79.3 v3.6"/>
    <g class="gm-grin"><path class="teeth" d="M44 82 Q60 99 76 82 Z"/><path class="ln" d="M47.5 86.4 Q60 91.5 72.5 86.4"/></g>
    <g class="gm-shout"><path class="maw" d="M47 82 Q60 78 73 82 Q72 98 60 98 Q48 98 47 82 Z"/><path class="tongue" d="M53 94 Q60 89 67 94 Q64 97.6 60 97.6 Q56 97.6 53 94 Z"/></g>
    <g class="gm-hat">
      <ellipse class="brim" cx="60" cy="42" rx="46" ry="10.5"/>
      <path class="dome" d="M34.5 41 C34.5 11 85.5 11 85.5 41 C73 46 47 46 34.5 41 Z"/>
      <path class="band" d="M35 34 C47 40 73 40 85 34 L85.5 41 C73 46 47 46 34.5 41 Z"/>
      <path class="weave" d="M50 22 q4 -3 9 -3 M66 21 q5 2 8 6 M22 43 q10 5 22 6 M78 49 q11 -1 20 -6"/>
    </g>
  </g>
  <g class="gm-armN">
    <path class="limb-ol" d="M45 98 Q32 101 32 113"/><path class="limb" d="M45 98 Q32 101 32 113"/>
    <g class="gm-fistN"><circle class="fist" cx="32" cy="115" r="5.6"/><path class="knk" d="M28.6 113 q1.6 1.6 0 3.4 M31.8 112.4 q1.6 2 0 4.4"/></g>
  </g>
  <g class="gm-steam"><circle cx="40" cy="88" r="6"/><circle cx="82" cy="90" r="5"/><circle cx="62" cy="30" r="7"/><circle cx="24" cy="108" r="5"/><circle cx="98" cy="110" r="6"/></g>
</g>
</svg>`;

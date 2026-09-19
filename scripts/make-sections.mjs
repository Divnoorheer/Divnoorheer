/**
 * Generates the notched section-header SVGs used across the profile README.
 *
 * Each header is a chamfered tab (the site's NotchedPanel + BracketFrame motif)
 * with an index chip, a title, and a trailing segment run. Keeping them in one
 * generator means the whole set stays visually identical and a title change is
 * a one-line edit here rather than hand-editing five SVG files.
 *
 * Run:  node scripts/make-sections.mjs
 * Palette mirrors src/styles/cyber.css.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '..', 'assets');

const C = {
  void: '#06060a',
  base: '#0b0d12',
  raised: '#1a1e27',
  edge: '#262c38',
  text: '#dfe4ec',
  muted: '#7f8798',
  yellow: '#fcee0a',
  cyan: '#00f0ff',
  red: '#ff003c',
  teal: '#16d9c4',
};

/** Accent rotates per section so the stack reads like the site's varied panels. */
const ACCENTS = { yellow: C.yellow, cyan: C.cyan, teal: C.teal, red: C.red };

/** XML-escape section titles so an ampersand never breaks the SVG. */
const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function header({ index, title, accent = 'cyan' }) {
  const a = ACCENTS[accent] ?? C.cyan;
  const W = 900;
  const H = 46;

  // Trailing segment run: filled ticks in the accent, fading to edge grey.
  const segStart = 720;
  const segs = Array.from({ length: 14 }, (_, i) => {
    const x = segStart + i * 13;
    const on = i < 6;
    const fill = on ? a : C.edge;
    const op = on ? 1 - i * 0.08 : 0.5;
    return `<rect x="${x}" y="18" width="8" height="10" fill="${fill}" opacity="${op.toFixed(2)}"/>`;
  }).join('\n    ');

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(title)}">
  <title>${esc(title)}</title>
  <defs>
    <style>
      .disp  { font-family: 'Rajdhani','Oswald','Arial Narrow',system-ui,sans-serif; font-weight:700; letter-spacing:2.5px; }
      .mono  { font-family: 'Share Tech Mono',ui-monospace,monospace; letter-spacing:2px; }
    </style>
  </defs>

  <!-- notched tab body: chamfered top-left, straight elsewhere -->
  <path d="M20 6 H892 V40 H8 V18 Z" fill="${C.base}"/>
  <path d="M20 6 H892 V40 H8 V18 Z" fill="${a}" opacity="0.04"/>
  <!-- accent left edge -->
  <path d="M20 6 L8 18 V40" fill="none" stroke="${a}" stroke-width="2"/>
  <rect x="8" y="6" width="4" height="34" fill="${a}"/>

  <!-- index chip -->
  <rect x="26" y="15" width="34" height="16" fill="${a}"/>
  <text x="43" y="27" class="mono" font-size="11" fill="${C.void}" text-anchor="middle">${index}</text>

  <!-- title -->
  <text x="72" y="29" class="disp" font-size="19" fill="${C.text}">${esc(title.toUpperCase())}</text>

  <!-- trailing segment run -->
  ${segs}
</svg>
`;
}

const SECTIONS = [
  { file: 'hdr-brief.svg', index: '00', title: 'Brief // who', accent: 'yellow' },
  { file: 'hdr-building.svg', index: '01', title: 'Currently Building', accent: 'cyan' },
  { file: 'hdr-stack.svg', index: '02', title: 'Stack // competencies', accent: 'teal' },
  { file: 'hdr-builds.svg', index: '03', title: 'Decrypted Builds', accent: 'yellow' },
  { file: 'hdr-signal.svg', index: '04', title: 'Signal // contributions', accent: 'red' },
  { file: 'hdr-telemetry.svg', index: '05', title: 'Telemetry', accent: 'cyan' },
  { file: 'hdr-connect.svg', index: '06', title: 'Open Channel', accent: 'red' },
];

await mkdir(OUT, { recursive: true });
for (const s of SECTIONS) {
  await writeFile(resolve(OUT, s.file), header(s), 'utf8');
  console.log('wrote', s.file);
}
console.log('done —', SECTIONS.length, 'section headers');

// Derives the route-story basemap from OpenFreeMap's Liberty style.
//
// Upstream: https://tiles.openfreemap.org/styles/liberty
// Liberty descends from OSM Liberty, itself derived from Mapbox's OSM Bright, and carries
// the BSD licence those retain. Tiles, glyphs and sprites continue to be served by
// OpenFreeMap; only the styling is ours.
//
// Liberty is a general-purpose reference map. This page is not one: the route is the
// subject and everything else is context, so the transforms below pull the basemap back
// without stripping the character that makes it read as the Costa Brava.
//
// Regenerate with:  node scripts/build-basemap-style.mjs
// Requires network. Not part of CI — the generated style is committed.

import fs from 'node:fs/promises';

const UPSTREAM = 'https://tiles.openfreemap.org/styles/liberty';
const OUTPUT = 'public/map/coastal-muted.json';

// --- colour helpers -------------------------------------------------------------------

function parseColor(value) {
  if (typeof value !== 'string') return null;
  const hex = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map(c => c + c).join('') : hex[1];
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
  }
  const rgb = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/i);
  if (rgb) return { r: +rgb[1], g: +rgb[2], b: +rgb[3], a: rgb[4] === undefined ? 1 : +rgb[4] };
  const hsl = value.match(/^hsla?\(\s*([\d.]+)[,\s]+([\d.]+)%[,\s]+([\d.]+)%(?:[,/\s]+([\d.]+))?\s*\)$/i);
  if (hsl) {
    const [h, s, l] = [+hsl[1] / 360, +hsl[2] / 100, +hsl[3] / 100];
    const a = hsl[4] === undefined ? 1 : +hsl[4];
    if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v, a }; }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const channel = t => {
      t = (t + 1) % 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return { r: Math.round(channel(h + 1 / 3) * 255), g: Math.round(channel(h) * 255), b: Math.round(channel(h - 1 / 3) * 255), a };
  }
  return null;
}

const toCss = ({ r, g, b, a }) => a >= 1
  ? `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
  : `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${+a.toFixed(3)})`;

// Pull a colour toward its own grey, then toward white. Muting rather than washing out:
// the hue survives, it just stops shouting.
function mute(value, { desaturate = 0.45, lighten = 0.12 } = {}) {
  const c = parseColor(value);
  if (!c) return value;
  const grey = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
  const mixed = {
    r: c.r + (grey - c.r) * desaturate,
    g: c.g + (grey - c.g) * desaturate,
    b: c.b + (grey - c.b) * desaturate,
    a: c.a
  };
  return toCss({
    r: mixed.r + (255 - mixed.r) * lighten,
    g: mixed.g + (255 - mixed.g) * lighten,
    b: mixed.b + (255 - mixed.b) * lighten,
    a: mixed.a
  });
}

// Paint values are often expressions, so transform every colour leaf wherever it sits.
function mapColors(value, fn) {
  if (typeof value === 'string') return parseColor(value) ? fn(value) : value;
  if (Array.isArray(value)) return value.map(v => mapColors(v, fn));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapColors(v, fn)]));
  }
  return value;
}

// --- transforms -----------------------------------------------------------------------

const LANDCOVER = /landcover|landuse|park|wood|forest|grass|cemetery|pitch|sand/;
// Minor points of interest are noise on a route story and crowd the line at zoom 13-15.
const DROP_LAYERS = /^poi_(r20|r7|transit)$|^poi_z\d|^road_one_way_arrow/;

const style = await fetch(UPSTREAM).then(r => {
  if (!r.ok) throw new Error(`Could not fetch upstream style: ${r.status}`);
  return r.json();
});

const notes = [];
const before = style.layers.length;
style.layers = style.layers.filter(layer => !DROP_LAYERS.test(layer.id));
notes.push(`dropped ${before - style.layers.length} minor POI / one-way-arrow layers`);

let casings = 0, land = 0;
for (const layer of style.layers) {
  if (!layer.paint) continue;

  // Liberty outlines major roads in #e9ac77, a warm orange-tan in the same hue family as
  // the route line. Neutralising it is the single biggest win for route legibility.
  if (layer.type === 'line' && /casing/.test(layer.id)) {
    const painted = mapColors(layer.paint, c => {
      const p = parseColor(c);
      if (!p) return c;
      const warm = p.r > p.b + 20;
      return warm ? mute(c, { desaturate: 0.9, lighten: 0.18 }) : mute(c, { desaturate: 0.4, lighten: 0.05 });
    });
    if (JSON.stringify(painted) !== JSON.stringify(layer.paint)) casings += 1;
    layer.paint = painted;
  }

  if (LANDCOVER.test(layer.id)) {
    layer.paint = mapColors(layer.paint, c => mute(c, { desaturate: 0.4, lighten: 0.1 }));
    land += 1;
  }
}
notes.push(`neutralised ${casings} road casing layers`, `muted ${land} landcover/landuse layers`);

// A softer sea and a slightly warmer ground let the coastline read without glare.
for (const layer of style.layers) {
  if (layer.id === 'water') layer.paint = { ...layer.paint, 'fill-color': 'rgb(196, 216, 232)' };
  if (layer.id === 'background') layer.paint = { ...layer.paint, 'background-color': 'rgb(248, 246, 242)' };
}
notes.push('softened water and background');

// Labels stay, but quieter: the reader is following a story, not navigating.
let labels = 0;
for (const layer of style.layers) {
  if (layer.type !== 'symbol') continue;
  layer.paint = { ...layer.paint, 'text-opacity': 0.82 };
  labels += 1;
}
notes.push(`eased ${labels} label layers to 0.82 opacity`);

style.name = 'Coastal Explorer — muted';
style.metadata = {
  ...(style.metadata || {}),
  'scrolly-route:derived-from': UPSTREAM,
  'scrolly-route:licence': 'BSD (OSM Liberty / Mapbox OSM Bright lineage); tiles and glyphs served by OpenFreeMap',
  'scrolly-route:generated-by': 'scripts/build-basemap-style.mjs'
};

await fs.mkdir('public/map', { recursive: true });
await fs.writeFile(OUTPUT, JSON.stringify(style, null, 1) + '\n');

console.log(`Wrote ${OUTPUT} (${style.layers.length} layers)`);
for (const note of notes) console.log(`  - ${note}`);

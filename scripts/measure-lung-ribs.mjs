// Where the lower border of the lung and of the pleura lies against the ribs (textbook: lung 6 / 8 / 10, pleura 8 / 10 / 12 at the mid-clavicular, mid-axillary and paravertebral lines).
// Each line is a thin slab of the body; the lowest vertex of the lung (lobes) or of the parietal pleura in the slab is compared with the rib meshes in the same slab.
// usage: node scripts/measure-lung-ribs.mjs
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {positionsOf} from './lib/stream-geometry.mjs';
const models = new URL('../public/models/', import.meta.url);
const atlas = JSON.parse(fs.readFileSync(new URL('atlas-stream.json', models)));
const load = (manifest, part) => {
  const b = fs.readFileSync(new URL('..' + '/public' + manifest.chunks[part.chunk].url, import.meta.url));
  return positionsOf(b, part);
};
const sup = JSON.parse(gunzipSync(fs.readFileSync(new URL('supplement/supplement-stream.json.gz', models)))), ser = JSON.parse(gunzipSync(fs.readFileSync(new URL('serous/serous-stream.json.gz', models))));
const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
const ribs = atlas.parts.filter(p => /^(Left|Right) \w+ rib$/i.test(p.name) && ORD.includes(p.name.split(' ')[1].toLowerCase())).map(p => ({side: /^Left/i.test(p.name) ? 'L' : 'R', n: ORD.indexOf(p.name.split(' ')[1].toLowerCase()) + 1, pos: load(atlas, p)}));
if (!ribs.length) throw new Error('no ribs found');
const lungs = sup.parts.filter(p => /lobe of (right|left) lung/i.test(p.name)).map(p => ({side: /right/i.test(p.name) ? 'R' : 'L', pos: load(sup, p)}));
const pleura = ser.parts.filter(p => /parietal pleura/i.test(p.name)).map(p => ({side: /right/i.test(p.name) ? 'R' : 'L', pos: load(ser, p)}));
// slab tests: [name, test(x, z, side)]. x is negative on the body's right.
const sign = s => s === 'R' ? -1 : 1;
const lines = {
  'mid-clavicular (front)': (x, z, s) => Math.abs(Math.abs(x) - .09) < .008 && z > .02,
  'mid-axillary (side)': (x, z, s) => Math.abs(z - 0) < .008 && sign(s) * x > .09,
  'paravertebral (back)': (x, z, s) => Math.abs(Math.abs(x) - .05) < .008 && z < -.03,
};
const lowest = (items, side, test) => {let y = Infinity; for (const it of items) if (it.side === side) for (let i = 0; i < it.pos.length; i += 3) if (test(it.pos[i], it.pos[i + 2], side)) y = Math.min(y, it.pos[i + 1]); return y;};
const ribCentre = (side, n, test) => {let s = 0, c = 0; const r = ribs.find(q => q.side === side && q.n === n); if (!r) return NaN; for (let i = 0; i < r.pos.length; i += 3) if (test(r.pos[i], r.pos[i + 2], side)) {s += r.pos[i + 1]; c++;} return c ? s / c : NaN;};
const rows = [];
for (const [name, test] of Object.entries(lines)) for (const side of ['R', 'L']) {
  const lung = lowest(lungs, side, test), pl = lowest(pleura, side, test), where = y => {let best = null; for (let n = 1; n <= 12; n++) {const c = ribCentre(side, n, test); if (Number.isFinite(c) && (!best || Math.abs(c - y) < Math.abs(best.c - y))) best = {n, c};} return best ? `rib ${best.n} (offset ${((y - best.c) * 1000).toFixed(0)} mm)` : 'n/a';};
  rows.push(`${name} ${side === 'R' ? 'right' : 'left'}: lung lower border y=${lung.toFixed(3)} -> ${where(lung)}; pleura lower border y=${pl.toFixed(3)} -> ${where(pl)}`);
}
console.log(rows.join('\n'));

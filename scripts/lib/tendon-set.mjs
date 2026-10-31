// The cuts of every tendon spec (scripts/tendon/*.mjs) on both sides, from the raw atlas meshes. Used by prepare-model-stream (muscle part) and prepare-paokao (tendon part).
// Results are cached under work/ keyed by a hash of the inputs, because a full run takes about half a minute.
import fs from 'node:fs';
import v8 from 'node:v8';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {cutMuscle, mirrorName} from './tendon-build.mjs';
import {weld, splitMesh, planeOf, volume} from './tendon-cut.mjs';
import {UPPER_LIMB_TENDONS} from '../tendon/upper-limb-cuts.mjs';

const root = new URL('../../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
export const TENDON_SPECS = [...UPPER_LIMB_TENDONS];
export const SIDES = [{w: 'Right', l: 'right', zh: '右', mirror: false}, {w: 'Left', l: 'left', zh: '左', mirror: true}];
export const SOURCE_FILES = ['scripts/lib/tendon-cut.mjs', 'scripts/lib/tendon-build.mjs', 'scripts/lib/tendon-set.mjs', 'scripts/tendon/upper-limb-cuts.mjs', 'public/models/atlas.json'];
const median = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

/**
 * @param parts every atlas part {id, name, bounds} and `read(part)` -> {positions, indices}
 * Returns [{spec, side, parts: [{id, name, bounds, cut: {y, belly, tendon}}], tendon: {positions, indices} | null, apo: ...}] in a fixed order.
 * A part that two specs cut (the long head of biceps: proximal tendon and distal tendon) is cut twice, the second cut working on the muscle part left by the first.
 */
export function planCuts(parts, read) {
  const cacheFile = file('work/tendon-cuts.v8'), hash = createHash('sha256').update(SOURCE_FILES.map(f => fs.readFileSync(file(f))).join('')).digest('hex');
  try { const c = v8.deserialize(fs.readFileSync(cacheFile)); if (c.hash === hash) return c.results; } catch {}
  const byName = new Map(); for (const p of parts) (byName.get(p.name) ?? byName.set(p.name, []).get(p.name)).push(p);
  const current = new Map();   // part id -> {positions, indices} of the muscle part as it is after the cuts so far
  const results = [];
  for (const spec of TENDON_SPECS) for (const side of SIDES) {
    const list = spec.parts.flatMap(n => byName.get(side.mirror ? mirrorName(n) : n) ?? []);
    if (!list.length) throw new Error(`tendon cut ${spec.key}: no atlas part for ${spec.parts.join(', ')}`);
    const inputs = list.map(p => ({p, g: current.get(p.id) ?? read(p)}));
    // a tendon made of several meshes is cut at one height (the median of the individual ones), so the muscle ends square instead of stepped
    let forced;
    if (inputs.length > 1) { const ys = inputs.map(({g}) => cutMuscle(g.positions, g.indices, spec)?.y).filter(y => y != null); forced = median(ys); }
    const pieces = [];
    for (const {p, g} of inputs) {
      const cut = cutMuscle(g.positions, g.indices, {...spec, y: forced});
      if (!cut) throw new Error(`tendon cut ${spec.key} (${p.name}, ${p.id}): no clean cut found`);
      current.set(p.id, cut.belly);
      let tendon = cut.tendon, apo = null;
      // the tendon of palmaris longus runs on into the palmar aponeurosis: the piece is split once more, at the distal border of the flexor retinaculum
      if (spec.apo) {
        const w = weld(tendon.positions, tendon.indices), two = splitMesh(w, planeOf([0, -1, 0], [0, spec.apo.y, 0]));
        if (volume(two.pos.positions, two.pos.indices) > 0 && volume(two.neg.positions, two.neg.indices) > 0) {
          tendon = {positions: Float32Array.from(two.neg.positions), indices: two.neg.indices}; apo = {positions: Float32Array.from(two.pos.positions), indices: two.pos.indices};
        }
      }
      pieces.push({id: p.id, name: p.name, bounds: p.bounds, y: cut.y, belly: cut.belly, tendon, apo});
    }
    results.push({spec: spec.key, side: side.w, pieces});
  }
  // the final muscle parts: what is left after every cut of the same part
  const finals = new Map(); for (const [id, g] of current) finals.set(id, g);
  const out = {results, finals};
  try { fs.mkdirSync(file('work'), {recursive: true}); fs.writeFileSync(cacheFile, v8.serialize({hash, results: out})); } catch {}
  return out;
}
export {mirrorName};

/** The raw atlas parts (public/models/atlas.json) and a reader for their geometry. */
export function atlasParts() {
  const atlas = JSON.parse(fs.readFileSync(file('public/models/atlas.json'))), chunks = new Map();
  const chunk = i => { if (!chunks.has(i)) chunks.set(i, fs.readFileSync(file('public' + atlas.chunks[i].url))); return chunks.get(i); };
  const read = p => { const b = chunk(p.chunk); return {positions: new Float32Array(b.buffer.slice(b.byteOffset + p.positions, b.byteOffset + p.positions + p.vertexCount * 12)), indices: new Uint32Array(b.buffer.slice(b.byteOffset + p.indices, b.byteOffset + p.indices + p.indexCount * 4))}; };
  return {parts: atlas.parts, read};
}

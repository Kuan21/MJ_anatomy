// The cuts of every tendon spec (scripts/tendon/*.mjs) on both sides, from the raw atlas meshes. Used by prepare-model-stream (muscle part) and prepare-paokao (tendon part).
// Results are cached under work/ keyed by a hash of the inputs, because a full run takes about half a minute.
import fs from 'node:fs';
import v8 from 'node:v8';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {cutMuscle, mirrorName, reachBone, clearBones} from './tendon-build.mjs';
import {meshOf} from './heart-geom.mjs';
import {weld, splitMesh, planeOf, volume} from './tendon-cut.mjs';
import {UPPER_LIMB_TENDONS} from '../tendon/upper-limb-cuts.mjs';
import {LOWER_LIMB_TENDONS} from '../tendon/lower-limb-cuts.mjs';

const root = new URL('../../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
export const TENDON_SPECS = [...UPPER_LIMB_TENDONS, ...LOWER_LIMB_TENDONS];
export const SIDES = [{w: 'Right', l: 'right', zh: '右', mirror: false}, {w: 'Left', l: 'left', zh: '左', mirror: true}];
export const SOURCE_FILES = ['scripts/lib/tendon-cut.mjs', 'scripts/lib/tendon-build.mjs', 'scripts/lib/tendon-set.mjs', 'scripts/tendon/upper-limb-cuts.mjs', 'scripts/tendon/lower-limb-cuts.mjs', 'public/models/atlas.json'];
// The bones a lower-limb tendon is lifted out of (left and right named alike); built once per side.
const LOWER_BONES = /^(Left|Right) (femur|tibia|fibula|patella|talus|calcaneus|cuboid bone|(medial|intermediate|lateral) cuneiform bone|(first|second|third|fourth|fifth) metatarsal bone)$|phalanx of (left|right) .*toe|navicular bone of (left|right) foot/;
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
  const results = [], bonesOf = {};
  for (const spec of TENDON_SPECS) for (const side of SIDES) {
    const list = spec.parts.flatMap(n => byName.get(side.mirror ? mirrorName(n) : n) ?? []);
    if (!list.length) throw new Error(`tendon cut ${spec.key}: no atlas part for ${spec.parts.join(', ')}`);
    const inputs = list.map(p => ({p, g: current.get(p.id) ?? read(p)}));
    // a tendon made of several meshes is cut at one height (the median of the individual ones), so the muscle ends square instead of stepped
    let forced;
    if (inputs.length > 1 && !spec.independent) { const ys = inputs.map(({g}) => cutMuscle(g.positions, g.indices, spec)?.y).filter(y => y != null); forced = spec.y ?? median(ys); }
    const pieces = [], rightName = p => spec.parts.find(n => (side.mirror ? mirrorName(n) : n) === p.name);
    for (const {p, g} of inputs) {
      const cut = cutMuscle(g.positions, g.indices, {...spec, y: spec.independent ? spec.yByPart?.[rightName(p)] ?? spec.y : forced ?? spec.y});
      if (!cut) throw new Error(`tendon cut ${spec.key} (${p.name}, ${p.id}): no clean cut found`);
      current.set(p.id, cut.belly);
      let tendon = cut.tendon, apo = null;
      // the tendon of palmaris longus runs on into the palmar aponeurosis, the rectus femoris tendon into the patellar ligament: the piece is split once more, at `apo.y` / `split.y`
      const sp = spec.apo ?? spec.split;
      if (sp && (!sp.only || sp.only.includes(rightName(p)))) {
        const w = weld(tendon.positions, tendon.indices), two = splitMesh(w, planeOf([0, -1, 0], [0, sp.y, 0]));
        if (volume(two.pos.positions, two.pos.indices) > 0 && volume(two.neg.positions, two.neg.indices) > 0) {
          tendon = {positions: Float32Array.from(two.neg.positions), indices: two.neg.indices}; apo = {positions: Float32Array.from(two.pos.positions), indices: two.pos.indices};
        }
      }
      // the quadriceps tendon ends at the base of the patella: what the source meshes draw below it (inside and behind the patella, or as wedges beside the joint) is dropped
      if (spec.trim && spec.trim.only.includes(rightName(p))) {
        const w = weld(tendon.positions, tendon.indices), two = splitMesh(w, planeOf([0, -1, 0], [0, spec.trim.y, 0]));
        if (volume(two.neg.positions, two.neg.indices) > 0) tendon = {positions: Float32Array.from(two.neg.positions), indices: two.neg.indices};
      }
      // a tendon modelled through a bone is lifted out of it (the cut ring stays where the muscle part has it)
      if (spec.lower) {
        bonesOf[side.w] ??= parts.filter(b => b.system === 'skeletal' && LOWER_BONES.test(b.name) && (side.mirror ? /^Left|left/.test(b.name) : /^Right|right/.test(b.name))).map(b => { const g = read(b); return meshOf(g.positions, g.indices); });
        const pieces2 = [tendon, apo].filter(Boolean);
        for (const t of pieces2) clearBones(t, bonesOf[side.w], {ringY: cut.y, end: spec.end});
      }
      // a tendon that stops short of its bone in the source mesh is extended onto it
      if (spec.reach) {
        const bone = parts.find(b => b.name === (side.mirror ? mirrorName(spec.reach.bone) : spec.reach.bone)); if (!bone) throw new Error(`tendon cut ${spec.key}: no bone ${spec.reach.bone}`);
        const bg = read(bone); reachBone(tendon, bg.positions, bg.indices, {len: spec.reach.len});
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

// Structures named in the course-summary checklist (docs/paokao-checklist.json) that neither BodyParts3D nor the Z-Anatomy exports contain, built from the textbook
// course on landmarks measured on the atlas meshes (scripts/paokao-structures/*.mjs). They are packaged like the serous shells, join the atlas as schematic parts that
// carry the concept of their own name, and get their bilingual data card from app/mj-paokao.json. Rebuilt only when an input changed.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createStream, simplify, weldByPosition} from './lib/stream-writer.mjs';
import {buildAll} from './lib/paokao-build.mjs';
import {quizModule} from './quiz-modules.mjs';
import {expand, attachment, originLevel, bridge, TOLERANCE} from './lib/topology.mjs';
import {ARTERIES, VEINS} from './topology-spec.mjs';

const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const out = new URL('public/models/stream/', root), dir = new URL('public/models/paokao/', root), manifest = new URL('paokao-stream.json.gz', dir);
const inputs = ['scripts/prepare-paokao.mjs', 'scripts/lib/topology.mjs', 'scripts/lib/tube-tips.mjs', 'scripts/topology-spec.mjs', 'app/biomechanics-v2/tissue-bindings.json', 'app/biomechanics-v2/body-bindings.json', 'app/mj-part-regions.ts', 'scripts/lib/paokao-build.mjs', 'scripts/lib/paokao-util.mjs', 'scripts/lib/paokao-world.mjs', 'scripts/lib/nerve-schematics.mjs', 'public/models/atlas.json', 'public/models/nerve-stream.json',
  'public/models/supplement/supplement-stream.json.gz', 'public/models/serous/serous-stream.json.gz', ...fs.readdirSync(file('scripts/paokao-structures')).map(f => 'scripts/paokao-structures/' + f)];
const hash = createHash('sha256').update(inputs.map(f => fs.readFileSync(file(f))).join('')).digest('hex'), stamp = file('work/paokao.stamp');
try { if (fs.readFileSync(stamp, 'utf8') === hash && fs.existsSync(manifest) && fs.existsSync(file('app/mj-paokao.json')) && fs.existsSync(file('app/biomechanics-v2/paokao-bindings.json'))) { console.log('Paokao structures: up to date.'); process.exit(0); } } catch {}

fs.mkdirSync(out, {recursive: true}); fs.mkdirSync(dir, {recursive: true}); fs.mkdirSync(file('work'), {recursive: true});
const {built, w, U} = buildAll(), stream = createStream(out, 'paokao'), cards = {};
// Topology: every branch in scripts/topology-spec.mjs must touch its parent. A branch of the atlas that does not gets a thin connector part (same name and concept as the branch,
// so it is selected and hidden with it); a new structure that does not is a bug in its spec and stops the build.
for (const b of built) w.addExtra(b.name, b.system, b.geometry);
const topology = [], created = new Set(built.map(b => b.name));
for (const rel of [...expand(ARTERIES, 'artery'), ...expand(VEINS, 'vein')]) {
  const att = attachment(U, w, rel);
  if (att.missing) { topology.push({...rel, status: 'mesh missing: ' + att.missing}); continue; }
  const level = originLevel(U, w, rel), needs = att.gap > TOLERANCE || (level != null && att.point[1] < level - (rel.rule.originBelow.tolMm ?? 12) / 1000);
  const row = {child: rel.child, parent: rel.parent, gapMm: +(att.gap * 1000).toFixed(1), status: needs ? 'fixed' : 'ok'};
  if (needs) {
    if (created.has(rel.child)) throw new Error(`topology: new structure ${rel.child} does not touch ${rel.parent} (${row.gapMm} mm)`);
    const b = bridge(U, w, rel, att); if (!b) continue;
    const entry = w.find(rel.child).find(e => e.concept), geometry = U.tube(b.pts, b.r0, b.r1, 18, 6);
    built.push({name: rel.child, connector: true, concept: entry.concept, system: entry.system, kind: 'connector', geometry, parent: rel.parent});
    w.addExtra(rel.child, entry.system, geometry);
    row.originY = level != null ? +level.toFixed(3) : undefined;
  }
  topology.push(row);
}
fs.writeFileSync(file('docs/topology-report.json'), JSON.stringify(topology, null, 1));
// Motion bindings: the new parts must follow the limb they sit on exactly like the atlas parts beside them. Parts in the arm region get a soft arm binding, parts in the leg
// region a leg binding (a landmark on a leg bone copies its bone's frame), and connectors copy the binding of the branch they belong to. Trunk and neck parts need none.
const {anatomicalRegion, anatomicalSide} = await quizModule('app/mj-part-regions.ts');
const tissueJson = JSON.parse(fs.readFileSync(file('app/biomechanics-v2/tissue-bindings.json'), 'utf8')), bodyJson = JSON.parse(fs.readFileSync(file('app/biomechanics-v2/body-bindings.json'), 'utf8'));
const atlasParts = JSON.parse(fs.readFileSync(file('public/models/atlas.json'), 'utf8')).parts, atlasByName = new Map(atlasParts.map(p => [p.name, p]));
const bindings = {tissue: {}, body: {}};
const boundsOf = g => { const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < g.positions.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], g.positions[i + k]); hi[k] = Math.max(hi[k], g.positions[i + k]); } return [lo, hi]; };
const ARM_PROFILE = {humerus: 'arm', scapula: 'scapular', clavicle: 'clavicular', radius: 'forearm', ulna: 'forearm'};
function bind(id, s) {
  if (s.connector) {
    const host = w.find(s.name).find(e => !/^(extra:|PK)/.test(e.id)); if (!host) return;
    if (tissueJson[host.id]) bindings.tissue[id] = {...tissueJson[host.id]}; if (bodyJson[host.id]) bindings.body[id] = {...bodyJson[host.id]};
    return;
  }
  const part = {id, name: s.name, system: s.system, bounds: boundsOf(s.geometry)}, region = anatomicalRegion(part), side = anatomicalSide(part);
  if (region === 'upper-limb' && (side === 'left' || side === 'right')) {
    const host = s.parent && atlasByName.get(s.parent), hostWord = host && /humerus|scapula|clavicle|radius|ulna/.exec(host.name)?.[0];
    bindings.tissue[id] = {name: s.name, side, profile: ARM_PROFILE[hostWord] ?? 'path'};
  } else if (region === 'lower-limb' && (side === 'left' || side === 'right')) {
    const host = s.parent && atlasByName.get(s.parent), hostBinding = host && bodyJson[host.id];
    bindings.body[id] = {name: s.name, rig: side === 'left' ? 'leftLeg' : 'rightLeg', frame: s.kind === 'landmark' && hostBinding ? hostBinding.frame : null};
  }
}
let n = 0;
for (const s of built) {
  const id = `${s.connector ? 'PKC' : 'PK'}-${++n}`;
  // Surface patches come out of a locally refined bone mesh with thousands of coplanar triangles: weld, then collapse the flat interior but keep the outline.
  let {positions, indices} = s.geometry;
  const cap = s.cap ?? (['fascia', 'sheath', 'aponeurosis'].includes(s.kind) ? 2500 : 700);
  if (indices.length / 3 > cap) { const w = weldByPosition(positions, indices); ({positions, indices} = await simplify(w.positions, w.indices, cap, .003, ['LockBorder'])); }
  bind(id, s);
  stream.add({id, conceptId: s.connector ? s.concept : id, name: s.name, system: s.system, schematic: !s.connector, kind: s.kind, ...(s.sex ? {sex: s.sex} : {})}, positions, indices);
  if (s.connector) continue;
  cards[id] = {name: s.name, zh: s.zh, system: s.system, kind: s.kind, origin: s.card?.origin, course: s.card?.course, supply: s.card?.supply, extra: s.card?.extra, note: s.note, refs: s.refs, parent: s.parent};
}
const info = stream.finish({source: 'Generated for this atlas from the textbook course of each structure, placed on landmarks measured on the atlas meshes', license: 'Generated by this project; no third-party geometry', attribution: 'Schematic structures for the course-summary checklist, built by scripts/prepare-paokao.mjs.'}, manifest);
fs.writeFileSync(file('app/biomechanics-v2/paokao-bindings.json'), JSON.stringify(bindings));
fs.writeFileSync(file('app/mj-paokao.json'), JSON.stringify(cards, null, 0));
fs.writeFileSync(stamp, hash);
console.log(`Paokao structures: ${info.parts} schematic structures in ${info.chunks} packages, ${(info.gzipBytes / 1e6).toFixed(2)} MB compressed.`);

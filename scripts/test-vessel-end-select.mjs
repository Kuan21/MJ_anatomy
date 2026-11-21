// A vessel and its end piece (`…-END`: connectors, bridges and tapers from scripts/prepare-vessel-ends.mjs) are one structure (app/mj-vessel-unit.ts):
//   1. picking either part selects both, the vessel first (its card is the one shown);
//   2. the card of an end piece never says "schematic model generated from the surface of the neighbouring structure", and it keeps the vessel's tapered-end note;
//   3. what a click selects is one continuous piece: checked for every vessel of the head and neck and of the pelvis and perineum, and for the three vessels
//      reported broken (left median antebrachial vein, right testicular artery, right deep femoral vein);
//   4. negative control: the end piece of the left median antebrachial vein selected on its own (the old behaviour) is several pieces, and the check must say so.
// The vessels that stay broken even with their end piece (49, docs/schematic-models-report.md) are a geometry job for after the exam and are not checked here.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import esbuild from 'esbuild';
import {fileURLToPath} from 'node:url';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {regionTools} from './lib/vessel-segments.mjs';
import {pieceSizes} from './lib/surface-distance.mjs';

const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
fs.mkdirSync(file('.sites-runtime'), {recursive: true});
const out = file('.sites-runtime/vessel-unit-test.mjs');
await esbuild.build({stdin: {contents: "export {vesselUnit, vesselBase, isVesselEnd} from './app/mj-vessel-unit';\nexport {structureProfile} from './app/mj-structure-info';", resolveDir: file('.'), loader: 'ts'},
  bundle: true, format: 'esm', platform: 'node', outfile: out, loader: {'.json': 'json'}, logLevel: 'error', external: ['three']});
const {vesselUnit, structureProfile} = await import(out + '?t=' + Date.now());
const {anatomicalRegion, anatomicalSubregion} = await regionTools();
const {atlas, geometry} = loadFullAtlas();
const ids = new Set(atlas.parts.map(p => p.id)), byId = new Map(atlas.parts.map(p => [p.id, p])), has = id => ids.has(id);
const ends = atlas.parts.filter(p => p.stream === 'vessel-ends');
const packaged = JSON.parse(zlib.gunzipSync(fs.readFileSync(file('public/models/vessel-ends/vessel-ends-stream.json.gz')))).parts.length;
assert.ok(ends.length > 0 && ends.length === packaged, `expected every vessel-end piece of the package (${packaged}), found ${ends.length}`);

// 1. selection
for (const e of ends) {
  const base = e.id.slice(0, -4);
  assert.deepEqual(vesselUnit(e.id, has), [base, e.id], `${e.id}: an end piece selects its vessel first`);
  assert.deepEqual(vesselUnit(base, has), [base, e.id], `${base}: a vessel selects its end piece too`);
}
assert.deepEqual(vesselUnit('FJ1252', has), ['FJ1252'], 'a part without an end piece is selected alone');

// 2. cards
const SURFACE = '由相鄰構造的表面生成';
for (const e of ends) {
  const facts = structureProfile(e.name, e.system, e).facts ?? [], main = byId.get(e.id.slice(0, -4));
  assert.ok(!facts.some(f => String(f.valueZh).includes(SURFACE)), `${e.id} ${e.name}: the end piece card must not read as a surface-generated schematic model`);
  const mainTaper = (structureProfile(main.name, main.system, main).facts ?? []).some(f => f.labelZh === '模型末端');
  assert.equal(facts.some(f => f.labelZh === '模型末端'), mainTaper, `${e.id}: the end piece keeps the vessel's tapered-end note`);
}

// 3. one continuous piece
const g = p => { const q = geometry(p); return {pos: q.positions, idx: q.indices}; };
const zone = p => { const r = anatomicalRegion(p); return r === 'trunk' ? anatomicalSubregion(p) : r; };
const NAMED = ['Left median antebrachial vein', 'Right testicular artery', 'Right deep femoral vein'];
const scope = ends.filter(e => { const m = byId.get(e.id.slice(0, -4)); return ['head-neck', 'pelvis'].includes(zone(m)) || NAMED.includes(m.name); });
const broken = [];
for (const e of scope) { const n = pieceSizes(vesselUnit(e.id, has).map(id => g(byId.get(id)))).length; if (n > 1) broken.push(`${e.name} (${e.id}): ${n} pieces`); }
assert.equal(broken.length, 0, `selected vessel broken into pieces:\n${broken.join('\n')}`);
for (const n of NAMED) assert.ok(scope.some(e => e.name === n), `${n} is checked`);

// 4. negative control
const control = ends.find(e => e.name === 'Left median antebrachial vein');
assert.ok(pieceSizes([g(control)]).length > 1, 'negative control: the end piece alone (old selection) must be found broken');

console.log(`Vessel end selection OK: ${ends.length} end pieces select their vessel and show its card; ${scope.length} selections (head and neck, pelvis and perineum, ${NAMED.length} named vessels) are one continuous piece; the old single-piece selection of the left median antebrachial vein is caught as broken.`);

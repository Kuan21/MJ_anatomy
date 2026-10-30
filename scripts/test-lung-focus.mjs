// The 肺 focus view (thorax view of the main atlas).
// 1. The panel can be clicked: nothing may sit on top of it (the right workspace used to cover it and swallow every click), and every control is wired to the scene.
// 2. Lobes and pleura are smooth and whole: closed lobes, consistent winding, no degenerate triangles, unit normals that agree with the faces, few sharp edges.
// 3. The faded rib cage is drawn with real alpha blending (a twin batch), never a dot pattern; the lobes are one matte material.
// The browser side (real mouse clicks on every control, screenshots) is scripts/browser/lung-focus-ui.cjs; it needs Playwright and a GPU or software GL, so it is run by hand.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {meshReport} from './lib/lung-mesh.mjs';

const text = f => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const page = text('app/page.tsx'), css = text('app/globals.css'), scene = text('app/scene.tsx');

// --- 1. panel ---------------------------------------------------------------------------------------------------------------------------------------------
const panelCss = css.match(/\.lung-focus\{[^}]*\}/)?.[0] ?? '';
const z = Number(panelCss.match(/z-index:(\d+)/)?.[1]), workspaceZ = Number(css.match(/\.right-workspace\{[^}]*?z-index:(\d+)/)?.[1]);
assert.ok(z > workspaceZ || /\.studio:has\(\.lung-focus\) \.right-workspace\{display:none/.test(css), 'the lung panel must sit above the right workspace or the workspace must step aside');
assert.ok(/\.studio:has\(\.lung-focus\) \.right-workspace\{display:none/.test(css), 'the right workspace (full-height, transparent) must step aside while the lung panel is open');
const panel = page.slice(page.indexOf('<aside className="lung-focus'), page.indexOf('</aside>', page.indexOf('<aside className="lung-focus')));
assert.ok(panel.length > 500, 'lung panel not found');
for (const [what, re] of [
  ['name labels switch calls aimLungView with the labels flag', /aria-label="名稱標籤"/],
  ['side buttons go through the region bar (applySide → the lung view)', /onClick=\{\(\)=>applySide\(id\)\}/],
  ['minus button hides the pleura', /減少一層[\s\S]{0,120}?onClick=\{\(\)=>setState\(v=>setSerousGroup\(v,PLEURA_KEYS,false\)\)/],
  ['plus button shows the pleura', /增加一層[\s\S]{0,120}?onClick=\{\(\)=>setState\(v=>setSerousGroup\(v,PLEURA_KEYS,true\)\)/],
  ['opacity slider sets lungOpacity', /type="range"[^>]*onChange=\{e=>\{[^}]*lungOpacity:value/],
  ['bronchial tree toggle', /aria-label="顯示支氣管樹"/],
  ['pulmonary vessel toggle', /aria-label="顯示肺血管"/],
  ['back button', /onClick=\{exitLungView\}/],
]) assert.ok(re.test(panel), `lung panel: ${what}`);
assert.ok(/setLungSide\(side\);[\s\S]{0,420}aimLungView\(side,false,lungInner,labels\)/.test(page), '胸腔 → 肺與胸膜 and the 肺 button must share the lung view (same focus logic)');
assert.ok(/inner\.vessels\|\|extra\.length\?\['arterial','venous'\]/.test(page), 'pulmonary vessels need the arterial and venous systems switched on');
assert.ok(/lungOpacity\?:number/.test(text('app/anatomy.ts')), 'SceneState.lungOpacity');
assert.ok(/latest\.current\.lungOpacity\?\?1/.test(scene), 'the scene must read lungOpacity');

// --- 3. rendering ------------------------------------------------------------------------------------------------------------------------------------------
assert.ok(/fadeMatFor/.test(scene) && /m\.transparent=true;m\.depthWrite=false;m\.alphaToCoverage=false/.test(scene), 'faded parts need a blended twin material');
assert.ok(/selectedData\[p\.index\*4\+2\]>0/.test(scene), 'faded parts must be routed into the twin batch');
const lungMaterial = scene.match(/const lungMat=materialFor\([^}]*\}/)?.[0] ?? '';
assert.ok(/roughness=1/.test(lungMaterial) && /FrontSide/.test(lungMaterial) && /envMapIntensity/.test(lungMaterial), 'one matte lung material');

assert.ok(/const lungLobe=\/\\blobe of/.test(scene) && /!lungLobe&&brainLoaded/.test(scene) && /!lungLobe&&intracranial/.test(scene), 'lung lobes must be exempt from the brain-name patterns (\\blobe\\b) that hide cerebral lobes');

// --- 2. meshes ---------------------------------------------------------------------------------------------------------------------------------------------
const readJson = f => JSON.parse(gunzipSync(fs.readFileSync(new URL(`../public/models/${f}`, import.meta.url))));
const geometry = (manifest, part) => {
  const b = fs.readFileSync(new URL(`../public${manifest.chunks[part.chunk].url}`, import.meta.url));
  const slice = (o, n, T) => new T(b.buffer.slice(b.byteOffset + o, b.byteOffset + o + n * T.BYTES_PER_ELEMENT));
  return {positions: slice(part.positions, part.vertexCount * 3, Float32Array), normals: slice(part.normals, part.vertexCount * 3, Int16Array), indices: slice(part.indices, part.indexCount, Uint32Array)};
};
const check = (name, g, {closed}) => {
  const r = meshReport(g.positions, g.indices);
  assert.ok(r.degenerate / r.triangles < 1e-3, `${name}: ${r.degenerate} degenerate triangles`);
  assert.equal(r.inconsistent, 0, `${name}: inconsistent winding`);
  assert.ok(r.nonManifold <= 40, `${name}: ${r.nonManifold} non-manifold edges`);
  if (closed) {assert.equal(r.open, 0, `${name}: open edges (holes)`); assert.ok(r.volume > 0, `${name}: faces point inward`);}
  // unit normals that agree with the faces
  let bad = 0, nonUnit = 0;
  for (let t = 0; t < g.indices.length; t += 3) {
    const v = [0, 1, 2].map(k => g.indices[t + k] * 3), p = v.map(i => [g.positions[i], g.positions[i + 1], g.positions[i + 2]]);
    const u = [p[1][0] - p[0][0], p[1][1] - p[0][1], p[1][2] - p[0][2]], w = [p[2][0] - p[0][0], p[2][1] - p[0][1], p[2][2] - p[0][2]];
    const f = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const n = [0, 1, 2].map(c => (g.normals[v[0] + c] + g.normals[v[1] + c] + g.normals[v[2] + c]) / 3 / 32767);
    if (f[0] * n[0] + f[1] * n[1] + f[2] * n[2] < 0) bad++;
  }
  for (let i = 0; i < g.normals.length; i += 3) if (Math.abs(Math.hypot(g.normals[i], g.normals[i + 1], g.normals[i + 2]) / 32767 - 1) > .01) nonUnit++;
  assert.equal(nonUnit, 0, `${name}: ${nonUnit} normals are not unit length`);
  assert.ok(bad / (g.indices.length / 3) < (closed ? .005 : .04), `${name}: ${bad} triangles face against their vertex normals`);
  return r;
};
const supplement = readJson('supplement/supplement-stream.json.gz'), serous = readJson('serous/serous-stream.json.gz');
const rows = [];
for (const p of supplement.parts.filter(p => /lobe of (right|left) lung/i.test(p.name))) {
  const r = check(p.name, geometry(supplement, p), {closed: true});
  assert.ok(r.sharpShare < .06, `${p.name}: ${(r.sharpShare * 100).toFixed(1)} % of the edges are sharper than 55 degrees (jagged surface)`);
  rows.push(`${p.name}: ${r.triangles} triangles, sharp edges ${(r.sharpShare * 100).toFixed(2)} %`);
}
for (const p of serous.parts.filter(p => /pleura/i.test(p.name))) {
  const r = check(p.name, geometry(serous, p), {closed: false});
  assert.ok(r.sharpShare < .12, `${p.name}: ${(r.sharpShare * 100).toFixed(1)} % sharp edges`);
  rows.push(`${p.name}: ${r.triangles} triangles, sharp edges ${(r.sharpShare * 100).toFixed(2)} %`);
}
if (process.argv.includes('--verbose')) console.log(rows.join('\n'));
console.log(`Lung focus view: panel wired, rib cage blended, ${rows.length} lobe and pleura meshes whole and smooth.`);

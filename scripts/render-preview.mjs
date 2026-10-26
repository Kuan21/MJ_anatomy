// Offline preview of anatomy meshes from several camera angles, for visual checks of new or moved structures (see CLAUDE.md, "視覺檢查").
// It draws the same meshes the viewer loads (atlas, supplement, paokao, nerve stream …) with three.js in headless Chromium, so the camera is under script control.
//   node scripts/render-preview.mjs <spec.json> <outDir>
// spec: {"title": "…", "size": [900, 700], "context": [{"match": "regex", "color": "#ccc", "opacity": .25}],
//        "focus": [{"match": "regex", "color": "#0a0", "opacity": 1}], "views": [{"name": "front", "eye": [x, y, z], "target": [x, y, z], "fov": 30}]}
// Coordinates are in metres in the model frame (+x body left, y up, +z anterior). Views can also be {"name", "around": "regex", "dir": [x, y, z], "dist": .25}
// which looks at the centre of the focus meshes matching `around` from direction `dir`.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {loadWorld} from './lib/paokao-world.mjs';

const [specFile, outDir] = process.argv.slice(2);
if (!specFile || !outDir) { console.error('usage: node scripts/render-preview.mjs <spec.json> <outDir>'); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8')); fs.mkdirSync(outDir, {recursive: true});
const w = loadWorld({paokao: true});
const groups = [...(spec.context ?? []).map(g => ({...g, kind: 'context'})), ...(spec.focus ?? []).map(g => ({...g, kind: 'focus'}))];
const meshes = [];
for (const g of groups) {
  const re = new RegExp(g.match, 'i');
  for (const e of w.entries) {
    if (!re.test(e.name) || (g.system && e.system !== g.system)) continue;
    const m = e.load(); meshes.push({name: e.name, color: g.color ?? '#999999', opacity: g.opacity ?? 1, kind: g.kind, positions: Array.from(m.positions), indices: Array.from(m.indices)});
  }
}
// meshes that are not in the world yet (a structure being designed): {"file": "mesh.json" with positions and indices, "color", "opacity", "name"}
for (const x of spec.extra ?? []) { const m = JSON.parse(fs.readFileSync(x.file, 'utf8')); meshes.push({name: x.name ?? path.basename(x.file), color: x.color ?? '#22aa55', opacity: x.opacity ?? 0.75, kind: 'focus', positions: m.positions, indices: m.indices}); }
const bounds = re => { let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; const r = new RegExp(re, 'i'); for (const m of meshes) if (m.kind === 'focus' && r.test(m.name)) for (let i = 0; i < m.positions.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], m.positions[i + k]); hi[k] = Math.max(hi[k], m.positions[i + k]); } return {lo, hi, c: lo.map((v, k) => (v + hi[k]) / 2), r: Math.hypot(...lo.map((v, k) => hi[k] - v)) / 2}; };
const views = (spec.views ?? []).map(v => {
  if (!v.around) return v;
  const b = bounds(v.around), d = v.dir, l = Math.hypot(...d) || 1, dist = v.dist ?? Math.max(.12, b.r * 3.2);
  return {name: v.name, target: b.c, eye: b.c.map((x, k) => x + d[k] / l * dist), fov: v.fov ?? 30};
});
const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const threeFile = path.join(path.dirname(require.resolve('three')), 'three.module.js');
const browser = await chromium.launch({args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const [W, H] = spec.size ?? [900, 700];
const page = await browser.newPage({viewport: {width: W, height: H}});
await page.route('**/three.module.js', r => r.fulfill({path: threeFile, contentType: 'text/javascript'}));
await page.route('**/page.html', r => r.fulfill({contentType: 'text/html', body: '<!doctype html><body style="margin:0"><canvas id=c></canvas>'}));
await page.goto('http://preview.local/page.html');
await page.evaluate(async ({meshes, views, W, H, bg}) => {
  const T = await import('http://preview.local/three.module.js');
  const canvas = document.getElementById('c'); canvas.width = W; canvas.height = H;
  const renderer = new T.WebGLRenderer({canvas, antialias: true, preserveDrawingBuffer: true}); renderer.setSize(W, H, false); renderer.setClearColor(bg ?? '#eef1f4');
  const scene = new T.Scene(); scene.add(new T.HemisphereLight(0xffffff, 0x8899aa, 1.1)); const sun = new T.DirectionalLight(0xffffff, 1.4); scene.add(sun, sun.target);
  for (const m of meshes) {
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(m.positions, 3)); g.setIndex(m.indices); g.computeVertexNormals();
    const mat = new T.MeshStandardMaterial({color: m.color, transparent: m.opacity < 1, opacity: m.opacity, side: T.DoubleSide, roughness: .75, metalness: 0, depthWrite: m.opacity >= .6});
    scene.add(new T.Mesh(g, mat));
  }
  window.__shots = {};
  for (const v of views) {
    const cam = new T.PerspectiveCamera(v.fov ?? 30, W / H, .002, 20); cam.position.set(...v.eye); cam.lookAt(...v.target); cam.updateMatrixWorld();
    sun.position.set(v.eye[0] + .3, v.eye[1] + .6, v.eye[2] + .4); sun.target.position.set(...v.target);
    renderer.render(scene, cam); window.__shots[v.name] = canvas.toDataURL('image/png');
  }
}, {meshes, views, W, H, bg: spec.background});
for (const v of views) {
  const data = await page.evaluate(n => window.__shots[n], v.name);
  fs.writeFileSync(path.join(outDir, `${v.name}.png`), Buffer.from(data.split(',')[1], 'base64'));
}
await browser.close();
console.log(`Rendered ${views.length} views of ${meshes.filter(m => m.kind === 'focus').length} focus and ${meshes.filter(m => m.kind === 'context').length} context meshes to ${outDir}`);

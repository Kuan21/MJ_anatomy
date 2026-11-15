// Pictures of the new lower-limb arteries (scripts/lib/leg-vessel-build.mjs) next to the vessels the site draws today, in headless Chromium (software GL, three.js), rest pose.
//   node scripts/render-leg-vessel-tree.mjs <out dir>
// Colours: new arteries red, current arteries grey, veins blue, bones ivory. Views: front, back, left and right side, each with the bones and with the vessels only, and two close-ups
// (inguinal region, hip and gluteal region). Needs Playwright (PLAYWRIGHT_PATH=<node_modules folder>, default /opt/node22/lib/node_modules) and a Chromium. Nothing is written inside the repo.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {buildTree, loadTree} from './lib/leg-vessel-build.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';

const out = process.argv[2]; if (!out) throw new Error('usage: render-leg-vessel-tree.mjs <out dir>');
const require = createRequire((process.env.PLAYWRIGHT_PATH ?? '/opt/node22/lib/node_modules') + '/');
const {chromium} = require('playwright');
fs.mkdirSync(out, {recursive: true});
const root = new URL('../', import.meta.url), three = fileURLToPath(new URL('node_modules/three/build/three.module.js', root));

const {vessels} = buildTree(loadTree());
const full = loadFullAtlas(), meta = [], chunks = []; let offset = 0;
const add = (type, name, pos, idx) => {
  const p = Buffer.from(Float32Array.from(pos).buffer), i = Buffer.from(Uint32Array.from(idx).buffer);
  meta.push({type, name, vertices: pos.length / 3, indices: idx.length, p: offset, i: offset + p.length}); chunks.push(p, i); offset += p.length + i.length;
};
const BONE = /^(Left|Right) (hip bone|femur|tibia|fibula|patella|talus|calcaneus|cuboid bone|(medial|intermediate|lateral) cuneiform bone|(first|second|third|fourth|fifth) metatarsal bone)$|^Navicular bone of (left|right) foot$|^(Proximal|Middle|Distal) phalanx of (left|right) (big|second|third|fourth|little) toe$|^Sacrum$|^(Fourth|Fifth) lumbar vertebra$/;
for (const p of full.atlas.parts) {
  if (p.stream === 'vessel-ends' || p.bounds[0][1] > 1.1 || p.bounds[1][1] < -.01 || Math.abs((p.bounds[0][0] + p.bounds[1][0]) / 2) > .2) continue;
  const g = full.geometry(p);
  if (p.system === 'skeletal' && BONE.test(p.name)) add('bone', p.name, g.positions, g.indices);
  else if (p.system === 'venous' && !/penis|palmar|carpal/.test(p.name)) add('vein', p.name, g.positions, g.indices);
  else if (p.system === 'arterial' && !/penis|palmar|carpal|coronary/.test(p.name)) add('old', p.name, g.positions, g.indices);
}
for (const v of vessels) add('new', v.name, v.geometry.positions, v.geometry.indices);
const dumpMeta = JSON.stringify(meta), dumpBin = Buffer.concat(chunks);

const html = `<!doctype html><meta charset=utf-8><body style="margin:0;background:#dfe3e6"><canvas id=c width=900 height=1100></canvas><script type=module>
import * as T from '/three.js';
const r = new T.WebGLRenderer({canvas: document.getElementById('c'), antialias: true, preserveDrawingBuffer: true}); r.setPixelRatio(1); r.setClearColor(0xdfe3e6);
const scene = new T.Scene(), COL = {bone: 0xe8e2cf, vein: 0x2b63b8, old: 0x9a9a9a, new: 0xd0202c};
scene.add(new T.HemisphereLight(0xffffff, 0x8a9399, 1.05)); const key = new T.DirectionalLight(0xffffff, 1.5); scene.add(key); scene.add(key.target);
const mats = Object.fromEntries(Object.entries(COL).map(([k, c]) => [k, new T.MeshStandardMaterial({color: c, roughness: .55, metalness: 0, side: T.DoubleSide, transparent: k === 'bone', opacity: k === 'bone' ? .55 : 1})]));
const groups = {};
window.load = async () => {
  const meta = await (await fetch('/dump.json')).json(), buf = await (await fetch('/dump.bin')).arrayBuffer();
  for (const m of meta) {
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(buf.slice(m.p, m.p + m.vertices * 12)), 3));
    g.setIndex(new T.BufferAttribute(new Uint32Array(buf.slice(m.i, m.i + m.indices * 4)), 1)); g.computeVertexNormals();
    const mesh = new T.Mesh(g, mats[m.type]); (groups[m.type] ??= new T.Group()).add(mesh);
  }
  for (const g of Object.values(groups)) scene.add(g);
};
window.show = types => { for (const [k, g] of Object.entries(groups)) g.visible = types.includes(k); };
window.view = (target, dir, dist, fov) => {
  const cam = new T.PerspectiveCamera(fov, 900 / 1100, .02, 20), d = new T.Vector3(...dir).normalize(), t = new T.Vector3(...target);
  cam.position.copy(t).addScaledVector(d, dist); cam.lookAt(t); cam.updateMatrixWorld(); key.position.copy(cam.position).add(new T.Vector3(.4, .8, .3).multiplyScalar(dist)); key.target.position.copy(t); r.render(scene, cam);
};
</script>`;
const server = http.createServer((req, res) => {
  if (req.url === '/') { res.setHeader('content-type', 'text/html'); return res.end(html); }
  if (req.url === '/three.js') { res.setHeader('content-type', 'text/javascript'); return res.end(fs.readFileSync(three)); }
  if (req.url === '/dump.json') return res.end(dumpMeta);
  if (req.url === '/dump.bin') return res.end(dumpBin);
  res.statusCode = 404; res.end();
}).listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const b = await chromium.launch({args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']}), p = await b.newPage({viewport: {width: 900, height: 1100}});
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/`); await p.evaluate(() => window.load());
  // whole pelvis and thigh (y 0.45 - 1.05), then close-ups
  const SHOTS = [
    ['front', [0, .68, 0], [0, .05, 1], 2.2, 22], ['back', [0, .68, 0], [0, .05, -1], 2.2, 22], ['left', [0, .68, 0], [1, .05, 0], 2.2, 22], ['right', [0, .68, 0], [-1, .05, 0], 2.2, 22],
    ['groin-front', [.0, .9, .03], [0, .1, 1], .55, 22], ['hip-back', [.0, .93, -.04], [0, .1, -1], .55, 22],
    ['leg-front', [0, .24, 0], [0, .05, 1], 1.0, 22], ['leg-back', [0, .24, 0], [0, .05, -1], 1.0, 22], ['leg-left', [0, .24, 0], [1, .05, 0], 1.0, 22],
    ['ankle-front', [0, .07, .03], [0, .12, 1], .42, 22], ['ankle-back', [0, .06, -.03], [0, .12, -1], .42, 22], ['ankle-left', [0, .06, 0], [1, .08, 0], .42, 22],
    ['foot-top-left', [.09, .03, .1], [0, 1, .02], .45, 22], ['foot-top-right', [-.09, .03, .1], [0, 1, .02], .45, 22], ['foot-medial', [.09, .04, .1], [-1, .1, 0], .45, 22],
    ['knee-front', [.0, .45, .03], [0, .1, 1], .5, 22], ['knee-back', [.0, .45, -.03], [0, .1, -1], .5, 22], ['knee-left', [.0, .45, 0], [1, .05, 0], .5, 22],
  ];
  for (const [mode, types] of [['bones', ['bone', 'vein', 'old', 'new']], ['vessels', ['vein', 'old', 'new']], ['new-only', ['new']]]) {
    await p.evaluate(t => window.show(t), types);
    for (const [name, target, dir, dist, fov] of SHOTS) { await p.evaluate(a => window.view(...a), [target, dir, dist, fov]); await p.locator('#c').screenshot({path: path.join(out, `${mode}-${name}.png`)}); }
  }
  console.log('drew', 3 * SHOTS.length, 'pictures in', out);
  await b.close(); server.close();
});

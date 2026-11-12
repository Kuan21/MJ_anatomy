// Draws the dumps of scripts/render-vessel-views.mjs (arteries red, veins blue, bones ivory) with three.js in headless Chromium (software GL), one PNG per view.
//   node scripts/render-vessel-views.cjs <dump dir> <out dir> <label> [camera.json]
// The cameras are fitted to the first state that is drawn and written to camera.json; the second state reuses them, so before/after pictures line up pixel for pixel.
const {chromium} = require('playwright'), http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const [dump, out, label, camFile] = process.argv.slice(2);
const root = path.resolve(__dirname, '..'), three = path.join(root, 'node_modules/three/build/three.module.js');
const VIEWS = [
  ['upper-front', 'upper-neutral', [0, 0.04, 1]], ['upper-back', 'upper-neutral', [0, 0.04, -1]], ['lower-front', 'lower-neutral', [0, 0.04, 1]], ['lower-back', 'lower-neutral', [0, 0.04, -1]],
  ['shoulder-abd90', 'shoulder-abd90', [0, 0.04, 1]], ['elbow-flex90', 'elbow-flex90', [1, 0.05, 0.1]], ['knee-flex90', 'knee-flex90', [1, 0.05, 0]],
];
const cams = camFile && fs.existsSync(camFile) ? JSON.parse(fs.readFileSync(camFile, 'utf8')) : {};
const html = `<!doctype html><meta charset=utf-8><body style="margin:0;background:#c9d1d6"><canvas id=c width=900 height=900></canvas><script type=module>
import * as T from '/three.js';
const r = new T.WebGLRenderer({canvas: document.getElementById('c'), antialias: true, preserveDrawingBuffer: true}); r.setPixelRatio(1); r.setClearColor(0xc9d1d6);
const scene = new T.Scene(), COL = {artery: 0xb3202a, vein: 0x2b63b8, bone: 0xe8e2cf};
scene.add(new T.HemisphereLight(0xffffff, 0x8a9399, 1.05)); const key = new T.DirectionalLight(0xffffff, 1.5); scene.add(key); scene.add(key.target);
const mats = Object.fromEntries(Object.entries(COL).map(([k, c]) => [k, new T.MeshStandardMaterial({color: c, roughness: .55, metalness: 0, side: T.DoubleSide})]));
let group = null;
window.load = async (name) => {
  if (group) { scene.remove(group); group.traverse(o => o.geometry?.dispose()); }
  const meta = await (await fetch('/dump/' + name + '.json')).json(), buf = await (await fetch('/dump/' + name + '.bin')).arrayBuffer();
  group = new T.Group(); const box = new T.Box3();
  for (const m of meta) {
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(new Float32Array(buf.slice(m.p, m.p + m.vertices * 12)), 3)); g.setAttribute('normal', new T.BufferAttribute(new Float32Array(buf.slice(m.n, m.n + m.vertices * 12)), 3));
    g.setIndex(new T.BufferAttribute(new Uint32Array(buf.slice(m.i, m.i + m.indices * 4)), 1)); g.computeBoundingBox(); box.union(g.boundingBox);
    group.add(new T.Mesh(g, mats[m.type]));
  }
  scene.add(group); return {min: box.min.toArray(), max: box.max.toArray()};
};
window.view = (target, dir, dist, fov) => {
  const cam = new T.PerspectiveCamera(fov, 1, .02, 20), d = new T.Vector3(...dir).normalize(), t = new T.Vector3(...target);
  cam.position.copy(t).addScaledVector(d, dist); cam.lookAt(t); cam.updateMatrixWorld(); key.position.copy(cam.position).add(new T.Vector3(.4, .8, .3).multiplyScalar(dist)); key.target.position.copy(t);
  r.render(scene, cam);
};
</script>`;
const server = http.createServer((req, res) => {
  if (req.url === '/') { res.setHeader('content-type', 'text/html'); return res.end(html); }
  if (req.url === '/three.js') { res.setHeader('content-type', 'text/javascript'); return res.end(fs.readFileSync(three)); }
  if (req.url.startsWith('/dump/')) { const f = path.join(dump, path.basename(req.url)); if (fs.existsSync(f)) return res.end(fs.readFileSync(f)); }
  res.statusCode = 404; res.end();
}).listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const b = await chromium.launch({args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']}), p = await b.newPage({viewport: {width: 900, height: 900}});
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('console', m.text()); });
  await p.goto(`http://127.0.0.1:${port}/`); fs.mkdirSync(out, {recursive: true});
  let loaded = null, box = null;
  for (const [name, pose, dir] of VIEWS) {
    if (loaded !== pose) { box = await p.evaluate(n => window.load(n), pose); loaded = pose; }
    if (!cams[name]) {
      const c = box.min.map((v, i) => (v + box.max[i]) / 2), ext = box.max.map((v, i) => v - box.min[i]), fov = 22;
      // distance so that the larger of the two extents seen from this side fits with a margin
      const horiz = Math.abs(dir[0]) > Math.abs(dir[2]) ? ext[2] : ext[0], size = Math.max(ext[1], horiz) * 1.12;
      cams[name] = {target: c, dist: size / 2 / Math.tan(fov / 2 * Math.PI / 180), fov};
    }
    const c = cams[name]; await p.evaluate(([t, d, dist, fov]) => window.view(t, d, dist, fov), [c.target, dir, c.dist, c.fov]);
    await p.locator('#c').screenshot({path: path.join(out, `${label}-${name}.png`)}); console.log('drew', label, name);
  }
  if (camFile) fs.writeFileSync(camFile, JSON.stringify(cams, null, 1));
  await b.close(); server.close();
});

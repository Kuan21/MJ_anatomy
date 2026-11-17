// Regression: in public/models/joints.glb every tissue whose name ends in .l / .r lies on that side of the body (mesh centroid x; positive x = the person's Left),
// and the two sides of a pair are mirror images (centroids about equal in size and opposite in sign). Fixed here: the two lateral temporomandibular ligaments were reversed
// in the official model (see SIDE_SWAPPED in scripts/extract-zanatomy-joints.mjs). Midline tissues (|x| < 2 mm) are not judged. Prints pass/fail and counts only.
//   node scripts/test-joints-lr-names.mjs [--list]
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root = new URL('../', import.meta.url);
const factory = createRequire(import.meta.url)(fileURLToPath(new URL('.sites-runtime/nerve-draco.cjs', root)));
const draco = await factory({wasmBinary: fs.readFileSync(new URL('public/draco/draco_decoder.wasm', root))});
const b = fs.readFileSync(new URL('public/models/joints.glb', root)), n = b.readUInt32LE(12), j = JSON.parse(b.subarray(20, 20 + n)), bin = b.subarray(28 + n);
const MID_MM = 2, rows = [];
for (const node of j.nodes) {
  const m = /^(.*)\.(l|r)$/.exec(node.name); if (!m || node.mesh === undefined) continue;
  const ext = j.meshes[node.mesh].primitives[0].extensions.KHR_draco_mesh_compression, v = j.bufferViews[ext.bufferView], buf = new draco.DecoderBuffer(), d = new draco.Decoder(), mesh = new draco.Mesh();
  const bytes = bin.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength); buf.Init(bytes, bytes.length);
  assert.ok(d.DecodeBufferToMesh(buf, mesh).ok(), `decode ${node.name}`);
  const values = new draco.DracoFloat32Array(); d.GetAttributeFloatForAllPoints(mesh, d.GetAttributeByUniqueId(mesh, ext.attributes.POSITION), values);
  let sx = 0; const count = mesh.num_points(); for (let k = 0; k < count; k++) sx += values.GetValue(k * 3);
  for (const o of [values, mesh, d, buf]) draco.destroy(o);
  rows.push({name: node.name, base: m[1], side: m[2], cx: sx / count * 1e3});
}
assert.ok(rows.length > 250, 'the scan sees the paired joint tissues');
const bad = rows.filter(r => Math.abs(r.cx) >= MID_MM && (r.cx > 0 ? 'l' : 'r') !== r.side);
if (process.argv.includes('--list')) for (const r of rows) console.log(`${r.name}\t${r.cx.toFixed(1)}`);
assert.deepEqual(bad.map(r => `${r.name} x=${r.cx.toFixed(1)} mm`), [], 'name side differs from mesh side');
const byBase = new Map(); for (const r of rows) (byBase.get(r.base) ?? byBase.set(r.base, {}).get(r.base))[r.side] = r;
const pairs = [...byBase.values()].filter(p => p.l && p.r);
const lopsided = pairs.filter(p => Math.abs(p.l.cx) >= MID_MM && Math.abs(p.r.cx) >= MID_MM && Math.abs(Math.abs(p.l.cx) - Math.abs(p.r.cx)) > 15);
assert.deepEqual(lopsided.map(p => p.l.base), [], 'the two sides of a pair are not mirror images');
const tmj = byBase.get('Lateral temporomandibular ligament');
assert.ok(tmj.l.cx > 40 && tmj.r.cx < -40, 'lateral temporomandibular ligament: .l on the Left (+x), .r on the Right (-x)');
console.log(`Joint left/right names OK: ${rows.length} paired tissues (${pairs.length} pairs) checked, none reversed.`);

// Decodes the artery meshes of the Brain Project model (public/models/brain.glb) for node scripts: every node of category "arteries", including the vertebral arteries that the brain
// detail viewer leaves out. Positions are the model's own frame (metres; +x the body's left, +y up, +z front). Used by the circle of Willis animation test.
import fs from 'node:fs';
import {createRequire} from 'node:module';

const root = new URL('../../', import.meta.url);
/** [{label, side, positions: Float32Array, index: Uint32Array}] */
export async function loadBrainArteries() {
  const factory = createRequire(import.meta.url)(new URL('.sites-runtime/nerve-draco.cjs', root).pathname);
  const draco = await factory({wasmBinary: fs.readFileSync(new URL('public/draco/draco_decoder.wasm', root))});
  const b = fs.readFileSync(new URL('public/models/brain.glb', root)), n = b.readUInt32LE(12), j = JSON.parse(b.subarray(20, 20 + n)), bin = b.subarray(28 + n);
  const out = [];
  for (const node of j.nodes) {
    const x = node.extras ?? {};
    if (x.bx_cat !== 'arteries' || node.mesh === undefined) continue;
    const pos = [], idx = [];
    for (const p of j.meshes[node.mesh].primitives) {
      const ext = p.extensions.KHR_draco_mesh_compression, v = j.bufferViews[ext.bufferView], buf = new draco.DecoderBuffer(), d = new draco.Decoder(), m = new draco.Mesh();
      const bytes = bin.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength);
      buf.Init(bytes, bytes.length);
      if (!d.DecodeBufferToMesh(buf, m).ok()) throw Error('brain.glb: Draco decode failed');
      const values = new draco.DracoFloat32Array(), faces = new draco.DracoInt32Array(), base = pos.length / 3;
      d.GetAttributeFloatForAllPoints(m, d.GetAttributeByUniqueId(m, ext.attributes.POSITION), values);
      for (let k = 0; k < m.num_points() * 3; k++) pos.push(values.GetValue(k));
      for (let f = 0; f < m.num_faces(); f++) {d.GetFaceFromMesh(m, f, faces); idx.push(base + faces.GetValue(0), base + faces.GetValue(1), base + faces.GetValue(2));}
      for (const o of [values, faces, m, d, buf]) draco.destroy(o);
    }
    out.push({label: String(x.bx_label), side: String(x.bx_side ?? ''), positions: Float32Array.from(pos), index: Uint32Array.from(idx)});
  }
  return out;
}

// Reads the joint soft tissue (public/models/joints.glb) the way the site does: decode the Draco meshes, then register every tissue to the atlas bones
// with createJointAnatomy (app/biomechanics-v2/joint-anatomy.ts). The neutral-pose positions (`base`) are what the quiz draws.
import fs from 'node:fs';
import {createRequire} from 'node:module';
import * as T from 'three';
import {quizModule} from '../quiz-modules.mjs';

const root = new URL('../../', import.meta.url);
export async function loadJointRows(atlas) {
  const {createJointAnatomy} = await quizModule('app/biomechanics-v2/joint-anatomy.ts');
  const factory = createRequire(import.meta.url)(new URL('.sites-runtime/nerve-draco.cjs', root).pathname);
  const draco = await factory({wasmBinary: fs.readFileSync(new URL('public/draco/draco_decoder.wasm', root))});
  const b = fs.readFileSync(new URL('public/models/joints.glb', root)), n = b.readUInt32LE(12), j = JSON.parse(b.subarray(20, 20 + n)), bin = b.subarray(28 + n);
  const world = [], parents = new Map();
  j.nodes.forEach((node, i) => (node.children ?? []).forEach(c => parents.set(c, i)));
  const matrix = i => {
    if (world[i]) return world[i];
    const node = j.nodes[i];
    const local = node.matrix ? new T.Matrix4().fromArray(node.matrix) : new T.Matrix4().compose(new T.Vector3(...(node.translation ?? [0, 0, 0])), new T.Quaternion(...(node.rotation ?? [0, 0, 0, 1])), new T.Vector3(...(node.scale ?? [1, 1, 1])));
    return world[i] = parents.has(i) ? matrix(parents.get(i)).clone().multiply(local) : local;
  };
  const source = new T.Group();
  for (const [i, node] of j.nodes.entries()) if (node.mesh !== undefined) for (const p of j.meshes[node.mesh].primitives) {
    const ext = p.extensions.KHR_draco_mesh_compression, v = j.bufferViews[ext.bufferView], buf = new draco.DecoderBuffer(), d = new draco.Decoder(), m = new draco.Mesh();
    const bytes = bin.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength);
    buf.Init(bytes, bytes.length);
    if (!d.DecodeBufferToMesh(buf, m).ok()) throw Error('joints.glb: Draco decode failed');
    const values = new draco.DracoFloat32Array();
    d.GetAttributeFloatForAllPoints(m, d.GetAttributeByUniqueId(m, ext.attributes.POSITION), values);
    const pos = Float32Array.from({length: m.num_points() * 3}, (_, k) => values.GetValue(k)), faces = new draco.DracoInt32Array(), indices = [];
    for (let f = 0; f < m.num_faces(); f++) {d.GetFaceFromMesh(m, f, faces); indices.push(faces.GetValue(0), faces.GetValue(1), faces.GetValue(2));}
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setIndex(indices);
    const mesh = new T.Mesh(g); mesh.name = node.name; mesh.userData = node.extras ?? {}; mesh.matrixAutoUpdate = false; mesh.matrix.copy(matrix(i));
    source.add(mesh);
    for (const o of [values, faces, m, d, buf]) draco.destroy(o);
  }
  const controller = createJointAnatomy(atlas, new T.Scene());
  controller.add(source);
  return controller.rows;
}

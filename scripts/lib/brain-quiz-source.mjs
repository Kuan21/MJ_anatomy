// Reads the Brain Project model (public/models/brain.glb, the one the brain viewer draws) for the brain quiz: decodes the Draco meshes and prepares every labelled node the way
// app/organ/brain-viewer.ts does (pieces of a node merged into one welded geometry, the fourth ventricle reshaped, cranial nerves cut to the stretch near the brain), so the quiz draws
// the same shapes as the main site. The viewer's extra Loop subdivision step of the cortex is left out: it quadruples the triangles (46 MB instead of 12 MB for the whole brain) and the quiz
// shades the welded mesh smoothly instead. Nothing is added or moved.
import fs from 'node:fs';
import {createRequire} from 'node:module';
import * as T from 'three';
import {mergeGeometries, mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {quizModule} from '../quiz-modules.mjs';

const root = new URL('../../', import.meta.url);
/** Same numbers as the brain viewer: groups that are smoothed, and how far a cranial nerve is drawn from the brain. */
const SMOOTHED = /^(frontal|parietal|temporal|occipital|limbic|insula|cortex-other|cerebellum|brainstem)$/;
const NERVE_REACH = .012;

export async function loadBrainRows() {
  const {describeBrainNode, displayEn} = await quizModule('app/organ/brain-catalogue.ts');
  const {nearMask, keepNear} = await quizModule('app/organ/brain-smooth.ts');
  const {fourthVentricleGeometry} = await quizModule('app/organ/brain-reshape.ts');
  const {PERIPHERAL_NERVE} = await quizModule('app/quiz/brain.ts');
  const factory = createRequire(import.meta.url)(new URL('.sites-runtime/nerve-draco.cjs', root).pathname);
  const draco = await factory({wasmBinary: fs.readFileSync(new URL('public/draco/draco_decoder.wasm', root))});
  const b = fs.readFileSync(new URL('public/models/brain.glb', root)), n = b.readUInt32LE(12), j = JSON.parse(b.subarray(20, 20 + n)), bin = b.subarray(28 + n);
  const rows = [], dropped = [];
  for (const node of j.nodes) {
    const x = node.extras ?? {};
    if (!x.bx_cat) continue;
    const raw = {name: node.name, cat: String(x.bx_cat), region: String(x.bx_region ?? ''), label: String(x.bx_label ?? ''), side: String(x.bx_side ?? '')};
    const pieces = [];
    for (const p of node.mesh === undefined ? [] : j.meshes[node.mesh].primitives) {
      const ext = p.extensions.KHR_draco_mesh_compression, v = j.bufferViews[ext.bufferView], buf = new draco.DecoderBuffer(), d = new draco.Decoder(), m = new draco.Mesh();
      const bytes = bin.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength);
      buf.Init(bytes, bytes.length);
      if (!d.DecodeBufferToMesh(buf, m).ok()) throw Error('brain.glb: Draco decode failed');
      const values = new draco.DracoFloat32Array();
      d.GetAttributeFloatForAllPoints(m, d.GetAttributeByUniqueId(m, ext.attributes.POSITION), values);
      const pos = Float32Array.from({length: m.num_points() * 3}, (_, k) => values.GetValue(k)), faces = new draco.DracoInt32Array(), indices = [];
      for (let f = 0; f < m.num_faces(); f++) {d.GetFaceFromMesh(m, f, faces); indices.push(faces.GetValue(0), faces.GetValue(1), faces.GetValue(2));}
      // the viewer takes the position attribute of the non-indexed geometry
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setIndex(indices);
      const flat = g.toNonIndexed(), ng = new T.BufferGeometry();
      ng.setAttribute('position', flat.getAttribute('position'));
      pieces.push(ng);
      for (const o of [values, faces, m, d, buf]) draco.destroy(o);
    }
    const part = describeBrainNode(raw, rows.length + dropped.length);
    if (!part) {dropped.push({raw, reason: 'not-brain'}); continue;}
    if (!pieces.length) {dropped.push({raw, part, reason: 'no-drawable-mesh'}); continue;}
    let geometry = mergeVertices(mergeGeometries(pieces, false), 1e-6);
    if (/^fourth ventricle$/i.test(part.en)) geometry = fourthVentricleGeometry(geometry);
    rows.push({raw, part, name: displayEn(part), geometry});
  }
  // cranial nerves: only the stretch near the brain is drawn (the rest is peripheral), as in the viewer
  const clouds = [];
  for (const r of rows) {
    if (!SMOOTHED.test(r.part.group)) continue;
    const a = r.geometry.getAttribute('position'), c = [];
    for (let i = 0; i < a.count; i++) c.push(a.getX(i), a.getY(i), a.getZ(i));
    clouds.push(c);
  }
  const mask = nearMask(clouds, .003, NERVE_REACH), kept = [];
  for (const r of rows) {
    if (r.part.group === 'cranial') {
      if (PERIPHERAL_NERVE.test(r.part.en)) {dropped.push({...r, reason: 'peripheral-nerve'}); continue;}
      const near = r.geometry.getIndex() ? keepNear(r.geometry, mask) : null;
      if (!near) {dropped.push({...r, reason: 'peripheral-nerve'}); continue;}
      r.geometry = near;
    }
    r.geometry.computeVertexNormals(); r.geometry.computeBoundingBox();
    kept.push(r);
  }
  return {rows: kept, dropped};
}

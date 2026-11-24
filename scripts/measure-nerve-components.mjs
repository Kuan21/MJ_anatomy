// Connected pieces of the source nerve meshes (nervous.glb): where each piece runs and which landmark its two ends are nearest to. Read-only, reproducible.
//   node scripts/measure-nerve-components.mjs <mesh name, e.g. "Facial nerve (VII).l"> [--json]
// Each piece is a branch or a ganglion of the source mesh that has no name of its own (the whole mesh carries one name). The two ends of a piece are the vertex farthest from its centroid and the vertex
// farthest from that one (the tube's tips), the root end being the one nearer to the root landmark. Landmarks are meshes of the atlas (bones, foramina, teeth, other nerves).
import {loadWorld} from './lib/paokao-world.mjs';
import {closest} from './lib/heart-geom.mjs';
export function pieces(m) {
  const I = m.indices, n = m.positions.length / 3, par = [...Array(n).keys()], find = x => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  for (let t = 0; t < I.length; t += 3) { const a = find(I[t]), b = find(I[t + 1]), c = find(I[t + 2]); par[b] = a; par[c] = a; }
  const mp = new Map(); for (let i = 0; i < n; i++) (mp.get(find(i)) ?? mp.set(find(i), []).get(find(i))).push(i);
  return [...mp.values()].sort((a, b) => b.length - a.length).map((vs, k) => {
    const P = m.positions, at = i => [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]], c = [0, 1, 2].map(a => vs.reduce((s, i) => s + P[i * 3 + a], 0) / vs.length), d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
    const A = vs.reduce((b, i) => d(at(i), c) > d(at(b), c) ? i : b, vs[0]), B = vs.reduce((b, i) => d(at(i), at(A)) > d(at(b), at(A)) ? i : b, vs[0]);
    const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (const i of vs) for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], P[i * 3 + a]); hi[a] = Math.max(hi[a], P[i * 3 + a]); }
    return {id: k + 1, verts: vs.length, lo, hi, ends: [at(A), at(B)], chord: d(at(A), at(B))};
  });
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const name = process.argv[2], w = loadWorld({paokao: true}), m = w.mesh(name), mm = v => v.map(x => (x * 1000).toFixed(0)).join(',');
  const sideName = /\.l$/.test(name) ? 'Left' : 'Right', LM = ['Mandible', `${sideName} angle of mandible`, `${sideName} zygomatic bone`, `${sideName} zygomatic arch`, `${sideName} maxilla`, `${sideName} stylomastoid foramen`, `${sideName} upper secondary canine tooth`, 'Mastoid process', `${sideName} sternocleidomastoid`, 'Skin'].filter(n => w.has(n));
  for (const p of pieces(m)) {
    console.log(`piece ${p.id}: ${p.verts} vertices, x ${mm([p.lo[0]])}..${mm([p.hi[0]])} y ${mm([p.lo[1]])}..${mm([p.hi[1]])} z ${mm([p.lo[2]])}..${mm([p.hi[2]])} mm, chord ${(p.chord * 1000).toFixed(0)} mm`);
    for (const [k, e] of p.ends.entries()) console.log(`   end ${k + 1} (${mm(e)}): ` + LM.map(n => `${n} ${(closest(w.mesh(n), e).d * 1000).toFixed(1)}`).join('; '));
  }
}

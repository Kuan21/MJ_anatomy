// Share of interior edges whose two faces fold over (dihedral angle above `angle` degrees) in one mesh {positions, indices}, welded by position: a smooth tendon or band has a few percent at most,
// a pleated one (every section of the loft a zig-zag polygon) 10-17 %.
export function foldShare({positions: P, indices: I}, angle = 100) {
  const nv = P.length / 3, map = new Map(), rep = new Uint32Array(nv);
  for (let i = 0; i < nv; i++) { const k = Math.round(P[i * 3] * 1e5) + ',' + Math.round(P[i * 3 + 1] * 1e5) + ',' + Math.round(P[i * 3 + 2] * 1e5); let r = map.get(k); if (r === undefined) { r = i; map.set(k, r); } rep[i] = r; }
  const nt = I.length / 3, fn = new Float32Array(nt * 3), ok = new Uint8Array(nt), edges = new Map();
  for (let t = 0; t < nt; t++) {
    const a = I[t * 3], b = I[t * 3 + 1], c = I[t * 3 + 2], ux = P[b * 3] - P[a * 3], uy = P[b * 3 + 1] - P[a * 3 + 1], uz = P[b * 3 + 2] - P[a * 3 + 2], vx = P[c * 3] - P[a * 3], vy = P[c * 3 + 1] - P[a * 3 + 1], vz = P[c * 3 + 2] - P[a * 3 + 2];
    const x = uy * vz - uz * vy, y = uz * vx - ux * vz, z = ux * vy - uy * vx, l = Math.hypot(x, y, z); if (l < 1e-14) continue; fn[t * 3] = x / l; fn[t * 3 + 1] = y / l; fn[t * 3 + 2] = z / l; ok[t] = 1;
    const r = [rep[a], rep[b], rep[c]]; for (let e = 0; e < 3; e++) { const p = r[e], q = r[(e + 1) % 3]; if (p === q) continue; const k = p < q ? p * nv + q : q * nv + p; const o = edges.get(k); if (o === undefined) edges.set(k, [t]); else o.push(t); }
  }
  let total = 0, bad = 0; const cos = Math.cos(angle * Math.PI / 180);
  for (const l of edges.values()) { if (l.length !== 2 || !ok[l[0]] || !ok[l[1]]) continue; total++; const [s, t] = l; if (fn[s * 3] * fn[t * 3] + fn[s * 3 + 1] * fn[t * 3 + 1] + fn[s * 3 + 2] * fn[t * 3 + 2] < cos) bad++; }
  return total ? bad / total : 0;
}

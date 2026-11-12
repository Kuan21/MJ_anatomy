// Tips (branch ends) of a tube-like mesh: weld the surface into a graph, then repeatedly take the vertex geodesically farthest from the skeleton found so far.
/** Tips of a tube tree: weld the surface into a graph, then repeatedly take the vertex farthest (geodesically) from the skeleton found so far. */
export function tubeTips(g, minBranch = .006) {
  const key = new Map(), pts = [], remap = new Uint32Array(g.pos.length / 3);
  for (let i = 0; i < remap.length; i++) {
    const k = `${Math.round(g.pos[i * 3] * 1e5)},${Math.round(g.pos[i * 3 + 1] * 1e5)},${Math.round(g.pos[i * 3 + 2] * 1e5)}`;
    let v = key.get(k); if (v === undefined) {v = pts.length; key.set(k, v); pts.push([g.pos[i * 3], g.pos[i * 3 + 1], g.pos[i * 3 + 2]]);} remap[i] = v;
  }
  const adj = pts.map(() => new Map());
  const link = (a, b) => {if (a === b) return; const d = Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1], pts[a][2] - pts[b][2]); adj[a].set(b, d); adj[b].set(a, d);};
  for (let i = 0; i < g.idx.length; i += 3) {const a = remap[g.idx[i]], b = remap[g.idx[i + 1]], c = remap[g.idx[i + 2]]; link(a, b); link(b, c); link(c, a);}
  // Dijkstra with a binary heap from several sources
  const dijkstra = sources => {
    const dist = new Float64Array(pts.length).fill(Infinity), prev = new Int32Array(pts.length).fill(-1), heap = [];
    const push = (d, v) => {heap.push([d, v]); let i = heap.length - 1; while (i > 0) {const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p;}};
    const pop = () => {const top = heap[0], last = heap.pop(); if (heap.length) {heap[0] = last; let i = 0; for (;;) {let l = 2 * i + 1, r = l + 1, m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m;}} return top;};
    for (const s of sources) {dist[s] = 0; push(0, s);}
    while (heap.length) {const [d, v] = pop(); if (d > dist[v]) continue; for (const [u, w] of adj[v]) if (d + w < dist[u]) {dist[u] = d + w; prev[u] = v; push(d + w, u);}}
    return {dist, prev};
  };
  const farthest = dist => {let best = -1, bd = -1; for (let i = 0; i < dist.length; i++) if (Number.isFinite(dist[i]) && dist[i] > bd) {bd = dist[i]; best = i;} return {best, bd};};
  let {dist: d0} = dijkstra([0]); const a = farthest(d0).best;
  const {dist: da, prev: pa} = dijkstra([a]); const b = farthest(da).best;
  const tips = [a, b], skeleton = new Set(), walk = (from, prev) => {for (let v = from; v >= 0 && !skeleton.has(v); v = prev[v]) skeleton.add(v);};
  walk(b, pa); skeleton.add(a);
  for (let guard = 0; guard < 40; guard++) {
    const {dist, prev} = dijkstra([...skeleton]), f = farthest(dist);
    if (f.bd < minBranch) break;
    tips.push(f.best); walk(f.best, prev);
  }
  // radius at a tip: distance from the tip to the vertices at 2 mm along the way towards the skeleton
  return {pts, tips, skeleton, adj};
}


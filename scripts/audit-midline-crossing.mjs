// Schematic (build-time) nerves, arteries and veins named Left/Right: does any part reach across the midline (x = 0, left positive) by more than 3 mm?
// usage: node scripts/audit-midline-crossing.mjs [stream.json.gz [dir-with-/models/stream]]   (reads public/models/paokao/paokao-stream.json.gz; output: names and the deepest crossing in mm)
import fs from 'node:fs'; import zlib from 'node:zlib';
const root = new URL('../', import.meta.url), m = JSON.parse(zlib.gunzipSync(fs.readFileSync(process.argv[2] ?? new URL('public/models/paokao/paokao-stream.json.gz', root))));
const rows = [];
for (const p of m.parts) {
  const side = /^Left /.test(p.name) ? 1 : /^Right /.test(p.name) ? -1 : 0; if (!side) continue;
  const b = fs.readFileSync(new URL((process.argv[3] ?? 'public') + m.chunks[p.chunk].url, process.argv[3] ? 'file:///' : root)), c = Buffer.from(b.subarray(p.positions, p.positions + p.vertexCount * 12)), v = new Float32Array(c.buffer, c.byteOffset, p.vertexCount * 3);
  let worst = 0; for (let i = 0; i < v.length; i += 3) worst = Math.max(worst, -v[i] * side * 1000);
  if (worst > 3) rows.push([p.system, p.name, worst.toFixed(1)]);
}
rows.sort((a, b) => b[2] - a[2]); console.log(`${rows.length} schematic parts named Left/Right reach more than 3 mm across the midline`); for (const r of rows) console.log(r.join('  '));

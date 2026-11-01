// Writes app/mj-tendon-owners.ts (tendon structure name -> atlas names of its owner muscle parts) and docs/tendon-owners.md.
// The display rules (app/mj-owners.ts) make a tendon follow its muscle through that table; the file is rewritten on every run so a new tendon spec never leaves it stale.
// 1. A tendon cut off its muscle (scripts/tendon/*.mjs): the muscle parts the spec lists (scripts/lib/tendon-owners.mjs). Nothing is set by hand per tendon.
// 2. A whole-mesh tendon of the source atlas (calcaneal tendon ...) or of a schematic structure: the muscle its name gives ("tendon of <muscle>"), otherwise the muscles whose mesh
//    lies against it (within 4 mm of the nearest one).
// 3. scripts/data/tendon-owner-overrides.json: the few that neither rule can give (the intermediate tendon of digastric).
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {tendonOwners} from './lib/tendon-owners.mjs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {displaySystem} from './lib/runtime-systems.mjs';

const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root));
const {atlas, geometry} = loadFullAtlas({streams: ['paokao/paokao-stream.json.gz']});
const parts = atlas.parts, names = new Set(parts.map(p => p.name));
const data = tendonOwners(names), method = Object.fromEntries(Object.keys(data).map(k => [k, 'cut spec']));
const overrides = JSON.parse(fs.readFileSync(file('scripts/data/tendon-owner-overrides.json'), 'utf8'));
const muscles = parts.filter(p => displaySystem(p) === 'muscular');
const strip = n => n.toLowerCase().replace(/\b(?:left|right)\b ?/g, '').replace(/\s+/g, ' ').trim();
const sideOf = n => /\bleft\b/i.test(n) ? 'left' : /\bright\b/i.test(n) ? 'right' : null;
const minDist = (A, B) => {   // vertex-to-vertex, A sampled to about 400 points
  let best = Infinity; const a = A.positions, b = B.positions, step = Math.max(1, Math.floor(a.length / 3 / 400));
  for (let i = 0; i < a.length / 3; i += step) { const x = a[i * 3], y = a[i * 3 + 1], z = a[i * 3 + 2]; for (let j = 0; j < b.length / 3; j++) { const d = (x - b[j * 3]) ** 2 + (y - b[j * 3 + 1]) ** 2 + (z - b[j * 3 + 2]) ** 2; if (d < best) best = d; } }
  return Math.sqrt(best);
};
const seen = new Set();
for (const p of parts) {
  if (displaySystem(p) !== 'tendon' && p.kind !== 'tendon') continue;
  if (data[p.name] || seen.has(p.name)) continue;
  seen.add(p.name);
  if (overrides[p.name]) { data[p.name] = overrides[p.name]; method[p.name] = 'override'; continue; }
  const side = sideOf(p.name), target = strip(p.name).replace(/^(?:tendons? of )/, ''), side2 = n => !side || sideOf(n) === side || sideOf(n) === null;
  const byName = muscles.filter(m => side2(m.name) && strip(m.name) === target);
  if (/tendons? of /i.test(p.name) && byName.length) { data[p.name] = [...new Set(byName.map(m => m.name))]; method[p.name] = 'name'; continue; }
  const gt = geometry(p), pad = .02, found = [];
  for (const m of muscles) {
    if (!side2(m.name) || m.id === p.id) continue;
    let near = true; for (let k = 0; k < 3; k++) if (m.bounds[1][k] < p.bounds[0][k] - pad || m.bounds[0][k] > p.bounds[1][k] + pad) near = false;
    if (near) found.push([minDist(gt, geometry(m)), m.name]);
  }
  found.sort((x, y) => x[0] - y[0]);
  const chosen = found.filter(f => f[0] <= found[0]?.[0] + .004 && f[0] < .012);
  if (!chosen.length) { console.error(`tendon ${p.name}: no owner muscle found (add it to scripts/data/tendon-owner-overrides.json)`); process.exit(1); }
  data[p.name] = [...new Set(chosen.map(c => c[1]))]; method[p.name] = `proximity (${chosen.map(c => (c[0] * 1000).toFixed(1) + ' mm').join(', ')})`;
}
// 4. Tendon sheaths, the dorsal compartments of the wrist and the palmar aponeurosis (connective tissue) follow the muscle whose tendon they enclose:
//    the owners are those of the tendons listed in the overrides file (sheathTendons), so they come from the cut specs. Retinacula, ligaments and capsules are not listed.
for (const p of parts) {
  if (displaySystem(p) !== 'connective' || data[p.name]) continue;
  const side = sideOf(p.name), bare = strip(p.name), tendons = overrides.sheathTendons[bare];
  if (!tendons) {
    if (/tendon sheath|dorsal compartment|palmar aponeurosis/i.test(p.name)) { console.error(`${p.name}: sheath or aponeurosis without owner (add it to sheathTendons in scripts/data/tendon-owner-overrides.json)`); process.exit(1); }
    continue;
  }
  const W = side === 'left' ? 'Left' : 'Right', owners = new Set();
  for (const t of tendons) { const o = data[`${W} ${t}`]; if (!o) { console.error(`${p.name}: tendon "${W} ${t}" has no owner muscle`); process.exit(1); } o.forEach(m => owners.add(m)); }
  data[p.name] = [...owners]; method[p.name] = 'follows tendon: ' + tendons.map(t => 'tendon' + (/^tendons /.test(t) ? 's' : '') + t.replace(/^tendons? /, ' ')).join(', ');
}
const sorted = Object.fromEntries(Object.entries(data).sort(([a], [b]) => a < b ? -1 : 1));
const text = '// Generated by scripts/prepare-tendon-owners.mjs (do not edit): tendon structure name -> atlas names of the muscle parts it belongs to; see app/mj-owners.ts and docs/tendon-owners.md.\nexport const TENDON_OWNERS: Record<string, string[]> = ' + JSON.stringify(sorted, null, 1) + ';\n';
let old = ''; try { old = fs.readFileSync(file('app/mj-tendon-owners.ts'), 'utf8'); } catch {}
if (old !== text) fs.writeFileSync(file('app/mj-tendon-owners.ts'), text);
let md = '# 肌腱、腱鞘與掌腱膜的所屬肌肉\n\n由 `node scripts/prepare-tendon-owners.mjs` 產生。肌腱、腱鞘（含腕背伸肌間隔）與掌腱膜跟著所屬肌肉顯示（分區、左右、分層、組織深度、隱藏、單獨顯示）；歸屬由切分規格自動推得，沒有逐條手設。\n\n| 結構 | 所屬肌肉（模型名稱） | 來源 |\n| --- | --- | --- |\n';
for (const [k, v] of Object.entries(sorted)) md += `| ${k} | ${v.join('；')} | ${method[k]} |\n`;
let oldMd = ''; try { oldMd = fs.readFileSync(file('docs/tendon-owners.md'), 'utf8'); } catch {}
if (oldMd !== md) fs.writeFileSync(file('docs/tendon-owners.md'), md);
console.log(`Tendon owners: ${Object.keys(sorted).length} tendon structures tied to their muscle (${Object.values(method).filter(m => m === 'cut spec').length} from cut specs, ${Object.values(method).filter(m => m !== 'cut spec').length} by name, proximity or override)${old === text ? '' : ' (updated)'}.`);

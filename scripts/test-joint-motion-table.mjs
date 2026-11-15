// Validates app/data/joint-motion/joints.json (internal joint-motion table). Prints only counts and pass/fail.
import fs from 'node:fs';
const root = new URL('../', import.meta.url).pathname;
const read = f => fs.readFileSync(root + f, 'utf8');
const table = JSON.parse(read('app/data/joint-motion/joints.json'));
const errors = [];
const err = m => errors.push(m);

// Muscle names known to the site (keys of the mf(...) tables).
const muscles = new Set();
for (const f of fs.readdirSync(root + 'app').filter(f => /^mj-muscle-facts-.*\.ts$/.test(f)))
  for (const m of read('app/' + f).matchAll(/^\s*'([^']+)'\s*:\s*mf\(/gm)) muscles.add(m[1]);
if (muscles.size < 100) err(`muscle facts parse looks wrong (${muscles.size} names)`);

// Atlas part names (skipped when the atlas is not present).
let partNames = null;
try { const a = JSON.parse(read('public/models/atlas.json')); partNames = new Set((a.parts || a).map(p => p.name)); } catch { /* optional */ }

// Hard-coded limits in body-motion.ts (head block).
const bl = read('app/biomechanics-v2/body-motion.ts').match(/BODY_LIMITS=\{head:\{([^}]*)\}/);
const limits = {};
if (!bl) err('cannot read BODY_LIMITS.head');
else for (const m of bl[1].matchAll(/(\w+):\[(-?\d+),(-?\d+)\]/g)) limits[m[1]] = [+m[2], +m[3]];

const ids = new Set();
const unique = (id, what) => { if (ids.has(id)) err(`duplicate id ${id} (${what})`); ids.add(id); };
const cjk = /[一-鿿]/;
const roles = ['primeMovers', 'synergists', 'antagonists'];
const sides = new Set(['bilateral', 'ipsilateral', 'contralateral']);
let nMove = 0, discrepancies = [];

if (!table._doc?.frame || !table._doc?.angles) err('_doc must document the frame and angle conventions');
for (const j of table.joints) {
  unique(j.id, 'joint');
  for (const k of ['nameEn', 'nameZh', 'type', 'typeZh']) if (!j[k]) err(`${j.id}: missing ${k}`);
  if (!cjk.test(j.nameZh || '') || !cjk.test(j.typeZh || '')) err(`${j.id}: Chinese names must contain Chinese`);
  for (const k of ['proximal', 'distal']) {
    if (!Array.isArray(j[k]) || !j[k].length) err(`${j.id}: ${k} must list atlas part names`);
    else if (partNames) for (const n of j[k]) if (!partNames.has(n)) err(`${j.id}: part "${n}" not in atlas`);
  }
  if (!j.movements?.length) err(`${j.id}: no movements`);
  for (const m of j.movements || []) {
    nMove++;
    unique(m.id, 'movement');
    if (!m.id.includes('.')) err(`${m.id}: movement id should be prefixed`);
    if (!m.nameEn || !m.nameZh || !cjk.test(m.nameZh)) err(`${m.id}: bilingual names required`);
    if (!['rotation', 'translation'].includes(m.kind)) err(`${m.id}: bad kind`);
    if (!Array.isArray(m.axis) || m.axis.length !== 3 || m.axis.some(v => !Number.isFinite(v))) err(`${m.id}: bad axis`);
    else if (Math.abs(Math.hypot(...m.axis) - 1) > 1e-6) err(`${m.id}: axis not unit length`);
    if (m.pivot !== null && !(Array.isArray(m.pivot) && m.pivot.length === 3 && m.pivot.every(Number.isFinite))) err(`${m.id}: pivot must be null or [x,y,z]`);
    if (!m.pivotLandmark) err(`${m.id}: pivotLandmark text required`);
    const r = m.range;
    if (!r || !(r.min < r.max) || !['deg', 'mm'].includes(r.unit) || r.approximate !== true) err(`${m.id}: range needs min<max, unit deg|mm, approximate:true`);
    else if ((m.kind === 'rotation') !== (r.unit === 'deg')) err(`${m.id}: unit does not match kind`);
    if (!/^(OpenStax A&P|Gray 1918)/.test(m.check || '')) err(`${m.id}: check must cite OpenStax A&P or Gray 1918 only`);
    if (!m.primeMovers?.length) err(`${m.id}: needs at least one prime mover`);
    for (const role of roles) for (const x of m[role] || []) {
      if (!muscles.has(x.muscle)) err(`${m.id}: ${role} "${x.muscle}" not in site muscle facts`);
      if (!sides.has(x.side)) err(`${m.id}: bad side for ${x.muscle}`);
    }
    for (const u of m.unlistedMuscles || []) if (muscles.has(u)) err(`${m.id}: "${u}" now exists in muscle facts; move it into a role list`);
    if (m.codeMapping) {
      const c = m.codeMapping, lim = limits[c.key];
      if (c.limits !== 'head' || !lim) err(`${m.id}: unsupported codeMapping`);
      else {
        // Positive code angle is the named direction when sign=+1; the movement's own max is |limit| on that side.
        const codeMax = c.sign > 0 ? lim[1] : -lim[0];
        if (codeMax !== r.max) discrepancies.push(`${m.id}: table ${r.max} vs BODY_LIMITS.head.${c.key} ${c.sign > 0 ? 'max' : 'min'} ${codeMax}`);
      }
    }
  }
}

// Cantonese colloquial wording is checked for the whole app by check-zh.mjs, which scans app/**/*.json (this file included).
for (const line of discrepancies) console.log('discrepancy (report only): ' + line);
if (errors.length) { for (const e of errors) console.error('FAIL ' + e); process.exit(1); }
console.log(`joint-motion table ok: ${table.joints.length} joints, ${nMove} movements, ${muscles.size} site muscle names, ${discrepancies.length} limit discrepancies reported`);

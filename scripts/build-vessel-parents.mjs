// Parent of every artery, vein and nerve that has one, by structure name, for the viewer's "path from the root to the selected structure" highlight.
//   node scripts/build-vessel-parents.mjs [--check]     writes app/mj-vessel-parents.json (--check only compares and fails when it is out of date)
// Sources (their parents are merged; a structure may have more than one parent):
//   1. scripts/topology-spec.mjs   the relations the build already checks (each branch must touch the structure it leaves), expanded to Right/Left and the nerve suffix .r/.l
//   2. app/mj-paokao.json          the `parent` of every schematic (generated) structure
//   3. app/mj-vessel-branches.json the arterial tree behind the branch list of the artery cards
//   4. app/data/vessel-tree/*.json the leg vessel tree (parent ids, the site's mesh name in `guide`)
//   5. scripts/data/vessel-parent-links.json the continuations of the main trunks that none of the above carries (aorta, subclavian→axillary, brachiocephalic veins …)
// A parent is the structure a branch leaves (artery), drains into (vein) or comes off (nerve), so following parents from any structure ends at the aorta, a vena cava or a nerve root.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {expand} from './lib/topology.mjs';
import {ARTERIES, VEINS, NERVES} from './topology-spec.mjs';
import {loadWorld} from './lib/paokao-world.mjs';
import {inferParents} from './lib/vessel-parent-infer.mjs';

const root = new URL('../', import.meta.url), file = f => fileURLToPath(new URL(f, root)), check = process.argv.includes('--check');
const parents = new Map();   // child -> ordered list of parents (a few structures really have two: the median cubital vein joins the cephalic and the basilic vein, the median nerve has two roots)
const put = (child, parent) => {
  if (!child || !parent || child === parent) return;
  const list = parents.get(child) ?? parents.set(child, []).get(child);
  if (!list.includes(parent)) list.push(parent);
};
for (const r of [...expand(ARTERIES, 'artery'), ...expand(VEINS, 'vein'), ...expand(NERVES, 'nerve')]) put(r.child, r.parent);
const world = loadWorld({paokao: true});
const paokao = JSON.parse(fs.readFileSync(file('app/mj-paokao.json'), 'utf8'));
for (const v of Object.values(paokao)) if (['arterial', 'venous', 'nervous'].includes(v.system) && v.parent) put(v.name, v.parent);
// the leg vessel tree (app/data/vessel-tree): each vessel's `guide` is the name of the mesh the site draws for it ({S} = Right/Left, {s} = right/left); a vessel without a mesh is skipped over
for (const f of fs.readdirSync(file('app/data/vessel-tree')).filter(f => f.endsWith('.json'))) {
  const tree = JSON.parse(fs.readFileSync(file('app/data/vessel-tree/' + f), 'utf8')), byId = new Map(tree.vessels.map(v => [v.id, v]));
  const meshAbove = v => { for (let p = byId.get(v.parent); p; p = byId.get(p.parent)) if (p.guide) return p; return null; };
  for (const v of tree.vessels) {
    if (!v.guide || !v.parent) continue;
    const up = meshAbove(v); if (!up) continue;
    for (const S of [{w: 'Right', l: 'right'}, {w: 'Left', l: 'left'}]) put(v.guide.replaceAll('{S}', S.w).replaceAll('{s}', S.l), up.guide.replaceAll('{S}', S.w).replaceAll('{s}', S.l));
  }
}
// links the other sources do not carry (the continuations of the main trunks; each with the textbook fact it states): scripts/data/vessel-parent-links.json
const links = JSON.parse(fs.readFileSync(file('scripts/data/vessel-parent-links.json'), 'utf8'));
const missing = [];
const linkName = (t, S) => S ? t.replaceAll('%', S.w).replace(/\.s$/, '.' + S.s) : t;
for (const l of links.links) for (const S of (l.sided ? [{w: 'Right', l: 'right', s: 'r'}, {w: 'Left', l: 'left', s: 'l'}] : [null])) for (const n of [linkName(l.child, S), linkName(l.parent, S)]) if (!world.has(n)) missing.push(n);
if (missing.length) { console.error(`scripts/data/vessel-parent-links.json names structures the model does not have: ${[...new Set(missing)].join('; ')}`); process.exit(1); }
for (const l of links.links) for (const S of (l.sided ? [{w: 'Right', l: 'right', s: 'r'}, {w: 'Left', l: 'left', s: 'l'}] : [null])) put(S ? l.child.replaceAll('%', S.w).replace(/\.s$/, '.' + S.s) : l.child, S ? l.parent.replaceAll('%', S.w).replace(/\.s$/, '.' + S.s) : l.parent);
const branches = JSON.parse(fs.readFileSync(file('app/mj-vessel-branches.json'), 'utf8'));
for (const [child, parent] of Object.entries(branches.parents ?? {})) put(child, parent);
// a parent must itself be an artery, a vein or a nerve of the model: some topology rules locate a branch by a bone ("second rib") and a bone is no part of a vessel path
const vesselKind = n => world.find(n).some(e => ['arterial', 'venous', 'nervous'].includes(e.system));
const dropped = new Set();
for (const [c, list] of parents) { const keep = list.filter(p => vesselKind(p) || (dropped.add(p), false)); if (keep.length) parents.set(c, keep); else parents.delete(c); }
// 6. what the meshes say, for the structures that no table gives a parent: only candidates for the user to confirm (docs/vessel-parents-candidates.md), never used by the viewer
const inferred = inferParents(world, parents);
// every chain must end (no cycles)
const cyc = []; for (const c of parents.keys()) { const seen = new Set(), stack = [...parents.get(c)]; while (stack.length) { const p = stack.pop(); if (p === c) { cyc.push(c); break; } if (seen.has(p)) continue; seen.add(p); stack.push(...(parents.get(p) ?? [])); } }
if (cyc.length) { console.error(`Vessel parents: a chain loops back on itself (${cyc.slice(0, 5).join('; ')})`); process.exit(1); }
const out = {note: 'Generated by scripts/build-vessel-parents.mjs (do not edit): structure name -> the structure(s) it leaves (artery), drains into (vein) or comes off (nerve).', parents: Object.fromEntries([...parents].sort((a, b) => a[0] < b[0] ? -1 : 1))};
const text = JSON.stringify(out, null, 1) + '\n', target = file('app/mj-vessel-parents.json'), candidatesFile = file('docs/vessel-parents-candidates.md');
const candidates = ['# Candidate parents worked out from the meshes (not used by the viewer)\n',
  'Generated by `node scripts/build-vessel-parents.mjs` (do not edit). For arteries and veins that no table gives a parent, the thicker structure of the same kind on the same side that one of their ends touches (within 2 mm) is listed here as a *candidate*.',
  'The rule is only a guess from the shapes, and many of the guesses are wrong (a vein that really drains into the external iliac vein is listed under the deep femoral vein, the superior vena cava under a brachiocephalic vein), so **nothing here is shown on the site**. A line the user confirms is added to `scripts/data/vessel-parent-links.json` with the textbook fact it states, and then the viewer uses it.\n',
  `${inferred.size} candidates.\n`, '| Structure | Candidate parent |', '| --- | --- |', ...[...inferred].sort((a, b) => a[0] < b[0] ? -1 : 1).map(([c, p]) => `| ${c} | ${p} |`)].join('\n') + '\n';
if (check) {
  const now = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
  if (now(target) !== text || now(candidatesFile) !== candidates) { console.error('app/mj-vessel-parents.json or docs/vessel-parents-candidates.md is out of date: run node scripts/build-vessel-parents.mjs'); process.exit(1); }
  console.log(`Vessel parents up to date: ${parents.size} structures with a parent, ${inferred.size} candidates (not used).`);
} else {
  fs.writeFileSync(target, text); fs.writeFileSync(candidatesFile, candidates);
  console.log(`Vessel parents: ${parents.size} structures with a parent written (${[...parents.values()].filter(l => l.length > 1).length} with more than one; ${dropped.size} bone or other non-vessel parents left out); ${inferred.size} candidates from the meshes listed in docs/vessel-parents-candidates.md (not used by the viewer).`);
}

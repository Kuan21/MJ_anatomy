// Writes docs/owner-visibility-audit.md: for every region and subregion of the top bar, (1) what stays on screen when each organ switch is turned off in turn (vessels, nerves, connective
// tissue) and (2) which tendons, fasciae, aponeuroses, retinacula and sheaths appear when Muscles is off. Display rules: app/mj-owners.ts. `--check` fails when the file is stale
// or when an in-organ vessel/nerve stays on screen with its organ off, or a tendon stays with its muscles off.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import {loadFullAtlas} from './lib/full-atlas.mjs';
import {displaySystem} from './lib/runtime-systems.mjs';

const root = new URL('../', import.meta.url), tmp = new URL('.sites-runtime/', root);
fs.mkdirSync(fileURLToPath(tmp), {recursive: true});
for (const f of ['mj-part-regions', 'mj-region-bar', 'mj-organ-owners', 'mj-tendon-owners', 'mj-owners']) {
  const src = fs.readFileSync(fileURLToPath(new URL(`app/${f}.ts`, root)), 'utf8');
  const js = ts.transpileModule(src, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}}).outputText.replace(/from '\.\/([\w-]+)'/g, "from './$1.mjs'");
  fs.writeFileSync(fileURLToPath(new URL(`${f}.mjs`, tmp)), js);
}
const bar = await import(new URL('mj-region-bar.mjs', tmp)), O = await import(new URL('mj-owners.mjs', tmp)), {isBrainTissue} = await import(new URL('mj-organ-owners.mjs', tmp));
const full = loadFullAtlas(), parts = full.atlas.parts.map(p => p.stream ? p : {...p, system: displaySystem(p)});
const index = bar.buildRegionIndex(parts), owners = O.buildOwners(parts);
const base = n => n.replace(/\b(?:left|right)\b ?/gi, '').replace(/\s+/g, ' ').trim();
const ORGANS = ['cardiac', 'respiratory', 'digestive', 'urinary', 'reproductive', 'lymphatic', 'endocrine', 'serous', 'sensory'];
const ORGAN_ZH = {cardiac: '心臟', respiratory: '呼吸', digestive: '消化', urinary: '泌尿', reproductive: '生殖', lymphatic: '淋巴', endocrine: '內分泌', serous: '漿膜', sensory: '感官', nervous: '神經（腦）'};
const VESSEL = new Set(['arterial', 'venous', 'nervous', 'lymphatic']);
const LIKE = /tendon|tendinous|aponeurosis|fascia|retinaculum|sheath|septum|tract|raphe|ligament|capsule|membrane|bursa|disk|disc/i;
const names = ids => { const m = new Map(); for (const id of ids) { const p = owners.byId.get(id), k = base(p.name); m.set(k, (m.get(k) ?? 0) + 1); } return [...m].sort(([a], [b]) => a < b ? -1 : 1).map(([k, n]) => k + (n > 1 ? ` ×${n}` : '')); };
let md = '# 器官開關與肌腱的顯示檢查（每個區域與子區域）\n\n由 `node scripts/audit-owner-visibility.mjs` 產生。規則見 `app/mj-owners.ts`；歸屬清單見 `docs/organ-owners.md`、`docs/tendon-owners.md`。\n\n' +
  '每一節：區域預設開啟的系統不變，逐一關閉每個器官開關，列出「因此消失的血管與神經」與「全部器官關閉後仍留在畫面上的血管與神經」（這些是經過、沿著的構造）。「肌肉關閉」一欄列出此時仍出現的肌腱（必為 0）與結締組織中的肌腱樣、筋膜樣構造。\n\n';
let bad = 0;
for (const def of bar.REGION_BAR.filter(r => r.key !== 'whole')) for (const sub of def.subs ?? [{id: undefined, label: ''}]) {
  const set = bar.regionMembers(index, parts, def.key, sub.id, 'both'), focus = set.focus.filter(id => owners.byId.has(id)), systems = bar.regionVisible(def.key, sub.id);
  const shown = vis => focus.filter(id => { const p = owners.byId.get(id); return vis.has(p.system) && O.ownerSwitchesOn(owners, p, vis); });
  const vessels = ids => ids.filter(id => VESSEL.has(owners.byId.get(id).system) && !isBrainTissue(owners.byId.get(id)));
  const allOn = new Set(systems), onVessels = vessels(shown(allOn));
  md += `## ${def.label}${sub.label ? ' → ' + sub.label : ''}\n\n開啟的系統：${systems.join('、')}；區域內血管與神經 ${onVessels.length} 個網格。\n\n`;
  for (const o of ORGANS.filter(x => systems.includes(x))) {
    const off = new Set(systems.filter(s => s !== o)), stay = new Set(vessels(shown(off))), gone = onVessels.filter(id => !stay.has(id) && owners.organ.get(id) === o);
    for (const id of vessels(shown(off))) if (owners.organ.get(id) === o) { bad++; console.error(`${def.key}/${sub.id}: ${owners.byId.get(id).name} stays with ${o} off`); }
    md += `- 關閉${ORGAN_ZH[o]}：隨之消失的血管與神經 ${gone.length} 個網格${gone.length ? '：' + names(gone).join('；') : '（沒有；此區域沒有歸屬於它的血管或神經）'}\n`;
  }
  const noOrgans = new Set(systems.filter(s => !ORGANS.includes(s))), rest = vessels(shown(noOrgans));
  md += `- 全部器官關閉：仍顯示 ${rest.length} 個網格（經過、沿著的構造）：${names(rest).join('；') || '無'}\n`;
  const noMuscle = new Set(systems.filter(s => s !== 'muscular')), left = shown(noMuscle);
  const tendons = left.filter(id => owners.byId.get(id).system === 'tendon'), conn = left.filter(id => { const p = owners.byId.get(id); return p.system === 'connective' && LIKE.test(p.name); });
  bad += tendons.length;
  md += `- 肌肉關閉：肌腱 ${tendons.length} 個網格；結締組織中肌腱樣、筋膜樣、韌帶樣構造 ${conn.length} 個網格${conn.length ? '：' + names(conn).join('；') : ''}\n\n`;
}
const out = fileURLToPath(new URL('docs/owner-visibility-audit.md', root));
if (process.argv.includes('--check')) {
  if (bad) { console.error(`${bad} owner visibility problem(s)`); process.exit(1); }
  let old = ''; try { old = fs.readFileSync(out, 'utf8'); } catch {}
  if (old !== md) { console.error('docs/owner-visibility-audit.md is out of date: run node scripts/audit-owner-visibility.mjs'); process.exit(1); }
  console.log('Owner visibility audit OK: no in-organ vessel stays with its organ off, no tendon stays with Muscles off.'); process.exit(0);
}
fs.writeFileSync(out, md); console.log(`docs/owner-visibility-audit.md written (${bad} problems).`);

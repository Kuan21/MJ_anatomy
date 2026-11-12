// Completeness audit: every structure the user's 18 gross-anatomy lectures name (docs/curriculum-terms.json, high recall and noisy)
// against everything the viewer can show. Writes docs/coverage-report.md and docs/coverage-data.json.
//   node scripts/audit-coverage.mjs           regenerate the report
//   node scripts/audit-coverage.mjs --check   fail when coverage regresses (npm run check:coverage)
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {female, serous, paokao, candidateArg, GROUPS, root, models, atlas, facial, supplement, conceptName, partIds, curriculum, entities, extraNames, ABBR, STOP, MOD, GENERIC, NOT_STRUCTURE, LANDMARK, tokens, analyse, fixToken, match, classifyNoise, structureProfile, mergeAtlasStreams, conceptMatches, isIndexed} from './lib/coverage-match.mjs';

// ---------------------------------------------------------------- run
const report = {generated: 'scripts/audit-coverage.mjs', lectures: [], totals: {}, missing: {}, hidden: {}};
const seen = new Map();
for (const lecture of curriculum.lectures) {
  const row = {file: lecture.file, lecture: lecture.lecture, have: [], findability: [], missing: [], landmark: [], noise: 0};
  const local = new Set();
  for (const {en, zh} of lecture.terms) {
    const clean = en.replace(/^[A-Z]\.\s+/, '').replace(/\s+/g, ' ').trim(), key = clean.toLowerCase();
    if (local.has(key)) continue; local.add(key);
    if (classifyNoise(clean)) {row.noise++; continue;}
    const group = GROUPS.find(([re]) => re.test(key.replace(/\s+m\.?$/, ' m').replace(/ muscles?$/, ' muscle')) || re.test(key));
    if (group && !seen.has(key)) {
      const found = group[1].map(member => [member, match(member)]);
      const have = found.filter(([, m]) => m), lacking = found.filter(([, m]) => !m).map(([t]) => t);
      seen.set(key, have.length ? {kind: lacking.length ? 'group-partial' : 'group', entity: have[0][1].entity, name: `${have.length}/${found.length} members` + (lacking.length ? `（缺：${lacking.join('、')}）` : '')} : null);
      for (const t of lacking) if (have.length) row.missing.push({term: `${clean} → ${t}`, zh: null});
    }
    if (!seen.has(key)) seen.set(key, match(clean));
    const m = seen.get(key);
    const item = {term: clean, zh: zh ?? null};
    if (m) {
      Object.assign(item, {kind: m.kind, model: m.name, source: m.entity.source, system: m.entity.system});
      if (m.entity.searchable || m.entity.source === 'atlas') row.have.push(item); else row.findability.push(item);
    } else if (LANDMARK.test(clean) && !/\b(muscle|artery|vein|nerve|ligament|gland|duct)\b/i.test(clean)) row.landmark.push(item);
    else row.missing.push(item);
  }
  report.lectures.push(row);
}
const unique = pick => new Set(report.lectures.flatMap(l => l[pick].map(x => x.term.toLowerCase()))).size;
report.totals = {terms: curriculum.lectures.reduce((n, l) => n + l.terms.length, 0), have: unique('have'), findability: unique('findability'), missing: unique('missing'), landmark: unique('landmark'), noise: report.lectures.reduce((n, l) => n + l.noise, 0)};
// Parts the viewer holds but cannot show or find by any route.
const orphan = {noConcept: atlas.parts.filter(p => !conceptName.get(p.conceptId)).map(p => p.id), systemless: atlas.parts.filter(p => !p.system).map(p => p.id)};
report.orphans = orphan;

const out = {version: 1, totals: report.totals, lectures: report.lectures.map(l => ({file: l.file, lecture: l.lecture, have: l.have.length, findability: l.findability.length, missing: l.missing.map(x => x.term), landmark: l.landmark.length, noise: l.noise})), missing: [...new Set(report.lectures.flatMap(l => l.missing.map(x => x.term.toLowerCase())))].sort(), findability: [...new Set(report.lectures.flatMap(l => l.findability.map(x => x.term.toLowerCase())))].sort()};
if (candidateArg) {const by = {}; for (const l of report.lectures) for (const x of l.have) if (String(x.source).startsWith('candidate')) by[x.source] = (by[x.source] ?? new Set()).add(x.term.toLowerCase()); const base = new Set(JSON.parse(fs.readFileSync(new URL('docs/coverage-baseline.json', root))).missing); const gained = out.missing.length; console.log(JSON.stringify({stillMissing: gained, baselineMissing: base.size, gainedBySource: Object.fromEntries(Object.entries(by).map(([k, v]) => [k, v.size]))})); process.exit(0);}
if (process.argv.includes('--pre-fix')) {const by = {}; for (const l of report.lectures) for (const x of l.findability) by[x.source] = (by[x.source] ?? new Set()).add(x.term.toLowerCase()); console.log(Object.fromEntries(Object.entries(by).map(([k, v]) => [k, v.size])), out.findability.length); process.exit(0);}
if (process.argv.includes('--data-only')) {console.log(JSON.stringify(out.totals)); process.exit(0);}

// The viewer's own Find-a-structure predicate over the atlas it really builds (body + facial + supplement).
const fullAtlas = mergeAtlasStreams(atlas, [JSON.parse(gunzipSync(fs.readFileSync(new URL('facial/facial-stream.json.gz', models)))), supplement, female, serous, paokao]);
const fullParts = new Map(fullAtlas.parts.map(p => [p.id, p]));
const uiSearch = query => fullAtlas.concepts.filter(c => {
  const p = c.elements.map(id => fullParts.get(id)).find(Boolean), profile = p ? structureProfile(c.name, p.system, p) : undefined;
  return conceptMatches(c, profile, query);
});
const isMuscleTerm = t => analyse(t).type === 'muscle' || /\bm\.?$/i.test(t.trim());
// What a student would type: lecture abbreviations spelled out (post. sup. → posterior superior), list letters and the trailing "m." dropped,
// position words left out (the model may order them differently), and only plain muscle names (not "nerve to …", "… artery", "tendon of …").
const searchText = t => t.replace(/^[a-z]\.\s+/i, '').replace(/^(?:part of|musculus)\s+/i, '').toLowerCase().replace(/[^a-z\s.]/g, ' ').split(/\s+/).filter(Boolean)
  .flatMap(w => (ABBR[w.replace(/\.$/, '')] ?? w.replace(/\.$/, '')).split(' ')).filter(w => !MOD.has(w) && !STOP.has(w) && w !== 'muscle' && w !== 'muscles').join(' ').trim();
const plainMuscle = t => !/\b(nerve|artery|arteries|vein|tendon|ligament|branch|fascia|innervat\w*)\b/i.test(t) && !/\ba\.?$/i.test(t.trim());
const typoed = t => tokens(t).some(w => fixToken(w) !== w);
// Lecture terms for muscles the model has, typed the way the lecture wrote them, must be found by search.
const unsearchable = [];
for (const l of report.lectures) for (const x of l.have) {
  if (!isMuscleTerm(x.term) || !plainMuscle(x.term) || !['exact', 'contained'].includes(x.kind) || x.system !== 'muscular' && x.source !== 'supplement') continue;
  const q = searchText(x.term);
  if (q.length >= 4 && !typoed(x.term) && !uiSearch(q).length) unsearchable.push(x.term + ` [${q}]`);
}
const MUST_FIND = ['latissimus dorsi', 'latiss', '背闊肌', '闊背肌', '背阔肌', '闊背', 'rectus abdominis', 'internal oblique', 'transversus abdominis', 'quadratus lumborum', 'multifidus', 'trapezius', '斜方肌'];
const mustMiss = MUST_FIND.filter(q => !uiSearch(q).length);
const unreachable = fullAtlas.parts.filter(p => !fullAtlas.concepts.some(c => c.elements.includes(p.id))).map(p => p.name);
if (process.argv.includes('--check')) {
  const baseline = JSON.parse(fs.readFileSync(new URL('docs/coverage-baseline.json', root), 'utf8'));
  const problems = [];
  if (out.findability.length) problems.push(`${out.findability.length} structures are in the model but cannot be found by search: ${out.findability.slice(0, 12).join(', ')}`);
  if (mustMiss.length) problems.push(`Find a structure returns nothing for: ${mustMiss.join(', ')}`);
  if (unsearchable.length) problems.push(`${unsearchable.length} muscles in the curriculum list are in the model but not found by search: ${[...new Set(unsearchable)].slice(0, 12).join(', ')}`);
  if (unreachable.length) problems.push(`${unreachable.length} drawn structures belong to no searchable concept: ${unreachable.slice(0, 8).join(', ')}`);
  if (orphan.noConcept.length) problems.push(`${orphan.noConcept.length} meshes have no searchable concept`);
  const bySystem = Object.fromEntries([...new Set(atlas.parts.map(p => p.system))].map(x => [x, atlas.parts.filter(p => p.system === x).length]));
  for (const [system, n] of Object.entries(baseline.partsBySystem)) if ((bySystem[system] ?? 0) < n) problems.push(`system '${system}' lost meshes: ${bySystem[system] ?? 0} < ${n}`);
  if (extraNames.size < baseline.searchExtras) problems.push(`search index shrank: ${extraNames.size} < ${baseline.searchExtras}`);
  const known = new Set(baseline.missing);
  const fresh = out.missing.filter(t => !known.has(t));
  if (fresh.length) problems.push(`${fresh.length} curriculum structures newly missing from the model (was covered before): ${fresh.slice(0, 12).join(', ')}`);
  if (out.totals.have < baseline.have) problems.push(`covered structures fell from ${baseline.have} to ${out.totals.have}`);
  for (const l of out.lectures) { const b = baseline.lectures[l.file]; if (b && l.have < b) problems.push(`${l.lecture}: covered ${l.have} < baseline ${b}`); }
  if (problems.length) {console.error('Coverage regression:\n - ' + problems.join('\n - ')); process.exit(1);}
  console.log(`Coverage OK: ${out.totals.have} curriculum structures present and findable, ${out.missing.length} known-missing (tracked in docs/coverage-baseline.json), ${out.totals.landmark} bone landmarks ride on existing bones.`);
  process.exit(0);
}

// ---------------------------------------------------------------- report
const md = ['# 課程清單覆蓋報告', '',
  `來源：\`docs/curriculum-terms.json\`（18 堂課自動抽出，${report.totals.terms.toLocaleString()} 個詞，寧多勿漏、含雜訊）。由 \`node scripts/audit-coverage.mjs\` 產生，\`npm run check:coverage\` 每次 build 前核對。`, '',
  '先篩走明顯唔係解剖結構嘅詞（病況、動作、段落字眼、純方位詞等），其餘同模型所有名稱做模糊配對：同義縮寫（m./a./v./n./lig./br.）、單複數、左右側、拉丁／英文拼法。模型名稱來自圖譜 2,234 件＋面部 47 件＋神經串流 286 件＋關節組織 349 件＋腦 437 件＋頸部血管。', '',
  '| 類別 | 不重複詞數 | 意思 |', '|---|---|---|',
  `| 一、已有 | ${report.totals.have} | 模型有，而且可以用搜尋／圖層揀到 |`,
  `| 二、模型有但 UI 搵唔到 | ${report.totals.findability} | 模型有幾何，但搜尋唔到（見下面清單；已修好者會喺「修復」一節列明） |`,
  `| 三、模型冇 | ${report.totals.missing} | 交俾第 2 部分補模型 |`,
  `| 骨性標誌 | ${report.totals.landmark} | 結節、窩、切跡等，屬已有骨件嘅表面特徵，模型唔另外分件 |`,
  `| 雜訊（已略去） | ${report.totals.noise} | 唔係解剖結構 |`, ''];
const ids = atlas.parts.map(p => +p.id.replace(/\D/g, '')).filter(Boolean).sort((a, b) => a - b), gaps = [];
for (let i = 1; i < ids.length; i++) if (ids[i] - ids[i - 1] > 1) gaps.push([ids[i - 1] + 1, ids[i] - 1]);
const gapCount = gaps.reduce((n, g) => n + g[1] - g[0] + 1, 0);
md.push('## 闊背肌（Latissimus dorsi）點解搵唔到', '',
  '**結論：係 (b)——BodyParts3D 原始資料有，但網站用嘅 4.0 匯出（2,234 件）冇匯出呢件肌肉，所以冇 geometry、冇 concept，搜尋當然搵唔到。** 唔係 (c) 有 geometry 但冇載入，亦唔係 (d) 搜尋索引漏收；之前報告話「來源入面根本冇」係錯嘅，原因係當時連唔到官方部件名單。', '',
  '查證：', '',
  '- BodyParts3D 3.0 官方部件名單（`parts_list_e.txt`，經 Kevin-Mattheus-Moerman/BodyParts3D 鏡像 `f0eeb6e843380cfe6b83797cf8c3e1af74de5e61` 取得）有 `FMA13357 latissimus dorsi`、`FMA13358 right latissimus dorsi`、`FMA13359 left latissimus dorsi`，而且左右兩邊都有 STL（各約 22.8 萬三角面）。',
  '- `public/models/atlas.json`（4.0 匯出）嘅 2,234 件 mesh 同 3,432 個 concept 都冇 latissimus／dorsi／FMA13357–13359；`app/anatomy-source-overrides.json` 只排除咗 2 件（足跟動脈分支），冇涉及闊背肌。',
  `- 3.0 有 925 個 STL；其中 128 個唔喺 4.0 atlas 入面：47 個係已經用緊嘅面部肌（OMFAtlas 套件），其餘主要係闊背肌、腹直肌、腹內斜肌、腹橫肌、錐狀肌、腰方肌、頸棘肌、多裂肌、腹股溝韌帶、伸趾短肌、右頸長肌、顳頂肌、帽狀腱膜、降鼻中隔肌（共 28 件已補入，見 \`scripts/supplement-parts.json\`），餘下係腦／心臟細部、毛髮、結腸等，另計。來源 mesh 編號有 ${gaps.length} 段缺口、共 ${gapCount} 個編號冇匯出，同樣係 4.0 匯出時被略去。`,
  '- `normalizeAtlasSystems` 已經修正 89 件系統分類錯誤（例如腓骨肌被標成骨骼）；冇肌肉被 dissection／region／depth 過濾器濾走：全身視圖永遠顯示所有開咗嘅系統。', '',
  '**修復**：`scripts/prepare-supplement.mjs` 由 3.0 鏡像下載已釘 sha256 嘅 STL，用 OMFAtlas 面部肌肉同一個相似變換（比例 1.0594、Z-up mm → Y-up m）對齊 4.0，再加一個平滑位移場（3.0 同 4.0 唔係同一個剛體：只用相似變換，肋骨處會偏 12 mm、腳部偏 30 mm），位移場用 270 塊兩版共有嘅骨做控制點；以 meshoptimizer 簡化（每件 ≤ 1.6 萬三角面，誤差 < 0.1%）、分成細包 gzip，載入方式同其餘分包一樣。留一法驗證（逐塊骨由其餘骨預測）：中位數誤差 1.3 mm、第 90 百分位 5.6 mm；`scripts/test-all-structures.mjs` 每次 check 都重算，並驗證闊背肌左右兩邊貼住肩胛骨、到達髂嵴。授權同現有資料一樣係 CC BY-SA 2.1 Japan。', '',
  '**2,279 對 2,232 嘅差異**：47 件面部肌（`BP3-FMA…`）以前要由 raw.githubusercontent.com 讀 16 MB 單一檔案，慢線 60 秒逾時就永遠載入唔到，標題就顯示 2,279 但只畫到 2,232（載入條停喺 93 %）。而家改為同源、壓縮、分段載入；`test-all-structures.mjs` 檢查每一件都有對應 package bytes。', '',
  '**同類 bug 嘅影響**：真正「模型有、UI 搵唔到」嘅係另一類——外周神經（286 件）、關節韌帶／關節囊（349 件）、腦結構（437 件）、頸部血管（8 件）喺 3D 入面畫到，但唔屬於 atlas concepts，搜尋搵唔到（課程詞中有 187 個受影響：神經 124、關節 49、腦 11、頸血管 3）。已經喺「Find a structure」加入呢 1,080 項索引，揀到神經會直接高亮，揀到其餘會打開圖層同資料卡。', '',
  '**build 守門**：`npm run check:coverage`（亦係 `npm run build` 前置步驟）用 Find a structure 真正嘅比對函式（`app/mj-search.ts`）檢查：闊背肌（latissimus／背闊肌／闊背肌／背阔肌）等指定肌肉必須搵到；課程清單入面「模型有嘅肌肉」用講義寫法（縮寫展開後）全部必須搵到；每一件畫出嚟嘅 mesh 都屬於某個可搜尋 concept。唔通過就 build 失敗。', '',
  '缺口編號（供補模型時對照）：' + gaps.map(g => g[0] === g[1] ? `FJ${g[0]}` : `FJ${g[0]}–${g[1]}`).join('、'), '');
for (const l of report.lectures) {
  md.push(`## ${l.lecture}　\`${l.file}\``, '', `已有 ${l.have.length}　·　UI 搵唔到 ${l.findability.length}　·　模型冇 ${l.missing.length}　·　骨標誌 ${l.landmark.length}　·　雜訊 ${l.noise}`, '');
  const partial = l.have.filter(x => x.kind === 'specific' || x.kind === 'fuzzy');
  if (partial.length) md.push('**一、已有（部分配對：模型件較概括／較細，請覆核）**', '', ...partial.map(x => `- ${x.term} → ${x.model}［${x.kind}］`), '');
  if (l.findability.length) md.push('**二、模型有但 UI 搵唔到**', '', ...l.findability.map(x => `- ${x.term}${x.zh ? `（${x.zh}）` : ''} → 模型：${x.model}［${x.source}］`), '');
  if (l.missing.length) md.push('**三、模型冇**', '', ...l.missing.map(x => `- ${x.term}${x.zh ? `（${x.zh}）` : ''}`), '');
}
fs.writeFileSync(new URL('docs/coverage-report.md', root), md.join('\n'));
fs.writeFileSync(new URL('docs/coverage-data.json', root), JSON.stringify({totals: report.totals, lectures: report.lectures}, null, 1));
fs.writeFileSync(new URL('docs/coverage-baseline.json', root), JSON.stringify({partsBySystem: Object.fromEntries([...new Set(atlas.parts.map(p => p.system))].map(x => [x, atlas.parts.filter(p => p.system === x).length])), searchExtras: extraNames.size, have: out.totals.have, missing: out.missing, lectures: Object.fromEntries(out.lectures.map(l => [l.file, l.have]))}, null, 1));
console.log(JSON.stringify(report.totals));

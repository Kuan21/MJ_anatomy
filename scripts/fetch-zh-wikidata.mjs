/** Chinese labels for the atlas concepts from Wikidata (CC0), joined on the Foundational Model of Anatomy identifier (Wikidata property P1402).
 * Usage: node scripts/fetch-zh-wikidata.mjs [--offline]
 *
 * This is a DRAFT source only. The site's Chinese names follow docs/muscle-layers.json and the 跑考摘要 glossary first and the Taiwan-standard
 * tables second (see scripts/prepare-naming.mjs); Wikidata labels never override them. The script writes
 *   scripts/zh-wikidata.cache.json   {fma: {tw, hant, hk, zh}}  (what Wikidata answered; reused with --offline)
 *   docs/zh-wikidata-draft.md        where Wikidata's Traditional-Chinese label differs from the name the site shows, for hand review
 * Label preference: zh-tw, then zh-hant, then zh-hk, then zh (Simplified labels are listed but flagged, not adopted).
 */
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {quizModule} from './quiz-modules.mjs';

const offline = process.argv.includes('--offline');
/** fetch() first; behind a corporate or sandbox proxy Node's fetch cannot see the proxy settings, so curl (which reads them) is the fallback. */
async function getJson(url) {
  const headers = {Accept: 'application/sparql-results+json', 'User-Agent': 'mj-anatomy/1.0 (anatomy viewer; Chinese terminology draft)'};
  try {const r = await fetch(url, {headers}); if (r.ok) return await r.json(); throw new Error(`HTTP ${r.status}`);}
  catch (error) {
    const out = spawnSync('curl', ['-sS', '--fail', '-m', '120', '-H', 'Accept: application/sparql-results+json', '-A', headers['User-Agent'], url], {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
    if (out.status !== 0) throw new Error(`${error.message}; curl: ${out.stderr.trim()}`);
    return JSON.parse(out.stdout);
  }
}
const root = new URL('../', import.meta.url);
const atlas = JSON.parse(fs.readFileSync(new URL('public/models/atlas.json', root), 'utf8'));
const cachePath = new URL('scripts/zh-wikidata.cache.json', root);
const fmaOf = id => /^FMA\d+$/.test(id) ? id.slice(3) : null;
const wanted = [...new Set(atlas.concepts.map(c => fmaOf(c.id)).filter(Boolean))];
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};
if (!offline) {
  const size = 300;
  for (let i = 0; i < wanted.length; i += size) {
    const slice = wanted.slice(i, i + size).filter(f => !(f in cache));
    if (!slice.length) continue;
    const label = (v, lang) => `OPTIONAL { ?item rdfs:label ?${v} . FILTER(LANG(?${v}) = "${lang}") }`;
    const query = `SELECT ?fma ?tw ?hant ?hk ?zh WHERE { VALUES ?fma { ${slice.map(x => `"${x}"`).join(' ')} } ?item wdt:P1402 ?fma . ${label('tw', 'zh-tw')} ${label('hant', 'zh-hant')} ${label('hk', 'zh-hk')} ${label('zh', 'zh')} }`;
    for (let attempt = 0; attempt < 3; attempt++) {
      let json;
      try {json = await getJson(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`);}
      catch (error) {console.error(`  Wikidata failed for batch ${i} (${String(error.message).slice(0, 100)}), retrying`); await new Promise(r => setTimeout(r, 4000 * (attempt + 1))); continue;}
      const rows = json.results.bindings;
      for (const f of slice) cache[f] = cache[f] ?? {};
      for (const r of rows) {const e = cache[r.fma.value] ??= {}; for (const k of ['tw', 'hant', 'hk', 'zh']) if (r[k]?.value && !e[k]) e[k] = r[k].value;}
      break;
    }
    process.stderr.write(`  ${Math.min(i + size, wanted.length)}/${wanted.length}\r`);
    fs.writeFileSync(cachePath, JSON.stringify(cache));
  }
  process.stderr.write('\n');
}
const pick = e => e?.tw ?? e?.hant ?? e?.hk ?? null;
const withLabel = wanted.filter(f => pick(cache[f])).length, simplifiedOnly = wanted.filter(f => !pick(cache[f]) && cache[f]?.zh).length;
console.log(`Wikidata: ${wanted.length} FMA identifiers asked; ${withLabel} have a Traditional-Chinese label (zh-tw / zh-hant / zh-hk), ${simplifiedOnly} only a plain "zh" label.`);

// ---- compare with what the site shows
const {structureProfile} = await quizModule('app/mj-structure-info.ts');
const {namingOverride, namingKey} = await quizModule('app/mj-naming.ts');
const strip = s => s.replace(/^[左右]/, '').replace(/[\s·・]/g, '');
const rows = [];
for (const c of atlas.concepts) {
  const f = fmaOf(c.id), wd = f ? pick(cache[f]) : null;
  if (!wd) continue;
  const p = atlas.parts.find(x => x.conceptId === c.id);
  if (!p) continue;   // a concept with no mesh of its own has no name on screen to compare
  const mine = structureProfile(c.name, p.system, p).chinese ?? '';
  if (!mine || /構造（/.test(mine) || strip(mine) === strip(wd)) continue;
  rows.push({en: c.name, fma: c.id, mine, wd, fixed: !!namingOverride(c.name), key: namingKey(c.name)});
}
const seen = new Set(), uniq = rows.filter(r => !seen.has(r.key) && seen.add(r.key));
const fixedRows = uniq.filter(r => r.fixed), openRows = uniq.filter(r => !r.fixed);
const md = row => `| ${row.en} | ${row.fma} | ${row.mine} | ${row.wd} |`;
const out = `# Wikidata 中文標籤草稿 vs 網站現用名稱

由 \`scripts/fetch-zh-wikidata.mjs\` 產生。Wikidata（CC0）以 FMA 編號對應，優先取 zh-tw，其次 zh-hant、zh-hk。**這只是初稿**：網站名稱的決定次序是 muscle-layers.json → 跑考摘要 → 其他共筆 → 台灣解剖學名詞表；Wikidata 不會覆蓋任何一項，最終名稱以跑考摘要為準。

- 向 Wikidata 查詢的 FMA 編號：${wanted.length}；有繁體中文標籤：${withLabel}；只有未標明地區的 zh 標籤（多為簡體，未採用）：${simplifiedOnly}。
- 與現用名稱用詞不同的結構（去除左右後）：${uniq.length} 個，其中 ${fixedRows.length} 個現用名稱來自跑考摘要／共筆／肌肉分層（已定案，保留），**${openRows.length} 個現用名稱來自台灣解剖學名詞表，請你核對要不要改用 Wikidata 的寫法**。

## 一、請核對：現用名稱為台灣解剖學名詞表，Wikidata 寫法不同（${openRows.length}）

| English | FMA | 現用名稱 | Wikidata（繁體） |
| --- | --- | --- | --- |
${openRows.sort((a, b) => a.en.localeCompare(b.en)).map(md).join('\n')}

## 二、已定案：現用名稱來自跑考摘要／共筆／肌肉分層（${fixedRows.length}，僅供參考）

| English | FMA | 現用名稱 | Wikidata（繁體） |
| --- | --- | --- | --- |
${fixedRows.sort((a, b) => a.en.localeCompare(b.en)).map(md).join('\n')}
`;
fs.writeFileSync(new URL('docs/zh-wikidata-draft.md', root), out);
console.log(`Chinese draft: ${uniq.length} differences (${openRows.length} to review, ${fixedRows.length} already fixed by 跑考摘要／共筆／肌肉分層) → docs/zh-wikidata-draft.md`);

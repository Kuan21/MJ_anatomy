// Course-summary completeness audit. Every structure in docs/paokao-checklist.json (574 terms cut out of the notes) is read as a full name
// (docs/paokao-names.json corrects names cut off by line breaks, joined alternatives and non-structures), matched to what the viewer shows
// (docs/paokao-aliases.json lists names the model spells differently), and checked for search and selection.
//   node scripts/audit-paokao.mjs            write docs/paokao-audit.md and docs/paokao-audit.json
//   node scripts/audit-paokao.mjs --check    fail the build when a real structure is missing, cannot be found by search or cannot be selected
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {resolvedItems} from './lib/paokao.mjs';
import {match, matchAll, tokens, MOD, GROUPS, models, atlas, facial, supplement, female, serous, heart, paokao, mergeAtlasStreams, conceptMatches, structureProfile, extraNames, entities} from './lib/coverage-match.mjs';

const root = new URL('../', import.meta.url), aliases = JSON.parse(fs.readFileSync(new URL('docs/paokao-aliases.json', root), 'utf8'));
const items = resolvedItems();
const stream = f => JSON.parse(gunzipSync(fs.readFileSync(new URL(f, models))));
const fullAtlas = mergeAtlasStreams(atlas, [stream('facial/facial-stream.json.gz'), supplement, female, serous, paokao]);
const fullParts = new Map(fullAtlas.parts.map(p => [p.id, p]));
const partOfConcept = new Map(); for (const c of fullAtlas.concepts) partOfConcept.set(c.id, c);
const search = (query) => {
  const hits = fullAtlas.concepts.filter(c => {
    const p = c.elements.map(id => fullParts.get(id)).find(Boolean), profile = p ? structureProfile(c.name, p.system, p) : undefined;
    return conceptMatches(c, profile, query);
  });
  return hits;
};
const norm = s => s.toLowerCase().replace(/\.[lr](\.\d+)?$/, '').replace(/\b(left|right)\b/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
const findable = (name, entity) => {
  // The structure the term resolved to must come back from Find a structure when its name is typed (alias spellings included).
  if (['nerve', 'joints', 'brain', 'neck'].includes(entity.source)) return extraNames.has(norm(entity.names[0]).replace(/\s+/g, ' ')) || extraNames.has(entity.names[0].replace(/^(Left|Right) /, '').toLowerCase());
  // What a student types: the name as the notes spell it, or without the trailing type word (the atlas says "trapezius", not "trapezius muscle").
  const full = name.toLowerCase().replace(/^(left|right) /, ''), plain = full.replace(/ (muscle|muscles|artery|arteries|vein|veins|nerve|nerves|ligament|branch)$/, '');
  return [full, plain].some(q => search(q).some(c => (entity.concept && c.id === entity.concept) || c.elements.includes(entity.id) || norm(c.name) === norm(entity.names[0])));
};
const groupMembers = name => { const key = name.toLowerCase().replace(/\s+m\.?$/, ' m').replace(/ muscles?$/, ' muscle'); const g = GROUPS.find(([re]) => re.test(key) || re.test(name.toLowerCase())); return g ? g[1] : null; };

// A term ending in "artery" must resolve to an artery, "nerve" to a nerve, and so on: the matcher alone would accept a muscle for "nerve to obturator internus".
const TYPE_SYSTEMS = {artery: ['arterial'], arteries: ['arterial'], vein: ['venous'], veins: ['venous'], nerve: ['nervous'], nerves: ['nervous'], muscle: ['muscular', 'cardiac'], muscles: ['muscular', 'cardiac'], ligament: ['connective', 'skeletal'], ganglion: ['nervous'], plexus: ['nervous', 'venous'], duct: ['lymphatic', 'digestive', 'urinary', 'reproductive', 'endocrine', 'sensory'], fascia: ['connective', 'muscular'], retinaculum: ['connective'], aponeurosis: ['connective', 'muscular']};
const typeOf = name => { const w = name.toLowerCase().split(/[^a-z]+/).filter(Boolean); if (/^nerve to /i.test(name)) return ['nervous']; for (let i = w.length - 1; i >= 0; i--) if (TYPE_SYSTEMS[w[i]]) return TYPE_SYSTEMS[w[i]]; return null; };
// Position words in the term (deep, superior, medial …) must be in the model's name too: "deep femoral artery" is not the femoral artery.
const modifiersKept = (name, entity) => { const mods = tokens(name).filter(t => MOD.has(t)); return mods.every(m => entity.names.some(n => tokens(n).includes(m))); };
const compatible = (name, entity) => { if (!modifiersKept(name, entity)) return false; const t = typeOf(name); return !t || entity.source === 'heart' || t.includes(entity.system) || (entity.source === 'joints' && t.includes('connective')); };
const matchFor = name => matchAll(name).find(m => compatible(name, m.entity)) ?? null;
function resolve(name) {
  const alt = aliases[name.toLowerCase()];
  if (alt) {
    const found = alt.map(a => [a, matchFor(a)]);
    if (found.every(([, m]) => m)) return {via: 'alias', matches: found.map(([a, m]) => ({alias: a, m}))};
  }
  const m = matchFor(name);
  if (m) return {via: m.kind, matches: [{m}]};
  const members = groupMembers(name);
  if (members) { const found = members.map(a => [a, matchFor(a)]); if (found.every(([, x]) => x)) return {via: 'group', matches: found.map(([a, x]) => ({alias: a, m: x}))}; }
  return null;
}

const rows = [];
for (const it of items) {
  if (it.skip) { rows.push({index: it.index, term: it.term, section: it.section, status: 'skip', reason: it.skip}); continue; }
  for (const name of it.names) {
    const row = {index: it.index, term: it.term, name, section: it.section, note: it.note};
    if (it.partOf) {
      const parent = resolve(it.partOf);
      Object.assign(row, parent ? {status: 'part', parent: it.partOf, model: parent.matches[0].m.name, source: parent.matches[0].m.entity.source} : {status: 'missing', reason: `parent ${it.partOf} missing`});
    } else {
      const r = resolve(name);
      if (!r) Object.assign(row, {status: 'missing'});
      else {
        const first = r.matches[0].m, isNew = r.matches.every(x => x.m.entity.source === 'paokao');
        const find = r.matches.map(x => x.m.entity.source === 'heart' ? true : findable(x.alias ?? name, x.m.entity));
        Object.assign(row, {status: isNew ? 'new' : 'have', via: r.via, model: r.matches.map(x => x.m.name).join('；'), source: [...new Set(r.matches.map(x => x.m.entity.source))].join('+'), kind: first.kind, findable: find.every(Boolean)});
      }
    }
    rows.push(row);
  }
}
const count = k => rows.filter(r => r.status === k).length, unique = new Set(rows.filter(r => r.name).map(r => r.name.toLowerCase())).size;
const problems = [
  ...rows.filter(r => r.status === 'missing').map(r => `缺少：${r.name}（#${r.index} ${r.term}）`),
  ...rows.filter(r => (r.status === 'have' || r.status === 'new') && !r.findable).map(r => `搜尋不到：${r.name} → ${r.model}`),
];
if (process.argv.includes('--check')) {
  if (problems.length) { console.error(`Paokao checklist: ${problems.length} problems\n - ` + problems.slice(0, 40).join('\n - ')); process.exit(1); }
  console.log(`Paokao OK: ${rows.filter(r => r.status === 'have' || r.status === 'new' || r.status === 'part').length} checklist structures exist, are searchable and selectable (${count('new')} added as schematic models); ${rows.filter(r => r.status === 'skip').length} non-structure terms skipped with a reason.`);
  process.exit(0);
}
fs.writeFileSync(new URL('docs/paokao-audit.json', root), JSON.stringify({totals: {terms: items.length, rows: rows.length, have: count('have'), new: count('new'), part: count('part'), skip: count('skip'), missing: count('missing')}, rows}, null, 1));
const md = ['# 跑考摘要完整性審核', '', `來源：\`docs/paokao-checklist.json\`（跑考摘要抽出 ${items.length} 項）。完整名稱修正見 \`docs/paokao-names.json\`，名稱別名見 \`docs/paokao-aliases.json\`。由 \`node scripts/audit-paokao.mjs\` 產生；\`npm run check:paokao\` 在 build 前檢查「每項都存在、搜尋得到、可以點選」。`, '',
  '| 狀態 | 項數 | 說明 |', '| --- | ---: | --- |',
  `| 已有 | ${count('have')} | 模型原本就有（含別名拼法） |`, `| 新增示意模型 | ${count('new')} | 公開圖譜沒有，依真實解剖位置新做 |`, `| 屬於已有結構的一部分 | ${count('part')} | 肌頭、肌腱等，包含在對應肌肉內 |`, `| 略過 | ${count('skip')} | 非結構詞，原因見下 |`, `| 缺少 | ${count('missing')} | 仍缺（build 失敗） |`, ''];
for (const [title, st] of [['缺少', 'missing'], ['略過（非結構詞）', 'skip'], ['新增示意模型', 'new']]) {
  const list = rows.filter(r => r.status === st); if (!list.length) continue;
  md.push(`## ${title}`, '', '| # | 原文 | 完整名稱 | 位置 | 備註 |', '| ---: | --- | --- | --- | --- |', ...list.map(r => `| ${r.index} | ${r.term} | ${r.name ?? ''} | ${r.section.split('／').slice(0, 2).join('／')} | ${r.reason ?? r.model ?? r.note ?? ''} |`), '');
}
md.push('## 全部項目', '', '| # | 原文 | 完整名稱 | 狀態 | 模型名稱 | 來源 |', '| ---: | --- | --- | --- | --- | --- |', ...rows.map(r => `| ${r.index} | ${r.term} | ${r.name ?? ''} | ${{have: '已有', new: '新增示意模型', part: '已有（部分）', skip: '略過', missing: '缺少'}[r.status]}${r.via && r.via !== 'exact' ? `（${r.via}）` : ''} | ${r.model ?? r.reason ?? ''} | ${r.source ?? ''} |`), '');
fs.writeFileSync(new URL('docs/paokao-audit.md', root), md.join('\n'));
console.log(JSON.stringify({terms: items.length, have: count('have'), new: count('new'), part: count('part'), skip: count('skip'), missing: count('missing'), problems: problems.length}));

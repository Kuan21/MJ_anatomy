// Neuroanatomy notes (docs/neuro-notes.json) -> info cards for the brain detail mode. The notes are internal reference only: nothing from them reaches the site.
//   docs/neuro-notes.json            the notes' structure list (auto-extracted: duplicates, broken names); read at build time for names and types only
//   docs/neuro-notes-curation.json   line-by-line review: keep / merge / drop / rename / region / mesh
//   docs/neuro-card-text/*.json      the card texts, written for this site in our own words ({id: [[field label, [sentence, …]], …]})
// Writes public/models/brain/neuro-cards.json (loaded by the brain mode: names, type, region, model links and our own texts, no note text or page numbers)
// and docs/neuro-notes-vs-model.md (internal comparison table). `--check` fails when either output is stale or the curation no longer matches the model.
// `--draft FROM TO` prints the notes' sentences for the cards with ids FROM..TO so they can be rewritten (internal use; never write them out as they are).
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {quizModule} from './quiz-modules.mjs';

const root = fileURLToPath(new URL('../', import.meta.url)), check = process.argv.includes('--check'), draft = process.argv.includes('--draft') ? process.argv.slice(process.argv.indexOf('--draft') + 1) : null;
const texts = {};
for (const f of fs.existsSync(root + 'docs/neuro-card-text') ? fs.readdirSync(root + 'docs/neuro-card-text').filter(f => f.endsWith('.json')).sort() : []) Object.assign(texts, JSON.parse(fs.readFileSync(root + 'docs/neuro-card-text/' + f, 'utf8')));
const notes = JSON.parse(fs.readFileSync(root + 'docs/neuro-notes.json', 'utf8'));
const cur = JSON.parse(fs.readFileSync(root + 'docs/neuro-notes-curation.json', 'utf8'));
const {describeBrainNode, BRAIN_GROUPS} = await quizModule('app/organ/brain-catalogue.ts');
const {SCHEMATIC_NAMES} = await quizModule('app/organ/brain-schematic.ts');

// ---- the model's own structures
const bytes = fs.readFileSync(root + 'public/models/brain.glb');
const json = JSON.parse(bytes.toString('utf8', 20, 20 + bytes.readUInt32LE(12)));
const parts = json.nodes.filter(n => n.extras?.bx_label).map((n, i) => describeBrainNode({name: n.name, cat: n.extras.bx_cat, region: n.extras.bx_region ?? '', label: n.extras.bx_label, side: n.extras.bx_side ?? ''}, i)).filter(Boolean);
const partEn = new Set([...parts.map(p => p.en), ...SCHEMATIC_NAMES]), groupIds = new Set(BRAIN_GROUPS.map(g => g.id));
const CORTEX_GROUPS = ['frontal', 'parietal', 'temporal', 'occipital', 'limbic', 'insula', 'cortex-other'];
const checkMesh = (id, name) => {
  if (name === '@cortex') return;
  if (name.startsWith('@group:')) {if (!groupIds.has(name.slice(7))) throw new Error(`${id}: unknown group ${name}`); return;}
  if (!partEn.has(name)) throw new Error(`${id}: the brain model has no structure named "${name}"`);
};

// ---- clean the notes' text (PDF extraction leaves spaces between Chinese characters)
const CJK = '\\u3400-\\u9fff\\uff00-\\uffef\\u3000-\\u303f';
const tidy = s => s.replace(new RegExp(`(?<=[${CJK}]) +(?=[${CJK}])`, 'g'), '').replace(/\s+/g, ' ').trim();
const sentences = text => tidy(text).split(/(?<=[。；])/).map(s => s.trim()).filter(s => s.length > 1);

// ---- which card field a sentence belongs to (first match wins; anything else stays under "筆記摘錄")
const RULES = {
  cortex_surface: [['影像表現', /影像|MRI|CT|斷層|造影/], ['損傷表現', /損傷|受損|病變|梗塞|梗死|失語|癱|缺損|障礙|失調|癲癇/], ['Brodmann 編號', /Brodmann|BA ?\d|第 ?\d+ ?區/], ['功能', /功能|負責|調控|控制|處理|整合|參與|認知|記憶|語言|情緒/], ['位置', /位於|位在|位置|介於|相鄰|上方|下方|前方|後方|之間/]],
  nucleus: [['影像表現', /影像|MRI|CT|斷層|造影/], ['損傷表現', /損傷|受損|病變|梗塞|障礙|失調|症/], ['傳入', /傳入|接受|接收|來自|輸入/], ['傳出', /傳出|投射|輸出|送至|傳至|傳往/], ['功能', /功能|負責|調控|控制|參與|傳遞|支配/], ['位置／所在高度', /位於|位在|位置|高度|橋腦|延腦|中腦|脊髓|之間/]],
  tract_pathway: [['損傷表現', /損傷|受損|病變|梗塞|障礙|失調|癱|症/], ['交叉位置', /交叉|跨過|對側|同側/], ['起始神經元', /起始|起自|起源|發出|細胞本體|第[一二三]級神經元/], ['中繼站', /中繼|突觸|換元|接力/], ['終點', /終止|止於|終點|到達|抵達|投射至/], ['傳遞內容', /傳遞|傳導|痛覺|溫覺|觸覺|本體覺|感覺|運動/]],
  csf_meninges: [['影像表現', /影像|MRI|CT|斷層|造影/], ['臨床意義', /出血|腫|阻塞|水腦|感染|疝|穿刺|臨床|中風/], ['連通關係', /連接|流向|通往|通過|相通|經由|連通|流至|進入/], ['內容物', /內含|含有|充滿|包含/], ['位置', /位於|位在|位置|之間|上方|下方|旁/]],
  vessel: [['阻塞症狀', /阻塞|栓塞|梗塞|梗死|中風|出血|症|異常/], ['來源', /來源|起源|起自|分出|發自|源自|分支出/], ['供應範圍', /供應|供給|灌流|血液|供血/], ['分支', /分支|終末支|支/]],
  nerve: [['損傷表現', /損傷|受損|病變|麻痺|障礙|症/], ['出腦位置', /穿出|出腦|離開|由.{0,8}出|發出/], ['起源核團', /核/], ['分布', /分布|支配|走向|供應|感覺|運動/], ['功能', /功能|負責|控制|調控|傳遞/]],
  ear: [['功能', /功能|負責|傳遞|轉換|感受/], ['位置', /位於|位在|位置|之間|內側|外側/], ['構造', /構造|組成|包含|分為|含有/]],
  structure: [['功能', /功能|負責|傳遞|控制|調控/], ['位置', /位於|位在|位置|之間|內側|外側|上方|下方/], ['構造', /構造|組成|包含|分為|含有|層/]],
};
const FIELD_ORDER = notes.card_fields_by_type;

// ---- merge / drop / rename
const byId = new Map(notes.structures.map(s => [s.id.replace('neuro-', ''), s]));
const entry = id => cur.entries['neuro-' + id];
const resolve = id => {const seen = new Set(); let e = entry(id); while (e?.merge) {if (seen.has(id)) throw new Error(`merge loop at ${id}`); seen.add(id); id = e.merge; e = entry(id);} return id;};
const cards = new Map();
for (const [id, s] of byId) {
  const e = entry(id); if (!e) throw new Error(`neuro-${id} is not in the curation`);
  if (e.drop) continue;
  const target = resolve(id), te = entry(target);
  if (!te || te.drop) throw new Error(`neuro-${id} merges into ${target}, which is dropped or missing`);
  if (!cards.has(target)) {
    const base = byId.get(target);
    cards.set(target, {id: target, en: te.en ?? base.en, zh: te.zh ?? base.zh, type: te.type ?? base.type, region: te.region, mesh: te.mesh ?? [], approx: te.approx ?? [], aka: [], excerpts: [], sources: []});
  }
  const card = cards.get(target);
  if (id !== target) card.aka.push({en: e.en ?? s.en, zh: e.zh ?? s.zh});
  else for (const a of [...(s.zh_alias ?? []), ...(s.alt_en ?? [])]) card.aka.push(/[㐀-鿿]/.test(a) ? {zh: a} : {en: a});
  for (const x of s.note_excerpts ?? []) card.excerpts.push({src: x.src, text: x.text});
  for (const src of s.sources ?? []) if (!card.sources.includes(src)) card.sources.push(src);
  if (s.note) card.noBody = true;
}
// structures the notes' list lacks but the lecture text names: the sentences that contain the term, verbatim, with their source page
const windowAround = (text, at, len) => {
  const start = Math.max(0, at - 100), end = Math.min(text.length, at + len + 100);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
};
for (const x of cur.extras ?? []) {
  const excerpts = [];
  for (const lecture of notes.lectures) for (const page of lecture.pages) {
    const text = tidy(page.text);
    for (const sentence of text.split(/(?<=[。；])/)) {
      const term = x.terms.find(t => sentence.includes(t)); if (!term) continue;
      excerpts.push({src: `${lecture.id} p.${page.page}`, text: sentence.length > 220 ? windowAround(sentence, sentence.indexOf(term), term.length) : sentence});
    }
  }
  cards.set(x.id, {id: x.id, en: x.en, zh: x.zh, type: x.type, region: x.region, mesh: x.mesh ?? [], approx: [], aka: [], excerpts: excerpts.slice(0, 14), sources: [...new Set(excerpts.slice(0, 14).map(e => e.src))], extra: true});
}
for (const card of cards.values()) {
  for (const m of [...card.mesh, ...card.approx]) checkMesh(card.id, m);
  // a merged group's notes count as the body of the card
  if (card.excerpts.length) delete card.noBody; else card.noBody = true;
  const seen = new Set(); card.excerpts = card.excerpts.filter(x => {const k = tidy(x.text); if (seen.has(k)) return false; seen.add(k); return true;});
  const rules = RULES[card.type] ?? RULES.structure, buckets = new Map();
  for (const x of card.excerpts) for (const sentence of sentences(x.text)) {
    const hit = sentence.length <= 160 && sentence.length >= 8 ? rules.find(([, re]) => re.test(sentence)) : undefined, label = hit ? hit[0] : '筆記摘錄', list = buckets.get(label) ?? [];
    if (!list.some(y => y.t === sentence)) list.push({t: sentence, s: x.src});
    buckets.set(label, list);
  }
  const order = [...(FIELD_ORDER[card.type] ?? []).filter(f => f !== '出處'), '筆記摘錄'];
  card.draft = order.filter(f => buckets.has(f)).map(f => ({label: f, items: buckets.get(f)}));
  card.fields = (texts[card.id] ?? []).map(([label, items]) => ({label, items}));
  delete card.excerpts;
  if (card.fields.length) delete card.noBody;
  card.aka = card.aka.filter((a, i, all) => (a.en || a.zh) && all.findIndex(b => b.en === a.en && b.zh === a.zh) === i && a.en !== card.en && a.zh !== card.zh);
  if (!card.aka.length) delete card.aka;
  if (!card.approx.length) delete card.approx;
  if (!card.mesh.length) delete card.mesh;
}
const list = [...cards.values()].sort((a, b) => a.id.localeCompare(b.id));
if (draft) {
  const [from, to] = draft;
  for (const c of list.filter(c => c.id >= from && c.id <= to)) {
    console.log(`\n## ${c.id} ${c.en} / ${c.zh} [${c.type}]${texts[c.id] ? ' (written)' : ''}`);
    for (const f of c.draft) {console.log(`  ${f.label}:`); for (const x of f.items) console.log(`    - ${x.t}`);}
  }
  process.exit(0);
}
const partCards = {};
for (const c of list) for (const m of c.mesh ?? []) if (!m.startsWith('@')) (partCards[m] ??= []).push(c.id);
// the public file carries names, type, region, model links and our own texts only
const publicCards = list.map(({draft, sources, noBody, extra, ...c}) => c);
const out = {version: 2, regions: cur.regions, typeLabels: notes.type_labels, cards: publicCards, partCards};
const outText = JSON.stringify(out) + '\n';

// ---- comparison table
const typeLabel = t => notes.type_labels[t] ?? t;
const rows = [];
for (const [id, s] of byId) {
  const e = entry(id), name = `${s.zh}<br>${s.en}`;
  if (e.drop) {rows.push({id, region: e.region, line: `| ${id} | ${name} | ${typeLabel(s.type)} | ${(s.sources ?? []).join('；')} | — | 否 | 已剔除：${e.drop} |`}); continue;}
  const target = resolve(id), card = cards.get(target);
  if (target !== id) {rows.push({id, region: card.region, line: `| ${id} | ${name} | ${typeLabel(s.type)} | ${(s.sources ?? []).join('；')} | 見 ${target} | 見 ${target} | 併入 ${target}「${card.zh}」，名稱保留為別名 |`}); continue;}
  const mesh = card.mesh?.length ? '有：' + card.mesh.slice(0, 3).join('、') + (card.mesh.length > 3 ? `…等 ${card.mesh.length} 個` : '') : card.approx?.length ? '近似：' + card.approx.join('、') : '模型未有';
  const clickable = card.mesh?.length || card.approx?.length ? '清單＋模型' : '僅清單（模型未有）';
  const filled = card.fields.length ? `已寫（${card.fields.map(f => f.label).join('、')}）` : card.noBody ? '筆記正文未有描述（待補，最終審核時依教科書或圖譜）' : '待寫';
  rows.push({id, region: card.region, line: `| ${id} | ${card.zh}<br>${card.en} | ${typeLabel(card.type)} | ${card.sources.join('；')} | ${mesh} | ${clickable} | ${filled} |`});
}
for (const x of cur.extras ?? []) {const card = cards.get(x.id); rows.push({id: x.id, region: card.region, line: `| ${x.id} | ${card.zh}<br>${card.en} | ${typeLabel(card.type)} | ${card.sources.join('；')} | 有：${card.mesh.join('、')}（示意） | 清單＋模型 | ${card.fields.length ? `已寫（${card.fields.map(f => f.label).join('、')}）` : '待寫'} |`});}
const total = byId.size, kept = list.length, merged = [...byId.keys()].filter(id => !entry(id).drop && resolve(id) !== id).length, dropped = [...byId.keys()].filter(id => entry(id).drop).length;
const withMesh = list.filter(c => c.mesh?.length).length, approxOnly = list.filter(c => !c.mesh?.length && c.approx?.length).length, none = kept - withMesh - approxOnly, empty = list.filter(c => c.noBody).length;
const table = `# 神經解剖筆記 vs 模型現況對照表（內部參考，不上網站）

由 \`scripts/prepare-neuro-notes.mjs\` 產生（\`npm run check\` 會檢查本檔是否最新）。資料來源：\`docs/neuro-notes.json\`；人工整理：\`docs/neuro-notes-curation.json\`。

## 摘要

- 筆記自動抽取的結構：${total} 條 → 保留成 **${kept} 張資訊卡**；併入其他條目 ${merged} 條（名稱保留為別名）；剔除 ${dropped} 條（不是構造，原因見下表）。
- 腦部模型（Brain Project）已有 mesh：${withMesh} 張卡；只有近似 mesh：${approxOnly} 張；**模型未有：${none} 張**（清單與搜尋仍找得到，標示「模型未有」，點擊可開資訊卡）。
- 筆記正文未有描述的卡片：${empty} 張（見下表「資訊卡」欄），內容待最終審核時依教科書或圖譜補上。
- 已用自己的話寫好資訊卡的：${list.filter(c => c.fields.length).length} 張；待寫：${list.filter(c => !c.fields.length).length} 張。

| id | 中英名稱 | 類型 | 出處 | 是否有 mesh | 是否可點選 | 資訊卡 |
| --- | --- | --- | --- | --- | --- | --- |
${rows.sort((a, b) => a.id.localeCompare(b.id)).map(r => r.line).join('\n')}
`;

const write = (file, text) => {
  const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (check) {if (old !== text) {console.error(`${file} is stale: run node scripts/prepare-neuro-notes.mjs`); process.exit(1);} return;}
  fs.mkdirSync(file.slice(0, file.lastIndexOf('/')), {recursive: true}); if (old !== text) fs.writeFileSync(file, text);
};
write(root + 'public/models/brain/neuro-cards.json', outText);
write(root + 'docs/neuro-notes-vs-model.md', table);
console.log(`Neuro notes: ${total} extracted → ${kept} cards (${withMesh} with a model structure, ${approxOnly} approximate, ${none} note-only; ${empty} without lecture text; ${list.filter(c => c.fields.length).length} texts written); ${merged} merged, ${dropped} dropped.`);

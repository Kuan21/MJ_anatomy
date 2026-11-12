// Peripheral nerves, plexuses and ganglia named in the lecture notes (docs/coverage-data.json) that have no 3D structure in the viewer.
// Output: docs/peripheral-nerve-gaps.md. Terms are normalised (abbreviations expanded, enumerators and sentence fragments dropped).
import fs from 'node:fs';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=f=>JSON.parse(fs.readFileSync(root+f,'utf8'));
const coverage=read('docs/coverage-data.json');
const have=new Set();
const norm=s=>s.toLowerCase().replace(/\b(left|right)\b/g,' ').replace(/\.(?:[lr])(?:\.\d+)?$/,'').replace(/[*().,/]/g,' ').replace(/\s+/g,' ').trim();
const atlas=read('public/models/atlas.json'),stream=read('public/models/atlas-stream.json');
for(const p of [...atlas.parts,...(stream.parts??[])])have.add(norm(p.name));
for(const x of JSON.parse(zlib.gunzipSync(fs.readFileSync(root+'public/models/search-extras.json.gz'))))have.add(norm(x.n));
const known=[...have];
const present=key=>known.some(n=>n===key||n.includes(key));
const ABBR=[[/\bsup\b\.?/g,'superior'],[/\binf\b\.?/g,'inferior'],[/\bant\b\.?/g,'anterior'],[/\bpost\b\.?/g,'posterior'],[/\bmed\b\.?/g,'medial'],[/\blat\b\.?/g,'lateral'],[/\bn\b\.?$/,'nerve'],[/\bnn\b\.?$/,'nerves'],[/\bn\.\s*(?:cn\s*\w+)?$/,'nerve']];
const NERVE=/\b(nerve|nerves|plexus|ganglion|ganglia|ramus|rami|trunk|ansa)\b/;
const NOISE=/^(ii?i?\.|[a-d]\.)\s|\b(neuron|neurons|neuroglia|fiber|cell|myelinated|statement|damage|combination|corresponding|main trunk|further|within|formed|several|largest|principal|peripheral nerve|spermatic cord|vocal cord|bicipital|aponeurosis|brachiocephalic trunk|pulmonary trunk|thyrocervical trunk|costocervical trunk|aortic arch|jugular trunk|subclavian trunk|intestinal trunk|broncomediastinal|lumbosacral trunk|celiac trunk|venous plexus|vein|artery|vessels?)\b/;
const rows=new Map();
for(const l of coverage.lectures)for(const m of l.missing){
 let t=m.term.trim().replace(/^[a-z]{1,3}\.\s+/i,'').replace(/\s+/g,' ');
 for(const [re,to] of ABBR)t=t.replace(re,to);
 const key=norm(t);
 if(!NERVE.test(key)||NOISE.test(key)||key.split(' ').length>6)continue;
 const entry=rows.get(key)??{key,lectures:new Set()};entry.lectures.add(l.lecture);rows.set(key,entry);
}
const list=[...rows.values()].sort((a,b)=>a.key.localeCompare(b.key));
const added=list.filter(r=>present(r.key)),missing=list.filter(r=>!present(r.key));
const group=r=>/occipital|auricular|cervical|supraclav|ansa|phrenic|accessory/.test(r.key)?'頸部／枕下':/vagus|laryngeal|cardiac|splanchnic|sympathetic|hypogastric|mesenteric|ganglion|pelvic|plexus/.test(r.key)?'自主神經系統與神經叢':/trigeminal|petrosal|alveolar|palatine|temporal|chorda|lingual|ophthalmic|oculomotor|facial|glossopharyngeal|hypoglossal|zygomatic|vidian|pterygoid|infraorbital|nasopalatine|auriculotemporal|deep temporal/.test(r.key)?'頭面部':/subscapular|pectoral|intercostobrachial|cutaneous|median|ulnar|radial|musculocutaneous/.test(r.key)?'上肢':/gluteal|clunial|pudendal|perineal|scrotal|labial|rectal|coccygeal|anococcygeal|subcostal|obturator|sural|femoral/.test(r.key)?'軀幹下部、骨盆與下肢':'其他';
const out=['# 周邊神經缺口清單\n','由 `node scripts/list-nerve-gaps.mjs` 依 `docs/coverage-data.json`（課程詞表）與目前模型名稱比對產生。課程詞表為自動抽取、含雜訊，已略去編號前綴、句子片段、神經元／細胞層級用詞與非神經結構；縮寫（n./sup./inf. 等）已展開。\n',
`- 課程詞表中判定為周邊神經／神經叢／神經節的詞：${list.length} 個\n- 其中模型已有（含本次補上的示意模型）：${added.length} 個\n- 模型尚缺：${missing.length} 個\n`,
'## 本次補上（示意管狀模型，資料卡標示「示意模型」）\n','枕下神經（C1 後支）、枕大神經（C2 後支）、第三枕神經（C3 後支）、枕小神經、耳大神經、枕下靜脈叢。Z-Anatomy（LluisV/Z-Anatomy@6c7f901，NervousSystem100.fbx／CardioVascular41.fbx）及 BodyParts3D 均無這六項的三維模型，因此沿教科書走行建立簡化管狀模型；詳見 `public/model_sources.json`。\n',
'## 模型尚缺的周邊神經（待決定如何補）\n'];
const groups=[...new Set(missing.map(group))].sort();
for(const g of groups){out.push(`### ${g}\n`);out.push('| 英文（正規化後） | 出現的課堂 |\n|---|---|');for(const r of missing.filter(x=>group(x)===g))out.push(`| ${r.key} | ${[...r.lectures].join('、')} |`);out.push('');}
out.push('## 已在模型中的對應（供核對）\n');out.push('<details><summary>展開 '+added.length+' 項</summary>\n\n'+added.map(r=>`- ${r.key}`).join('\n')+'\n\n</details>\n');
fs.writeFileSync(root+'docs/peripheral-nerve-gaps.md',out.join('\n'));
console.log(`nerve gaps: ${list.length} terms, ${added.length} present, ${missing.length} missing`);

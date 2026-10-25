// Unified Chinese naming.
//   priority: (1) docs/muscle-layers.json  (2) docs/glossary.json with source_priority 跑考摘要  (3) other docs/glossary.json  (4) Taiwan-standard tables in app/
// Writes app/mj-naming-data.ts (read by chineseName) and docs/naming-report.md. Run with --check to fail when either file is stale.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {runnerImport} from 'vite';
const root=fileURLToPath(new URL('../',import.meta.url)),load=async f=>(await runnerImport(root+f)).module;
const read=f=>JSON.parse(fs.readFileSync(root+f,'utf8'));
const checkOnly=process.argv.includes('--check');
const DATA=root+'app/mj-naming-data.ts',REPORT=root+'docs/naming-report.md';

// Confirmed corrections applied to every Chinese name (longest first).
const FIXES=[['背闊肌','闊背肌']];

// Phase 1: baseline names with no overrides.
const previousData=fs.existsSync(DATA)?fs.readFileSync(DATA,'utf8'):'';
fs.writeFileSync(DATA,'export const NAMING_DATA={overrides:{} as Record<string,string>,fixes:'+JSON.stringify(FIXES)+' as [string,string][]};\n');
const naming=await load('app/mj-naming.ts'),info=await load('app/mj-structure-info.ts'),layers=await load('app/mj-muscle-layers.ts');

const structures=new Map();   // key -> {name, system, where:Set}
const add=(name,system,where)=>{const k=naming.namingKey(name);if(!k)return;const e=structures.get(k)??{name,system,where:new Set()};e.where.add(where);structures.set(k,e);};
const atlas=read('public/models/atlas.json'),stream=read('public/models/atlas-stream.json');
for(const p of [...atlas.parts,...(stream.parts??[])])add(p.name,p.system,'圖譜');
for(const x of JSON.parse(zlib.gunzipSync(fs.readFileSync(root+'public/models/search-extras.json.gz'))))add(x.n,x.s,'圖譜（延後載入）');
const quizKeys=new Set();
for(const f of fs.readdirSync(root+'public/models').filter(f=>/^quiz-.*\.json$/.test(f))){
 const q=read('public/models/'+f);
 for(const s of q.structures){add(s.name,s.system,'Quiz');quizKeys.add(naming.namingKey(s.name));}
}
const sideless=zh=>zh.replace(/^[左右]/,'');
const baseline=new Map();
for(const [k,e] of structures)baseline.set(k,sideless(info.structureProfile(e.name,e.system).chinese??''));

// Source 1: muscle-layers.json. Only exact structure names are renamed; parts and numbered series keep their derived names.
const layerForms=new Map();
for(const r of layers.MUSCLE_LAYER_REGIONS)for(const g of r.layers)for(const m of g.muscles){
 const e=m.en.toLowerCase();let forms=[e];
 const head=e.match(/^(.+?) – (long|short|lateral|medial) head$/);
 if(head)forms=[`${head[2]} head of ${head[1]}`];
 const limb=e.match(/^(.+?) \((hand|foot)\)$/);
 if(limb)forms=[`${limb[1]} of ${limb[2]}`];
 for(const f of forms)if(!layerForms.has(f))layerForms.set(f,{zh:m.zh,region:r.id,en:m.en});
}

// Sources 2 and 3: glossary.json, strictly filtered.
const ABBR={'sup.':'superior','inf.':'inferior','ant.':'anterior','post.':'posterior','med.':'medial','lat.':'lateral'};
const TYPES={m:{add:'',zh:/肌$/},n:{add:' nerve',zh:/神經$/},a:{add:' artery',zh:/動脈$/},v:{add:' vein',zh:/靜脈$/},lig:{add:' ligament',zh:/韌帶$/}};
const rejected=[],glossaryRules=[];
const glossary=read('docs/glossary.json').terms;
for(const t of glossary){
 const tier=t.source_priority==='跑考摘要'?2:3;
 const why=(r)=>rejected.push({en:t.en,zh:t.zh,tier,reason:r});
 if(t.needs_review){why('標為 needs_review');continue;}
 let en=t.en.trim().replace(/\.$/,'');
 const tm=/^(.*?)\s+(m|n|a|v|lig)$/i.exec(en);
 if(!tm){why('無法判斷結構類型（缺 m/n/a/v/lig 後綴）');continue;}
 const type=TYPES[tm[2].toLowerCase()];let body=tm[1];
 if(/^[a-z]{1,3}\.\s/i.test(body)&&!Object.keys(ABBR).some(a=>body.toLowerCase().startsWith(a))){why('英文名含編號前綴（自動抽取殘留）');continue;}
 body=body.replace(/\b(sup|inf|ant|post|med|lat)\./gi,m=>ABBR[m.toLowerCase()]).replace(/palmer/gi,'palmar').toLowerCase().trim();
 if(/\b(br|branch)\b|^tendon of|^nerve to|^set of/.test(body)){why('分支／肌腱／系列結構，無法一對一對應');continue;}
 const zh=t.zh.trim();
 if(!type.zh.test(zh)){why('中文名類型與英文後綴不符（疑似抽取錯位）');continue;}
 if(zh.length>10||/[，、。的與由為及]/.test(zh)||/^(源自|深層|位於|來自|屬於|包含|行經|沿|經由|通過)|(?:深層有|源自|位於)/.test(zh)){why('中文名過長或含句子成分');continue;}
 let key=(body+type.add).trim();
 if(/^(inferior|superior) gemellus$/.test(body))key=`gemellus ${body.split(' ')[0]}`;
 glossaryRules.push({key,zh,tier,en:t.en,alternatives:t.alternatives??[]});
}

// Resolve per structure.
const rows=[],overrides={},conflicts=[],adopted={1:0,2:0,3:0},sameName=new Map();
for(const [k,e] of structures){
 const base=baseline.get(k);let pick=null;
 const lf=layerForms.get(k);
 if(lf)pick={zh:lf.zh,tier:1,src:`muscle-layers.json（${lf.region}）`};
 const gl=glossaryRules.filter(g=>g.key===k).sort((a,b)=>a.tier-b.tier);
 if(!pick&&gl.length)pick={zh:gl[0].zh,tier:gl[0].tier,src:gl[0].tier===2?'glossary.json（跑考摘要）':'glossary.json（其他筆記）'};
 if(pick&&gl.length&&gl[0].zh!==pick.zh)conflicts.push({key:k,layers:pick.zh,glossary:gl[0].zh});
 if(pick&&pick.zh!==base){overrides[k]=pick.zh;adopted[pick.tier]++;}
 const finalZh=overrides[k]??base;
 rows.push({key:k,name:e.name,where:[...e.where].join('、'),system:e.system,source:pick?pick.src:'台灣解剖學名詞（程式內建對照表）',before:base,after:finalZh,changed:pick&&pick.zh!==base});
 if(finalZh){const list=sameName.get(finalZh)??[];list.push(e.name);sameName.set(finalZh,list);}
}
const final={overrides:Object.fromEntries(Object.entries(overrides).sort()),fixes:FIXES};
const finalText='// Generated by scripts/prepare-naming.mjs — do not edit.\nexport const NAMING_DATA={\n overrides:'+JSON.stringify(final.overrides,null,1).replace(/\n/g,'\n ')+',\n fixes:'+JSON.stringify(final.fixes)+' as [string,string][]\n};\n';

// Report
const side=n=>n.replace(/\b(Left|Right)\b/gi,'').replace(/\s+/g,' ').trim();
const changed=rows.filter(r=>r.changed),quizRows=rows.filter(r=>r.where.includes('Quiz'));
const dup=[...sameName].filter(([,v])=>new Set(v.map(x=>naming.namingKey(x))).size>1&&v.length>1).slice(0,60);
const latin=rows.filter(r=>!r.after||/[A-Za-z]{3,}/.test(r.after.replace(/\b[IVX]+\b/g,'').replace(/\b[CTLS]\d+/g,'')));
const bySource=Object.entries(rows.reduce((a,r)=>{const s=r.source.replace(/（[a-z_]+）$/,'');a[s]=(a[s]||0)+1;return a;},{})).sort((a,b)=>b[1]-a[1]);
const md=[];
md.push('# 統一命名報告\n');
md.push('由 `scripts/prepare-naming.mjs` 產生（`npm run check` 會檢查本檔是否最新）。優先次序：\n');
md.push('1. `docs/muscle-layers.json`（跑考摘要的肌肉分層）\n2. `docs/glossary.json` 中 `source_priority` 為「跑考摘要」的項目\n3. `docs/glossary.json` 其他項目\n4. 以上皆無，採用台灣解剖學通用譯名（程式內建對照表 `app/mj-structure-info.ts`、`app/mj-zh-anatomy.ts`、`app/mj-zh-extra*.ts`）\n');
md.push('`docs/glossary.json` 為自動抽取，採用前逐項過濾：標為 `needs_review`、英文名不帶結構類型後綴、中文名與類型不符（如動脈對應到「分隔」）、含句子成分、分支／肌腱／系列結構者一律不採用，列於下方「待確認」。\n');
md.push('## 一、結果摘要\n');
md.push(`- 涵蓋結構名稱（去除左右後）：${rows.length} 個，其中 Quiz 用到 ${quizRows.length} 個\n- 採用來源 1（muscle-layers.json）改名：${adopted[1]} 個；來源 2（跑考摘要）：${adopted[2]} 個；來源 3（其他筆記）：${adopted[3]} 個\n- 全站固定修正：${FIXES.map(([a,b])=>`「${a}」→「${b}」`).join('、')}\n- 仍缺中文名或含英文：${latin.length} 個\n`);
md.push('| 來源 | 結構數 |\n|---|---|\n'+bySource.map(([s,n])=>`| ${s} | ${n} |`).join('\n')+'\n');
md.push('## 二、已改名（前後對照）\n');
md.push('| 結構 | 使用來源 | 改名前 | 改名後 |\n|---|---|---|---|\n'+(changed.length?changed.map(r=>`| ${side(r.name)} | ${r.source} | ${r.before||'（無）'} | ${r.after} |`).join('\n'):'| （無） | | | |')+'\n');
md.push('## 三、已知錯誤的修正結果\n');
const known=[['左背闊肌→左闊背肌','Latissimus dorsi'],['Quiz 說明文字「背闊肌」→「闊背肌」','（說明文字，全站字串修正）'],['左Occipital Pole→左枕極','Occipital pole'],['左Angular Gyrus→左角回','Angular gyrus']];
for(const [label,en] of known){const r=rows.find(x=>x.key===en.toLowerCase());md.push(`- ${label}${r?`：目前「${r.after}」（${r.source}）`:''}`);}
md.push('\n## 四、待你確認\n');
md.push('### 4.1 不採用的 glossary 項目（共 '+rejected.length+' 項）\n');
const reasonCounts=rejected.reduce((a,r)=>{a[r.reason]=(a[r.reason]||0)+1;return a;},{});
md.push(Object.entries(reasonCounts).map(([r,n])=>`- ${r}：${n} 項`).join('\n')+'\n');
md.push('跑考摘要來源中被擋下的項目（請確認是否要人手補正）：\n');
md.push('| 英文（原文） | 中文（原文） | 擋下原因 |\n|---|---|---|\n'+rejected.filter(r=>r.tier===2).map(r=>`| ${r.en} | ${r.zh} | ${r.reason} |`).join('\n')+'\n');
md.push('其他筆記來源中標為 needs_review 者（部分明顯錯配，如「Enteric nervous system」不可對應「骨盆內臟神經」）：\n');
md.push('<details><summary>展開 '+rejected.filter(r=>r.tier===3).length+' 項</summary>\n\n| 英文（原文） | 中文（原文） | 擋下原因 |\n|---|---|---|\n'+rejected.filter(r=>r.tier===3).map(r=>`| ${r.en} | ${r.zh} | ${r.reason} |`).join('\n')+'\n\n</details>\n');
if(latin.length)md.push('### 4.0 仍缺中文名\n\n'+latin.map(r=>`- ${r.name}（${r.after||'無'}）`).join('\n')+'\n');
md.push('### 4.2 來源 1 與 glossary 不一致\n');
md.push(conflicts.length?'| 結構 | muscle-layers.json（採用） | glossary.json |\n|---|---|---|\n'+conflicts.map(c=>`| ${c.key} | ${c.layers} | ${c.glossary} |`).join('\n'):'無。');
md.push('\n### 4.3 同一中文名對應多個不同英文結構\n');
md.push(dup.length?'| 中文名 | 對應英文 |\n|---|---|\n'+dup.map(([zh,v])=>`| ${zh} | ${[...new Set(v.map(side))].slice(0,6).join('；')} |`).join('\n'):'無。');
md.push('\n（`muscle-layers.json` 本身將 Extensor/Flexor pollicis longus 與 Extensor/Flexor hallucis longus 都寫成「伸拇長肌」「屈拇長肌」，手部與足部同名，請確認是否要改為「伸拇趾長肌」「屈拇趾長肌」。）\n');
md.push('### 4.4 程式內建譯名中標示為「組合詞」者\n');
md.push('這些名稱由規則組合產生（器官段血管、椎間盤、腦回／溝別名等），已列入 `docs/zh-tw-terminology-review.md`，請抽查。\n');
md.push('## 五、Quiz 結構命名一覽\n');
md.push('<details><summary>展開 '+quizRows.length+' 項</summary>\n\n| 結構 | 使用來源 | 中文名 |\n|---|---|---|\n'+quizRows.map(r=>`| ${side(r.name)} | ${r.source} | ${r.after} |`).join('\n')+'\n\n</details>\n');
md.push('## 六、其餘圖譜結構命名一覽\n');
const others=rows.filter(r=>!r.where.includes('Quiz'));
md.push('<details><summary>展開 '+others.length+' 項</summary>\n\n| 結構 | 使用來源 | 中文名 |\n|---|---|---|\n'+others.map(r=>`| ${side(r.name)} | ${r.source} | ${r.after} |`).join('\n')+'\n\n</details>\n');
const reportText=md.join('\n');

if(checkOnly){
 const stale=[];
 if(previousData!==finalText)stale.push('app/mj-naming-data.ts');
 if(!fs.existsSync(REPORT)||fs.readFileSync(REPORT,'utf8')!==reportText)stale.push('docs/naming-report.md');
 fs.writeFileSync(DATA,finalText);
 if(stale.length){fs.writeFileSync(DATA,finalText);console.error('命名資料已過期，請執行 node scripts/prepare-naming.mjs：'+stale.join('、'));process.exit(1);}
 if(latin.length){console.error('仍有結構缺中文名：'+latin.slice(0,10).map(r=>r.name).join('；'));process.exit(1);}
}else{
 fs.writeFileSync(DATA,finalText);fs.writeFileSync(REPORT,reportText);
 console.log(`naming: ${rows.length} structures, overrides ${Object.keys(overrides).length} (layers ${adopted[1]}, 跑考 ${adopted[2]}, other ${adopted[3]}), rejected glossary ${rejected.length}, missing ${latin.length}`);
}

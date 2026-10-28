// Connective tissue layers (app/mj-connective-layers.ts): every capsule, ligament, disc and membrane of the joint model and the atlas gets a layer, and the layer follows the
// rules written in the module. docs/connective-layers.md lists the structures of each layer for review. The joint model is read from work/joints-rest.json
// (node scripts/export-joints-rest.mjs); without it only the atlas and schematic structures are checked.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {runnerImport} from 'vite';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),load=async f=>(await runnerImport(root+f)).module;
const mod=await load('app/mj-connective-layers.ts'),cls=await load('app/mj-system-classifier.ts');
const atlas=cls.normalizeAtlasSystems(loadFullAtlas().atlas);
const names=new Map();// base name -> {layer, source}
for(const p of atlas.parts)if(p.system==='connective'){const l=mod.connectiveLayer(p.name);if(l!==null)names.set(p.name.replace(/\b(Left|Right) /g,'').replace(/ of (left|right) /,' of '),{layer:l,source:'atlas'});}
const jointsFile=root+'work/joints-rest.json';
let joints=0;
if(fs.existsSync(jointsFile)){
 for(const r of JSON.parse(fs.readFileSync(jointsFile,'utf8')).rows){
  const base=r.name.replace(/\.[lr]$/,''),l=mod.connectiveLayer(base);joints++;
  assert.notEqual(l,null,`${base}: joint structure without a layer`);
  if(r.kind==='fibrocartilage')assert.equal(l,1,`${base}: fibrocartilage is layer 1`);
  if(r.kind==='capsule')assert.equal(l,2,`${base}: capsule is layer 2`);
  names.set(base,{layer:l,source:'joints'});
 }
}
// rules spot checks
const expect={'Articular disc of distal radio-ulnar joint':1,'Glenoid labrum':1,'Medial meniscus':1,'Articular capsule of elbow joint':2,'Articular capsules of metacarpophalangeal joints':2,
 'Dorsal radiocarpal ligament':3,'Radioscaphocapitate ligament':3,'Anterior cruciate ligament':3,'Interosseous membrane of forearm':3,'Collateral interphalangeal ligaments of hand':4,'Collateral metacarpophalangeal ligaments':4,
 'Deep transverse metacarpal ligament':4,'Plantar metatarsal ligaments':4,'Extensor retinaculum of wrist':5,'Flexor retinaculum of wrist':5,'Superior glenohumeral ligament':5,'Annular ligament of radius':5,'Radial collateral ligament':5,
 'Radial collateral ligament of wrist joint':3,'Acromioclavicular ligament':5,'Annular pulleys of index finger':6,'Palmar aponeurosis':6};
for(const [n,l] of Object.entries(expect))assert.equal(mod.connectiveLayer(n),l,`${n} should be layer ${l}`);
assert.equal(mod.connectiveLayer('Quadrangular space'),null);assert.equal(mod.connectiveLayer('Right carpal tunnel'),null);
// the layer filter
const part=name=>({name,system:'connective'});
assert.ok(mod.matchesConnectiveLayer(part('Right dorsal radiocarpal ligament'),3)&&!mod.matchesConnectiveLayer(part('Right dorsal radiocarpal ligament'),2));
assert.ok(mod.matchesConnectiveLayer(part('Right quadrangular space'),1)&&mod.matchesConnectiveLayer({name:'Right humerus',system:'skeletal'},1)&&mod.matchesConnectiveLayer(part('Right annular pulleys of index finger'),6)&&!mod.matchesConnectiveLayer(part('Right annular pulleys of index finger'),5));
const by=new Map();for(const [n,v] of names){(by.get(v.layer)??by.set(v.layer,[]).get(v.layer)).push(n);}
const md=['# 結締組織分層','',`依 \`app/mj-connective-layers.ts\` 的規則歸層（共 ${names.size} 個結構種類，不分左右；關節模型 ${joints} 件）。請核對每層的內容。`,''];
for(const l of mod.CONNECTIVE_LAYERS){const list=(by.get(l.order)??[]).sort();md.push(`## 第 ${l.order} 層｜Layer ${l.order}：${l.en}｜${l.zh}（${list.length}）`,'',...list.map(n=>`- ${n}`),'');}
fs.writeFileSync(root+'docs/connective-layers.md',md.join('\n'));
console.log(`connective layers: ${names.size} structure kinds in ${by.size} layers (${joints} joint-model tissues)`);

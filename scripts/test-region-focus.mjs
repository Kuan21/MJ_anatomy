import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import ts from 'typescript';

const root=new URL('../',import.meta.url),tmp=new URL('.sites-runtime/',root);
await mkdir(tmp,{recursive:true});
const source=await readFile(new URL('app/mj-part-regions.ts',root),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
await writeFile(new URL('mj-part-regions.mjs',tmp),js);
const regions=await import(new URL('mj-part-regions.mjs',tmp));

const raw=JSON.parse(await readFile(new URL('public/models/atlas.json',root),'utf8'));
const overrides=JSON.parse(await readFile(new URL('app/anatomy-source-overrides.json',root),'utf8'));
const excluded=new Set(overrides.exclude);
const parts=raw.parts.filter(p=>!excluded.has(p.id)).map(p=>({...p,...(overrides.parts[p.id]||{})}));
const byId=new Map(parts.map(p=>[p.id,p]));

const requirePart=id=>{const p=byId.get(id);assert.ok(p,'Missing runtime part '+id);return p;};
const named=(ids,pattern)=>ids.map(id=>byId.get(id)).filter(Boolean).filter(p=>pattern.test(p.name));

const upper=new Set(regions.partsInRegion(parts,'upper-limb'));
const lower=new Set(regions.partsInRegion(parts,'lower-limb'));
const head=new Set(regions.partsInRegion(parts,'head-neck'));
const topHead=new Set(regions.topRegionParts(parts,'head'));

// The four focus groups must not overlap. A mesh belongs to one anatomical
// movement chain; duplicated membership is exactly what caused unrelated parts
// to move together.
for(const id of upper){assert.ok(!lower.has(id)&&!head.has(id),'Upper-limb mesh leaked into another focus: '+id);}
for(const id of lower){assert.ok(!head.has(id),'Lower-limb mesh leaked into head/neck: '+id);}

// Strong representative structures must land in the correct focus.
for(const name of ['Left humerus','Right humerus','Left radius','Right radius']){
 const p=parts.find(x=>x.name===name);assert.ok(p&&upper.has(p.id),name+' missing from upper-limb focus');
}
for(const name of ['Left femur','Right femur','Left tibia','Right tibia','Left talus','Right talus']){
 const p=parts.find(x=>x.name===name);assert.ok(p&&lower.has(p.id),name+' missing from lower-limb focus');
}
for(const name of ['Atlas','Axis','Hyoid bone']){
 const p=parts.find(x=>x.name===name);assert.ok(p&&head.has(p.id),name+' missing from head-neck focus');
}

// Regression: hands must never become lower limbs simply because their neutral
// y-coordinate overlaps the pelvis/thigh region.
const upperTerms=/\bhand\b|finger|thumb|metacarp|carpal|palmar|humerus|radius|ulna|clavicle|scapula/i;
assert.equal(named([...lower],upperTerms).length,0,'Upper-limb structures leaked into lower-limb focus');

// Regression: lower-limb anatomy must never be visible in strict head/neck
// motion focus or the contextual top-level head view.
const lowerTerms=/\bfoot\b|toe|metatars|plantar|femur|femoral|patella|tibia|fibula|fibular|saphen|sciatic|gastrocnem|soleus|glute/i;
assert.equal(named([...head],lowerTerms).length,0,'Lower-limb structures leaked into head-neck motion focus');
assert.equal(named([...topHead],lowerTerms).length,0,'Lower-limb structures leaked into top head view');

// Verified BodyParts3D source anomalies.
const leftFootVein=requirePart('FJ2186'),rightFootVein=requirePart('FJ2199');
assert.equal(leftFootVein.name,'Left dorsal metatarsal vein');
assert.equal(rightFootVein.name,'Right dorsal metatarsal vein');
assert.equal(regions.anatomicalRegion(leftFootVein),'lower-limb');
assert.equal(regions.anatomicalSubregion(leftFootVein),'foot');
assert.equal(regions.anatomicalRegion(rightFootVein),'lower-limb');
assert.equal(regions.anatomicalSubregion(rightFootVein),'foot');
assert.ok(lower.has('FJ2186')&&lower.has('FJ2199'));

const rightFpb=requirePart('FJ1469'),leftFpb=requirePart('FJ1469M');
assert.equal(rightFpb.name,'Right flexor pollicis brevis');
assert.equal(leftFpb.name,'Left flexor pollicis brevis');
assert.equal(regions.anatomicalSide(rightFpb),'right');
assert.equal(regions.anatomicalSide(leftFpb),'left');
assert.equal(regions.anatomicalSubregion(rightFpb),'hand');
assert.equal(regions.anatomicalSubregion(leftFpb),'hand');

const leftFibular=requirePart('FJ2190');
assert.equal(leftFibular.name,'Left fibular vein');
assert.equal(regions.anatomicalRegion(leftFibular),'lower-limb');
assert.equal(regions.anatomicalSide(leftFibular),'left');
assert.ok(lower.has(leftFibular.id),'Corrected left fibular vein must stay in lower-limb focus');

// A neck/chest centroid must not detach a shoulder muscle from its upper-limb
// motion chain. Intrinsic laryngeal structures belong to the head/neck view.
for(const id of ['FJ1460','FJ1460M','FJ1521','FJ1521M']){
 assert.equal(regions.anatomicalRegion(requirePart(id)),'upper-limb',id+' must stay in the shoulder chain');
 assert.ok(upper.has(id),id+' missing from upper-limb focus');
}
for(const id of ['FJ2777','FJ2778','FJ2781','FJ2782','FJ2783','FJ2789','FJ2794','FJ2796','FJ2799','FJ2800','FJ2801']){
 assert.equal(regions.anatomicalRegion(requirePart(id)),'head-neck',id+' is intrinsic laryngeal anatomy');
 assert.ok(head.has(id),id+' missing from head-neck focus');
}

for(const id of ['FJ2091','FJ2195']){
 assert.ok(!byId.has(id),'Excluded source anomaly still exists at runtime: '+id);
 assert.ok(!upper.has(id)&&!lower.has(id)&&!head.has(id),'Excluded source anomaly leaked into focus: '+id);
}

console.log(`Region/focus regression audit passed: ${upper.size} upper-limb, ${lower.size} lower-limb, ${head.size} head-neck meshes.`);

// Regression: UI-visible foot/genicular/perforating vessels previously stayed
// in the rest pose because this audit only checked existing manifest entries.
const bodyBindings=JSON.parse(await readFile(new URL('app/biomechanics-v2/body-bindings.json',root),'utf8'));
let legSoft=0;
for(const p of parts){
 if(!lower.has(p.id)||!['muscular','arterial','venous','connective'].includes(p.system))continue;
 const side=regions.anatomicalSide(p);if(side==='midline')continue;
 const b=bodyBindings[p.id];assert.ok(b,`Visible lower-limb tissue lacks motion: ${p.id} ${p.name}`);
 assert.equal(b.rig,side==='left'?'leftLeg':'rightLeg',`Wrong leg rig: ${p.name}`);
 assert.equal(b.name,p.name,`Stale binding name: ${p.id}`);legSoft++;
}
console.log(`${legSoft} visible lower-limb soft tissues all have matching motion bindings.`);

for(const id of ['FJ1438','FJ1438M']){assert.ok(lower.has(id));assert.ok(!upper.has(id),'Tensor fasciae latae must not float in arm view');}

const classifierSource=(await readFile(new URL('app/mj-system-classifier.ts',root),'utf8')).replace(/import sourceOverrides from '[^']+';/,`const sourceOverrides=${JSON.stringify(overrides)};`);
await writeFile(new URL('mj-system-classifier.mjs',tmp),ts.transpileModule(classifierSource,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
const {normalizeAtlasSystems}=await import(new URL('mj-system-classifier.mjs',tmp));
const normalized=normalizeAtlasSystems(raw);
for(const id of ['FJ1438','FJ1438M'])assert.equal(normalized.parts.find(p=>p.id===id).system,'muscular');

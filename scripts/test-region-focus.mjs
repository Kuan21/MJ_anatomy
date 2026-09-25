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
assert.deepEqual(topHead,head,'Top-level Head focus must contain only head and neck meshes');

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

for(const id of ['FJ2091','FJ2195']){
 assert.ok(!byId.has(id),'Excluded source anomaly still exists at runtime: '+id);
 assert.ok(!upper.has(id)&&!lower.has(id)&&!head.has(id),'Excluded source anomaly leaked into focus: '+id);
}

console.log(`Region/focus regression audit passed: ${upper.size} upper-limb, ${lower.size} lower-limb, ${head.size} head-neck meshes.`);

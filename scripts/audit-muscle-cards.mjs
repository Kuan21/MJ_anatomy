// Muscle card audit: every muscular structure the viewer draws must show the same muscle card (category "Muscle", fields Origin, Insertion, Innervation, Action, each with English and Chinese).
// Lists the muscles that use another layout (generic "Region / Structure type" card) or lack a field. usage: node scripts/audit-muscle-cards.mjs [--list] [--check]
// Prints structure names and counts only.
import {quizModule} from './quiz-modules.mjs';
import {loadStabilityParts} from './lib/stability-world.mjs';
const {structureProfile}=await quizModule('app/mj-structure-info.ts');
const {atlas}=loadStabilityParts();
const FIELDS=[['Origin','起點'],['Insertion','止點'],['Innervation','神經支配'],['Action','作用']];
const rows=[];
for(const part of atlas.parts){
 if(part.system!=='muscular')continue;
 const p=structureProfile(part.name,'muscular',part);
 const facts=p.facts??[];
 const missing=FIELDS.filter(([en])=>!facts.some(f=>f.labelEn===en&&(f.valueEn||'').trim()&&(f.valueZh||'').trim())).map(([en])=>en);
 rows.push({id:part.id,name:part.name,category:p.category,missing,layout:facts.some(f=>f.labelEn==='Structure type')?'generic':'muscle'});
}
const bad=rows.filter(r=>r.missing.length||r.layout==='generic');
console.log(`muscular structures: ${rows.length}; complete muscle card: ${rows.length-bad.length}; generic layout: ${rows.filter(r=>r.layout==='generic').length}; missing at least one field: ${rows.filter(r=>r.missing.length).length}`);
const cats={};for(const r of rows)cats[r.category]=(cats[r.category]||0)+1;console.log('categories:',JSON.stringify(cats));
if(process.argv.includes('--list'))for(const r of bad)console.log(`  ${r.id.padEnd(16)} ${r.name.padEnd(48)} ${r.layout.padEnd(8)} missing: ${r.missing.join(', ')}`);
if(process.argv.includes('--check')&&bad.length)process.exit(1);

import fs from 'node:fs';

const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const atlas=read('public/models/atlas.json');
const overrides=read('app/anatomy-source-overrides.json');
const tissue=read('app/biomechanics-v2/tissue-bindings.json');
const body=read('app/biomechanics-v2/body-bindings.json');
const bodyNerves=read('app/biomechanics-v2/body-nerve-bindings.json');

const excluded=new Set(overrides.exclude);
const parts=atlas.parts.filter(p=>!excluded.has(p.id)).map(p=>({...p,...(overrides.parts[p.id]||{})}));
const byId=new Map(parts.map(p=>[p.id,p]));
const failures=[];
const center=p=>p.bounds[0].map((v,i)=>(v+p.bounds[1][i])/2);
const side=p=>{const x=center(p)[0];return x>.025?'left':x<-.025?'right':null;};
const limbLaterality=/clavicle|scapula|humerus|radius|ulna|hand|finger|thumb|carpal|metacarp|brachial|antebrachial|cephalic|basilic|femur|femoral|patella|tibia|fibula|fibular|saphen|sciatic|glute|thigh|leg|foot|toe|tarsal|metatars|plantar|calcane|talus|gastrocnem|soleus/i;

for(const p of parts){
 const [x,y]=center(p);
 if(/^Left\b/i.test(p.name)&&x<-.025)failures.push(p.id+': "'+p.name+'" is labelled left but geometry is on the right');
 if(/^Right\b/i.test(p.name)&&x>.025)failures.push(p.id+': "'+p.name+'" is labelled right but geometry is on the left');
 if(/\bmetacarpal\b/i.test(p.name)&&y<.30)failures.push(p.id+': hand/metacarpal name is located at foot height');
 if(/\bmetatarsal\b/i.test(p.name)&&y>.30)failures.push(p.id+': foot/metatarsal name is located above the lower limb');
}

for(const [id,b] of Object.entries(tissue)){
 const p=byId.get(id);if(!p)continue;
 if(b.name!==p.name)failures.push(id+': tissue binding name "'+b.name+'" != part "'+p.name+'"');
 const s=side(p);if(s&&b.side!==s)failures.push(id+': tissue binding side '+b.side+' != geometry side '+s);
}
const intrinsicHand=/flexor digiti minimi brevis of .* hand|flexor pollicis brevis|abductor pollicis brevis|adductor pollicis|opponens pollicis|abductor digiti minimi.*hand|opponens digiti minimi|lumbrical.*hand|interosse.*hand/i;
for(const [id,b] of Object.entries(tissue)){
 const p=byId.get(id);if(!p)continue;
 if(intrinsicHand.test(p.name)&&b.profile!=='hand')failures.push(id+': intrinsic hand muscle uses '+b.profile+' profile instead of hand');
 const [,y]=center(p),x=Math.abs(center(p)[0]);
 if(y<.30&&x>.035&&x<.21)failures.push(id+': upper-limb tissue binding lies in foot/lower-leg space');
}

for(const [id,b] of Object.entries(body)){
 const p=byId.get(id);if(!p)continue;
 if(b.name!==p.name)failures.push(id+': body binding name "'+b.name+'" != part "'+p.name+'"');
 if(b.rig==='leftLeg'||b.rig==='rightLeg'){
  const s=side(p),expected=s?s+'Leg':null;
  if(expected&&b.rig!==expected)failures.push(id+': body rig '+b.rig+' != geometry side '+expected);
 }
}

for(const [name,region] of Object.entries(bodyNerves)){
 const sideSuffix=/\.l(?:\.|$)/i.test(name)?'left':/\.r(?:\.|$)/i.test(name)?'right':null;
 if(region==='leftLeg'&&sideSuffix==='right')failures.push(name+': right-sided nerve bound to leftLeg');
 if(region==='rightLeg'&&sideSuffix==='left')failures.push(name+': left-sided nerve bound to rightLeg');
}

// Explicit regressions for source records that previously produced the exact
// cross-region failures visible in the UI.
for(const [id,expected] of Object.entries({FJ2186:'Left dorsal metatarsal vein',FJ2199:'Right dorsal metatarsal vein',FJ2190:'Left fibular vein',FJ1469:'Right flexor pollicis brevis',FJ1469M:'Left flexor pollicis brevis'})){
 const p=byId.get(id);if(!p||p.name!==expected)failures.push(id+': expected corrected runtime identity "'+expected+'"');
}
for(const id of ['FJ2091','FJ2195'])if(byId.has(id))failures.push(id+': quarantined source anomaly is still active');

for(const [id,patch] of Object.entries(overrides.parts)){
 const p=byId.get(id);
 if(!p)failures.push(id+': corrected source part is missing');
 if(p&&patch.name&&p.name!==patch.name)failures.push(id+': source name correction was not applied');
}
for(const id of overrides.exclude)if(byId.has(id))failures.push(id+': excluded source anomaly is still active');

if(failures.length){
 console.error('Anatomy mapping audit failed:\n'+failures.map(x=>' - '+x).join('\n'));
 process.exit(1);
}
console.log('Anatomy mapping audit passed: '+parts.length+' runtime meshes, '+Object.keys(tissue).length+' upper-tissue bindings, '+Object.keys(body).length+' body bindings, '+Object.keys(bodyNerves).length+' body-nerve bindings.');

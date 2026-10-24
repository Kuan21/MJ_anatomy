import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {runnerImport} from 'vite';
const atlas=JSON.parse(fs.readFileSync(new URL('../public/models/atlas.json',import.meta.url),'utf8'));
const lower=s=>s.toLowerCase();
const skeletal=atlas.parts.filter(p=>p.system==='skeletal');
const exact=name=>skeletal.filter(p=>lower(p.name)===lower(name));
const required=['clavicle','scapula','humerus','radius','ulna'];
let failed=false;
const fail=message=>{console.error(`✗ ${message}`);failed=true;};
for(const side of ['Left','Right']){
 for(const bone of required){
  const name=`${side} ${bone}`,matches=exact(name);
  console.log(`${name}: ${matches.length}`);
  if(matches.length!==1)fail(`Expected exactly one skeletal "${name}", found ${matches.length}`);
 }
}
const handPatterns=/metacarpal bone|phalanx .* (finger|thumb)|scaphoid|lunate|triquetr|pisiform|trapezium|trapezoid|capitate|hamate/;
for(const side of ['left','right']){
 const hand=skeletal.filter(p=>lower(p.name).includes(side)&&handPatterns.test(lower(p.name)));
 console.log(`${side} hand bones: ${hand.length}`);
 if(!hand.length)fail(`No skeletal ${side} hand bones matched.`);
}
const contamination=required.flatMap(term=>atlas.parts.filter(p=>lower(p.name).includes(term)&&p.system!=='skeletal').map(p=>p.name));
console.log(`Non-skeletal substring matches deliberately excluded: ${contamination.length}`);
// Guard against regressions where fuzzy matching accidentally captures vessels or muscles.
if(!contamination.length){console.warn('No non-skeletal substring collisions found; catalogue may have changed.');}

// ── Shared segment chain + dual-quaternion skinning, validated on the real geometry ──
const app=file=>fileURLToPath(new URL(`../app/${file}`,import.meta.url));
const load=async file=>(await runnerImport(app(file))).module;
const [R,S,M,T]=await Promise.all([load('mj-rig.ts'),load('mj-skinning.ts'),load('mj-motion.ts'),import('three')]);
const rig=R.rigFor(atlas);
const chain=['thorax','pelvis',...['left','right'].flatMap(s=>['scapula','humerus','ulna','radius','hand','femur','tibia','foot'].map(k=>`${s}.${k}`))];
for(const id of chain)if(!rig.byId.has(id))fail(`Rig is missing segment ${id}.`);
console.log(`Rig segments: ${rig.segments.length} (${rig.segments.map(s=>s.id).join(', ')})`);
for(const side of ['left','right']){
 const b=R.mapLowerLimbBones(atlas,side);
 for(const k of ['femur','tibia','fibula','patella','hip'])if(b[k].length!==1)fail(`Lower-limb chain: expected one ${side} ${k}, found ${b[k].length}.`);
 if(!b.foot.length)fail(`Lower-limb chain: no ${side} foot bones.`);
 console.log(`${side} lower limb: femur ${b.femur.length}, tibia ${b.tibia.length}, foot bones ${b.foot.length}`);
}

// Dual-quaternion maths must match the equivalent matrix exactly.
{
 const out=new T.Vector3();let worst=0;
 for(let k=0;k<200;k++){
  const q=new T.Quaternion().setFromEuler(new T.Euler(Math.sin(k)*3,Math.cos(k*1.7)*3,Math.sin(k*.3)*3)),t=new T.Vector3(Math.sin(k*2.1),Math.cos(k*.9),Math.sin(k*1.3)),p=new T.Vector3(Math.cos(k),Math.sin(k*1.1),Math.cos(k*.7));
  const dq=S.dualQuaternion({translation:t.toArray(),quaternion:q.toArray()}),m=new T.Matrix4().compose(t,q,new T.Vector3(1,1,1));
  worst=Math.max(worst,S.applyDQ(dq,p.x,p.y,p.z,out).distanceTo(p.clone().applyMatrix4(m)));
 }
 console.log(`Dual quaternion vs matrix max error: ${worst.toExponential(2)}`);
 if(worst>1e-6)fail('Dual-quaternion transform disagrees with matrix transform.');
}

const chunks=new Map(),chunk=i=>{if(!chunks.has(i))chunks.set(i,fs.readFileSync(new URL(`../public${atlas.chunks[i].url}`,import.meta.url)).buffer);return chunks.get(i);};
const geometry=i=>{const p=atlas.parts[i],buffer=chunk(p.chunk);return{positions:new Float32Array(buffer,p.positions,p.vertexCount*3),indices:new Uint32Array(buffer,p.indices,p.indexCount),box:new T.Box3(new T.Vector3(...p.bounds[0]),new T.Vector3(...p.bounds[1]))};};
const upper=new Set(rig.segments.filter(s=>s.limb==='upper').map(s=>s.index)),rightUpper=new Set(rig.segments.filter(s=>s.limb==='upper'&&s.side==='right').map(s=>s.index));
const started=performance.now(),skins=new Map();let vertices=0;
atlas.parts.forEach((p,i)=>{
 const g=geometry(i),candidates=S.candidateSegments(rig,g.box);if(!candidates.some(s=>upper.has(s))&&p.system!=='integumentary')return;
 skins.set(i,S.computePartSkin(rig,i,p.name,S.skinKind(p.system,p.name),g.positions,p.vertexCount,g.box,g.indices));vertices+=p.vertexCount;
});
console.log(`Skinned ${skins.size} upper-limb parts (${vertices.toLocaleString()} vertices) in ${((performance.now()-started)/1000).toFixed(1)} s`);

let unity=0,boneErrors=0;
skins.forEach((skin,i)=>{
 const p=atlas.parts[i],bone=rig.boneSegment.get(i);
 for(let v=0;v<p.vertexCount;v++){let sum=0;for(let k=0;k<4;k++)sum+=skin.weight[v*4+k];if(sum!==65535)unity++;}
 if(bone!==undefined&&(skin.segments.length!==1||skin.segments[0]!==bone||skin.weight[0]!==65535))boneErrors++;
});
if(unity)fail(`${unity} vertices whose weights do not sum to 1.`);
if(boneErrors)fail(`${boneErrors} mapped bones are not rigidly weighted (1.0) to their own segment.`);
console.log(`Weights: partition of unity ok=${!unity}, rigid bones ok=${!boneErrors}`);

// maxStretch: smooth blend zones stretch (the axillary fold is the worst case, where the thoracodorsal bundle
// follows latissimus dorsi toward the humerus); a torn joint measured ×50–420 before the fixes guarded here.
const POSES=[
 {name:'abduction 75° + elbow 60°',maxStretch:10,pose:{...M.NEUTRAL_POSE,shoulderAbduction:75,elbowFlexion:60}},
 {name:'flexion 120° + elbow 120° + pronation 80°',maxStretch:10,pose:{...M.NEUTRAL_POSE,shoulderFlexion:120,elbowFlexion:120,forearmRotation:80}},
 {name:'abduction 150° + external rotation 60° + elbow 145°',maxStretch:20,pose:{...M.NEUTRAL_POSE,shoulderAbduction:150,shoulderRotation:60,elbowFlexion:145}},
];
const posed=(pose,i)=>{const p=atlas.parts[i],out=new Float32Array(p.vertexCount*3);return S.skinPositions(pose,skins.get(i),geometry(i).positions,p.vertexCount,out);};

// Neurovascular continuity. Weights are a pure function of position, so two parts that meet must agree on the
// transform at the meeting point (no break), and stay attached up to the smooth stretch of the blend zone.
const tubes=[...skins.keys()].filter(i=>['arterial','venous','nervous'].includes(atlas.parts[i].system)&&skins.get(i).segments.some(s=>rightUpper.has(s)));
const CONTACT=.0015,cell=CONTACT,hash=(x,y,z)=>`${Math.floor(x/cell)},${Math.floor(y/cell)},${Math.floor(z/cell)}`;
const grid=new Map();
for(const i of tubes){const g=geometry(i).positions;for(let v=0;v<g.length/3;v++){const k=hash(g[v*3],g[v*3+1],g[v*3+2]);let list=grid.get(k);if(!list)grid.set(k,list=[]);list.push(i,v);}}
const contacts=[];
for(const i of tubes){
 const g=geometry(i).positions;
 for(let v=0;v<g.length/3;v+=2){
  const x=g[v*3],y=g[v*3+1],z=g[v*3+2],cx=Math.floor(x/cell),cy=Math.floor(y/cell),cz=Math.floor(z/cell);let best=null,bd=CONTACT*CONTACT;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){const list=grid.get(`${cx+a},${cy+b},${cz+c}`);if(!list)continue;for(let k=0;k<list.length;k+=2){const j=list[k];if(j<=i)continue;const w=list[k+1],h=geometry(j).positions,d=(h[w*3]-x)**2+(h[w*3+1]-y)**2+(h[w*3+2]-z)**2;if(d<bd){bd=d;best=[j,w,Math.sqrt(d)];}}}
  if(best)contacts.push([i,v,...best]);
 }
}
const pairs=new Set(contacts.map(([i,,j])=>`${i}-${j}`));
console.log(`Neurovascular parts in the right upper limb: ${tubes.length}; touching part pairs: ${pairs.size}; contact samples: ${contacts.length}`);
if(!contacts.length)fail('No neurovascular contacts found to validate; catalogue may have changed.');
const pose=new S.SegmentPose(rig.segments.length);
for(const {name,maxStretch,pose:requested} of POSES){
 const built=M.buildUpperLimbPreview(atlas,'right',requested);pose.set(rig,built.segments);
 const cache=new Map(),at=i=>{if(!cache.has(i))cache.set(i,posed(pose,i));return cache.get(i);};
 let worst=0,worstPair='',ratio=0,breakGap=0,breakPair='';const pi=new T.Vector3(),pj=new T.Vector3();
 for(const [i,v,j,w,rest] of contacts){
  const a=at(i),b=at(j),d=Math.hypot(a[v*3]-b[w*3],a[v*3+1]-b[w*3+1],a[v*3+2]-b[w*3+2]);
  if(d-rest>worst){worst=d-rest;worstPair=`${atlas.parts[i].name} ↔ ${atlas.parts[j].name}`;}
  ratio=Math.max(ratio,(d-.001)/rest);
 }
 // Break test: the shared point between two touching parts, skinned as part of each, must land in the same place.
 for(let k=0;k<contacts.length;k+=7){
  const [i,v,j,w]=contacts[k],gi=geometry(i),gj=geometry(j),m=[0,1,2].map(c=>(gi.positions[v*3+c]+gj.positions[w*3+c])/2),point=Float32Array.from(m);
  // Parts that keep to different groups (forearm vein vs thigh fascia) may only part company away from the junctions.
  const fi=skins.get(i).foreign??0,fj=skins.get(j).foreign??0;if(fi!==fj&&S.junctionFactor(rig,...m)>0)continue;
  const si=S.computePartSkin(rig,-1,'','field',point,1,gi.box,undefined,{foreign:fi}),sj=S.computePartSkin(rig,-1,'','field',point,1,gj.box,undefined,{foreign:fj});
  S.skinVertex(pose,si,0,...m,pi);S.skinVertex(pose,sj,0,...m,pj);const gap=pi.distanceTo(pj);if(gap>breakGap){breakGap=gap;breakPair=`${atlas.parts[i].name} ↔ ${atlas.parts[j].name}`;}
 }
 // Smooth bending: no edge inside a vessel or nerve may be torn open at a joint.
 let stretch=0,stretchPart='';
 for(const i of tubes){const g=geometry(i),a=at(i),idx=g.indices,r=g.positions;for(let k=0;k<idx.length;k+=3)for(let e=0;e<3;e++){const p=idx[k+e],q=idx[k+(e+1)%3],l0=Math.hypot(r[p*3]-r[q*3],r[p*3+1]-r[q*3+1],r[p*3+2]-r[q*3+2]);if(l0<1e-5)continue;const l=Math.hypot(a[p*3]-a[q*3],a[p*3+1]-a[q*3+1],a[p*3+2]-a[q*3+2])/l0;if(l>stretch){stretch=l;stretchPart=atlas.parts[i].name;}}}
 console.log(`[${name}] break gap max ${(breakGap*1000).toFixed(3)} mm; contact drift max ${(worst*1000).toFixed(2)} mm (${worstPair||'—'}), local ×${Math.max(1,ratio).toFixed(1)}; max vessel/nerve edge stretch ×${stretch.toFixed(2)} (${stretchPart})`);
 if(breakGap>5e-5)fail(`[${name}] neurovascular break: ${breakPair} disagree by ${(breakGap*1000).toFixed(3)} mm at their shared point.`);
 if(ratio>maxStretch)fail(`[${name}] touching neurovascular parts pulled apart ×${ratio.toFixed(1)} at ${worstPair}.`);
 if(stretch>maxStretch)fail(`[${name}] a neurovascular edge is stretched ×${stretch.toFixed(2)} in ${stretchPart} (torn at a joint).`);
 if(built.ligamentStates.some(s=>s.violated))fail(`[${name}] radioulnar guards violated: ${JSON.stringify(built.ligamentStates)}`);
}

// Muscles: weights run origin→insertion, and belly calibre follows the stretch ratio.
const byName=n=>atlas.parts.findIndex(p=>p.name===n);
const expectMuscle=(name,origin,insertion)=>{
 const i=byName(name),skin=skins.get(i);if(!skin?.muscle){fail(`${name}: expected an origin→insertion muscle binding.`);return null;}
 const o=rig.segments[skin.muscle.origin].id,n=rig.segments[skin.muscle.insertion].id;
 if(o!==origin||n!==insertion)fail(`${name}: expected ${origin}→${insertion}, got ${o}→${n}.`);
 return i;
};
const brachialis=expectMuscle('Right brachialis','right.humerus','right.ulna'),biceps=expectMuscle('Long head of right biceps brachii','right.scapula','right.radius');
const tricepsLong=expectMuscle('Long head of right triceps brachii','right.scapula','right.ulna');
expectMuscle('Acromial part of right deltoid','right.scapula','right.humerus');expectMuscle('Sternocostal part of right pectoralis major','thorax','right.humerus');
// Cross-section: distance of mid-belly vertices from their own axis point, both carried by the vertex's blended DQ.
const girth=i=>{const skin=skins.get(i),m=skin.muscle,count=atlas.parts[i].vertexCount,rest=geometry(i).positions,o=new T.Vector3(...m.o),d=new T.Vector3(...m.i).sub(o),l2=d.lengthSq(),p=new T.Vector3(),c=new T.Vector3();
 let sum=0,base=0;for(let v=0;v<count;v++){const r=new T.Vector3(rest[v*3],rest[v*3+1],rest[v*3+2]),t=r.clone().sub(o).dot(d)/l2;if(t<1/3||t>2/3)continue;const c0=o.clone().addScaledVector(d,t);S.skinVertex(pose,skin,v,r.x,r.y,r.z,p);S.applyDQ(Float32Array.from(S.vertexDQ(pose,skin,v)),c0.x,c0.y,c0.z,c);sum+=p.distanceTo(c);base+=r.distanceTo(c0);}
 return{ratio:sum/Math.max(1e-9,base),lambda:S.bellyScale(pose,m).lambda};};
for(const [flex,label] of [[120,'120° elbow flexion']]){
 pose.set(rig,M.buildUpperLimbPreview(atlas,'right',{...M.NEUTRAL_POSE,elbowFlexion:flex}).segments);
 [brachialis,biceps,tricepsLong].forEach(i=>{
  if(i===null||i<0)return;const g=girth(i);
  console.log(`${atlas.parts[i].name}: length ×${g.lambda.toFixed(2)}, belly cross-section ×${g.ratio.toFixed(3)} at ${label}`);
  if(g.lambda<.98&&g.ratio<=1.001)fail(`${atlas.parts[i].name} shortened but its belly did not thicken.`);
  if(g.lambda>1.02&&g.ratio>=.999)fail(`${atlas.parts[i].name} lengthened but its belly did not thin.`);
 });
}

// Reversibility and passive guards over a pose grid.
{
 const neutral=M.buildUpperLimbPreview(atlas,'right',M.NEUTRAL_POSE).segments;
 const drift=Object.values(neutral).reduce((m,t)=>Math.max(m,Math.hypot(...t.translation),Math.abs(Math.abs(t.quaternion[3])-1)),0);
 if(drift>1e-9)fail(`Neutral pose is not the rest pose (drift ${drift}).`);
 let violations=0,poses=0;
 for(const side of ['left','right'])for(const shoulderAbduction of [0,60,120,170])for(const elbowFlexion of [0,90,145])for(const forearmRotation of [-10,60,140]){
  poses++;const r=M.buildUpperLimbPreview(atlas,side,{...M.NEUTRAL_POSE,shoulderAbduction,elbowFlexion,forearmRotation});if(r.ligamentStates.some(s=>s.violated)||r.warnings.some(w=>w.startsWith('Pose reduced')))violations++;
 }
 console.log(`Radioulnar guards: ${poses} poses, ${violations} violations; neutral drift ${drift.toExponential(1)}`);
 if(violations)fail(`${violations} poses violate the radioulnar guards (pronation axis is not anatomical).`);
 const leftHand=M.buildUpperLimbPreview(atlas,'left',{...M.NEUTRAL_POSE,shoulderFlexion:90}).segments['left.hand'],rightHand=M.buildUpperLimbPreview(atlas,'right',{...M.NEUTRAL_POSE,shoulderFlexion:90}).segments['right.hand'];
 const forward=t=>new T.Vector3(...rig.byId.get(t[1]).pivot.toArray()).applyQuaternion(new T.Quaternion(...t[0].quaternion)).add(new T.Vector3(...t[0].translation)).z;
 if(!(forward([leftHand,'left.hand'])>.2&&forward([rightHand,'right.hand'])>.2))fail('Shoulder flexion must bring both hands forward (+z).');
}
if(failed)process.exitCode=1;else console.log('✓ Upper-limb mapping, shared segment chain and skinning validated.');

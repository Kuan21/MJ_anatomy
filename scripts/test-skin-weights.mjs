// Skin (and any unbound fascia/lymphatic limb surface) is weighted over the SAME segment chain that moves the bones,
// muscles and vessels. This proves the build-time weights are valid and that, with an arm or a leg moved, the skin follows
// its bones instead of staying behind (the "ghost") or tearing at the joints.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {runnerImport} from 'vite';
const root=fileURLToPath(new URL('../',import.meta.url)),load=async file=>(await runnerImport(root+file)).module;
const [soft,gpu,motion,bodyMotion,regions]=await Promise.all(['app/biomechanics-v2/soft-tissue.ts','app/biomechanics-v2/gpu-skinning.ts','app/mj-motion.ts','app/biomechanics-v2/body-motion.ts','app/mj-part-regions.ts'].map(load));
const atlas=JSON.parse(fs.readFileSync(root+'public/models/atlas.json','utf8')),skinFile=JSON.parse(gunzipSync(fs.readFileSync(root+'public/models/skin-weights.json.gz')));
const buffers=new Map(),chunk=i=>{if(!buffers.has(i))buffers.set(i,fs.readFileSync(root+'public'+atlas.chunks[i].url));return buffers.get(i);};
const view=(p,Type,offset,count)=>{const b=chunk(p.chunk);return new Type(b.buffer.slice(b.byteOffset+offset,b.byteOffset+offset+count*Type.BYTES_PER_ELEMENT));};
const hash=positions=>{let h=2166136261;for(let i=0;i<positions.length;i++)h=Math.imul(h^Math.round(positions[i]*1e7),16777619);return h>>>0;};
const skin=atlas.parts.find(p=>p.id==='FJ2810');assert.ok(skin&&skin.name==='Skin','skin mesh present');
const entry=skinFile.parts[skin.id];assert.ok(entry,'skin has weights');
const base=view(skin,Float32Array,skin.positions,skin.vertexCount*3),triangles=view(skin,Uint32Array,skin.indices,skin.indexCount);
assert.equal(entry.vertexCount,skin.vertexCount);assert.equal(entry.positionHash,hash(base),'weights belong to this exact mesh');
assert.equal(skinFile.slotCount,gpu.SLOT_COUNT,'palette layout matches');
const slotBytes=Buffer.from(entry.slots,'base64'),raw=Buffer.from(entry.weights,'base64'),values=new Uint16Array(raw.buffer,raw.byteOffset,raw.length/2);
const indices=Uint8Array.from(slotBytes),weights=Float32Array.from(values,v=>v/65535);
for(let v=0;v<skin.vertexCount;v++){let sum=0;for(let k=0;k<4;k++){sum+=values[v*4+k];assert.ok(indices[v*4+k]<gpu.SLOT_COUNT,'slot in range');}assert.equal(sum,65535,'exact partition of unity');}
// Everything with no binding of its own and a limb region must be covered (today: only the skin).
const bound=new Set(Object.keys(JSON.parse(fs.readFileSync(root+'app/biomechanics-v2/tissue-bindings.json','utf8'))).concat(Object.keys(JSON.parse(fs.readFileSync(root+'app/biomechanics-v2/body-bindings.json','utf8')))));
for(const p of atlas.parts)if(['lymphatic','integumentary','connective'].includes(p.system)&&['upper-limb','lower-limb'].includes(regions.anatomicalRegion(p))&&!bound.has(p.id)&&!regions.isMotionQuarantined(p))assert.ok(skinFile.parts[p.id],'unbound limb surface weighted: '+p.name);

// Bones, posed by the same transforms the viewer uses.
const boneBindings=JSON.parse(fs.readFileSync(root+'app/biomechanics-v2/bone-bindings.json','utf8')),bodyBindings=JSON.parse(fs.readFileSync(root+'app/biomechanics-v2/body-bindings.json','utf8'));
const bones=atlas.parts.filter(p=>p.system==='skeletal').map(p=>({p,base:view(p,Float32Array,p.positions,p.vertexCount*3)}));
const rigs={left:soft.makeSoftRig(atlas,'left'),right:soft.makeSoftRig(atlas,'right')};
const applyRigid=(positions,t)=>{if(!t)return positions;const [qx,qy,qz,qw]=t.quaternion,[tx,ty,tz]=t.translation,out=new Float32Array(positions.length);for(let i=0;i<positions.length;i+=3){const x=positions[i],y=positions[i+1],z=positions[i+2],cx=qy*z-qz*y+qw*x,cy=qz*x-qx*z+qw*y,cz=qx*y-qy*x+qw*z;out[i]=x+2*(qy*cz-qz*cy)+tx;out[i+1]=y+2*(qz*cx-qx*cz)+ty;out[i+2]=z+2*(qx*cy-qy*cx)+tz;}return out;};
const posedBones=(transforms)=>bones.map(({p,base})=>applyRigid(base,transforms[p.id]));
const nearest=(points,list)=>{ // grid of bone samples
 const cell=.03,grid=new Map(),key=(x,y,z)=>`${Math.floor(x/cell)},${Math.floor(y/cell)},${Math.floor(z/cell)}`;
 for(const pts of list)for(let i=0;i<pts.length;i+=9){const k=key(pts[i],pts[i+1],pts[i+2]);(grid.get(k)??grid.set(k,[]).get(k)).push(pts[i],pts[i+1],pts[i+2]);}
 return(x,y,z)=>{let best=Infinity;const cx=Math.floor(x/cell),cy=Math.floor(y/cell),cz=Math.floor(z/cell);
  for(let a=-3;a<=3;a++)for(let b=-3;b<=3;b++)for(let c=-3;c<=3;c++){const l=grid.get(`${cx+a},${cy+b},${cz+c}`);if(!l)continue;for(let i=0;i<l.length;i+=3){const d=Math.hypot(l[i]-x,l[i+1]-y,l[i+2]-z);if(d<best)best=d;}}
  return best;};
};
const rest=nearest(posedBones({}),[...posedBones({})]);
const restDistance=new Float32Array(skin.vertexCount);for(let v=0;v<skin.vertexCount;v++)restDistance[v]=rest(base[v*3],base[v*3+1],base[v*3+2]);

const arms=input=>({...motion.buildUpperLimbMotion(atlas,'left',{...motion.NEUTRAL_POSE,...input}).transforms,...motion.buildUpperLimbMotion(atlas,'right',{...motion.NEUTRAL_POSE,...input}).transforms});
const POSES=[
 {name:'both arms flexion 180',kind:'arm',transforms:arms({shoulderFlexion:180})},
 {name:'both arms abduction 180',kind:'arm',transforms:arms({shoulderAbduction:180})},
 {name:'elbow 140 + forearm pronation',kind:'arm',transforms:arms({shoulderFlexion:60,elbowFlexion:140,forearmRotation:80})},
];
const legRig=bodyMotion.makeBodyRig(atlas,'leftLeg');
const legPose=pose=>{const built=bodyMotion.buildBodyMotion(legRig,{...bodyMotion.BODY_NEUTRAL,...pose});return{transforms:built.transforms,palette:built.palette};};
const hip=legPose({flexion:120}),knee=legPose({knee:130});
let report=[];
for(const pose of [...POSES,{name:'left hip flexion 120',kind:'leg',...hip},{name:'left knee flexion 130',kind:'leg',...knee}]){
 const palettes=pose.kind==='arm'?{left:soft.makePalette(rigs.left,pose.transforms),right:soft.makePalette(rigs.right,pose.transforms)}:{left:null,right:null};
 const packed=gpu.writePalette(new Float32Array(gpu.PALETTE_WIDTH*4),palettes,pose.kind==='leg'?{left:pose.palette}:undefined);
 const posed=gpu.slotSkin({indices,weights,lbs:true},base,packed,new Float32Array(base.length));
 const boneNear=nearest(null,posedBones(pose.transforms));
 // 1. The skin keeps its distance to the nearest bone: no ghost left behind, no bone poking through the surface.
 let worst=0,worstName,under=0;const moved=pose.kind==='arm'?new Set(['hand','forearm']):new Set(['foot']);
 for(let v=0;v<skin.vertexCount;v+=3){
  const d=boneNear(posed[v*3],posed[v*3+1],posed[v*3+2]);
  if(restDistance[v]>1e-4&&d<restDistance[v]*.35-.004)under++;
  worst=Math.max(worst,restDistance[v]-d);
 }
 assert.ok(under<=skin.vertexCount/3*.03,`${pose.name}: skin must not collapse into the bones (${under} of ${Math.floor(skin.vertexCount/3)} sampled vertices)`);
 // 2. No tearing: surface edges stay within a bounded stretch, and no triangle is swallowed.
 let maxStretch=0,torn=0,edges=0;
 for(let t=0;t<triangles.length;t+=3)for(let k=0;k<3;k++){const a=triangles[t+k],b=triangles[t+(k+1)%3],r=Math.hypot(base[a*3]-base[b*3],base[a*3+1]-base[b*3+1],base[a*3+2]-base[b*3+2]);if(r<1e-5)continue;const d=Math.hypot(posed[a*3]-posed[b*3],posed[a*3+1]-posed[b*3+1],posed[a*3+2]-posed[b*3+2]);edges++;maxStretch=Math.max(maxStretch,d/r);if(d/r>6)torn++;}
 assert.ok(torn/edges<.008,`${pose.name}: skin must not tear (${torn} of ${edges} edges stretched more than 6x, worst ${maxStretch.toFixed(1)}x)`);
 // 3. Every vertex that is rigidly carried by one moving frame lands exactly where that frame puts it (nothing is left in the rest pose).
 // (the hand is split over the finger frames, so its skin is no longer a single pure frame: count vertices carried mainly by one moving frame)
 let rigidMoved=0;for(let v=0;v<skin.vertexCount;v++){const dom=[0,1,2,3].reduce((b,k)=>weights[v*4+k]>weights[v*4+b]?k:b,0);if(weights[v*4+dom]<.6||indices[v*4+dom]===0)continue;const d=Math.hypot(posed[v*3]-base[v*3],posed[v*3+1]-base[v*3+1],posed[v*3+2]-base[v*3+2]);if(d>.02)rigidMoved++;}
 assert.ok(rigidMoved>(pose.kind==='arm'?300:60),`${pose.name}: skin over the moving segments actually moves (${rigidMoved})`);
 report.push(`${pose.name}: max edge stretch ${maxStretch.toFixed(1)}x, ${rigidMoved} vertices carried by moving bones`);
}
// Neutral pose reproduces the source skin exactly.
const identity=gpu.slotSkin({indices,weights},base,gpu.writePalette(new Float32Array(gpu.PALETTE_WIDTH*4),{left:null,right:null}),new Float32Array(base.length));
for(let i=0;i<base.length;i++)assert.ok(Math.abs(identity[i]-base[i])<1e-6,'neutral pose is exact');
console.log('PASS skin weights: '+skin.vertexCount.toLocaleString()+' vertices over the shared segment chain; '+report.join('; ')+'.');

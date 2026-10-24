// GPU stage of biomechanics-v2 skinning. Proves that moving linear bindings to
// the shader changes nothing: the CPU twin equals deformTissue, the packed
// palette/attributes reproduce it within quantisation, the worker routes them
// out of the per-pose solve, and GPU vessels stay joined to CPU-solved ones.
// The GLSL itself is checked in a browser; this script mirrors its arithmetic.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {runnerImport} from 'vite';
const root=fileURLToPath(new URL('../',import.meta.url)),load=async file=>(await runnerImport(root+file)).module;
const [soft,gpu,motion,regions,worker]=await Promise.all(['app/biomechanics-v2/soft-tissue.ts','app/biomechanics-v2/gpu-skinning.ts','app/mj-motion.ts','app/mj-part-regions.ts','app/biomechanics-v2/shoulder-worker.ts'].map(load));
const atlas=JSON.parse(fs.readFileSync(root+'public/models/atlas.json','utf8'));
const buffers=new Map(),chunk=i=>{if(!buffers.has(i))buffers.set(i,fs.readFileSync(root+'public'+atlas.chunks[i].url));return buffers.get(i);};
const view=(p,Type,offset,count)=>{const b=chunk(p.chunk);return new Type(b.buffer.slice(b.byteOffset+offset,b.byteOffset+offset+count*Type.BYTES_PER_ELEMENT));};
const rigs={left:soft.makeSoftRig(atlas,'left'),right:soft.makeSoftRig(atlas,'right')};
const bound=[];
for(const p of atlas.parts){
 const b=soft.tissueBindings[p.id];if(!b||b.name!==p.name||regions.isMotionQuarantined(p)||!['upper-limb','trunk'].includes(regions.anatomicalRegion(p)))continue;
 const profile=['arterial','venous'].includes(p.system)?soft.resolveNeurovascularProfile(p.name,b.profile):b.profile,base=view(p,Float32Array,p.positions,p.vertexCount*3);
 bound.push({p,side:b.side,base,skin:soft.bindTissue(rigs[b.side],profile,base,p)});
}
const linear=bound.filter(x=>soft.isLinearBinding(x.skin));
const linearVertices=linear.reduce((n,x)=>n+x.p.vertexCount,0),allVertices=bound.reduce((n,x)=>n+x.p.vertexCount,0);
assert.ok(linear.length>100,'linear bindings found');
assert.ok(linear.some(x=>x.p.system==='arterial')&&linear.some(x=>x.p.system==='venous'),'vessels are GPU-skinned');
for(const x of linear)assert.ok(!x.skin.fibre&&!x.skin.cable&&!x.skin.follower&&!['chest','pectoralPath','scapular','deltoid','cuff'].includes(x.skin.profile),x.p.name);

// Mirror of GPU_SKIN_NORMAL/GPU_SKIN_POSITION on the packed float32 texture and quantised attributes.
const shaderSkin=(palette,slots,weights,v,x,y,z)=>{
 const real=s=>[0,1,2,3].map(c=>palette[s*8+c]),dual=s=>[4,5,6,7].map(c=>palette[s*8+c]);
 const r0=real(slots[v*4]),total=[0,1,2,3].reduce((a,k)=>a+weights[v*4+k]/65535,0),R=[0,0,0,0],D=[0,0,0,0];
 for(let k=0;k<4;k++){let w=weights[v*4+k]/65535/total;if(w<=0)continue;const s=slots[v*4+k],r=real(s),d=dual(s);if(r.reduce((a,c,i)=>a+c*r0[i],0)<0)w=-w;for(let c=0;c<4;c++){R[c]+=w*r[c];D[c]+=w*d[c];}}
 const len=Math.hypot(...R);for(let c=0;c<4;c++){R[c]/=len;D[c]/=len;}const dot=R.reduce((a,c,i)=>a+c*D[i],0);for(let c=0;c<4;c++)D[c]-=dot*R[c];
 const cx=R[1]*z-R[2]*y+R[3]*x,cy=R[2]*x-R[0]*z+R[3]*y,cz=R[0]*y-R[1]*x+R[3]*z;
 return[x+2*(R[1]*cz-R[2]*cy)+2*(R[3]*D[0]-D[3]*R[0]+R[1]*D[2]-R[2]*D[1]),y+2*(R[2]*cx-R[0]*cz)+2*(R[3]*D[1]-D[3]*R[1]+R[2]*D[0]-R[0]*D[2]),z+2*(R[0]*cy-R[1]*cx)+2*(R[3]*D[2]-D[3]*R[2]+R[0]*D[1]-R[1]*D[0])];
};
// Mirror of the shader's linear-blend branch (chest / pectoral sheets, preview only).
const shaderLbs=(palette,slots,weights,v,x,y,z)=>{
 let total=0;for(let k=0;k<4;k++)total+=weights[v*4+k]/65535;const acc=[0,0,0];
 for(let k=0;k<4;k++){const w=weights[v*4+k]/65535/total;if(w<=0)continue;const s2=slots[v*4+k],r=[0,1,2,3].map(c=>palette[s2*8+c]),d=[4,5,6,7].map(c=>palette[s2*8+c]);
  const cx=r[1]*z-r[2]*y+r[3]*x,cy=r[2]*x-r[0]*z+r[3]*y,cz=r[0]*y-r[1]*x+r[3]*z;
  acc[0]+=w*(x+2*(r[1]*cz-r[2]*cy)+2*(r[3]*d[0]-d[3]*r[0]+r[1]*d[2]-r[2]*d[1]));acc[1]+=w*(y+2*(r[2]*cx-r[0]*cz)+2*(r[3]*d[1]-d[3]*r[1]+r[2]*d[0]-r[0]*d[2]));acc[2]+=w*(z+2*(r[0]*cy-r[1]*cx)+2*(r[3]*d[2]-d[3]*r[2]+r[0]*d[1]-r[1]*d[0]));}
 return acc;
};
const POSES=[{shoulderAbduction:75,elbowFlexion:60},{shoulderFlexion:120,elbowFlexion:120,forearmRotation:60},{shoulderAbduction:150,shoulderRotation:40,elbowFlexion:140}];
let twinError=0,shaderError=0,seamDrift=0,seamBaseline=0,seamPair='';
const contacts=[];{
 // Touching vessel/nerve pairs where one side is GPU-skinned and the other stays on the CPU solver.
 const tubes=bound.filter(x=>['arterial','venous','nervous'].includes(x.p.system)),cell=.0015,grid=new Map(),key=(x,y,z)=>`${Math.floor(x/cell)},${Math.floor(y/cell)},${Math.floor(z/cell)}`;
 tubes.forEach((t,ti)=>{for(let v=0;v<t.p.vertexCount;v++){const k=key(t.base[v*3],t.base[v*3+1],t.base[v*3+2]);(grid.get(k)??grid.set(k,[]).get(k)).push(ti,v);}});
 tubes.forEach(t=>{if(!soft.isLinearBinding(t.skin))return;for(let v=0;v<t.p.vertexCount;v+=2){const x=t.base[v*3],y=t.base[v*3+1],z=t.base[v*3+2],[cx,cy,cz]=key(x,y,z).split(',').map(Number);let best=null,bd=cell*cell;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){const list=grid.get(`${cx+a},${cy+b},${cz+c}`)??[];for(let k=0;k<list.length;k+=2){const o=tubes[list[k]];if(soft.isLinearBinding(o.skin))continue;const w=list[k+1],d=(o.base[w*3]-x)**2+(o.base[w*3+1]-y)**2+(o.base[w*3+2]-z)**2;if(d<bd){bd=d;best=[o,w,Math.sqrt(d)];}}}
  if(best)contacts.push([t,v,...best]);}});
}
for(const requested of POSES){
 const pose={...motion.NEUTRAL_POSE,...requested},transforms={...motion.buildUpperLimbMotion(atlas,'left',pose).transforms,...motion.buildUpperLimbMotion(atlas,'right',pose).transforms};
 const palettes={left:soft.makePalette(rigs.left,transforms),right:soft.makePalette(rigs.right,transforms)},packed=gpu.writePalette(new Float32Array(gpu.PALETTE_WIDTH*4),palettes);
 for(const side of ['left','right'])for(let f=0;f<gpu.FRAME_COUNT;f++)for(let c=0;c<8;c++)assert.equal(packed[(gpu.SIDE_BASE[side]+f)*8+c],Math.fround(palettes[side][f*8+c]),'palette slot packing');
 const posed=new Map();
 for(const x of linear){
  const cpu=new Float32Array(x.base.length),twin=new Float32Array(x.base.length);soft.deformTissue(x.skin,x.base,palettes[x.side],cpu);soft.linearSkin(x.skin,x.base,palettes[x.side],twin);
  const count=x.p.vertexCount,slots=new Uint8Array(count*4),weights=new Uint16Array(count*4);gpu.writeGpuAttributes(gpu.gpuBinding(x.side,x.skin),slots,weights,0);
  for(let v=0;v<count;v++){
   let sum=0;for(let k=0;k<4;k++){sum+=weights[v*4+k];assert.ok(slots[v*4+k]<gpu.SLOT_COUNT,'slot in range');}assert.equal(sum,65535,'exact partition of unity');
   twinError=Math.max(twinError,Math.hypot(cpu[v*3]-twin[v*3],cpu[v*3+1]-twin[v*3+1],cpu[v*3+2]-twin[v*3+2]));
   const g=shaderSkin(packed,slots,weights,v,x.base[v*3],x.base[v*3+1],x.base[v*3+2]);shaderError=Math.max(shaderError,Math.hypot(g[0]-cpu[v*3],g[1]-cpu[v*3+1],g[2]-cpu[v*3+2]));
   if(!posed.has(x))posed.set(x,new Float32Array(x.base.length));posed.get(x).set(g,v*3);
  }
 }
 const cpuPosed=new Map();
 for(const [t,v,o,w,rest] of contacts){
  if(!cpuPosed.has(o)){const out=new Float32Array(o.base.length);soft.deformTissue(o.skin,o.base,palettes[o.side],out);cpuPosed.set(o,out);}
  const a=posed.get(t),b=cpuPosed.get(o),d=Math.hypot(a[v*3]-b[w*3],a[v*3+1]-b[w*3+1],a[v*3+2]-b[w*3+2])-rest;
  const c=new Float32Array(t.base.length);soft.deformTissue(t.skin,t.base,palettes[t.side],c);const before=Math.hypot(c[v*3]-b[w*3],c[v*3+1]-b[w*3+1],c[v*3+2]-b[w*3+2])-rest;
  if(d-before>seamDrift){seamDrift=d-before;seamPair=`${t.p.name} ↔ ${o.p.name}`;}seamBaseline=Math.max(seamBaseline,before);
 }
}
assert.ok(twinError<1e-6,`linearSkin equals deformTissue (max ${twinError})`);
assert.ok(shaderError<5e-5,`shader arithmetic on packed float32/uint16 data stays within 0.05 mm of deformTissue (max ${shaderError})`);
assert.ok(seamDrift<5e-5,`GPU vessels stay joined to CPU-solved neighbours: extra drift ${seamDrift} at ${seamPair}`);

// The worker must stop re-solving linear bindings and hand their weights over once.
const solve=worker.createShoulderSolver(atlas),gpuOut=[],inputs=bound.map(x=>({part:x.p,base:x.base.slice(),normals:view(x.p,Int16Array,x.p.normals,x.p.vertexCount*3),triangles:view(x.p,Uint32Array,x.p.indices,x.p.indexCount)}));
const pose={...motion.NEUTRAL_POSE,shoulderAbduction:60},results=solve(inputs,{...motion.buildUpperLimbMotion(atlas,'left',pose).transforms,...motion.buildUpperLimbMotion(atlas,'right',pose).transforms},gpuOut);
const solved=new Set(results.map(r=>r.id)),handed=new Map(gpuOut.map(g=>[g.id,g]));
for(const x of linear){assert.ok(handed.get(x.p.id)?.exact===true,'weights handed over as exact: '+x.p.name);assert.ok(!solved.has(x.p.id),'not re-solved per pose: '+x.p.name);}
const refined=bound.filter(x=>!soft.isLinearBinding(x.skin));
for(const x of refined){assert.ok(handed.get(x.p.id)?.exact===false,'preview weights handed over for refined tissue: '+x.p.name);assert.ok(solved.has(x.p.id),'refined tissue is still solved exactly: '+x.p.name);}

// Drag preview: how far is the coarse GPU blend from the solved shape? (mm; bounds the visible jump when the solve lands)
const previewPose={...motion.NEUTRAL_POSE,shoulderAbduction:75,elbowFlexion:60},previewTransforms={...motion.buildUpperLimbMotion(atlas,'left',previewPose).transforms,...motion.buildUpperLimbMotion(atlas,'right',previewPose).transforms};
const previewResults=solve([],previewTransforms,[]),previewPalettes={left:soft.makePalette(rigs.left,previewTransforms),right:soft.makePalette(rigs.right,previewTransforms)};
const byId=new Map(bound.map(x=>[x.p.id,x])),jumps=[];let worstJump=0,worstName='';
for(const r of previewResults){
 const x=byId.get(r.id),coarse=(['chest','pectoralPath'].includes(x.skin.profile)?soft.lbsSkin:soft.linearSkin)(x.skin,x.base,previewPalettes[x.side],new Float32Array(x.base.length));
 let sum=0,max=0;const n=x.p.vertexCount;for(let v=0;v<n;v++){const d=Math.hypot(coarse[v*3]-r.positions[v*3],coarse[v*3+1]-r.positions[v*3+1],coarse[v*3+2]-r.positions[v*3+2]);sum+=d;if(d>max)max=d;}
 jumps.push(sum/n);if(max>worstJump){worstJump=max;worstName=x.p.name;}
 assert.ok(coarse.every(Number.isFinite),'finite preview: '+x.p.name);
}
jumps.sort((a,b)=>a-b);const medianJump=jumps[jumps.length>>1],p90Jump=jumps[Math.floor(jumps.length*.9)];
{ // the linear-blend preview branch equals its CPU twin on the packed data
 const lbsParts=bound.filter(x=>['chest','pectoralPath'].includes(x.skin.profile));assert.ok(lbsParts.length>0,'chest/pectoral bindings exist');
 const tr={...motion.buildUpperLimbMotion(atlas,'left',previewPose).transforms,...motion.buildUpperLimbMotion(atlas,'right',previewPose).transforms},pal={left:soft.makePalette(rigs.left,tr),right:soft.makePalette(rigs.right,tr)};let worst=0;
 for(const x of lbsParts){const packed=gpu.writePalette(new Float32Array(gpu.PALETTE_WIDTH*4),pal),n=x.p.vertexCount,slots=new Uint8Array(n*4),weights=new Uint16Array(n*4);gpu.writeGpuAttributes(gpu.gpuBinding(x.side,x.skin),slots,weights,0);
  const twin=soft.lbsSkin(x.skin,x.base,pal[x.side],new Float32Array(x.base.length));
  for(let v=0;v<n;v+=3){const g=shaderLbs(packed,slots,weights,v,x.base[v*3],x.base[v*3+1],x.base[v*3+2]);worst=Math.max(worst,Math.hypot(g[0]-twin[v*3],g[1]-twin[v*3+1],g[2]-twin[v*3+2]));}}
 assert.ok(worst<5e-5,`linear-blend shader mirror within 0.05 mm of its CPU twin (max ${worst})`);
}
assert.ok(medianJump<.02,`preview is a recognisable approximation of the solved shape (median mean deviation ${(medianJump*1000).toFixed(1)} mm)`);
console.log(`Preview vs solved at 75° abduction / 60° elbow, ${previewResults.length} refined parts: mean deviation median ${(medianJump*1000).toFixed(1)} mm, p90 ${(p90Jump*1000).toFixed(1)} mm, worst vertex ${(worstJump*1000).toFixed(1)} mm (${worstName})`);
const later=[];solve([],{},later);assert.equal(later.length,0,'weights are sent only once');
console.log(`PASS GPU skinning: ${linear.length}/${bound.length} upper-limb bindings (${linearVertices.toLocaleString()}/${allVertices.toLocaleString()} vertices) skinned on the GPU; CPU twin ${twinError.toExponential(1)} m, shader mirror ${(shaderError*1000).toFixed(4)} mm, GPU↔CPU seam extra drift ${(seamDrift*1000).toFixed(4)} mm over ${contacts.length} contacts (baseline ${(seamBaseline*1000).toFixed(2)} mm); worker hands ${handed.size} bindings over once (${linear.length} exact, ${refined.length} preview-only).`);

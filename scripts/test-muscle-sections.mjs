// Independent curved-route fixture: bending alone must not look like axial
// compression, and upper-arm cross sections should follow their centreline.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Vector3} from 'three';
import * as soft from '../.sites-runtime/soft-tissue.mjs';
import * as motion from '../.sites-runtime/mj-motion.mjs';
const atlas=JSON.parse(fs.readFileSync('public/models/atlas.json'));
for(const side of ['left','right']){
 const rig=soft.makeSoftRig(atlas,side),radius=.008;
 const base=new Float32Array(Array.from({length:33},(_,i)=>Array.from({length:8},(_,j)=>[rig.elbow.x+radius*Math.cos(j*Math.PI/4),rig.elbow.y+.25-i*.25/32,rig.elbow.z+radius*Math.sin(j*Math.PI/4)]).flat()).flat());
 const binding=soft.bindTissue(rig,'arm',base,{name:'Curved section fixture',system:'muscular'}),f=binding.fibre;
 assert.ok(f.alignSections);
 // Prescribe a continuous quadratic route so the measured middle section
 // really is curved (production attachment bands may leave it straight).
 f.indices.fill(0);f.weights.fill(0);
 for(let i=0;i<33;i++){const t=(i/32)**2;f.indices[i*4]=3;f.indices[i*4+1]=4;f.weights[i*4]=1-t;f.weights[i*4+1]=t;}
 const palette=soft.makePalette(rig,{[rig.ids[4]]:{quaternion:[0,0,0,1],translation:[side==='left'?.10:-.10,.07,0]}});
 const route=f.centres.map((p,i)=>{const w=Array(7).fill(0);for(let k=0;k<4;k++)w[f.indices[i*4+k]]+=f.weights[i*4+k];return soft.deformPoint(p,w,palette);});
 const arc=route.slice(1).reduce((sum,p,i)=>sum+p.distanceTo(route[i]),0),expectedRadius=radius*Math.max(.65,Math.min(1.6,1/Math.sqrt(Math.max(.1,arc/f.length))));
 const out=base.slice();soft.deformTissue(binding,base,palette,out);
 const centre=i=>{const c=new Vector3();for(let j=0;j<8;j++)c.add(new Vector3().fromArray(out,(i*8+j)*3));return c.multiplyScalar(1/8);};
 const mid=centre(16),tangent=centre(17).sub(centre(15)).normalize();
 let normalError=0;
 for(let j=0;j<8;j++){
  const radial=new Vector3().fromArray(out,(16*8+j)*3).sub(mid);
  assert.ok(Math.abs(radial.length()-expectedRadius)<2e-7,'Bending spuriously inflated section');
  normalError=Math.max(normalError,Math.abs(radial.dot(tangent)));
 }
 assert.ok(normalError<2e-7,'Upper-arm cross section is oblique to route');
 const reset=base.slice();soft.deformTissue(binding,base,soft.makePalette(rig,{}),reset);assert.ok(reset.every((v,i)=>Math.abs(v-base[i])<2e-7));
 console.log(side,'curved guide: arc-based calibre, perpendicular middle section, exact reset PASS',normalError);
}
let count=0,worst=0;
for(const p of atlas.parts){
 const b=soft.tissueBindings[p.id];if(!b||!['arm','biceps','triceps'].includes(b.profile))continue;
 const buf=fs.readFileSync('public'+atlas.chunks[p.chunk].url),base=new Float32Array(buf.buffer,buf.byteOffset+p.positions,p.vertexCount*3).slice(),idx=new Uint32Array(buf.buffer,buf.byteOffset+p.indices,p.indexCount),rig=soft.makeSoftRig(atlas,b.side),binding=soft.bindTissue(rig,b.profile,base,p),out=base.slice();
 if(b.profile==='triceps'){
  assert.ok(Math.min(...binding.fibre.coordinates)<1e-6&&Math.max(...binding.fibre.coordinates)>1-1e-6,'Each head spans its own attachment coordinates');
  for(let i=0;i<base.length/3;i++)if(base[i*3+1]>p.bounds[0][1]+.036){
   let ulna=0;for(let k=0;k<4;k++)if(binding.indices[i*4+k]===4)ulna+=binding.weights[i*4+k];
   assert.equal(ulna,0,'Elbow must not rotate the upper triceps belly');
  }
 }
 const poses=[...[70,145,165].flatMap(shoulderAbduction=>[0,70,140].map(elbowFlexion=>({shoulderAbduction,elbowFlexion,forearmRotation:80,wristFlexion:-23,wristDeviation:19}))),
  {shoulderFlexion:82,shoulderAbduction:143,shoulderRotation:0,elbowFlexion:0},
  {shoulderFlexion:82,shoulderAbduction:143,shoulderRotation:48,elbowFlexion:140,forearmRotation:80,wristFlexion:80}];
 for(const input of poses){
  const pose={...motion.NEUTRAL_POSE,...input};
  soft.deformTissue(binding,base,soft.makePalette(rig,motion.buildUpperLimbMotion(atlas,b.side,pose).transforms),out);
  assert.ok(out.every(Number.isFinite));let ratio=0;
  for(let i=0;i<idx.length;i+=3)for(let k=0;k<3;k++){const a=idx[i+k]*3,b=idx[i+(k+1)%3]*3,L=v=>Math.hypot(v[a]-v[b],v[a+1]-v[b+1],v[a+2]-v[b+2]),rest=L(base);if(rest>.0002)ratio=Math.max(ratio,L(out)/rest);}
  assert.ok(ratio<4.2,`${p.name}: elbow spike ${ratio}`);worst=Math.max(worst,ratio);count++;
 }
}
assert.equal(count,132);
console.log(count,'actual upper-arm muscle/pose cases; screenshot elbow/pronation/wrist values PASS; maximum edge ratio',worst);

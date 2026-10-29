import {build} from 'esbuild';
import fs from 'node:fs';
import {loadFullAtlas} from '/home/user/mj-shoulder/scripts/lib/full-atlas.mjs';
const root='/home/user/mj-shoulder/';
fs.mkdirSync(root+'.sites-runtime',{recursive:true});
await build({entryPoints:[root+'scripts/lib/vessel-motion-entry.ts'],bundle:true,format:'esm',platform:'node',outfile:root+'.sites-runtime/vm.mjs',loader:{'.json':'json'},logLevel:'error',external:['three']});
const m=await import(root+'.sites-runtime/vm.mjs');
const {atlas,geometry}=loadFullAtlas();
const pose={...m.NEUTRAL_POSE,shoulderFlexion:180};
const {transforms}=m.buildUpperLimbMotion(atlas,'left',pose);
const rig=m.makeSoftRig(atlas,'left'),palette=m.makePalette(rig,transforms);
const p=atlas.parts.find(q=>q.name==='Left serratus anterior');
const g=geometry(p),b=m.tissueBindings[p.id];
const skin=m.bindTissue(rig,b.profile,g.positions,p,'',g.indices);
const posed=new Float32Array(g.positions.length);m.deformTissue(skin,g.positions,palette,posed);
const guard=m.makeSurfaceConstraints(g.positions,g.indices,skin);const before=posed.slice();const posedP={};m.constrainSurface(guard,posed);let imm=0;for(let i=0;i<guard.mobility.length;i++)if(!guard.mobility[i])imm++;console.log('immobile',imm,'of',guard.mobility.length,'edges',guard.lengths.length,'seams',guard.seams.length/2);for(const n of [1,2,6,20]){const t=before.slice();m.constrainSurface(guard,t,n);console.log('passes',n,JSON.stringify((()=>{let w=1,bad=0;for(let q=0;q<g.indices.length;q+=3)for(let e=0;e<3;e++){const a=g.indices[q+e],c=g.indices[q+(e+1)%3];const l0=Math.hypot(...[0,1,2].map(k=>g.positions[a*3+k]-g.positions[c*3+k])),l1=Math.hypot(...[0,1,2].map(k=>t[a*3+k]-t[c*3+k]));if(l0>1e-5){w=Math.max(w,l1/l0);if(l1/l0>2.5&&l1>.008)bad++;}}return [w.toFixed(2),bad];})()));}
const mx=(arr)=>{let w=1,bad=0;for(let t=0;t<g.indices.length;t+=3)for(let e=0;e<3;e++){const a=g.indices[t+e],c=g.indices[t+(e+1)%3];const l0=Math.hypot(...[0,1,2].map(k=>g.positions[a*3+k]-g.positions[c*3+k])),l1=Math.hypot(...[0,1,2].map(k=>arr[a*3+k]-arr[c*3+k]));if(l0>1e-5){w=Math.max(w,l1/l0);if(l1/l0>2.5&&l1>.008)bad++;}}return [w.toFixed(2),bad];};
console.log('stretch skin only',mx(before),'after guard',mx(posed));
console.log('profile',skin.profile,'wrap',!!skin.wrap,'verts',g.positions.length/3);
const T=g.indices;let shown=0;
for(let t=0;t<T.length&&shown<8;t+=3)for(let e=0;e<3;e++){const a=T[t+e],c=T[t+(e+1)%3];const l0=Math.hypot(...[0,1,2].map(k=>g.positions[a*3+k]-g.positions[c*3+k])),l1=Math.hypot(...[0,1,2].map(k=>posed[a*3+k]-posed[c*3+k]));if(l0>1e-5&&l1/l0>3&&l1>.008&&shown<8){shown++;console.log('edge',(l1/l0).toFixed(1),'l0mm',(l0*1000).toFixed(1),'A idx',[...skin.indices.slice(a*4,a*4+4)],[...skin.weights.slice(a*4,a*4+4)].map(x=>+x.toFixed(2)),'C idx',[...skin.indices.slice(c*4,c*4+4)],[...skin.weights.slice(c*4,c*4+4)].map(x=>+x.toFixed(2)));}}

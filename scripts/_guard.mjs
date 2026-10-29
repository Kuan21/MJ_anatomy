import {build} from 'esbuild';
import fs from 'node:fs';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const root='/home/user/mj-shoulder/';
await build({entryPoints:[root+'scripts/lib/vessel-motion-entry.ts'],bundle:true,format:'esm',platform:'node',outfile:root+'.sites-runtime/vm.mjs',loader:{'.json':'json'},logLevel:'error',external:['three']});
const m=await import(root+'.sites-runtime/vm.mjs');
const {atlas,geometry}=loadFullAtlas();
const kind=process.argv[2]||'shoulderFlexion',ang=+(process.argv[3]||180);
const {transforms}=m.buildUpperLimbMotion(atlas,'left',{...m.NEUTRAL_POSE,[kind]:ang});
const rig=m.makeSoftRig(atlas,'left'),palette=m.makePalette(rig,transforms);
const st=(g,arr)=>{let w=1,bad=0;for(let q=0;q<g.indices.length;q+=3)for(let e=0;e<3;e++){const a=g.indices[q+e],c=g.indices[q+(e+1)%3];const l0=Math.hypot(...[0,1,2].map(k=>g.positions[a*3+k]-g.positions[c*3+k])),l1=Math.hypot(...[0,1,2].map(k=>arr[a*3+k]-arr[c*3+k]));if(l0>1e-5){w=Math.max(w,l1/l0);if(l1/l0>2.5&&l1>.008)bad++;}}return +w.toFixed(2)+'/'+bad;};
for(const p of atlas.parts){
 if(p.system!=='muscular')continue;const b=m.tissueBindings[p.id];if(!b||b.name!==p.name)continue;if(!/Left|left/.test(p.name))continue;
 const g=geometry(p);let skin;try{skin=m.bindTissue(rig,b.profile,g.positions,p,'',g.indices);}catch(e){continue;}
 if(!['chest','scapular'].includes(skin.profile))continue;
 const posed=new Float32Array(g.positions.length);m.deformTissue(skin,g.positions,palette,posed);
 const gd=m.makeSurfaceConstraints(g.positions,g.indices,skin);const q=posed.slice();m.constrainSurface(gd,q);const gs=m.makeSurfaceConstraints(g.positions,g.indices,skin);for(let i=0;i<gs.mobility.length;i++)if(!gs.mobility[i])gs.mobility[i]=.05;const q2=posed.slice();m.constrainSurface(gs,q2,12);
 const gg={indices:g.indices,positions:g.positions};
 console.log(skin.profile,p.name,'skin',st(gg,posed),'guard',st(gg,q),'soft12',st(gg,q2));
}

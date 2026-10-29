import {build} from 'esbuild';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const root='/home/user/mj-shoulder/';
await build({entryPoints:[root+'scripts/lib/vessel-motion-entry.ts'],bundle:true,format:'esm',platform:'node',outfile:root+'.sites-runtime/vm.mjs',loader:{'.json':'json'},logLevel:'error',external:['three']});
const m=await import(root+'.sites-runtime/vm.mjs');
const {atlas,geometry}=loadFullAtlas();
const {transforms}=m.buildUpperLimbMotion(atlas,'left',{...m.NEUTRAL_POSE,shoulderFlexion:180});
const rig=m.makeSoftRig(atlas,'left'),palette=m.makePalette(rig,transforms);
const sh=[0.16,1.36,-0.01];
for(const p of atlas.parts){
 if(!['arterial','venous','nervous','lymphatic'].includes(p.system))continue;
 const c=p.bounds[0].map((v,k)=>(v+p.bounds[1][k])/2);
 if(Math.hypot(c[0]-sh[0],c[1]-sh[1],c[2]-sh[2])>.2||c[0]<0.02||c[1]>1.5)continue;
 const b=m.tissueBindings[p.id];
 let moved='nobinding';
 if(b&&b.name===p.name){const g=geometry(p);const prof=(p.system==='arterial'||p.system==='venous')?m.resolveNeurovascularProfile(p.name,b.profile):b.profile;try{const sk=m.bindTissue(rig,prof,g.positions,p,'',g.indices);const o=new Float32Array(g.positions.length);m.deformTissue(sk,g.positions,palette,o);let mv=0;for(let k=0;k<o.length;k++)mv=Math.max(mv,Math.abs(o[k]-g.positions[k]));moved=(mv*1000).toFixed(0)+'mm '+prof;}catch(e){moved='err '+e.message.slice(0,40);}}
 console.log(p.system,moved,p.name,c.map(x=>x.toFixed(2)).join(','));
}

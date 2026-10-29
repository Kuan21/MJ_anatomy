import {build} from 'esbuild';
import {loadFullAtlas} from './lib/full-atlas.mjs';
const root='/home/user/mj-shoulder/';
await build({entryPoints:[root+'scripts/lib/vessel-motion-entry.ts'],bundle:true,format:'esm',platform:'node',outfile:root+'.sites-runtime/vm.mjs',loader:{'.json':'json'},logLevel:'error',external:['three']});
const m=await import(root+'.sites-runtime/vm.mjs');
const {atlas,geometry}=loadFullAtlas();
const kind=process.argv[2]||'shoulderFlexion',ang=+(process.argv[3]||180);
const {transforms}=m.buildUpperLimbMotion(atlas,'left',{...m.NEUTRAL_POSE,[kind]:ang});
const rig=m.makeSoftRig(atlas,'left'),palette=m.makePalette(rig,transforms);
const sh=[0.16,1.36,-0.01];
const rows=[],skins=new Map();
for(const p of atlas.parts){
 if(!['arterial','venous'].includes(p.system))continue;
 const c=p.bounds[0].map((v,k)=>(v+p.bounds[1][k])/2);
 if(Math.hypot(c[0]-sh[0],c[1]-sh[1],c[2]-sh[2])>.33||c[0]<-0.02)continue;
 const g=geometry(p);let posed=g.positions;const b=m.tissueBindings[p.id];
 if(b&&b.name===p.name){const prof=m.resolveNeurovascularProfile(p.name,b.profile);try{const sk=m.bindTissue(rig,prof,g.positions,p,'',g.indices);if(p.id.endsWith('-END')){const mn=skins.get(p.id.slice(0,-4));if(mn)m.alignEndPiece(sk,g.positions,mn.sk,mn.pos);}else skins.set(p.id,{sk,pos:g.positions});posed=new Float32Array(g.positions.length);m.deformTissue(sk,g.positions,palette,posed);}catch(e){console.log('BINDERR',p.id,p.name,e.message.slice(0,80));}}
 rows.push({p,rest:g.positions,posed,bound:!!(b&&b.name===p.name)});
}
const cell=.004,h=new Map();
const key=(x,y,z)=>Math.floor(x/cell)+','+Math.floor(y/cell)+','+Math.floor(z/cell);
rows.forEach((r,ri)=>{for(let i=0;i<r.rest.length/3;i+=1){const k=key(r.rest[i*3],r.rest[i*3+1],r.rest[i*3+2]);let a=h.get(k);if(!a)h.set(k,a=[]);a.push([ri,i]);}});
const worst=new Map();
rows.forEach((r,ri)=>{for(let i=0;i<r.rest.length/3;i+=3){const x=r.rest[i*3],y=r.rest[i*3+1],z=r.rest[i*3+2];const kx=Math.floor(x/cell),ky=Math.floor(y/cell),kz=Math.floor(z/cell);for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++){for(const [rj,j] of h.get((kx+dx)+','+(ky+dy)+','+(kz+dz))||[]){if(rj<=ri)continue;const o=rows[rj];const d0=Math.hypot(x-o.rest[j*3],y-o.rest[j*3+1],z-o.rest[j*3+2]);if(d0>.003)continue;const d1=Math.hypot(r.posed[i*3]-o.posed[j*3],r.posed[i*3+1]-o.posed[j*3+1],r.posed[i*3+2]-o.posed[j*3+2]);const gap=d1-d0;const k=ri+'|'+rj;if(!worst.has(k)||worst.get(k)<gap)worst.set(k,gap);}}}});
const out=[...worst.entries()].filter(([,g])=>g>.008).sort((a,b)=>b[1]-a[1]);
console.log(rows.length,'vessels near shoulder;',out.length,'touching pairs that come apart >8mm');
for(const [k,g] of out.slice(0,40)){const [a,b]=k.split('|').map(Number);console.log((g*1000).toFixed(0)+'mm',rows[a].p.name,rows[a].bound?'':'[unbound]','<->',rows[b].p.name,rows[b].bound?'':'[unbound]');}
console.log('--- parts named lateral thoracic');
for(const r of rows)if(/lateral thoracic/i.test(r.p.name)){console.log(r.p.id,r.p.name,r.p.system,r.p.kind||'',r.p.stream||'',r.bound,r.rest.length/3,'bbox y',r.p.bounds[0][1].toFixed(2),r.p.bounds[1][1].toFixed(2));}

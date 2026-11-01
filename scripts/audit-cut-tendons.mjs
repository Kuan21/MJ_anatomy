// Cut tendons (both limbs, both sides): share of vertices inside any bone, deepest penetration, and how far each end is from the nearest bone.
//   node scripts/audit-cut-tendons.mjs [out.json]      writes work/cut-tendon-audit.json by default and prints a summary
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {planCuts, atlasParts, TENDON_SPECS} from './lib/tendon-set.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const {parts, read} = atlasParts(), {results} = planCuts(parts, read);
const BONE_SKIP=/gingiva|tooth|teeth|molar|incisor|canine|premolar|cartilage|disc|meniscus|labrum|fibularis|tibialis|iliotibial|subscapularis|levator/i;
const bones=[];const chunks=new Map();
for(const p of parts){if(p.system!=='skeletal'||BONE_SKIP.test(p.name)||!p.normals&&p.normals!==0)continue;const g=read(p);bones.push({name:p.name,P:g.positions,N:g.normals||null});}
// normals: atlasParts read may not include normals; fall back to raw atlas buffers
const atlas=JSON.parse(fs.readFileSync(root+'public/models/atlas.json','utf8'));
const raw=new Map(atlas.parts.map(p=>[p.name,p]));const bufs=new Map();const buf=u=>{if(!bufs.has(u))bufs.set(u,fs.readFileSync(root+'public'+u));return bufs.get(u);};
for(const b of bones){if(b.N)continue;const p=raw.get(b.name);if(!p)continue;const bb=buf(atlas.chunks[p.chunk].url);b.P=new Float32Array(bb.buffer,bb.byteOffset+p.positions,p.vertexCount*3);b.N=new Int16Array(bb.buffer,bb.byteOffset+p.normals,p.vertexCount*3);}
const CELL=0.006;const H=new Map();const key=(x,y,z)=>((Math.floor(x/CELL)+4096)*8192+(Math.floor(y/CELL)+4096))*8192+(Math.floor(z/CELL)+4096);
bones.forEach((b,bi)=>{if(!b.N)return;for(let i=0;i<b.P.length;i+=3){const k=key(b.P[i],b.P[i+1],b.P[i+2]);let a=H.get(k);if(!a)H.set(k,a=[]);a.push(bi,i);}});
const nearest=(x,y,z,reach=0.006)=>{let best=null,bd=reach*reach;const cx=Math.floor(x/CELL),cy=Math.floor(y/CELL),cz=Math.floor(z/CELL);const R=Math.ceil(reach/CELL);
 for(let dx=-R;dx<=R;dx++)for(let dy=-R;dy<=R;dy++)for(let dz=-R;dz<=R;dz++){const a=H.get(((cx+dx+4096)*8192+(cy+dy+4096))*8192+(cz+dz+4096));if(!a)continue;
  for(let j=0;j<a.length;j+=2){const b=bones[a[j]],i=a[j+1];const ex=x-b.P[i],ey=y-b.P[i+1],ez=z-b.P[i+2];const d=ex*ex+ey*ey+ez*ez;if(d<bd){bd=d;best={b,i,ex,ey,ez,d:Math.sqrt(d)};}}}
 if(!best)return null;const b=best.b,i=best.i;const nx=b.N[i]/32767,ny=b.N[i+1]/32767,nz=b.N[i+2]/32767;const nl=Math.hypot(nx,ny,nz)||1;return {bone:b.name,d:best.d,signed:(best.ex*nx+best.ey*ny+best.ez*nz)/nl};};
const rows=[];
for(const r of results){const spec=TENDON_SPECS.find(s=>s.key===r.spec);
 for(const [label,pick] of [['tendon',p=>p.tendon],['split',p=>p.apo]])for(const p of r.pieces){const t=pick(p);if(!t)continue;const P=t.positions,n=P.length/3;
  let inside=0,deepest=0;const by=new Map();let lo=[9,9,9],hi=[-9,-9,-9];
  for(let v=0;v<n;v++){const x=P[v*3],y=P[v*3+1],z=P[v*3+2];for(let k=0;k<3;k++){const q=P[v*3+k];if(q<lo[k])lo[k]=q;if(q>hi[k])hi[k]=q;}const nb=nearest(x,y,z);if(nb&&nb.signed<-0.0015){inside++;if(-nb.signed>deepest)deepest=-nb.signed;by.set(nb.bone,(by.get(nb.bone)||0)+1);}}
  // ends: the 5% of vertices at each extreme of the longest axis; distance to nearest bone within 15 mm
  const axis=[0,1,2].reduce((a,k)=>hi[k]-lo[k]>hi[a]-lo[a]?k:a,0);const idx=[...Array(n).keys()].sort((a,b)=>P[a*3+axis]-P[b*3+axis]);const m=Math.max(3,Math.floor(n*0.05));
  const endDist=list=>{let best=1;for(const v of list){const nb=nearest(P[v*3],P[v*3+1],P[v*3+2],0.015);if(nb&&nb.d<best)best=nb.d;}return Math.round(best*1000*10)/10;};
  const e1=endDist(idx.slice(0,m)),e2=endDist(idx.slice(-m));
  rows.push({key:spec.key,limb:spec.lower?'lower':'upper',side:r.side,label,name:p.name,n,insidePct:Math.round(inside/n*1000)/10,deepest:Math.round(deepest*10000)/10,bones:[...by.entries()].sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k,v])=>k+' '+Math.round(v/n*100)+'%'),endA:e1,endB:e2,extent:Math.round((hi[axis]-lo[axis])*1000)});
 }}
const OUT=process.argv[2]||root+'work/cut-tendon-audit.json';fs.mkdirSync(root+'work',{recursive:true});fs.writeFileSync(OUT,JSON.stringify(rows));
console.log('tendon pieces',rows.length,'inside>=3%',rows.filter(r=>r.insidePct>=3).length,'deepest>=3mm',rows.filter(r=>r.deepest>=3).length,'end>8mm from bone',rows.filter(r=>Math.min(r.endA,r.endB)>8).length);

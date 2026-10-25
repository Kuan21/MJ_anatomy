// Interpenetration audit: which structures cut through each other (muscle–muscle, muscle–bone, bone–bone, vessel–muscle excluded because
// vessels are meant to run between muscles). A vertex of A counts as buried in B when the nearest vertex of B lies within 6 mm and A is on the
// inward side of B's normal there by more than 1.5 mm. Output: docs/overlap-audit.md.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=f=>JSON.parse(fs.readFileSync(root+f,'utf8'));
const atlas=read('public/models/atlas.json');
const supplement=JSON.parse(zlib.gunzipSync(fs.readFileSync(root+'public/models/supplement/supplement-stream.json.gz')));
const buffers=new Map();
const buf=(url)=>{if(!buffers.has(url))buffers.set(url,fs.readFileSync(root+'public'+url));return buffers.get(url);};
const SYSTEMS=new Set(['muscular','skeletal']);
const parts=[];
for(const [src,list] of [[atlas,atlas.parts],[supplement,supplement.parts]])for(const p of list){
 if(!SYSTEMS.has(p.system)||/set of|papillary|ventricle|atrium|valve|tooth|gingiva|molar|incisor|canine/i.test(p.name))continue;
 parts.push({p,src});
}
const CELL=.004,REACH=.006,DEPTH=.0015;
function load(entry){
 if(entry.v)return entry;
 const {p,src}=entry,b=buf(src.chunks[p.chunk].url);
 entry.v=new Float32Array(b.buffer.slice(b.byteOffset+p.positions,b.byteOffset+p.positions+p.vertexCount*12));
 entry.n=new Int16Array(b.buffer.slice(b.byteOffset+p.normals,b.byteOffset+p.normals+p.vertexCount*6));
 return entry;
}
function hashOf(entry){
 if(entry.h)return entry.h;
 load(entry);const h=new Map(),v=entry.v;
 for(let i=0;i<v.length/3;i++){const k=Math.floor(v[i*3]/CELL)+','+Math.floor(v[i*3+1]/CELL)+','+Math.floor(v[i*3+2]/CELL);let a=h.get(k);if(!a){a=[];h.set(k,a);}a.push(i);}
 return entry.h=h;
}
const baseName=n=>n.toLowerCase().replace(/\b(left|right)\b/g,'').replace(/^(long|short|lateral|medial|superficial|deep|transverse|oblique|clavicular|acromial|spinal|sternocostal|abdominal|ascending|descending|humeral|ulnar|anterior|posterior) (head|part) of /,'').replace(/\s+/g,' ').trim();
const overlap=(a,b)=>[0,1,2].every(k=>a.p.bounds[0][k]<b.p.bounds[1][k]&&b.p.bounds[0][k]<a.p.bounds[1][k]);
const results=[];
for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++){
 const A=parts[i],B=parts[j];
 if(!overlap(A,B))continue;
 if(baseName(A.p.name)===baseName(B.p.name))continue;
 // test both directions, keep the worse
 let best=null;
 for(const [X,Y] of [[A,B],[B,A]]){
  load(X);const h=hashOf(Y),yv=Y.v,yn=Y.n,xv=X.v,count=xv.length/3,step=Math.max(1,Math.floor(count/2500));
  let inside=0,tested=0,deep=0,maxDepth=0,coincident=0;
  const box=Y.p.bounds;
  for(let k=0;k<count;k+=step){
   const x=xv[k*3],y=xv[k*3+1],z=xv[k*3+2];
   if(x<box[0][0]||x>box[1][0]||y<box[0][1]||y>box[1][1]||z<box[0][2]||z>box[1][2])continue;
   tested++;
   const cx=Math.floor(x/CELL),cy=Math.floor(y/CELL),cz=Math.floor(z/CELL);
   let near=-1,nd=REACH*REACH;
   for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++){
    const cell=h.get((cx+dx)+','+(cy+dy)+','+(cz+dz));if(!cell)continue;
    for(const m of cell){const ex=yv[m*3]-x,ey=yv[m*3+1]-y,ez=yv[m*3+2]-z,d=ex*ex+ey*ey+ez*ez;if(d<nd){nd=d;near=m;}}
   }
   if(near<0)continue;
   const nx=yn[near*3]/32767,ny=yn[near*3+1]/32767,nz=yn[near*3+2]/32767,signed=(x-yv[near*3])*nx+(y-yv[near*3+1])*ny+(z-yv[near*3+2])*nz;
   if(signed<-DEPTH){inside++;maxDepth=Math.max(maxDepth,-signed);if(-signed>.004)deep++;}
   else if(Math.abs(signed)<.0004)coincident++;
  }
  const r={a:X.p.name,b:Y.p.name,sa:X.p.system,sb:Y.p.system,tested,inside,deep,maxDepth,coincident,ratio:tested?inside/tested:0};
  if(!best||r.inside>best.inside)best=r;
 }
 if(best.inside>=25&&best.ratio>.05)results.push(best);
}
results.sort((p,q)=>q.deep-p.deep||q.inside-p.inside);
const mm=v=>(v*1000).toFixed(1);
const lines=['# 結構穿插（interpenetration）審核\n','由 `node scripts/audit-overlap.mjs` 產生。方法：逐對檢查包圍盒相交的肌肉／骨骼（含 BodyParts3D 3.0 補充件如闊背肌），A 的頂點若落在 B 最近頂點法線內側超過 1.5 mm（且距離 6 mm 內），就算「穿入」B。成對只列較嚴重的一方。血管與神經本來就穿行於肌肉之間，不列入。\n',
`共 ${parts.length} 件結構參與比對，找到 ${results.length} 對有明顯穿插。「深穿」＝穿入超過 4 mm 的取樣頂點數；「共面」＝與對方表面距離小於 0.4 mm（容易 z-fighting／黑點）的取樣頂點數。\n`,
'選取時不再受影響：被選結構以 shader 深度偏移完整顯示在鄰近結構之上（見 `app/scene.tsx` 的 `gl_Position.z` 偏移），所以下表是**模型本身的穿插**，不會因選取而消失，需要換模型或修正位置才能根治。\n',
'| # | 結構 A | 穿入結構 B | 取樣點 | 穿入 | 深穿(>4 mm) | 最深 mm | 共面 |\n|---|---|---|---|---|---|---|---|'];
results.slice(0,120).forEach((r,i)=>lines.push(`| ${i+1} | ${r.a} | ${r.b} | ${r.tested} | ${r.inside} (${(r.ratio*100).toFixed(0)}%) | ${r.deep} | ${mm(r.maxDepth)} | ${r.coincident} |`));
const latissimus=results.filter(r=>/latissimus/i.test(r.a+r.b));
lines.push('\n## 闊背肌相關\n');
lines.push(latissimus.length?'| 結構 A | 穿入結構 B | 穿入 | 深穿 | 最深 mm | 共面 |\n|---|---|---|---|---|---|\n'+latissimus.map(r=>`| ${r.a} | ${r.b} | ${r.inside} | ${r.deep} | ${mm(r.maxDepth)} | ${r.coincident} |`).join('\n'):'沒有達到門檻的穿插。');
fs.writeFileSync(root+'docs/overlap-audit.md',lines.join('\n')+'\n');
console.log(`overlap audit: ${parts.length} parts, ${results.length} interpenetrating pairs, ${latissimus.length} involving latissimus`);

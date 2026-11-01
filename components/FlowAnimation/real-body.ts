import * as THREE from 'three';
import type {Atlas,Part} from '../../app/anatomy';
import {fetchModelBuffer} from '../../app/model-download';
import {positionArray,indexArray,normalArray} from '../../app/stream-geometry';
import type {FlowModel} from './engine';
import type {Pt} from './types';
import {makeWarp} from './warp';

/**
 * 下肢走向動畫的背景：直接使用網站的人體模型（右下肢骨骼、骨盆、腰椎與肌肉），不是示意方塊。
 * 只載入需要的部位，使用自己的場景，因此關閉動畫後主畫面的視角、切面與選取狀態完全不變。
 */
const MUSCLE_GROUPS:[string,RegExp][]=[
 ['quad',/right (rectus femoris|vastus)/i],
 ['sart',/right sartorius/i],
 ['add',/right (adductor (brevis|longus|magnus|minimus)|pectineus)/i],
 ['grac',/right gracilis/i],
 ['ham',/right (semimembranosus|semitendinosus)|head of right biceps femoris/i],
 ['gmax',/right gluteus maximus/i],
 ['gmed',/right gluteus (medius|minimus)/i],
 ['calf',/right (soleus|plantaris)|head of right gastrocnemius/i],
 ['tibant',/right tibialis anterior/i],
 ['fib',/right fibularis/i],
];
const OTHER_MUSCLES=/right (psoas|iliacus|tensor fasciae|obturator|gemellus|quadratus femoris|popliteus|tibialis posterior|extensor (digitorum longus|hallucis)|flexor (digitorum|hallucis) longus)/i;
const BONES=/^(right (femur|tibia|fibula|patella|hip bone|talus|calcaneus|navicular|cuboid|.*cuneiform|.*metatarsal)\b|sacrum|coccyx|(first|second|third|fourth|fifth) lumbar vertebra)|(phalanx of right (big|second|third|fourth|little) toe)|sesamoid bone of right foot/i;

const isBone=(p:Part)=>p.system==='skeletal'&&BONES.test(p.name)&&!/fibularis|tibialis/i.test(p.name);
const muscleGroup=(p:Part)=>{
 if(/piriformis/i.test(p.name)&&/right/i.test(p.name))return 'pir';
 for(const [k,rx] of MUSCLE_GROUPS)if(rx.test(p.name))return k;
 return OTHER_MUSCLES.test(p.name)?'other':null;
};
const wanted=(p:Part)=>p.system!=='arterial'&&p.system!=='venous'&&p.system!=='nervous'&&(isBone(p)||muscleGroup(p)!==null);

type Verts=Float32Array;
const cen=(v:Verts,pred:(x:number,y:number,z:number)=>boolean):Pt=>{let n=0,sx=0,sy=0,sz=0;for(let i=0;i<v.length;i+=3){if(pred(v[i],v[i+1],v[i+2])){n++;sx+=v[i];sy+=v[i+1];sz+=v[i+2];}}return n?[sx/n,sy/n,sz/n]:[NaN,NaN,NaN];};
const box=(v:Verts)=>{const lo:Pt=[1e9,1e9,1e9],hi:Pt=[-1e9,-1e9,-1e9];for(let i=0;i<v.length;i+=3)for(let k=0;k<3;k++){if(v[i+k]<lo[k])lo[k]=v[i+k];if(v[i+k]>hi[k])hi[k]=v[i+k];}return {lo,hi};};
const argmax=(v:Verts,f:(x:number,y:number,z:number)=>number):Pt=>{let b=-1e9,r:Pt=[0,0,0];for(let i=0;i<v.length;i+=3){const s=f(v[i],v[i+1],v[i+2]);if(s>b){b=s;r=[v[i],v[i+1],v[i+2]];}}return r;};

/** 原型座標與網站模型座標的對應點（原型示意座標 → 由網站模型頂點量出的位置） */
function landmarks(g:(name:string)=>Verts|undefined):{from:Pt[];to:Pt[]}{
 const from:Pt[]=[],to:Pt[]=[];
 const add=(a:Pt,b:Pt)=>{if(b.every(Number.isFinite)){from.push(a);to.push(b);}};
 const femur=g('Right femur'),tibia=g('Right tibia'),fibula=g('Right fibula'),calc=g('Right calcaneus'),hip=g('Right hip bone'),sacrum=g('Sacrum');
 if(femur){
  const {lo,hi}=box(femur),cx=(lo[0]+hi[0])/2,L=hi[1]-lo[1];
  add([-.82,.22,0],cen(femur,(x,y)=>y>hi[1]-.04&&x>cx));
  add([-1.7,.05,-.12],argmax(femur,(x,y)=>y>hi[1]-.1?-x:-1e9));
  const at=(f:number)=>cen(femur,(_x,y)=>Math.abs(y-(lo[1]+L*f))<.008);
  add([-1.17,-2.08,0],at(.5));add([-1.16,-.9,0],at(.75));add([-1.19,-3.3,0],at(.25));
  add([-1.2,-4.35,0],cen(femur,(_x,y)=>y<lo[1]+.03));
 }
 if(tibia){
  const {lo,hi}=box(tibia),L=hi[1]-lo[1];
  add([-1.15,-4.5,.05],cen(tibia,(_x,y)=>y>hi[1]-.03));
  add([-1.1,-6.55,.05],cen(tibia,(_x,y)=>Math.abs(y-(lo[1]+L*.5))<.008));
  const m=argmax(tibia,(x,y)=>y<lo[1]+.025?x:-1e9);
  add([-.92,-8.62,.05],cen(tibia,(x,y)=>y<lo[1]+.025&&x>m[0]-.01));
 }
 if(fibula){
  const {lo,hi}=box(fibula),L=hi[1]-lo[1];
  add([-1.58,-4.75,-.1],cen(fibula,(_x,y)=>y>hi[1]-.02));
  add([-1.54,-6.77,-.1],cen(fibula,(_x,y)=>Math.abs(y-(lo[1]+L*.5))<.008));
  add([-1.52,-8.68,-.1],cen(fibula,(_x,y)=>y<lo[1]+.015));
 }
 if(calc){const {lo}=box(calc);add([-1.18,-9.1,.3],cen(calc,(_x,_y,z)=>z<lo[2]+.012));}
 const big=g('Distal phalanx of right big toe'),little=g('Distal phalanx of right little toe');
 if(big){const {hi}=box(big);add([-.86,-9.12,2.3],cen(big,(_x,_y,z)=>z>hi[2]-.008));}
 if(little){const {hi}=box(little);add([-1.48,-9.12,2.06],cen(little,(_x,_y,z)=>z>hi[2]-.008));}
 if(hip){
  const {lo,hi}=box(hip);
  add([-1.85,1.05,.42],argmax(hip,(_x,y,z)=>y+z));
  add([-.08,.28,.45],cen(hip,(_x,y,z)=>z>hi[2]-.01&&y<lo[1]+.07));
 }
 if(sacrum){const {lo,hi}=box(sacrum);add([0,.75,-.82],[(lo[0]+hi[0])/2,(lo[1]+hi[1])/2,(lo[2]+hi[2])/2]);}
 [['First',3.2],['Second',2.75],['Third',2.3],['Fourth',1.85],['Fifth',1.4]].forEach(([n,y])=>{
  const v=g(`${n} lumbar vertebra`);if(v){const {lo,hi}=box(v);add([0,y as number,-.6],[(lo[0]+hi[0])/2,(lo[1]+hi[1])/2,(lo[2]+hi[2])/2]);}
 });
 return {from,to};
}

export interface LoadedBody{model:(scene:THREE.Scene,col:(hex:number)=>THREE.Color)=>FlowModel;map:(p:Pt)=>Pt;unit:number;landmarkCount:number}

/** 下載需要的部位並建立背景模型與座標對應。 */
export async function loadLowerLimbBody(atlas:Atlas,signal:AbortSignal):Promise<LoadedBody>{
 const base=import.meta.env.BASE_URL;
 const resolve=(u:string)=>u.startsWith('/')?`${base}${u.slice(1)}`:u;
 const parts=atlas.parts.filter(wanted);
 const chunkIds=[...new Set(parts.map(p=>p.chunk))];
 const buffers=new Map<number,ArrayBuffer>();
 const failed:number[]=[];
 await Promise.all(chunkIds.map(async ci=>{
  const c=atlas.chunks[ci];let buf:ArrayBuffer;
  try{
   try{buf=await fetchModelBuffer(resolve(c.gzip?c.gzip:c.url),c.bytes,!!c.gzip,signal);}
   catch(e){if(signal.aborted||!c.gzip)throw e;buf=await fetchModelBuffer(resolve(c.url),c.bytes,false,signal);}
   buffers.set(ci,buf);
  }catch(e){if(signal.aborted)throw e;failed.push(ci);}
 }));
 if(failed.length===chunkIds.length)throw new Error('解剖資料檔不完整，請重新載入檢視器。');
 const geoms=new Map<string,{part:Part;geo:THREE.BufferGeometry;pos:Float32Array}>();
 for(const p of parts){
  const buf=buffers.get(p.chunk);if(!buf)continue;
  const pos=positionArray(buf,p),geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  geo.setAttribute('normal',new THREE.BufferAttribute(normalArray(buf,p),3,true));
  geo.setIndex(new THREE.BufferAttribute(indexArray(buf,p),1));
  geoms.set(p.name,{part:p,geo,pos});
 }
 buffers.clear();
 const {from,to}=landmarks(name=>geoms.get(name)?.pos);
 const map=makeWarp(from,to);
 // 原型的一個單位約等於模型的幾公分：用大腿長度（原型約 4.6 單位）換算
 const femur=geoms.get('Right femur');let unit=0.096;
 if(femur){const {lo,hi}=box(femur.pos);unit=(hi[1]-lo[1])/4.98;}
 const model=(scene:THREE.Scene,col:(hex:number)=>THREE.Color):FlowModel=>{
  const boneMat=new THREE.MeshStandardMaterial({color:col(0xe8dcc6),roughness:.8,transparent:true,opacity:.42,depthWrite:false});
  const pirifMat=new THREE.MeshStandardMaterial({color:col(0xb86b5e),roughness:.6,transparent:true,opacity:.3,depthWrite:false});
  const colors:Record<string,number>={quad:0xc9705f,sart:0xc9705f,add:0xb56a8a,grac:0xb56a8a,ham:0xc07a4f,gmax:0xc07a4f,gmed:0xd08a5a,calf:0xc07a4f,tibant:0x6f8fc4,fib:0x5aa39a,other:0xc9a08f};
  const muscleMats:Record<string,THREE.MeshStandardMaterial>={};
  for(const k in colors)muscleMats[k]=new THREE.MeshStandardMaterial({color:col(colors[k]),roughness:.7,transparent:true,opacity:.1,depthWrite:false,emissive:col(colors[k]),emissiveIntensity:0});
  for(const {part,geo} of geoms.values()){
   const g=isBone(part)?null:muscleGroup(part);
   const mat=isBone(part)?boneMat:g==='pir'?pirifMat:g?muscleMats[g]:null;
   if(!mat)continue;
   const mesh=new THREE.Mesh(geo,mat);mesh.renderOrder=isBone(part)?1:0;scene.add(mesh);
  }
  return {muscleMats,pirifMat,dispose:()=>{boneMat.dispose();Object.values(muscleMats).forEach(m=>m.dispose());}};
 };
 return {model,map,unit,landmarkCount:from.length};
}

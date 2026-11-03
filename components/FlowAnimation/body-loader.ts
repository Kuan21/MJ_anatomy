import * as THREE from 'three';
import type {Atlas,Part} from '../../app/anatomy';
import {fetchModelBuffer} from '../../app/model-download';
import {positionArray,indexArray,normalArray} from '../../app/stream-geometry';
import type {FlowModel} from './engine';
import type {Pt} from './types';
import {makeWarp} from './warp';

/** 載入走向動畫需要的網站人體模型部位，建立背景模型與「原型座標 → 模型座標」的變形。上、下肢共用，只換設定。 */
export type Verts=Float32Array;
export const cen=(v:Verts,pred:(x:number,y:number,z:number)=>boolean):Pt=>{let n=0,sx=0,sy=0,sz=0;for(let i=0;i<v.length;i+=3){if(pred(v[i],v[i+1],v[i+2])){n++;sx+=v[i];sy+=v[i+1];sz+=v[i+2];}}return n?[sx/n,sy/n,sz/n]:[NaN,NaN,NaN];};
export const box=(v:Verts)=>{const lo:Pt=[1e9,1e9,1e9],hi:Pt=[-1e9,-1e9,-1e9];for(let i=0;i<v.length;i+=3)for(let k=0;k<3;k++){if(v[i+k]<lo[k])lo[k]=v[i+k];if(v[i+k]>hi[k])hi[k]=v[i+k];}return {lo,hi};};
export const argmax=(v:Verts,f:(x:number,y:number,z:number)=>number):Pt=>{let b=-1e9,r:Pt=[0,0,0];for(let i=0;i<v.length;i+=3){const s=f(v[i],v[i+1],v[i+2]);if(s>b){b=s;r=[v[i],v[i+1],v[i+2]];}}return r;};


export interface BodyConfig{
 isBone:(p:Part)=>boolean;
 /** 肌肉群組 id（引擎依步驟的 mus 調整透明度）；'pir' 為梨狀肌；'other' 為一律淡顯的其他肌肉；不用顯示則回傳 null */
 muscleGroup:(p:Part)=>string|null;
 colors:Record<string,number>;
 landmarks:(g:(name:string)=>Verts|undefined)=>{from:Pt[];to:Pt[]};
 /** 原型一個單位約等於幾公尺 */
 unit:(g:(name:string)=>Verts|undefined)=>number|undefined;
}

export interface LoadedBody{model:(scene:THREE.Scene,col:(hex:number)=>THREE.Color)=>FlowModel;map:(p:Pt)=>Pt;unit:number;landmarkCount:number}

/** 下載需要的部位並建立背景模型與座標對應。 */
export async function loadBody(atlas:Atlas,signal:AbortSignal,cfg:BodyConfig):Promise<LoadedBody>{
 const {isBone,muscleGroup}=cfg;
 const wanted=(p:Part)=>p.system!=='arterial'&&p.system!=='venous'&&p.system!=='nervous'&&(isBone(p)||muscleGroup(p)!==null);
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
 const posOf=(name:string)=>geoms.get(name)?.pos;
 const {from,to}=cfg.landmarks(posOf);
 const map=makeWarp(from,to);
 const unit=cfg.unit(posOf)??0.096;
 const model=(scene:THREE.Scene,col:(hex:number)=>THREE.Color):FlowModel=>{
  const boneMat=new THREE.MeshStandardMaterial({color:col(0xe8dcc6),roughness:.8,transparent:true,opacity:.42,depthWrite:false});
  const pirifMat=new THREE.MeshStandardMaterial({color:col(0xb86b5e),roughness:.6,transparent:true,opacity:.3,depthWrite:false});
  const colors=cfg.colors;
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

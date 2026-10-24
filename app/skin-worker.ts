import * as T from 'three';
import type {Atlas} from './anatomy';
import {rigFor} from './mj-rig';
import {computePartSkin,skinKind,type PartSkin} from './mj-skinning';

/** Off-main-thread skin weights: the viewer shows each chunk at once and patches weights in when they arrive. */
export interface SkinRequest {type:'chunk';id:number;parts:{index:number;positions:Float32Array;indices:Uint32Array}[]}
export interface SkinReply {type:'skins';id:number;skins:{index:number;skin:PartSkin}[]}
const ctx=self as unknown as {onmessage:((e:MessageEvent<{type:'atlas';atlas:Atlas}|SkinRequest>)=>void)|null;postMessage:(m:SkinReply,transfer:Transferable[])=>void};
let atlas:Atlas|null=null;
ctx.onmessage=e=>{
 const msg=e.data;
 if(msg.type==='atlas'){atlas=msg.atlas;return;}
 if(!atlas)return;
 const rig=rigFor(atlas),skins=msg.parts.map(({index,positions,indices})=>{
  const p=atlas!.parts[index],box=new T.Box3(new T.Vector3().fromArray(p.bounds[0]),new T.Vector3().fromArray(p.bounds[1]));
  return{index,skin:computePartSkin(rig,index,p.name,skinKind(p.system,p.name),positions,p.vertexCount,box,indices)};
 });
 ctx.postMessage({type:'skins',id:msg.id,skins},skins.flatMap(s=>[s.skin.index.buffer,s.skin.weight.buffer]));
};

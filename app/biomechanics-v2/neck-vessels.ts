import * as T from 'three';
import type {Atlas,SceneState,SystemId,Part} from '../anatomy';
import {makeBodyRig,buildBodyMotion,bindBodyTissue} from './body-motion';
import {deformTissue,type SkinBinding} from './soft-tissue';
export interface NeckVesselData {vessels:{name:string;parentId:string;system:SystemId;positions:number[];indices:number[]}[]}
const NO_PALETTE=new Float64Array(0);
const samePalette=(a:Float64Array,b:Float64Array)=>{if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;};
export function createNeckVessels(atlas:Atlas,scene:T.Scene){
 const head=makeBodyRig(atlas,'head'),spine=makeBodyRig(atlas,'spine');
 const rows:{mesh:T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>;parent:Part;system:SystemId;base:Float32Array;head:SkinBinding;spine:SkinBinding;/** what produced the current positions, so an unchanged pose is not re-deformed and re-lit */posed?:{region:string;palette:Float64Array}}[]=[];
 const replaced=new Set<string>();
 function add(data:NeckVesselData){
  for(const v of data.vessels){
   const parent=atlas.parts.find(p=>p.id===v.parentId);if(!parent)throw new Error('Missing cervical vessel identity '+v.parentId);
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v.positions,3));g.setIndex(v.indices);g.computeVertexNormals();
   const mesh=new T.Mesh(g,new T.MeshStandardMaterial({color:v.system==='venous'?0x4485aa:0xbc4447,roughness:.53,side:T.DoubleSide}));mesh.name=v.name;mesh.visible=false;scene.add(mesh);
   const base=new Float32Array(v.positions);
   // Every branch samples exactly the same cervical field; no per-object
   // bounding-box or rigid-head rule can pull a bifurcation apart.
   rows.push({mesh,parent,system:v.system,base,head:bindBodyTissue(head,base),spine:bindBodyTissue(spine,base,true)});replaced.add(parent.id);
  }
 }
 const SELECT_COLOR=0x5DB89A;
 /** `selectedName`: the vessel found by search (its mesh name): highlighted and the only row left under Isolate. */
 function update(s:SceneState,explode:number,selectedName:string|null=null){
  const moving=s.bodyMotion?.region==='head'?buildBodyMotion(head,s.bodyMotion.pose):s.bodyMotion?.region==='spine'?buildBodyMotion(spine,s.bodyMotion.pose):null;
  const focus=s.focusParts?new Set(s.focusParts):null,hidden=new Set(s.hiddenParts??[]),selected=new Set(s.selected);
  for(const r of rows){
   const picked=!!selectedName&&r.mesh.name===selectedName,hiddenByName=(s.hiddenNerves??[]).includes(r.mesh.name);
   r.mesh.visible=!hiddenByName&&explode<.01&&(picked||(!hidden.has(r.parent.id)&&s.visible.includes(r.system)&&(!focus||focus.has(r.parent.id))&&(!s.isolate||selected.has(r.parent.id))));
   {const m=r.mesh.material,base=r.system==='venous'?0x4485aa:0xbc4447,color=picked?SELECT_COLOR:base,emissive=picked?SELECT_COLOR:0;
    if(m.color.getHex()!==color||m.emissive.getHex()!==emissive){m.color.setHex(color);m.emissive.setHex(emissive);m.emissiveIntensity=picked?.35:0;}}
   // Deformation is a pure function of (region, palette); update() runs for every viewer state change. A row still at its
   // source shape already has the source normals computed in add().
   const region=moving?s.bodyMotion!.region:'',palette=moving?moving.palette:NO_PALETTE,previous=r.posed;
   if(previous?(previous.region===region&&samePalette(previous.palette,palette)):!moving)continue;
   const attr=r.mesh.geometry.getAttribute('position') as T.BufferAttribute;
   if(moving)deformTissue(s.bodyMotion?.region==='head'?r.head:r.spine,r.base,moving.palette,attr.array as Float32Array);else (attr.array as Float32Array).set(r.base);
   attr.needsUpdate=true;r.mesh.geometry.computeVertexNormals();r.mesh.geometry.computeBoundingSphere();
   r.posed={region,palette:moving?Float64Array.from(palette):NO_PALETTE};
  }
 }
 function dispose(){for(const r of rows){scene.remove(r.mesh);r.mesh.geometry.dispose();r.mesh.material.dispose();}}
 return{add,update,dispose,replaced,rows};
}

import * as T from 'three';
import type {Atlas,SceneState,SystemId,Part} from '../anatomy';
import {makeBodyRig,buildBodyMotion,bindBodyTissue} from './body-motion';
import {deformTissue,type SkinBinding} from './soft-tissue';
export interface NeckVesselData {/** set once the carotid joints have been refined, so a second add() of the same data does not narrow the external carotid again */joined?:boolean;vessels:{name:string;parentId:string;system:SystemId;positions:number[];indices:number[]}[]}
const NO_PALETTE=new Float64Array(0);
const samePalette=(a:Float64Array,b:Float64Array)=>{if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;};
/**
 * The Z-Anatomy carotid tubes meet in a flat butt joint: each common carotid ends in a flat ring, the internal and the external carotid both start 2 to 5 mm beside that ring and run on top of each
 * other for the first 4 cm (centre lines 0.4 mm apart at the start, 3 mm at 3 cm). Drawn as they are, the stub of the two coincident tubes shows as a light, square-cut collar on the artery (it
 * flickers where the two surfaces share a depth). The branches are moved onto the centre of the common carotid's end ring, fading out over 4 cm, and the external carotid is drawn narrower while
 * it lies inside the internal one (full width again where the two have parted, from about 6 cm).
 */
const smooth=(t:number)=>{const x=Math.max(0,Math.min(1,t));return x*x*(3-2*x);};
function joinCarotids(vessels:NeckVesselData['vessels']){
 const by=new Map(vessels.map(v=>[v.name,v]));
 for(const [common,internal,external] of [['Left common carotid artery','Internal carotid artery.l','External carotid artery.l'],['Right common carotid artery','Internal carotid artery.r','External carotid artery.r']]){
  const c=by.get(common),branches=[by.get(internal),by.get(external)];if(!c||!branches[0]||!branches[1])continue;
  let top=-Infinity;for(let i=1;i<c.positions.length;i+=3)top=Math.max(top,c.positions[i]);
  const ring=(pos:number[],test:(y:number)=>boolean)=>{let x=0,z=0,n=0;for(let i=0;i<pos.length;i+=3)if(test(pos[i+1])){x+=pos[i];z+=pos[i+2];n++;}return n?[x/n,z/n]:null;};
  const end=ring(c.positions,y=>y>top-.0015);if(!end)continue;
  branches.forEach((b,k)=>{
   if(!b)return;let low=Infinity;for(let i=1;i<b.positions.length;i+=3)low=Math.min(low,b.positions[i]);
   const start=ring(b.positions,y=>y<low+.003);if(!start)return;
   const dx=end[0]-start[0],dz=end[1]-start[1];if(Math.hypot(dx,dz)>.008)return;
   const pos=b.positions.slice();
   // centre of each 1.5 mm slice of the branch, for the narrowing of the external carotid
   const slice=new Map<number,[number,number,number]>();
   for(let i=0;i<pos.length;i+=3){const s=Math.floor((pos[i+1]-low)/.0015),e=slice.get(s)??[0,0,0];e[0]+=pos[i];e[1]+=pos[i+2];e[2]++;slice.set(s,e);}
   for(let i=0;i<pos.length;i+=3){
    const h=pos[i+1]-low,w=1-smooth((h-.003)/.037);pos[i]+=dx*w;pos[i+2]+=dz*w;
    if(k===1){const e=slice.get(Math.floor(h/.0015))!;const cx=e[0]/e[2]+dx*w,cz=e[1]/e[2]+dz*w,f=.62+.38*smooth((h-.025)/.035);pos[i]=cx+(pos[i]-cx)*f;pos[i+2]=cz+(pos[i+2]-cz)*f;}
   }
   b.positions=pos;
  });
 }
}
export function createNeckVessels(atlas:Atlas,scene:T.Scene){
 const head=makeBodyRig(atlas,'head'),spine=makeBodyRig(atlas,'spine');
 const rows:{mesh:T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>;parent:Part;system:SystemId;base:Float32Array;head:SkinBinding;spine:SkinBinding;/** what produced the current positions, so an unchanged pose is not re-deformed and re-lit */posed?:{region:string;palette:Float64Array}}[]=[];
 const replaced=new Set<string>();
 function add(data:NeckVesselData){
  if(!data.joined){joinCarotids(data.vessels);data.joined=true;}
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
   r.mesh.visible=!hiddenByName&&explode<.01&&s.visible.includes(r.system)&&(picked||(!hidden.has(r.parent.id)&&s.visible.includes(r.system)&&(!focus||focus.has(r.parent.id))&&(!s.isolate||selected.has(r.parent.id))));
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

import registrationData from './joint-registration.json';
import * as T from 'three';
import type {Atlas,Part,SceneState} from '../anatomy';
import {anatomicalRegion} from '../mj-part-regions';
import {bindTissue,deformTissue,makePalette,type SkinBinding,type Profile,makeSoftRig} from './soft-tissue';
import {bindBodyTissue,makeBodyRig,buildBodyMotion,type BodyRegion} from './body-motion';

// Z-Anatomy includes capsules and ligaments, not a complete hyaline-cartilage
// segmentation. Never relabel those structures as articular cartilage.
export function jointKind(name:string){return /labrum|meniscus|articular disc|interpubic disc/i.test(name)?'fibrocartilage':/capsul/i.test(name)?'capsule':'ligament';}
export function includeJoint(name:string){
 // Existing atlas owns intervertebral discs and membranes. Triradiate cartilage
 // is developmental anatomy and does not belong in this adult atlas.
 return !/triradiate|intervertebral disc|nucleus pulposus|membrane|fat pad|pubic symphysis|sacrococcygeal symphysis/i.test(name)&&/ligament|capsul|labrum|meniscus|articular disc|interpubic disc|frenula/i.test(name);
}
export function jointProfile(name:string,y:number):Profile{
 name=name.toLowerCase();
 // Name territories take precedence over substrings: scaphotrapeziotrapezoidal
 // is a wrist ligament, not the trapezoid component at the shoulder.
 if(/scapho|trapezi|carpal|metacarp|phalange|pisohamate|pisometacarp/.test(name))return 'hand';
 if(/glenoid labrum|transverse humeral/.test(name))return /labrum/.test(name)?'scapular':'humeral';
 if(/sternoclavicular|interclavicular/.test(name))return 'clavicular';
 if(/glenohumeral|coracohumeral|acromioclavicular|coracoacromial|coracoclavicular|\bconoid ligament\b|\btrapezoid ligament\b/.test(name))return 'shoulderJoint';
 if(/wrist|radiocarpal|radio-ulnar|ulnocarpal/.test(name))return 'wristJoint';
 if(/elbow|annular|collateral ligament/.test(name)&&y>1)return 'elbowJoint';
 return y<.84?'hand':y<.98?'wristJoint':'path';
}
const NO_INPUT=new Float64Array(0);
const sameInput=(a:Float64Array,b:Float64Array)=>{if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;};
export function createJointAnatomy(atlas:Atlas,scene:T.Scene){
 const upper={left:makeSoftRig(atlas,'left'),right:makeSoftRig(atlas,'right')};
 const body={head:makeBodyRig(atlas,'head'),spine:makeBodyRig(atlas,'spine'),leftLeg:makeBodyRig(atlas,'leftLeg'),rightLeg:makeBodyRig(atlas,'rightLeg')};
 type Row={mesh:T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>;base:Float32Array;/** what produced the current positions, so an unchanged pose is not re-deformed and re-lit */posed?:{mode:number;input:Float64Array};side:'left'|'right';region:ReturnType<typeof anatomicalRegion>;anchor:Part;skin?:SkinBinding;bodySkin:SkinBinding;spineSkin:SkinBinding;bodyRegion:BodyRegion;rigidId?:string};
 const rows:Row[]=[];
 const registrations=Object.entries(registrationData).map(([name,r])=>({...r,name,matrix:new T.Matrix4().fromArray(r.matrix),box:new T.Box3(new T.Vector3(...r.sourceBounds[0]),new T.Vector3(...r.sourceBounds[1]))}));
 const surfaces:{mesh:T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>;parent:Part}[]=[];
 function addSurfaces(data:{patches:{name:string;parentId:string;positions:number[];indices:number[]}[]}){
  for(const patch of data.patches){const parent=atlas.parts.find(p=>p.id===patch.parentId);if(!parent)continue;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(patch.positions,3));g.setIndex(patch.indices);g.computeVertexNormals();const mesh=new T.Mesh(g,new T.MeshStandardMaterial({color:0x92dce0,roughness:.4,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));mesh.name='Articular surface · '+parent.name;mesh.visible=false;scene.add(mesh);surfaces.push({mesh,parent});}
 }
 function addMesh(o:T.Mesh){
  {
   const sourceName=String(o.userData.za_name??o.name).replaceAll('_',' '),name=sourceName.toLowerCase();
   if(!includeJoint(name))return;
   const g=o.geometry.clone().applyMatrix4(o.matrixWorld);g.computeBoundingBox();
   const sourceCenter=g.boundingBox!.getCenter(new T.Vector3()),side=sourceCenter.x>=0?'left':'right';
   const socketName=/glenoid labrum/.test(name)?'Scapula':/acetabular labrum|transverse acetabular/.test(name)?'Hip bone':/^(lateral|medial) meniscus/.test(name)?'Tibia':null;
   const forced=socketName?registrations.find(r=>r.name===socketName+(side==='left'?'.l':'.r')):undefined;
   const candidates=registrations.filter(r=>r.name.endsWith(side==='left'?'.l':'.r')||!/[.][lr]$/.test(r.name));
   const closest=forced??candidates.reduce((a,b)=>a.box.distanceToPoint(sourceCenter)<b.box.distanceToPoint(sourceCenter)?a:b);
   const anchor=atlas.parts.find(p=>p.id===closest.parentId)!;
   const region=anatomicalRegion(anchor),rig=upper[side];
   const pos=g.getAttribute('position') as T.BufferAttribute;
   // Same source-bone registration field for all joint tissues. Socket rims
   // use the socket's transform; other tissues blend local neighbouring bones.
   const v=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3();
   for(let i=0;i<pos.count;i++){
    v.fromBufferAttribute(pos,i);
    if(forced)v.applyMatrix4(forced.matrix);
    else {
     let first=closest,second=closest,d1=Infinity,d2=Infinity;
     for(const r of candidates){const d=r.box.distanceToPoint(v);if(d<d1){second=first;d2=d1;first=r;d1=d;}else if(d<d2){second=r;d2=d;}}
     const w1=1/(.002+d1)**2,w2=1/(.002+d2)**2;
     a.copy(v).applyMatrix4(first.matrix);b.copy(v).applyMatrix4(second.matrix);v.copy(a).lerp(b,w2/(w1+w2));
    }
    pos.setXYZ(i,v.x,v.y,v.z);
   }
   const c=g.boundingBox!.getCenter(new T.Vector3());
   g.computeBoundingBox();g.computeVertexNormals();
   const base=new Float32Array(pos.array),kind=jointKind(name);
   const material=new T.MeshStandardMaterial({color:kind==='fibrocartilage'?0x84d8dc:kind==='capsule'?0xc5d9d2:0xd4d3ac,roughness:.6,side:T.DoubleSide,transparent:kind==='capsule',opacity:kind==='capsule'?.26:1,depthWrite:kind!=='capsule'});
   const mesh=new T.Mesh(g,material);mesh.name=sourceName;mesh.visible=false;scene.add(mesh);
   const part={...anchor,name,bounds:[g.boundingBox!.min.toArray(),g.boundingBox!.max.toArray()]} as Part;
   const bodyRegion:BodyRegion=region==='lower-limb'?(side==='left'?'leftLeg':'rightLeg'):region==='head-neck'?'head':'spine';
   const row:Row={mesh,base,side,region,anchor,bodyRegion,bodySkin:bindBodyTissue(body[bodyRegion],base,/temporomandibular|stylohyoid|stylomandibular|sphenomandibular/.test(name),part),spineSkin:bindBodyTissue(body.spine,base,region==='upper-limb'||region==='head-neck',part)};
   if(region==='upper-limb'&&rig)row.skin=bindTissue(rig,jointProfile(name,c.y),base,part);
   // Socket rims must remain attached to the socket, not blend toward the head.
   const rigidName=/glenoid labrum/.test(name)?`${side} scapula`:/acetabular labrum|transverse acetabular/.test(name)?`${side} hip bone`:/^(Lateral|Medial) meniscus/i.test(name)?`${side} tibia`:null;
   if(rigidName)row.rigidId=atlas.parts.find(p=>p.name.toLowerCase()===rigidName)?.id;
   rows.push(row);
  }
 }
 function add(root:T.Object3D){root.updateMatrixWorld(true);root.traverse(o=>{if(o instanceof T.Mesh)addMesh(o);});}
 /** Same result as add(), but hands control back every `budgetMs` so registering ~285 structures does not freeze the page. */
 async function addSliced(root:T.Object3D,pause:()=>Promise<void>,cancelled:()=>boolean,budgetMs=12){
  root.updateMatrixWorld(true);const meshes:T.Mesh[]=[];root.traverse(o=>{if(o instanceof T.Mesh)meshes.push(o);});
  let start=performance.now();
  for(const o of meshes){if(performance.now()-start>budgetMs){await pause();if(cancelled())return;start=performance.now();}addMesh(o);}
 }
 function update(s:SceneState,explode:number){
  const palettes={left:upper.left?makePalette(upper.left,s.partTransforms??{}):null,right:upper.right?makePalette(upper.right,s.partTransforms??{}):null};
  const active=s.bodyMotion?buildBodyMotion(body[s.bodyMotion.region],s.bodyMotion.pose):null;
  const focus=s.focusParts?new Set(s.focusParts):null,hidden=new Set(s.hiddenParts??[]);
  for(const {mesh,parent} of surfaces){
   mesh.visible=s.jointSurfaces!==false&&s.visible.includes('connective')&&!s.isolate&&explode<.01&&s.depthFilter!=='superficial'&&!hidden.has(parent.id)&&(!focus||focus.has(parent.id));
   const t=s.partTransforms?.[parent.id];mesh.position.set(...(t?.translation??[0,0,0]));mesh.quaternion.set(...(t?.quaternion??[0,0,0,1]));
  }
  for(const r of rows){
   r.mesh.visible=s.visible.includes('connective')&&!s.isolate&&explode<.01&&s.depthFilter!=='superficial'&&!hidden.has(r.anchor.id)&&(!focus||focus.has(r.anchor.id));
   // The deformation is a pure function of (mode, input). Skip it, and the normal rebuild, when neither changed:
   // update() runs for every viewer state change, not only for pose changes.
   let mode=0,input:Float64Array=NO_INPUT;
   if(r.rigidId){const t=s.partTransforms?.[r.rigidId];if(t){mode=1;input=Float64Array.of(...t.translation,...t.quaternion);}}
   else if(active&&s.bodyMotion?.region===r.bodyRegion){mode=2;input=active.palette;}
   else if(active&&s.bodyMotion?.region==='spine'){mode=3;input=active.palette;}
   else if(!active&&s.tissueMotion&&r.skin&&palettes[r.side]){mode=4;input=palettes[r.side]!;}
   const previous=r.posed;
   if(previous?(previous.mode===mode&&sameInput(previous.input,input)):mode===0)continue;
   // A row still at its source shape already has its source normals (computed in add()).
   const out=r.mesh.geometry.getAttribute('position') as T.BufferAttribute;out.array.set(r.base);
   if(mode===1){const q=new T.Quaternion(input[3],input[4],input[5],input[6]),v=new T.Vector3(input[0],input[1],input[2]),p=new T.Vector3();for(let i=0;i<out.count;i++){p.fromArray(r.base,i*3).applyQuaternion(q).add(v);out.setXYZ(i,p.x,p.y,p.z);}}
   else if(mode===2)deformTissue(r.bodySkin,r.base,input,out.array as Float32Array);
   else if(mode===3)deformTissue(r.spineSkin,r.base,input,out.array as Float32Array);
   else if(mode===4)deformTissue(r.skin!,r.base,input,out.array as Float32Array);
   out.needsUpdate=true;r.mesh.geometry.computeVertexNormals();r.mesh.geometry.computeBoundingSphere();
   r.posed={mode,input:mode?Float64Array.from(input):NO_INPUT};
  }
 }
 function dispose(){for(const {mesh} of surfaces){scene.remove(mesh);mesh.geometry.dispose();mesh.material.dispose();}for(const r of rows){scene.remove(r.mesh);r.mesh.geometry.dispose();r.mesh.material.dispose();}}
 return {add,addSliced,addSurfaces,update,dispose,rows,surfaces};
}

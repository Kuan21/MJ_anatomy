// Run test-soft-tissue and test-surface-constraints first. Export actual mesh
// geometry for offline visual comparison; not a browser/GPU screenshot.
import fs from 'node:fs';
import {Vector3,Quaternion} from 'three';
import * as soft from '../.sites-runtime/soft-tissue.mjs';
import * as motion from '../.sites-runtime/mj-motion.mjs';
import * as guard from '../.sites-runtime/surface-constraints.mjs';
const root=new URL('../',import.meta.url),atlas=JSON.parse(fs.readFileSync(new URL('public/models/atlas.json',root)));
const buffers=atlas.chunks.map(c=>fs.readFileSync(new URL('public'+c.url,root)));
const rig=soft.makeSoftRig(atlas,'left'),cases=[];
for(const pose of [{shoulderFlexion:32,shoulderAbduction:162,shoulderRotation:48},{shoulderFlexion:161,shoulderAbduction:36,shoulderRotation:0}]){
 const transforms=motion.buildUpperLimbMotion(atlas,'left',{...motion.NEUTRAL_POSE,...pose}).transforms,palette=soft.makePalette(rig,transforms),rows=[];
 for(const p of atlas.parts.filter(p=>/^Left (serratus anterior|scapula|humerus|.*rib|dorsal scapular artery|lateral thoracic artery|axillary artery)$/.test(p.name))){
  const b=buffers[p.chunk],base=new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3).slice(),idx=new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount),before=base.slice(),after=base.slice();
  if(soft.tissueBindings[p.id]){
   const skin=soft.bindTissue(rig,p.system==='arterial'?'path':soft.tissueBindings[p.id].profile,base,p);
   const previous=/dorsal scapular artery/i.test(p.name)?soft.bindTissue(rig,'path',base):skin;
   soft.deformTissue(previous,base,palette,before);soft.deformTissue(skin,base,palette,after);
   if(skin.profile==='scapular'){const g=guard.makeSurfaceConstraints(base,idx,skin);guard.constrainSurface(g,before);guard.constrainSurface(g,after);}
  }else if(transforms[p.id]){
   const t=transforms[p.id],q=new Quaternion(...t.quaternion),v=new Vector3(...t.translation);
   for(let i=0;i<base.length;i+=3)after.set(new Vector3(...base.slice(i,i+3)).applyQuaternion(q).add(v).toArray(),i);before.set(after);
  }
  rows.push({name:p.name,system:p.system,base:[...base],before:[...before],after:[...after],idx:[...idx]});
 }
 cases.push({pose,rows});
}
fs.writeFileSync(new URL('.sites-runtime/shoulder-comparison.json',root),JSON.stringify(cases));
console.log('Exported two reported poses, baseline and candidate actual mesh geometry.');

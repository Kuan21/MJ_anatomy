import type {Part} from '../anatomy';
import {anatomicalRegion,anatomicalSide,isMotionQuarantined,partCenter} from '../mj-part-regions';
import {bindBodyTissue,bindSpineCarrier,bodyBindings,skullAttached,type BodyRig,type BodyRegion} from './body-motion';
import {bindTissue,resolveNeurovascularProfile,tissueBindings,type makeSoftRig} from './soft-tissue';

type SoftRigs=Record<'left'|'right',ReturnType<typeof makeSoftRig>>;
/** One classification for both the worker and synchronous fallback. */
export function bodyPartRule(p:Part,rig:BodyRig){
 const bb=bodyBindings[p.id],binding=tissueBindings[p.id],region=anatomicalRegion(p),side=anatomicalSide(p),pc=partCenter(p);
 const spinal=/spinal cord|central canal/i.test(p.name);
 const cervical=(pc[1]>=1.08&&pc[1]<=1.72&&Math.abs(pc[0])<=.34&&/trachea|esophagus|laryn|pharyn|hyoid|thyroid|cricoid|epiglott|longus|scalen|sternocleidomastoid|splenius|semispinalis|carotid|jugular|vertebral artery|vertebral vein|cervical fascia|nuchal ligament|spinalis cervicis|spinalis capitis/i.test(p.name))||(spinal&&p.bounds[1][1]>=1.10&&p.bounds[0][1]<=1.72);
 if(rig.region==='spine'){
  if(binding?.name===p.name&&!isMotionQuarantined(p)&&['upper-limb','trunk'].includes(region))return{carrier:true,skull:false,guard:false};
  if(pc[1]>=rig.levels[0]-.12&&pc[1]<=rig.levels[rig.levels.length-1]+.13&&/pectoralis|serratus|intercostal|costal cartilage|costochondral|sternocostal|rectus abdominis|pyramidalis|inguinal ligament|oblique|transversus abdominis|latissimus|trapezius|diaphragm|erector spinae|iliocostalis|longissimus|spinalis|multifidus|rotator|interspinal|intertransvers|levatores costarum|transversus thoracis|linea alba|semispinalis thoracis|quadratus lumborum|psoas|thoracolumbar|aorta|vena cava|intercostal (?:artery|vein)|thoracic duct/i.test(p.name))return{carrier:false,skull:false,guard:p.system==='muscular'};
  if((bb?.rig==='head'||skullAttached(p)||cervical)&&p.system!=='skeletal')return{carrier:false,skull:!spinal,guard:false};
 }else if(rig.region==='head'){
  if((bb?.rig==='head'&&bb.frame===null)||cervical)return{carrier:false,skull:false,guard:/platysma|sternocleidomastoid/i.test(p.name)};
 }else if(bb&&bb.frame===null&&(bb.rig==='leftLeg'||bb.rig==='rightLeg')&&region==='lower-limb'&&!isMotionQuarantined(p)){
  const resolved:BodyRegion=side==='left'?'leftLeg':side==='right'?'rightLeg':bb.rig;
  if(resolved===rig.region)return{carrier:false,skull:false,guard:false};
 }
 return null;
}
export function bindBodyPart(p:Part,base:Float32Array,rig:BodyRig,softRigs:SoftRigs){
 const rule=bodyPartRule(p,rig);if(!rule)return null;
 if(rule.carrier){const binding=tissueBindings[p.id],side=anatomicalSide(p),soft=softRigs[side==='midline'?binding.side:side];if(!soft)return null;const profile=['arterial','venous'].includes(p.system)?resolveNeurovascularProfile(p.name,binding.profile):binding.profile;return{skin:bindSpineCarrier(rig,base,bindTissue(soft,profile,base,p)),guard:rule.guard};}
 return{skin:bindBodyTissue(rig,base,rule.skull,p),guard:rule.guard};
}

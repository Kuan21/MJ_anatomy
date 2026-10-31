import type {Atlas} from './anatomy';
import {lungCategoryOf,type LungCategoryKey} from './mj-lung-categories';

/**
 * Name labels for the medial (mediastinal) view of one lung.
 * `names` are model part names; every part with such a name on the chosen side is what the label points to and what a click opens.
 * Surface marks (grooves, contact areas, borders) are patches cut from the lobe surface by scripts/paokao-structures/lungs.mjs.
 * `near` names a part whose centre the arrow should end closest to (the bronchial artery is one mesh that runs along both main bronchi).
 * Structures the model does not have as a patch or a mesh are not listed here; REVIEW_LOG.md (肺 PR 2 規劃) says which they are.
 */
export interface LungLabelDef{key:string;names:string[];near?:string}
const hilum=(w:'Left'|'Right'):LungLabelDef=>({key:`hilum-${w}`,names:[`Hilum of ${w.toLowerCase()} lung`]});
export const LUNG_LABELS:Record<'left'|'right',LungLabelDef[]>={
 right:[
  {key:'apex',names:['Apex of right lung']},
  {key:'subclavian',names:['Right groove for subclavian artery']},
  {key:'brachiocephalic',names:['Groove for brachiocephalic vein']},
  {key:'first-rib',names:['Groove for first rib of right lung']},
  {key:'svc',names:['Groove for superior vena cava']},
  {key:'thymus',names:['Contact area for thymus of right lung']},
  {key:'anterior-border',names:['Anterior border of right lung']},
  {key:'horizontal-fissure',names:['Horizontal fissure of right lung']},
  {key:'oblique-fissure',names:['Oblique fissure of right lung']},
  {key:'cardiac',names:['Cardiac impression of right lung']},
  {key:'ivc',names:['Groove for inferior vena cava']},
  {key:'trachea',names:['Contact area for trachea of right lung']},
  {key:'esophagus',names:['Groove for esophagus']},
  {key:'azygos',names:['Groove for azygos vein']},
  {key:'ligament',names:['Right pulmonary ligament']},
  {key:'diaphragm',names:['Diaphragmatic surface of right lung']},
  {key:'inferior-border',names:['Inferior border of right lung']},
  hilum('Right'),
  {key:'bronchus',names:['Right main bronchus proper']},
  {key:'pa',names:['Right pulmonary artery']},
  {key:'sup-vein',names:['Right superior pulmonary vein']},
  {key:'inf-vein',names:['Right inferior pulmonary vein']},
  {key:'bronchial-artery',names:['Bronchial artery'],near:'Hilum of right lung'},
 ],
 left:[
  {key:'apex',names:['Apex of left lung']},
  {key:'subclavian',names:['Left groove for subclavian artery']},
  {key:'brachiocephalic',names:['Groove for left brachiocephalic vein']},
  {key:'first-rib',names:['Groove for first rib of left lung']},
  {key:'thymus',names:['Contact area for thymus of left lung']},
  {key:'anterior-border',names:['Anterior border of left lung']},
  {key:'oblique-fissure',names:['Oblique fissure of left lung']},
  {key:'aortic-arch',names:['Groove for aortic arch']},
  {key:'descending-aorta',names:['Groove for descending aorta']},
  {key:'cardiac',names:['Cardiac impression of left lung']},
  {key:'cardiac-notch',names:['Cardiac notch of left lung']},
  {key:'lingula',names:['Lingula of left lung']},
  {key:'esophagus',names:['Esophageal impression of left lung']},
  {key:'ligament',names:['Left pulmonary ligament']},
  {key:'diaphragm',names:['Diaphragmatic surface of left lung']},
  {key:'inferior-border',names:['Inferior border of left lung']},
  hilum('Left'),
  {key:'bronchus',names:['Left main bronchus']},
  {key:'pa',names:['Left pulmonary artery']},
  {key:'sup-vein',names:['Left superior pulmonary vein']},
  {key:'inf-vein',names:['Left inferior pulmonary vein']},
  {key:'bronchial-artery',names:['Bronchial artery'],near:'Hilum of left lung'},
 ],
};

export interface ResolvedLungLabel{key:string;name:string;system:string;ids:string[];near:string[];cat:LungCategoryKey|null}
/** The labels of one lung with the atlas parts they point to; labels whose parts the atlas does not have are dropped (and counted by the caller). */
export function resolveLungLabels(atlas:Atlas,side:'left'|'right'):ResolvedLungLabel[]{
 const onSide=(p:Atlas['parts'][number])=>{const cx=(p.bounds[0][0]+p.bounds[1][0])/2;return side==='left'?cx>0:cx<0;};
 const chest=(p:Atlas['parts'][number])=>{const cy=(p.bounds[0][1]+p.bounds[1][1])/2;return cy>1.17&&cy<1.45;};
 const out:ResolvedLungLabel[]=[];
 for(const def of LUNG_LABELS[side]){
  const hit=atlas.parts.filter(p=>def.names.includes(p.name)&&chest(p)&&(def.near?true:onSide(p)));
  if(!hit.length)continue;
  const near=def.near?atlas.parts.filter(p=>p.name===def.near).map(p=>p.id):[];
  out.push({key:def.key,name:hit[0].name,system:hit[0].system,ids:hit.map(p=>p.id),near,cat:lungCategoryOf(hit[0].name)});
 }
 return out;
}

/** The real meshes that enter the hilum of one lung (main bronchus, pulmonary artery, superior and inferior pulmonary veins), for the "relation at the hilum" highlight. */
export function lungHilumRoot(atlas:Atlas,side:'left'|'right'){
 const w=side==='left'?'Left':'Right',names={bronchus:side==='left'?'Left main bronchus':'Right main bronchus proper',artery:`${w} pulmonary artery`,veins:[`${w} superior pulmonary vein`,`${w} inferior pulmonary vein`]};
 const pick=(n:string)=>atlas.parts.filter(p=>p.name===n&&(p.bounds[0][1]+p.bounds[1][1])/2>1.17&&(p.bounds[0][1]+p.bounds[1][1])/2<1.45).map(p=>p.id);
 return{bronchus:pick(names.bronchus),artery:pick(names.artery),veins:names.veins.flatMap(pick)};
}

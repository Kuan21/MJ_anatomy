import type {Atlas} from './anatomy';
import {lungCategoryOf,type LungCategoryKey} from './mj-lung-categories';
import links from './mj-lung-links.json';
const chestCentre=(p:Atlas['parts'][number])=>{const cy=(p.bounds[0][1]+p.bounds[1][1])/2;return cy>1.17&&cy<1.45;};

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

/** Structures of the chest that can lie between the camera and the mediastinal face of one lung (trachea, oesophagus, heart, great vessels, thymus): drawn faint in the medial view. */
export function lungContextIds(atlas:Atlas,side:'left'|'right'){
 const other=side==='left'?/^right /i:/^left /i;
 return atlas.parts.filter(p=>links.context.includes(p.name)&&!other.test(p.name)&&chestCentre(p)).map(p=>p.id);
}
/** The structures that press the grooves, impressions and contact areas of the given lungs, grouped by the category of the groove they make (the colour they take). */
export function lungImpressors(atlas:Atlas,sides:('left'|'right')[]):{cat:LungCategoryKey;ids:string[]}[]{
 const by=new Map<LungCategoryKey,Set<string>>(),map=links.impressors as Record<string,string[]>;
 for(const side of sides)for(const def of LUNG_LABELS[side]){
  const cat=lungCategoryOf(def.names[0]),names=map[def.names[0]];
  if(!cat||!names)continue;
  const other=side==='left'?/^right /i:/^left /i;
  for(const p of atlas.parts)if(names.includes(p.name)&&!other.test(p.name)&&chestCentre(p)){const set=by.get(cat)??new Set<string>();set.add(p.id);by.set(cat,set);}
 }
 return [...by].map(([cat,set])=>({cat,ids:[...set]}));
}
/** The model part a data-card link name stands for (a patch or a structure; the chest copy, on the lung's side when there are two). */
export function lungLinkTarget(atlas:Atlas,name:string,side?:'left'|'right'){
 const hits=atlas.parts.filter(p=>p.name===name&&chestCentre(p));
 if(hits.length<=1||!side)return hits[0];
 return hits.find(p=>{const cx=(p.bounds[0][0]+p.bounds[1][0])/2;return side==='left'?cx>0:cx<0;})??hits[0];
}
/** Neighbours and impressing structures of a lung groove for the data card: model part names. */
export function lungCardLinks(name:string){return{impressors:(links.impressors as Record<string,string[]>)[name]??[],neighbours:(links.neighbours as Record<string,string[]>)[name]??[]};}

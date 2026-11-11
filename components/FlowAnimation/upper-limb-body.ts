import type {Atlas,Part} from '../../app/anatomy';
import type {Pt} from './types';
import {loadBody,cen,box,argmax,type Verts,type BodyConfig} from './body-loader';

/** 上肢：右上肢骨骼、肩帶、胸骨、頸胸椎與肌肉 */
const MUSCLE_GROUPS:[string,RegExp][]=[
 ['pmaj',/right pectoralis major/i],
 ['pmin',/right pectoralis minor/i],
 ['serr',/right serratus anterior/i],
 ['levr',/right levator scapulae/i],
 ['supra',/right supraspinatus/i],
 ['infra',/right infraspinatus/i],
 ['subsc',/right subscapularis/i],
 ['tmaj',/right teres major/i],
 ['tmin',/right teres minor/i],
 ['delt',/right deltoid/i],
 ['cbr',/right coracobrachialis/i],
 ['bic',/right biceps brachii/i],
 ['brach',/right brachialis/i],
 ['tric',/right triceps brachii/i],
 // 注意：小腿與足部也有 flexor／extensor digitorum longus，不可被上肢的群組選到
 ['flex',/right (flexor (carpi [a-z ]+|digitorum (superficialis|profundus)|pollicis longus)|palmaris|pronator)|(head of right (flexor carpi|pronator))/i],
 ['ext',/right (extensor (carpi [a-z ]+|digiti minimi|indicis|pollicis (longus|brevis))|extensor digitorum$|abductor pollicis longus|brachioradialis|anconeus)/i],
 ['sup',/right supinator/i],
 ['then',/right (abductor pollicis brevis|opponens pollicis|flexor pollicis brevis)|flexor pollicis brevis/i],
 ['hypo',/(abductor digiti minimi|flexor digiti minimi brevis|opponens digiti minimi) of right hand/i],
];
const OTHER=/right (trapezius|rhomboid|subclavius)|of right trapezius|(sets? of (dorsal|palmar) interossei|lumbricals) of right hand|adductor pollicis/i;
const BONES=/^(right (humerus|radius|ulna|scapula|clavicle|first rib|scaphoid|lunate|triquetrum|pisiform|trapezium|trapezoid|capitate|hamate|.*metacarpal bone)|manubrium|body of sternum|xiphoid process|(third|fourth|fifth|sixth|seventh) cervical vertebra|(first|second|third) thoracic vertebra)\b|phalanx of right (thumb|index finger|middle finger|ring finger|little finger)/i;

const isBone=(p:Part)=>p.system==='skeletal'&&BONES.test(p.name);
const muscleGroup=(p:Part):string|null=>{
 if(p.system==='skeletal'&&!/^(flexor|extensor|pronator)/i.test(p.name)&&isBone(p))return null;
 if(/\bleft\b/i.test(p.name))return null;
 for(const [k,rx] of MUSCLE_GROUPS)if(rx.test(p.name))return k;
 return OTHER.test(p.name)?'other':null;
};

const landmarks=(g:(name:string)=>Verts|undefined):{from:Pt[];to:Pt[]}=>{
 const from:Pt[]=[],to:Pt[]=[];
 const add=(a:Pt,b:Pt)=>{if(b.every(Number.isFinite)){from.push(a);to.push(b);}};
 const ctr=(v:Verts):Pt=>{const {lo,hi}=box(v);return [(lo[0]+hi[0])/2,(lo[1]+hi[1])/2,(lo[2]+hi[2])/2];};
 const hum=g('Right humerus'),rad=g('Right radius'),uln=g('Right ulna'),sca=g('Right scapula'),cla=g('Right clavicle');
 if(hum){
  const {lo,hi}=box(hum),cx=(lo[0]+hi[0])/2,L=hi[1]-lo[1];
  add([-1.62,2.35,-.05],cen(hum,(x,y)=>y>hi[1]-.03&&x>cx));
  const at=(f:number)=>cen(hum,(_x,y)=>Math.abs(y-(lo[1]+L*f))<.006);
  add([-1.75,1.675,0],at(.75));add([-1.83,.8,0],at(.5));add([-1.91,-.075,0],at(.25));
  add([-1.955,-.85,-.01],cen(hum,(_x,y)=>y<lo[1]+.02));
  add([-1.71,-.85,-.02],argmax(hum,(x,y)=>y<lo[1]+.03?x:-1e9));
  add([-2.2,-.85,0],argmax(hum,(x,y)=>y<lo[1]+.03?-x:-1e9));
 }
 if(rad){
  const {lo,hi}=box(rad),L=hi[1]-lo[1];
  add([-2.15,-1.0,.05],cen(rad,(_x,y)=>y>hi[1]-.02));
  add([-2.25,-2.67,.065],cen(rad,(_x,y)=>Math.abs(y-(lo[1]+L*.5))<.006));
  add([-2.35,-4.35,.08],cen(rad,(_x,y)=>y<lo[1]+.015));
 }
 if(uln){
  const {lo,hi}=box(uln),L=hi[1]-lo[1];
  add([-1.85,-.95,-.05],cen(uln,(_x,y)=>y>hi[1]-.02));
  add([-1.92,-2.65,-.015],cen(uln,(_x,y)=>Math.abs(y-(lo[1]+L*.5))<.006));
  add([-1.98,-4.35,.02],cen(uln,(_x,y)=>y<lo[1]+.015));
 }
 const cap=g('Right capitate');if(cap)add([-2.15,-4.95,.1],ctr(cap));
 const tip=(name:string,a:Pt)=>{const v=g(name);if(v){const {lo}=box(v);add(a,cen(v,(_x,y)=>y<lo[1]+.005));}};
 tip('Distal phalanx of right little finger',[-1.86,-6.07,.08]);
 tip('Distal phalanx of right middle finger',[-2.18,-6.2,.08]);
 tip('Distal phalanx of right thumb',[-2.72,-5.4,.25]);
 if(cla){
  const {lo,hi}=box(cla);
  add([-.3,2.55,.45],cen(cla,x=>x>hi[0]-.015));
  add([-1.65,2.76,.02],cen(cla,x=>x<lo[0]+.015));
 }
 if(sca){
  const {lo}=box(sca);
  add([-1.1,1.95,-.6],ctr(sca));
  add([-1.65,2.72,-.12],argmax(sca,(x,y)=>y-x));
  add([-1.4,2.48,.3],argmax(sca,(_x,_y,z)=>z));
  add([-1.1,1.2,-.62],cen(sca,(_x,y)=>y<lo[1]+.01));
 }
 const man=g('Manubrium');if(man){const {hi}=box(man);add([0,2.4,.5],cen(man,(_x,y)=>y>hi[1]-.006));}
 const stb=g('Body of sternum');if(stb){const {lo}=box(stb);add([0,.8,.5],cen(stb,(_x,y)=>y<lo[1]+.006));}
 ([['Fifth cervical vertebra',3.6],['First thoracic vertebra',2.7],['Second thoracic vertebra',2.4]] as [string,number][]).forEach(([n,y])=>{const v=g(n);if(v)add([0,y,-.5],ctr(v));});
 return {from,to};
};

const config:BodyConfig={
 isBone,muscleGroup,landmarks,
 colors:{pmaj:0xc9705f,pmin:0xb56a8a,serr:0x6f8fc4,levr:0x5aa39a,supra:0xd08a5a,infra:0xd08a5a,subsc:0xb56a8a,lat:0xc07a4f,tmaj:0xc07a4f,tmin:0xd08a5a,delt:0xc9705f,cbr:0x6f8fc4,bic:0xc9705f,brach:0xd08a5a,tric:0xc07a4f,flex:0xb56a8a,ext:0x5aa39a,sup:0x6f8fc4,then:0xc9705f,hypo:0xc9705f,other:0xc9a08f},
 // 原型的上臂（肱骨）約 3.5 單位長
 unit:g=>{const h=g('Right humerus');if(!h)return undefined;const {lo,hi}=box(h);return Math.hypot(hi[0]-lo[0],hi[1]-lo[1])/3.5;},
};
export const loadUpperLimbBody=(atlas:Atlas,signal:AbortSignal)=>loadBody(atlas,signal,config);

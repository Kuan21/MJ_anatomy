import type {Atlas,Part} from '../anatomy';

export type ArticulationRegion='shoulder'|'elbow'|'forearm'|'wrist'|'finger'|'hip'|'knee'|'ankle'|'toe'|'cervical'|'thoracic'|'lumbar';
export interface JointSpec{
 id:string;
 region:ArticulationRegion;
 type:'ball'|'hinge'|'pivot'|'condyloid'|'plane'|'spinal';
 dof:string[];
 limits:Record<string,[number,number]>;
}
export const HUMAN_JOINTS:JointSpec[]=[
 {id:'glenohumeral',region:'shoulder',type:'ball',dof:['flexion','abduction','rotation'],limits:{flexion:[-45,150],abduction:[0,145],rotation:[-25,35]}},
 {id:'elbow',region:'elbow',type:'hinge',dof:['flexion'],limits:{flexion:[0,135]}},
 {id:'radioulnar',region:'forearm',type:'pivot',dof:['rotation'],limits:{rotation:[-45,45]}},
 {id:'wrist',region:'wrist',type:'condyloid',dof:['flexion','deviation'],limits:{flexion:[-45,45],deviation:[-8,8]}},
 {id:'finger-mcp',region:'finger',type:'condyloid',dof:['flexion','abduction'],limits:{flexion:[-15,90],abduction:[-20,20]}},
 {id:'finger-pip',region:'finger',type:'hinge',dof:['flexion'],limits:{flexion:[0,105]}},
 {id:'finger-dip',region:'finger',type:'hinge',dof:['flexion'],limits:{flexion:[0,80]}},
 {id:'thumb-cmc',region:'finger',type:'condyloid',dof:['flexion','abduction','opposition'],limits:{flexion:[-15,45],abduction:[0,55],opposition:[0,50]}},
 {id:'hip',region:'hip',type:'ball',dof:['flexion','abduction','rotation'],limits:{flexion:[-20,80],abduction:[0,35],rotation:[-20,20]}},
 {id:'knee',region:'knee',type:'hinge',dof:['flexion'],limits:{flexion:[0,110]}},
 {id:'ankle',region:'ankle',type:'hinge',dof:['flexion'],limits:{flexion:[-30,20]}},
 {id:'toe-mtp',region:'toe',type:'condyloid',dof:['flexion','abduction'],limits:{flexion:[-35,45],abduction:[-10,10]}},
 {id:'toe-pip',region:'toe',type:'hinge',dof:['flexion'],limits:{flexion:[0,50]}},
 {id:'toe-dip',region:'toe',type:'hinge',dof:['flexion'],limits:{flexion:[0,45]}},
 {id:'cervical-spine',region:'cervical',type:'spinal',dof:['flexion','rotation','sideBend'],limits:{flexion:[-30,35],rotation:[-55,55],sideBend:[-25,25]}},
 {id:'thoracolumbar-spine',region:'lumbar',type:'spinal',dof:['flexion','rotation','sideBend'],limits:{flexion:[-15,42],rotation:[-24,24],sideBend:[-20,20]}},
];

export type DigitName='thumb'|'index'|'middle'|'ring'|'little'|'big toe'|'second toe'|'third toe'|'fourth toe'|'little toe';
export interface DigitChain{
 side:'left'|'right';
 kind:'finger'|'toe';
 digit:DigitName;
 metapodial?:Part;
 proximal?:Part;
 middle?:Part;
 distal?:Part;
}

const sideMatch=(name:string,side:'left'|'right')=>new RegExp(`\\b${side}\\b`,'i').test(name);
const digitPattern=(digit:DigitName)=>new RegExp(digit.replace(' ','\\s+'),'i');

export function discoverDigitChains(atlas:Atlas,side:'left'|'right',kind:'finger'|'toe'):DigitChain[]{
 const digits:DigitName[]=kind==='finger'?['thumb','index','middle','ring','little']:['big toe','second toe','third toe','fourth toe','little toe'];
 return digits.map(digit=>{
  const parts=atlas.parts.filter(p=>p.system==='skeletal'&&sideMatch(p.name,side)&&digitPattern(digit).test(p.name));
  const index=kind==='finger'?(['thumb','index','middle','ring','little'] as DigitName[]).indexOf(digit)+1:(['big toe','second toe','third toe','fourth toe','little toe'] as DigitName[]).indexOf(digit)+1;
  const metapodial=atlas.parts.find(p=>p.system==='skeletal'&&sideMatch(p.name,side)&&new RegExp(`${kind==='finger'?'metacarpal':'metatarsal'}`,'i').test(p.name)&&(
   new RegExp(`\\b${['first','second','third','fourth','fifth'][index-1]}\\b`,'i').test(p.name)
  ));
  return{
   side,kind,digit,metapodial,
   proximal:parts.find(p=>/proximal phalanx/i.test(p.name)),
   middle:parts.find(p=>/middle phalanx/i.test(p.name)),
   distal:parts.find(p=>/distal phalanx/i.test(p.name)),
  };
 });
}

export function articulationCoverage(atlas:Atlas){
 const chains=[
  ...discoverDigitChains(atlas,'left','finger'),...discoverDigitChains(atlas,'right','finger'),
  ...discoverDigitChains(atlas,'left','toe'),...discoverDigitChains(atlas,'right','toe')
 ];
 return{
  chains,
  completeFingerChains:chains.filter(c=>c.kind==='finger'&&c.metapodial&&c.proximal&&c.distal).length,
  completeToeChains:chains.filter(c=>c.kind==='toe'&&c.metapodial&&c.proximal&&c.distal).length,
 };
}

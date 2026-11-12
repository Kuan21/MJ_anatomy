// Typed access to the internal joint-motion table (app/data/joint-motion/joints.json).
// Data only: not wired into the UI or the 3D scene yet. The `check` and `note` fields are internal and must never be rendered.
import table from './data/joint-motion/joints.json';

export type MuscleSide='bilateral'|'ipsilateral'|'contralateral';
export type MuscleRole='primeMover'|'synergist'|'antagonist';
export interface MovementMuscle{muscle:string;side:MuscleSide}
export interface MovementRange{min:number;max:number;unit:'deg'|'mm';approximate:boolean}
export interface CodeMapping{limits:'head'|'spine'|'leg';key:'flexion'|'rotation'|'sideBend'|'knee'|'ankle';sign:1|-1}
export interface JointMovement{
 id:string;nameEn:string;nameZh:string;kind:'rotation'|'translation';
 /** Unit vector in the site frame: x left(+)/right(-), y up(+), z anterior(+). */
 axis:[number,number,number];
 /** [x,y,z] in atlas units, or null when no landmark has been derived yet. */
 pivot:[number,number,number]|null;pivotLandmark:string;
 range:MovementRange;
 primeMovers:MovementMuscle[];synergists:MovementMuscle[];antagonists:MovementMuscle[];
 /** Muscles that should take part but are absent from the site muscle facts. */
 unlistedMuscles:string[];
 codeMapping?:CodeMapping;
 /** Internal only. */check:string;note?:string;
}
export interface Joint{
 id:string;nameEn:string;nameZh:string;type:string;typeZh:string;paired:boolean;
 /** Atlas part names of the reference (fixed) side and the moving side. */
 proximal:string[];distal:string[];bodyRegionInCode:string|null;
 movements:JointMovement[];
}
export interface JointMotionTable{_doc:Record<string,unknown>;joints:Joint[]}

export const JOINT_MOTION_TABLE=table as unknown as JointMotionTable;
export const JOINTS:Joint[]=JOINT_MOTION_TABLE.joints;

export const jointById=(id:string):Joint|undefined=>JOINTS.find(j=>j.id===id);

const movementIndex=new Map<string,{joint:Joint;movement:JointMovement}>();
for(const joint of JOINTS)for(const movement of joint.movements)movementIndex.set(movement.id,{joint,movement});

export const movementById=(id:string):JointMovement|undefined=>movementIndex.get(id)?.movement;
export const jointOfMovement=(id:string):Joint|undefined=>movementIndex.get(id)?.joint;

export interface MuscleParticipation{movementId:string;jointId:string;role:MuscleRole;side:MuscleSide}
const norm=(s:string)=>s.toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();
const byMuscle=new Map<string,MuscleParticipation[]>();
for(const {joint,movement} of movementIndex.values()){
 const groups:[MuscleRole,MovementMuscle[]][]=[['primeMover',movement.primeMovers],['synergist',movement.synergists],['antagonist',movement.antagonists]];
 for(const [role,list] of groups)for(const m of list){
  const key=norm(m.muscle),arr=byMuscle.get(key)||[];
  arr.push({movementId:movement.id,jointId:joint.id,role,side:m.side});
  byMuscle.set(key,arr);
 }
}
/** Movements a muscle takes part in, with its role. Name uses the site muscle-facts key (case-insensitive). */
export const movementsForMuscle=(name:string):MuscleParticipation[]=>byMuscle.get(norm(name))||[];

/**
 * Eye movements of the eye detail atlas (left eye): what each extraocular muscle does from the primary position, and the resting
 * position of the eye when one of the three nerves to those muscles is paralysed. Angles are for display only: large enough to
 * read on screen, inside the normal range of the eye.
 * Axes of the atlas: +X lateral for the left eye, +Y up, +Z anterior.
 */
export interface EyeRotation {
 /** Degrees; positive turns the cornea laterally (abduction), negative medially (adduction). */
 abduct:number;
 /** Degrees; positive turns the cornea upward. */
 elevate:number;
 /** Degrees; positive rolls the top of the eye toward the nose (intorsion), negative away from it (extorsion). */
 intort:number;
}
export interface EyeMovement {
 id:string;
 kind:'muscle'|'palsy';
 name:string;
 zh:string;
 /** Short label for the button. */
 label:string;
 rotation:EyeRotation;
 /** Atlas ids of the muscle that produces the movement (kind 'muscle'). */
 muscles?:string[];
 /** Atlas ids of the muscles that no longer work (kind 'palsy'). */
 paralysed?:string[];
 /** Pupil diameter relative to normal. */
 pupil?:number;
 text:string;
 textZh:string;
}

export const EYE_MUSCLE_IDS={superiorRectus:'FJ1323',inferiorRectus:'FJ1295',medialRectus:'FJ1308',lateralRectus:'FJ1304',superiorOblique:'FJ1322',inferiorOblique:'FJ1294',levator:'FJ1306'} as const;
const M=EYE_MUSCLE_IDS;

export const EYE_MOVEMENTS:EyeMovement[] = [
 {id:'sr',kind:'muscle',label:'SR',name:'Superior rectus',zh:'上直肌',muscles:[M.superiorRectus],rotation:{abduct:-5,elevate:18,intort:6},
  text:'Elevation, with intorsion and adduction. Nerve: oculomotor nerve, superior branch.',textZh:'上轉，並帶有內旋與內收。神經：動眼神經上支。'},
 {id:'ir',kind:'muscle',label:'IR',name:'Inferior rectus',zh:'下直肌',muscles:[M.inferiorRectus],rotation:{abduct:-5,elevate:-18,intort:-6},
  text:'Depression, with extorsion and adduction. Nerve: oculomotor nerve, inferior branch.',textZh:'下轉，並帶有外旋與內收。神經：動眼神經下支。'},
 {id:'mr',kind:'muscle',label:'MR',name:'Medial rectus',zh:'內直肌',muscles:[M.medialRectus],rotation:{abduct:-20,elevate:0,intort:0},
  text:'Adduction. Nerve: oculomotor nerve, inferior branch.',textZh:'內收。神經：動眼神經下支。'},
 {id:'lr',kind:'muscle',label:'LR',name:'Lateral rectus',zh:'外直肌',muscles:[M.lateralRectus],rotation:{abduct:20,elevate:0,intort:0},
  text:'Abduction. Nerve: abducens nerve (not part of this model).',textZh:'外展。神經：外旋神經（本模型未包含）。'},
 {id:'so',kind:'muscle',label:'SO',name:'Superior oblique',zh:'上斜肌',muscles:[M.superiorOblique],rotation:{abduct:6,elevate:-10,intort:12},
  text:'Intorsion, with depression and abduction. Nerve: trochlear nerve.',textZh:'內旋，並帶有下轉與外展。神經：滑車神經。'},
 {id:'io',kind:'muscle',label:'IO',name:'Inferior oblique',zh:'下斜肌',muscles:[M.inferiorOblique],rotation:{abduct:6,elevate:10,intort:-12},
  text:'Extorsion, with elevation and abduction. Nerve: oculomotor nerve, inferior branch.',textZh:'外旋，並帶有上轉與外展。神經：動眼神經下支。'},
 {id:'cn3',kind:'palsy',label:'CN III',name:'Oculomotor nerve palsy',zh:'動眼神經麻痺',rotation:{abduct:20,elevate:-10,intort:0},pupil:1.6,
  paralysed:[M.superiorRectus,M.inferiorRectus,M.medialRectus,M.inferiorOblique,M.levator],
  text:'Only the lateral rectus and the superior oblique still work, so the eye rests turned down and out. The upper eyelid droops (levator palpebrae superioris), and when the parasympathetic fibres are involved the pupil is dilated and near focus is lost. The drooping eyelid is not drawn.',
  textZh:'只剩外直肌與上斜肌有作用，眼球靜止時偏向外下方。提上眼瞼肌麻痺使上眼瞼下垂；副交感纖維受影響時瞳孔放大、無法調節看近。模型沒有呈現下垂的眼瞼。'},
 {id:'cn4',kind:'palsy',label:'CN IV',name:'Trochlear nerve palsy',zh:'滑車神經麻痺',rotation:{abduct:0,elevate:8,intort:-6},paralysed:[M.superiorOblique],
  text:'The superior oblique no longer works, so the eye rests a little higher and rolled outward. Double vision is vertical and worst on looking down and inward, as when reading or going downstairs; tilting the head to the opposite side reduces it.',
  textZh:'上斜肌失去作用，眼球靜止時略為偏高並外旋。複視為垂直方向，向下並向內看時最明顯（例如閱讀或下樓梯）；頭傾向對側可以減輕。'},
 {id:'cn6',kind:'palsy',label:'CN VI',name:'Abducens nerve palsy',zh:'外旋神經麻痺',rotation:{abduct:-20,elevate:0,intort:0},paralysed:[M.lateralRectus],
  text:'The lateral rectus no longer works, so the eye rests turned inward and cannot be abducted. Double vision is horizontal and worst on looking toward the affected side.',
  textZh:'外直肌失去作用，眼球靜止時偏向內側，無法外展。複視為水平方向，向患側看時最明顯。'},
];

const rad=(degrees:number)=>degrees*Math.PI/180;
type Quaternion=[number,number,number,number];
const multiply=(a:Quaternion,b:Quaternion):Quaternion=>[
 a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],
 a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],
 a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],
 a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
const about=(axis:0|1|2,angle:number):Quaternion=>{const q:Quaternion=[0,0,0,Math.cos(angle/2)];q[axis]=Math.sin(angle/2);return q;};

/** Rotation of the globe as a quaternion [x, y, z, w]: horizontal turn, then vertical turn, then roll about the line of sight. */
export function gazeQuaternion(rotation:EyeRotation):Quaternion{
 return multiply(multiply(about(1,rad(rotation.abduct)),about(0,-rad(rotation.elevate))),about(2,rad(rotation.intort)));
}

/** Rotates a vector by a quaternion [x, y, z, w]. */
export function rotate(v:[number,number,number],q:Quaternion):[number,number,number]{
 const [x,y,z]=v,[qx,qy,qz,qw]=q;
 const tx=2*(qy*z-qz*y),ty=2*(qz*x-qx*z),tz=2*(qx*y-qy*x);
 return [x+qw*tx+qy*tz-qz*ty,y+qw*ty+qz*tx-qx*tz,z+qw*tz+qx*ty-qy*tx];
}

/** How far a point of a muscle or of the optic nerve follows the globe: 1 at its attachment, falling smoothly to 0 at `reach`. */
export function followWeight(distance:number,reach:number){
 const t=Math.max(0,1-distance/reach);
 return t*t*(3-2*t);
}

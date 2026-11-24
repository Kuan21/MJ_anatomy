/**
 * Openings of the bony orbit shown in the eye detail atlas. They are not separate models: scripts/build-eye-atlas.mjs records, for
 * each opening, the vertices of the bones around it (public/models/eye/eye-atlas.json, `openings`), and the viewer colours that part
 * of the bone surface. `contents` lists the atlas structures that pass through and exist in this model; `absent` names the ones the
 * model does not have.
 */
export interface EyeOpening {
 id:string;
 name:string;
 zh:string;
 /** Short label for the button. */
 label:string;
 color:string;
 contents:string[];
 text:string;
 textZh:string;
 absent:string;
 absentZh:string;
 /** Other Chinese name in use for the same opening. */
 aliasZh?:string;
 /** Where the "look at" button puts the camera: in front of the orbital margin instead of the default (anterolateral, looking into the orbit). */
 view?:'front';
 /** One line shown after "look at": where the camera is and what is on each side of the picture. */
 hintZh:string;
}

const APEX_HINT='目前由左眼眶的前外側看向眶尖：畫面左邊是鼻側，上方是眶頂，右邊是眼眶外側壁。';
const MEDIAL_HINT='目前由左眼眶的前外側看向眼眶內側壁：畫面左邊是鼻側，上方是眶頂。';

export const EYE_OPENINGS:EyeOpening[] = [
 {id:'optic-canal',label:'Optic canal',name:'Optic canal',zh:'視神經管',color:'#8a5bd6',contents:['FJ1313','FJ1695M'],
  text:'Short canal through the lesser wing of the sphenoid bone at the apex of the orbit, medial to the superior orbital fissure. It carries the optic nerve, with the ophthalmic artery below it, between the orbit and the middle cranial fossa.',
  textZh:'穿過蝶骨小翼的短管，位於眼眶尖端、上眶裂的內側。通過的有視神經，以及在它下方的眼動脈，往來於眼眶與中顱窩之間。',
  absent:'',absentZh:'',hintZh:APEX_HINT},
 {id:'superior-orbital-fissure',label:'Superior fissure',name:'Superior orbital fissure',zh:'上眶裂',aliasZh:'眶上裂',color:'#2f7fe0',contents:['FJ1321','FJ1293','FJ1330','FJ1300','FJ1290','FJ1310'],
  text:'Gap between the lesser and greater wings of the sphenoid bone, lateral to the optic canal. Through it pass the oculomotor nerve (superior and inferior branches), the trochlear nerve, the lacrimal, frontal and nasociliary nerves (the three branches of the ophthalmic nerve), the abducens nerve and the superior ophthalmic vein. Inside the common tendinous ring: both branches of the oculomotor nerve, the nasociliary nerve and the abducens nerve. Outside the ring: the lacrimal nerve, the frontal nerve, the trochlear nerve and the superior ophthalmic vein.',
  textZh:'蝶骨小翼與大翼之間的裂隙，位於視神經管的外側。通過的有動眼神經上支與下支、滑車神經、淚神經、額神經、鼻睫神經（後三條是眼神經的分支）、外旋神經與上眼靜脈。在總腱環內通過的：動眼神經上支與下支、鼻睫神經、外旋神經；在總腱環外通過的：淚神經、額神經、滑車神經、上眼靜脈。',
  absent:'Not in this model: abducens nerve, superior ophthalmic vein.',absentZh:'本模型沒有：外旋神經（又稱外展神經）、上眼靜脈。',hintZh:APEX_HINT},
 {id:'inferior-orbital-fissure',label:'Inferior fissure',name:'Inferior orbital fissure',zh:'下眶裂',aliasZh:'眶下裂',color:'#1f9d6b',contents:['infraorbital-nerve'],
  text:'Gap in the floor of the orbit between the greater wing of the sphenoid bone and the maxilla. It connects the orbit with the pterygopalatine and infratemporal fossae. Through it pass the infraorbital nerve and vessels, the zygomatic nerve, and branches of the inferior ophthalmic vein.',
  textZh:'眶底後部、蝶骨大翼與上頜骨之間的裂隙，使眼眶與翼顎窩、顳下窩相通。通過的有眶下神經與眶下血管、顴神經，以及下眼靜脈的分支。',
  absent:'Not in this model: infraorbital vessels, zygomatic nerve, inferior ophthalmic vein.',absentZh:'本模型沒有：眶下血管、顴神經、下眼靜脈。',hintZh:APEX_HINT},
 {id:'supraorbital-foramen',label:'Supraorbital',name:'Supraorbital foramen (notch)',zh:'眶上孔',aliasZh:'眶上切跡',color:'#d9822b',contents:['FJ1325'],view:'front',
  text:'Opening on the supraorbital margin of the frontal bone, about one third of the way from its medial end. In many skulls it is an open notch rather than a closed foramen. The supraorbital nerve and vessels leave the orbit through it and turn up onto the forehead.',
  textZh:'位於額骨眶上緣、約在內側三分之一與外側三分之二交界處的開口；不少顱骨上它沒有閉合成孔，而是一個切跡。眶上神經與眶上血管由這裡離開眼眶，轉向上方到前額。',
  absent:'Not in this model: supraorbital vessels.',absentZh:'本模型沒有：眶上血管。',hintZh:'目前由左眼眶的正前方看向眶上緣：畫面左邊是鼻側，上方是前額。'},
 {id:'infraorbital-foramen',label:'Infraorbital',name:'Infraorbital foramen',zh:'眶下孔',color:'#5b8f1a',contents:['infraorbital-nerve'],view:'front',
  text:'Opening on the front of the maxilla, about 1 cm below the infraorbital margin and roughly on the same vertical line as the supraorbital foramen. It is the front end of the infraorbital canal: the infraorbital nerve and vessels come out onto the face through it.',
  textZh:'位於上頜骨前面、眶下緣下方約 1 公分處的開口，大致與眶上孔在同一條垂直線上。它是眶下管的前端出口，眶下神經與眶下血管由這裡出到面部。',
  absent:'Not in this model: infraorbital vessels.',absentZh:'本模型沒有：眶下血管。',hintZh:'目前由左眼眶的正前方看向眶下緣下方：畫面左邊是鼻側，上方是眼眶。'},
 {id:'anterior-ethmoidal-foramen',label:'Ant. ethmoidal',name:'Anterior ethmoidal foramen',zh:'前篩孔',color:'#c2477f',contents:['FJ1283'],
  text:'Small opening in the medial wall of the orbit, on the suture between the frontal bone and the ethmoid bone. The anterior ethmoidal nerve, a branch of the nasociliary nerve, leaves the orbit through it with the anterior ethmoidal vessels, on the way to the anterior cranial fossa and then the nasal cavity.',
  textZh:'眼眶內側壁上的小孔，位於額骨與篩骨之間的骨縫上。前篩神經（鼻睫神經的分支）與前篩血管由這裡離開眼眶，先進入前顱窩，再到鼻腔。',
  absent:'Not in this model: anterior ethmoidal vessels.',absentZh:'本模型沒有：前篩血管。',hintZh:MEDIAL_HINT},
 {id:'posterior-ethmoidal-foramen',label:'Post. ethmoidal',name:'Posterior ethmoidal foramen',zh:'後篩孔',color:'#00a0bf',contents:['FJ1315'],
  text:'Small opening in the medial wall of the orbit, behind the anterior ethmoidal foramen on the same suture between the frontal bone and the ethmoid bone, a short distance in front of the optic canal. The posterior ethmoidal nerve and vessels pass through it to the posterior ethmoidal air cells and the sphenoidal sinus.',
  textZh:'眼眶內側壁上的小孔，與前篩孔位於同一條額骨與篩骨之間的骨縫上，在前篩孔的後方、視神經管的前方不遠處。後篩神經與後篩血管由這裡通往後篩竇與蝶竇。',
  absent:'Not in this model: posterior ethmoidal vessels.',absentZh:'本模型沒有：後篩血管。',hintZh:MEDIAL_HINT},
];

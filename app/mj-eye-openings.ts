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
}

export const EYE_OPENINGS:EyeOpening[] = [
 {id:'optic-canal',label:'Optic canal',name:'Optic canal',zh:'視神經管',color:'#8a5bd6',contents:['FJ1313','FJ1695M'],
  text:'Short canal through the lesser wing of the sphenoid bone at the apex of the orbit, medial to the superior orbital fissure. It carries the optic nerve, with the ophthalmic artery below it, between the orbit and the middle cranial fossa.',
  textZh:'穿過蝶骨小翼的短管，位於眼眶尖端、上眶裂的內側。通過的有視神經，以及在它下方的眼動脈，往來於眼眶與中顱窩之間。',
  absent:'',absentZh:''},
 {id:'superior-orbital-fissure',label:'Superior fissure',name:'Superior orbital fissure',zh:'上眶裂',aliasZh:'眶上裂',color:'#2f7fe0',contents:['FJ1321','FJ1293','FJ1330','FJ1300','FJ1290','FJ1310'],
  text:'Gap between the lesser and greater wings of the sphenoid bone, lateral to the optic canal. Through it pass the oculomotor nerve (superior and inferior branches), the trochlear nerve, the lacrimal, frontal and nasociliary nerves (the three branches of the ophthalmic nerve), the abducens nerve and the superior ophthalmic vein. Inside the common tendinous ring: both branches of the oculomotor nerve, the nasociliary nerve and the abducens nerve. Outside the ring: the lacrimal nerve, the frontal nerve, the trochlear nerve and the superior ophthalmic vein.',
  textZh:'蝶骨小翼與大翼之間的裂隙，位於視神經管的外側。通過的有動眼神經上支與下支、滑車神經、淚腺神經、額神經、鼻睫神經（後三條是眼神經的分支）、外旋神經與上眼靜脈。在總腱環內通過的：動眼神經上支與下支、鼻睫神經、外旋神經；在總腱環外通過的：淚腺神經、額神經、滑車神經、上眼靜脈。',
  absent:'Not in this model: abducens nerve, superior ophthalmic vein.',absentZh:'本模型沒有：外旋神經（又稱外展神經）、上眼靜脈。'},
 {id:'inferior-orbital-fissure',label:'Inferior fissure',name:'Inferior orbital fissure',zh:'下眶裂',aliasZh:'眶下裂',color:'#1f9d6b',contents:[],
  text:'Gap in the floor of the orbit between the greater wing of the sphenoid bone and the maxilla. It connects the orbit with the pterygopalatine and infratemporal fossae. Through it pass the infraorbital nerve and vessels, the zygomatic nerve, and branches of the inferior ophthalmic vein.',
  textZh:'眶底後部、蝶骨大翼與上頜骨之間的裂隙，使眼眶與翼顎窩、顳下窩相通。通過的有眶下神經與眶下血管、顴神經，以及下眼靜脈的分支。',
  absent:'Not in this model: infraorbital nerve and vessels, zygomatic nerve, inferior ophthalmic vein.',absentZh:'本模型沒有：眶下神經與眶下血管、顴神經、下眼靜脈。'},
];

import {Button} from '@/components/ui/button';

export interface MotionStructure {name:string;role:string}
export interface MotionAnatomy {bones:MotionStructure[];muscles:MotionStructure[]}

export const UPPER_ACTION_ANATOMY:Record<string,MotionAnatomy>={
 shoulderFlexion:{
  bones:[
   {name:'clavicle',role:'posterior rotation / elevation'},
   {name:'scapula',role:'upward rotation + protraction'},
   {name:'humerus',role:'flexes at glenohumeral joint'},
  ],
  muscles:[
   {name:'anterior deltoid',role:'shortens · prime mover'},
   {name:'clavicular part of pectoralis major',role:'shortens · assists flexion'},
   {name:'coracobrachialis',role:'shortens · assists'},
   {name:'biceps brachii',role:'assists shoulder flexion'},
   {name:'serratus anterior',role:'rotates/protracts scapula'},
   {name:'trapezius',role:'stabilises and upwardly rotates scapula'},
  ],
 },
 shoulderAbduction:{
  bones:[
   {name:'clavicle',role:'elevates / posteriorly rotates'},
   {name:'scapula',role:'upward rotation'},
   {name:'humerus',role:'abducts away from trunk'},
  ],
  muscles:[
   {name:'supraspinatus',role:'initiates abduction'},
   {name:'acromial part of deltoid',role:'shortens · prime mover'},
   {name:'serratus anterior',role:'upwardly rotates scapula'},
   {name:'trapezius',role:'upper/lower fibres rotate scapula'},
   {name:'latissimus dorsi',role:'lengthens / opposes abduction'},
   {name:'pectoralis major',role:'lengthens / adduction antagonist'},
  ],
 },
 elbowFlexion:{
  bones:[
   {name:'humerus',role:'proximal reference'},
   {name:'ulna',role:'flexes around trochlea'},
   {name:'radius',role:'follows forearm flexion'},
  ],
  muscles:[
   {name:'brachialis',role:'shortens · prime flexor'},
   {name:'biceps brachii',role:'shortens · flexion + supination'},
   {name:'brachioradialis',role:'shortens · strongest in neutral forearm'},
   {name:'triceps brachii',role:'lengthens · antagonist'},
  ],
 },
 forearmRotation:{
  bones:[
   {name:'ulna',role:'relative stable axis'},
   {name:'radius',role:'rotates around ulna'},
  ],
  muscles:[
   {name:'pronator teres',role:'shortens in pronation'},
   {name:'pronator quadratus',role:'shortens in pronation'},
   {name:'supinator',role:'shortens in supination'},
   {name:'biceps brachii',role:'powerful supinator when elbow flexed'},
  ],
 },
 wristExtension:{
  bones:[
   {name:'radius',role:'proximal wrist reference'},
   {name:'carpal',role:'extends as a linked row'},
   {name:'metacarpal',role:'follows carpal extension'},
  ],
  muscles:[
   {name:'extensor carpi radialis longus',role:'shortens · wrist extension'},
   {name:'extensor carpi radialis brevis',role:'shortens · wrist extension'},
   {name:'extensor carpi ulnaris',role:'shortens · extension + ulnar deviation'},
   {name:'flexor carpi radialis',role:'lengthens · antagonist'},
   {name:'flexor carpi ulnaris',role:'lengthens · antagonist'},
  ],
 },
};

export const BODY_ACTION_ANATOMY=(region:string,action:string):MotionAnatomy=>{
 if(region==='head'){
  if(action==='rotation')return{
   bones:[{name:'atlas',role:'C1 follows skull'},{name:'axis',role:'primary axial rotation pivot'},{name:'cervical vertebra',role:'distributed rotation'}],
   muscles:[{name:'sternocleidomastoid',role:'contralateral rotation'},{name:'splenius capitis',role:'ipsilateral rotation'},{name:'semispinalis capitis',role:'controls/stabilises'}],
  };
  if(action==='sideBend')return{
   bones:[{name:'cervical vertebra',role:'distributed lateral flexion'},{name:'skull',role:'follows upper cervical chain'}],
   muscles:[{name:'sternocleidomastoid',role:'ipsilateral side-bend'},{name:'scalene',role:'assists side-bend'},{name:'splenius capitis',role:'assists/stabilises'}],
  };
  return{
   bones:[{name:'cervical vertebra',role:'segmental flexion'},{name:'skull',role:'follows upper cervical chain'}],
   muscles:[{name:'longus colli',role:'shortens · deep flexor'},{name:'longus capitis',role:'shortens · deep flexor'},{name:'sternocleidomastoid',role:'bilateral flexion'},{name:'semispinalis capitis',role:'lengthens · extensor antagonist'}],
  };
 }
 if(region==='spine'){
  if(action==='rotation')return{
   bones:[{name:'lumbar vertebra',role:'small distributed rotation'},{name:'thoracic vertebra',role:'greater distributed rotation'},{name:'rib',role:'follows thoracic frame'},{name:'sternum',role:'follows rib cage'}],
   muscles:[{name:'external oblique',role:'contralateral rotation'},{name:'internal oblique',role:'ipsilateral rotation'},{name:'multifidus',role:'segmental control'},{name:'erector spinae',role:'stabilises'}],
  };
  if(action==='sideBend')return{
   bones:[{name:'lumbar vertebra',role:'segmental side-bend'},{name:'thoracic vertebra',role:'segmental side-bend'},{name:'rib',role:'follows thorax'}],
   muscles:[{name:'quadratus lumborum',role:'shortens ipsilaterally'},{name:'internal oblique',role:'assists side-bend'},{name:'external oblique',role:'assists side-bend'},{name:'erector spinae',role:'ipsilateral assistance'}],
  };
  return{
   bones:[{name:'lumbar vertebra',role:'larger share of flexion'},{name:'thoracic vertebra',role:'distributed flexion'},{name:'rib',role:'follows thoracic chain'},{name:'sternum',role:'follows rib cage'}],
   muscles:[{name:'rectus abdominis',role:'shortens · trunk flexion'},{name:'external oblique',role:'assists flexion'},{name:'internal oblique',role:'assists flexion'},{name:'erector spinae',role:'lengthens eccentrically'},{name:'multifidus',role:'segmental stabilisation'}],
  };
 }
 if(action==='knee')return{
  bones:[{name:'femur',role:'proximal reference'},{name:'tibia',role:'flexes posteriorly'},{name:'fibula',role:'follows tibia'},{name:'patella',role:'tracks femoral groove'}],
  muscles:[{name:'biceps femoris',role:'shortens · knee flexion'},{name:'semitendinosus',role:'shortens · knee flexion'},{name:'semimembranosus',role:'shortens · knee flexion'},{name:'quadriceps femoris',role:'lengthens · antagonist'}],
 };
 if(action==='ankle')return{
  bones:[{name:'tibia',role:'proximal reference'},{name:'fibula',role:'ankle mortise'},{name:'talus',role:'rocks within mortise'},{name:'calcaneus',role:'follows hindfoot'}],
  muscles:[{name:'tibialis anterior',role:'shortens · dorsiflexion'},{name:'extensor hallucis longus',role:'assists dorsiflexion'},{name:'gastrocnemius',role:'lengthens'},{name:'soleus',role:'lengthens'}],
 };
 if(action==='sideBend')return{
  bones:[{name:'hip bone',role:'pelvic reference'},{name:'femur',role:'abducts laterally'}],
  muscles:[{name:'gluteus medius',role:'shortens · prime abductor'},{name:'gluteus minimus',role:'shortens · assists'},{name:'tensor fasciae latae',role:'assists/stabilises'},{name:'adductor longus',role:'lengthens'}],
 };
 return{
  bones:[{name:'hip bone',role:'pelvic reference'},{name:'femur',role:'flexes at hip'}],
  muscles:[{name:'iliopsoas',role:'shortens · prime hip flexor'},{name:'rectus femoris',role:'assists hip flexion'},{name:'sartorius',role:'assists'},{name:'gluteus maximus',role:'lengthens · antagonist'}],
 };
};

export default function MotionAnatomyPanel({anatomy,onInspect}:{anatomy:MotionAnatomy;onInspect?:(name:string)=>void}){
 return <details className="motion-anatomy-panel">
  <summary>動作解剖 <span>骨骼 + 肌肉</span></summary>
  <div className="motion-anatomy-grid">
   <section><h4>骨骼變化</h4>{anatomy.bones.map((x,i)=><Button variant="ghost" key={x.name+i} onClick={()=>onInspect?.(x.name)}><span>{x.name}</span><small>{x.role}</small></Button>)}</section>
   <section><h4>肌肉變化</h4>{anatomy.muscles.map((x,i)=><Button variant="ghost" key={x.name+i} onClick={()=>onInspect?.(x.name)}><span>{x.name}</span><small>{x.role}</small></Button>)}</section>
  </div>
 </details>;
}

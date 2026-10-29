import {createNeckVessels,type NeckVesselData} from './biomechanics-v2/neck-vessels';
import {createJointAnatomy} from './biomechanics-v2/joint-anatomy';
import {useEffect,useRef} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {GLTFLoader,type GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createExplosionLayout} from './explosion-layout';
import {fetchModelBuffer,loadMissingChunks} from './model-download';
import {createAssetQueue} from './asset-queue';
import {prepareSurfaceNormals,updateSurfaceNormals} from './surface-normals';
import {PointerTap} from './pointer-tap';
import {framingDistance} from './camera-framing';
import {SYSTEMS,type Atlas,type SceneState} from './anatomy';
import {matchesMuscleLayer} from './mj-muscle-layers';
import {matchesFacialMuscleLayer} from './mj-facial-layers';
import {matchesHeartLayer,isShellSurface} from './mj-heart-layers';
import {clavicleLevel} from './mj-part-regions';
import {matchesSex} from './mj-sex';
import {serousLayerKey,PERITONEUM_KEYS} from './mj-serous';
import {matchesDepth} from './mj-depth';
import {anatomicalRegion,anatomicalSide,isMotionQuarantined} from './mj-part-regions';
import {isLinearBinding,lbsSkin,linearSkin,makeSoftRig,bindTissue,makePalette,deformTissue,deformPoint,followDeltoidSurface,setDeltoidFollowers,registerNerveRest,resolveNeurovascularProfile,tissueBindings,nerveBindings,type SkinBinding,type Profile,type DeltoidFollowers} from './biomechanics-v2/soft-tissue';
import {makeBodyRig,buildBodyMotion,bindBodyTissue,bindSpineCarrier,cranialNerveRigid,inferredLimb,type BodyRegion} from './biomechanics-v2/body-motion';
import {bindBodyPart,bodyPartRule} from './biomechanics-v2/body-part';
import {makeSurfaceConstraints,constrainSurface} from './biomechanics-v2/surface-constraints';
import {createSpaceOutline} from './space-outline';
import {GPU_SKIN_NORMAL,GPU_SKIN_PARS,GPU_SKIN_POSITION,PALETTE_WIDTH,clearGpuAttributes,gpuBinding,gpuSkinNormal,skinMode,writeGpuAttributes,writePalette,slotSkin,type GpuBinding} from './biomechanics-v2/gpu-skinning';
import {makeShoulderMuscles,solveShoulderMuscles,SHEET_PROFILES} from './biomechanics-v2/shoulder-muscles';
import shoulderLandmarks from './biomechanics-v2/shoulder-landmarks.json';
import bodyNerveData from './biomechanics-v2/body-nerve-bindings.json';
import blockedOverlay from './biomechanics-v2/blocked-overlay-meshes.json';
const blockedOverlayMeshes=new Set<string>(blockedOverlay.names);
import {nerveChunkScene,type NerveCatalogue} from './nerve-stream';
const bodyNerveBindings=bodyNerveData as Record<string,BodyRegion>;
export interface AnatomyLoadStatus {loaded:number;total:number;systems:Record<string,number>;failed:string[];busy:boolean;interactive:boolean;supplementaryPending:number}
// Selection colours: soft mint (#5DB89A) at 85 % strength; hover is a lighter tint of the same hue.
const SELECT_COLOR=0x5DB89A,HOVER_COLOR=0xA7DCCB;
interface Props {atlas:Atlas;state:SceneState;onSelect:(id:string)=>void;onSelectNerve?:(name:string)=>void;onProgress:(n:number)=>void;onLoadStatus?:(status:AnatomyLoadStatus)=>void;retryNonce?:number;onError:(s:string)=>void;onJointDrag?:(side:'left'|'right',joint:'shoulderAbduction'|'shoulderFlexion'|'elbowFlexion',delta:number)=>void;region?:'whole-body'|'shoulder'|'arm'|'forearm'|'hand';focusSide?:'both'|'left'|'right';motionActive?:boolean;jointMotionEnabled?:boolean;selectedExternalNerve?:string|null;bodyArea?:'whole'|'upper'|'lower'|'head'|'organs'}
export default function AnatomyScene({atlas,state,onSelect,onSelectNerve,onProgress,onLoadStatus,retryNonce=0,onError,onJointDrag,region='whole-body',focusSide='both',motionActive=false,jointMotionEnabled=false,selectedExternalNerve=null,bodyArea='whole'}:Props){
 const retryLoad=useRef<(()=>void)|null>(null);
 const host=useRef<HTMLDivElement>(null),latest=useRef(state),select=useRef(onSelect),selectNerve=useRef(onSelectNerve),selectedNerve=useRef<string|null>(selectedExternalNerve),jointDrag=useRef(onJointDrag),viewerContext=useRef({region,focusSide,motionActive,jointMotionEnabled,bodyArea});
 latest.current=state;select.current=onSelect;selectNerve.current=onSelectNerve;selectedNerve.current=selectedExternalNerve;jointDrag.current=onJointDrag;viewerContext.current={region,focusSide,motionActive,jointMotionEnabled,bodyArea};
 useEffect(()=>{
  const el=host.current!;let disposed=false,frame=0,dirty=true,ready=false,lastView='',lastReset=-1,lastIsolate='',layoutKey='',amount=0,lastCameraFocus=-1,autoFade:Set<string>|null=null,autoFadeDirty=false,nerveFocusWait=0;
  let lastState:SceneState|null=null;
  const abort=new AbortController();
  let workerAvailable=typeof Worker!=='undefined';
  const deviceNavigator=navigator as Navigator&{deviceMemory?:number};
  const coarseTouchDevice=navigator.maxTouchPoints>1&&(typeof matchMedia!=='function'||matchMedia('(pointer: coarse)').matches||matchMedia('(any-pointer: coarse)').matches);
  const constrainedDevice=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)||coarseTouchDevice||(deviceNavigator.deviceMemory??8)<=4;
  const cooperativeYield=()=>new Promise<void>(resolve=>setTimeout(resolve,0));
  let reportLoading=()=>{},supplementaryPending=0;
  type SupplementaryTask={task:()=>Promise<void>;onFailure:()=>void;label:string};
  const failedSupplementary:SupplementaryTask[]=[];
  let renderer:T.WebGLRenderer;
  const headCut=new T.Plane(new T.Vector3(0,1,0),-clavicleLevel(atlas.parts));
  try{renderer=new T.WebGLRenderer({antialias:!constrainedDevice,alpha:false,powerPreference:'high-performance'});}catch{onError('This browser could not start the 3D viewer. Please try a browser with WebGL enabled.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,constrainedDevice?1:innerWidth<768?1.5:2));renderer.setClearColor('#cbd2d6');renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;el.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Interactive human anatomy. Drag to orbit, pinch or scroll to zoom, and tap a structure to inspect it.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.005,100),controls=new OrbitControls(camera,renderer.domElement);
  type NerveMesh=T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>;
  const bodyRigs={head:makeBodyRig(atlas,'head'),spine:makeBodyRig(atlas,'spine'),leftLeg:makeBodyRig(atlas,'leftLeg'),rightLeg:makeBodyRig(atlas,'rightLeg')};
  const softRigs={left:makeSoftRig(atlas,'left'),right:makeSoftRig(atlas,'right')};
  const connectiveSide=(name:string):'left'|'right'|null=>/\bleft\b/i.test(name)?'left':/\bright\b/i.test(name)?'right':null;
  const connectiveProfile=(name:string):Profile|null=>{
   const n=name.toLowerCase();
   if(/glenohumeral|glenoid|labrum|shoulder capsule|acromioclavicular|coracoclavicular|coracoacromial|coracohumeral|transverse humeral/.test(n))return 'shoulderJoint';
   if(/elbow capsule|annular ligament|radial collateral|ulnar collateral/.test(n))return 'elbowJoint';
   if(/wrist|radiocarpal|ulnocarpal|intercarpal|carpometacarp|metacarpophalangeal|interphalangeal|retinaculum/.test(n))return 'wristJoint';
   return null;
  };
  // The whole-body atlas is the first useful view. Large supplementary GLBs
  // used to download and decode beside it, which could push iPad Safari over
  // its per-tab memory limit before the progress card disappeared.
  const supplementaryQueue=createAssetQueue(abort.signal,2);
  // Nerves and veins of the nerve layer are bound to the motion skeleton by weights that arrive in separate packages (skin weights, nerve packages).
  // Until every one of them has been applied they stay hidden, so a nerve never shows in an unweighted, wrongly placed state.
  const settling={nerves:0,skin:0};
  const settlingKey=(label:string):keyof typeof settling|null=>label.startsWith('周邊神經')?'nerves':label==='皮膚權重'?'skin':null;
  const nervesReady=()=>settling.nerves===0&&settling.skin===0;
  const scheduleSupplementary=(task:()=>Promise<void>,onFailure:()=>void,label='補充組織')=>{
   supplementaryPending++;reportLoading();
   const group=settlingKey(label);if(group)settling[group]++;
   supplementaryQueue.add(async()=>{
    if(disposed)return;
    let error:unknown;
    for(let attempt=0;attempt<2;attempt++){try{await task();error=undefined;break;}catch(e){error=e;if(disposed)return;}}
    if(error!==undefined){failedSupplementary.push({task,onFailure,label});console.warn(label+' unavailable',error);}
    supplementaryPending--;if(group)settling[group]--;lastState=null;dirty=true;reportLoading();await cooperativeYield();
   });
  };
  const fetchSupplementaryJson=async(path:string)=>JSON.parse(new TextDecoder().decode(await fetchModelBuffer(`${import.meta.env.BASE_URL}models/${path}`,0,path.endsWith('.gz'),abort.signal)));
  const cervicalVessels=createNeckVessels(atlas,scene);
  scheduleSupplementary(async()=>{const data=await fetchSupplementaryJson('neck-vessels.json.gz');if(disposed)return;cervicalVessels.add(data as NeckVesselData);lastState=null;dirty=true;},()=>onError('頸部血管模型未能載入，請重新整理。'));
  const supplementaryJoints=createJointAnatomy(atlas,scene);
  scheduleSupplementary(async()=>{const data=await fetchSupplementaryJson('articular-surfaces.json.gz');if(disposed)return;supplementaryJoints.addSurfaces(data as Parameters<typeof supplementaryJoints.addSurfaces>[0]);supplementaryJoints.update(latest.current,amount);dirty=true;},()=>onError('關節軟骨面載入失敗，請重新整理。'));
  // Skin (and any unbound fascia/lymphatic mesh in a limb) is weighted at build time over the same segment chain as
  // the bones, muscles and vessels (scripts/prepare-skin-weights.mjs); the shader blends those absolute palette slots.
  const surfaceBindings=new Map<string,GpuBinding>();
  scheduleSupplementary(async()=>{
   const data=await fetchSupplementaryJson('skin-weights.json.gz') as {parts:Record<string,{vertexCount:number;slots:string;weights:string}>};if(disposed)return;
   const decode=(text:string)=>Uint8Array.from(atob(text),c=>c.charCodeAt(0));
   for(const [id,w] of Object.entries(data.parts)){
    const slots=decode(w.slots),raw=decode(w.weights),values=new Uint16Array(raw.buffer,raw.byteOffset,raw.byteLength/2),weights=new Float32Array(values.length);
    for(let i=0;i<values.length;i++)weights[i]=values[i]/65535;
    if(slots.length!==w.vertexCount*4)continue;
    surfaceBindings.set(id,{side:null,indices:slots,weights,exact:true,lbs:true});
   }
   lastState=null;dirty=true;
  },()=>onError('皮膚權重載入失敗，請重新整理。'),'皮膚權重');
  // Special region range: boundaries and contents are highlighted only inside up to two spheres (one per side), fading out towards their edge.
  const rangeU={rangeA:{value:new T.Vector4()},rangeB:{value:new T.Vector4()},rangeN:{value:0}};
  const RANGE_FRAG='uniform vec4 rangeA; uniform vec4 rangeB; uniform float rangeN;\nfloat rangeMask(vec3 p){ float m=0.0; if(rangeN>0.5){ m=max(m,1.0-smoothstep(rangeA.w*0.55,rangeA.w,distance(p,rangeA.xyz))); } if(rangeN>1.5){ m=max(m,1.0-smoothstep(rangeB.w*0.55,rangeB.w,distance(p,rangeB.xyz))); } return m; }\n';
  const nerveRoot=new T.Group();nerveRoot.name='MJ external nervous system';scene.add(nerveRoot);const nerveMeshes:NerveMesh[]=[];
  const shoulderNerve=/brachial plexus|trunk of brachial plexus|division of .*brachial plexus|cord of brachial plexus|roots of brachial plexus|axillary nerve|suprascapular nerve|long thoracic nerve|thoracodorsal nerve|pectoral nerve|subscapular nerve|dorsal scapular nerve|subclavian nerve/i;
  const armNerve=/musculocutaneous nerve|radial nerve|median nerve|ulnar nerve|brachial cutaneous nerve|antebrachial cutaneous nerve|muscular branches of (radial|axillary|median|ulnar) nerve/i;
  const forearmNerve=/median nerve|ulnar nerve|radial nerve|antebrachial cutaneous nerve|interosseous nerve|superficial branch of radial nerve|deep branch of radial nerve|dorsal branch of ulnar nerve|palmar branch of (median|ulnar) nerve/i;
  const handNerve=/median nerve|ulnar nerve|radial nerve|palmar digital|dorsal digital|deep branch of ulnar nerve|superficial branch of ulnar nerve|palmar branch of (median|ulnar) nerve/i;
  const upperLimbNerve=new RegExp([shoulderNerve.source,armNerve.source,forearmNerve.source,handNerve.source].join('|'),'i');
  const nerveSide=(name:string)=>/\.r(?:\.|$)/i.test(name)?'right':/\.l(?:\.|$)/i.test(name)?'left':'both';
  // GLTFLoader sanitizes spaces/dots in Object3D.name. Preserve the source
  // node metadata for exact anatomical identity and laterality instead.
  const sourceName=(o:T.Object3D)=>typeof o.userData.name==='string'?o.userData.name:o.name;
  const meshSourceName=(o:T.Object3D)=>{let p:T.Object3D|null=o;while(p){if(typeof p.userData.name==='string')return p.userData.name;p=p.parent;}return o.name;};
  const nerveName=(o:T.Object3D)=>[sourceName(o),o.parent?sourceName(o.parent):'',o.parent?.parent?sourceName(o.parent.parent):''].filter(Boolean).join(' ');
  const hasNamedAncestor=(o:T.Object3D,pattern:RegExp)=>{let p:T.Object3D|null=o;while(p){if(pattern.test(sourceName(p)||''))return true;p=p.parent;}return false;};
  const nerveMatchesRegion=(name:string,r:'whole-body'|'shoulder'|'arm'|'forearm'|'hand',motion:boolean)=>{
   // Motion Lab is limb-focused: never reveal the rest of the whole-body
   // nervous system just because the global nervous-system layer is enabled.
   if(motion)return upperLimbNerve.test(name);
   if(r==='whole-body')return true;
   if(r==='shoulder')return shoulderNerve.test(name);
   if(r==='arm')return armNerve.test(name);
   if(r==='forearm')return forearmNerve.test(name);
   return handNerve.test(name);
  };
  const draco=new DRACOLoader();draco.setDecoderPath(`${import.meta.env.BASE_URL}draco/`);draco.setWorkerLimit(1);
  const gltfLoader=new GLTFLoader();gltfLoader.setDRACOLoader(draco);
  const loader={load(url:string,onLoad:(gltf:GLTF)=>void,_progress:unknown,onFailure:(error:unknown)=>void){
   void fetchModelBuffer(url,0,false,abort.signal).then(buffer=>gltfLoader.parseAsync(buffer,`${import.meta.env.BASE_URL}models/`)).then(gltf=>{if(!disposed)onLoad(gltf);}).catch(onFailure);
  }};
  scheduleSupplementary(()=>new Promise<void>((resolve,reject)=>loader.load(`${import.meta.env.BASE_URL}models/joints.glb`,gltf=>{if(disposed){resolve();return;}supplementaryJoints.addSliced(gltf.scene,cooperativeYield,()=>disposed).then(()=>{if(!disposed){supplementaryJoints.update(latest.current,amount);dirty=true;}resolve();},reject);},undefined,reject)),()=>onError('關節組織模型載入失敗，請重新整理。'));
  // A nerve package holds dozens of meshes; installing them in one task froze the page for ~2 s, so the work yields
  // to input and rendering every ~12 ms. The result is the same set of meshes.
  const installNerves=async(root:T.Group)=>{if(disposed)return;root.updateMatrixWorld(true);const sources:T.Mesh[]=[];root.traverse(o=>{if(o instanceof T.Mesh)sources.push(o);});
   let sliceStart=performance.now();
   for(const o of sources){
    if(performance.now()-sliceStart>12){await cooperativeYield();if(disposed)return;sliceStart=performance.now();}
    installNerve(o);
   }
   lastState=null;dirty=true;};
  const installNerve=(o:T.Mesh)=>{{
    const exactName=meshSourceName(o)||'',fullName=nerveName(o);
    // The source GLB contains a freestanding 3-D title at x≈-0.81. Remove it
    // deterministically, and never import central-nervous-system meshes from
    // this legacy overlay (the BodyParts3D atlas already owns the brain/CNS).
    if(/nervous system\s*&\s*sense organs/i.test(exactName))return;
    // Brain and brain-stem anatomy of this overlay (occipital cortex, vermis, medulla pyramids, nuclei) lies inside the skull: only the brain detail mode shows it.
    if(blockedOverlayMeshes.has(exactName))return;
    const spinalCordLike=/spinal cord|medulla spinalis/i.test(fullName);
    const cranialNerveLike=/optic nerve|oculomotor|trochlear|trigeminal|abducens|facial nerve|vestibulocochlear|glossopharyngeal|vagus|accessory nerve|hypoglossal|cranial nerve/i.test(fullName);
    if(!nerveBindings[exactName]&&!bodyNerveBindings[exactName]&&!spinalCordLike&&!/nerve|ganglion|ganglia|plexus|ramus|rami|sympathetic trunk/i.test(exactName))return;
    if(hasNamedAncestor(o,/central nervous system/i)&&!spinalCordLike)return;
    if(/brain|cerebr|cerebell|\bgyrus\b|lobule|\blobe\b|hemisphere|white matter|gray matter|cortex|corpus callosum|thalam|hypothalam|hippocamp|amygdal|caudate|putamen|globus pallidus|internal capsule|colliculus|geniculate|midbrain|pons|medulla oblongata|fornix|commissure|ventricle|choroid plexus|optic chiasm|optic tract|pituitary|pineal/i.test(fullName)&&!spinalCordLike)return;
    const geometry=o.geometry.clone();geometry.applyMatrix4(o.matrixWorld);geometry.computeBoundingBox();const geoCenter=geometry.boundingBox?.getCenter(new T.Vector3())??new T.Vector3(),geoSize=geometry.boundingBox?.getSize(new T.Vector3())??new T.Vector3();
    // Fallback for the title geometry even if a future exporter renames it.
    if(geoCenter.x<-.58&&geoCenter.y>.68&&geoCenter.y<1.12)return;
    // Some legacy CNS children have no useful anatomical node label. Reject
    // broad intracranial sheets by geometry as well, while retaining slender
    // cranial/peripheral nerves. The integrated brain model owns this volume.
    if(!nerveBindings[exactName]&&!bodyNerveBindings[exactName]&&geoCenter.y>1.46&&Math.abs(geoCenter.x)<.22&&!cranialNerveLike&&!spinalCordLike&&(geoSize.x>.028||geoSize.z>.028))return;
    geometry.boundingSphere=new T.Sphere(new T.Vector3(0,.9,0),2.5);const position=geometry.getAttribute('position');if(!position)return;const material=new T.MeshStandardMaterial({color:spinalCordLike?0xe8d9b8:0xf1cb4f,metalness:0,roughness:.42,emissive:spinalCordLike?0x493f2d:0x6b5100,emissiveIntensity:spinalCordLike?.10:.28,depthTest:true,depthWrite:true,transparent:false,opacity:1});geometry.computeBoundingBox();const nerveCenter=geometry.boundingBox?.getCenter(new T.Vector3())??new T.Vector3();
    const binding=nerveBindings[exactName];
    const mesh=new T.Mesh(geometry,material);mesh.name=exactName||fullName;mesh.frustumCulled=false;mesh.renderOrder=0;
    mesh.userData.mjNerve=true;mesh.userData.mjExactName=exactName;mesh.userData.mjVein=/vein|venous/i.test(exactName);mesh.userData.mjSide=binding?.side??nerveSide(exactName);
    if(binding&&softRigs[binding.side]){registerNerveRest(softRigs[binding.side]!,position.array as Float32Array);position.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingBox();}
    else geometry.computeVertexNormals();// once, and only for meshes that survived the filters above
    mesh.userData.basePositions=new Float32Array(position.array as ArrayLike<number>);
    if(binding&&softRigs[binding.side])mesh.userData.skin=bindTissue(softRigs[binding.side]!,resolveNeurovascularProfile(exactName,'path'),mesh.userData.basePositions,undefined,exactName);
    // Live drag preview: limb nerves carry the same palette weights as the anatomy meshes (other nerves stay on the identity slot).
    {const count=position.count,slots=new Uint8Array(count*4),weights=new Uint16Array(count*4);clearGpuAttributes(slots,weights,0,count);
     if(mesh.userData.skin&&binding)writeGpuAttributes(gpuBinding(binding.side,mesh.userData.skin),slots,weights,0);
     geometry.setAttribute('segIndex',new T.BufferAttribute(slots,4));geometry.setAttribute('segWeight',new T.BufferAttribute(weights,4,true));
     const flag={value:0};mesh.userData.previewFlag=flag;mesh.userData.baseNormals=new Float32Array(geometry.getAttribute('normal').array as ArrayLike<number>);
     const rangeFlag={value:0};mesh.userData.rangeFlag=rangeFlag;
     material.onBeforeCompile=shader=>{shader.uniforms.paletteState={value:paletteTexture};shader.uniforms.paletteWidth={value:PALETTE_WIDTH};shader.uniforms.nervePreview=flag;Object.assign(shader.uniforms,rangeU,{rangeSel:rangeFlag});
      // inside a special region's sphere a picked nerve glows with a bright outline; outside it fades back to pale
      shader.vertexShader='varying vec3 vRangePos;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvRangePos = transformed;');
      shader.fragmentShader='varying vec3 vRangePos; uniform float rangeSel;\n'+RANGE_FRAG+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat rangeM = rangeSel>0.5 ? rangeMask(vRangePos) : 1.0; diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.80,0.78,0.72), rangeSel*(1.0-rangeM)*0.65);');
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(1.0,0.78,0.1)*0.5*rangeSel*rangeM;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n{ float rimN = 1.0-abs(dot(normalize(vNormal),normalize(vViewPosition))); gl_FragColor.rgb += vec3(1.0,0.86,0.25)*pow(rimN,2.0)*0.55*rangeSel*rangeM; }');
      shader.vertexShader=GPU_SKIN_PARS+'uniform float nervePreview;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\n'+gpuSkinNormal('nervePreview'));
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n'+GPU_SKIN_POSITION);};}
    const inferredHeadNerve=/cervical|vagus|phrenic|hypoglossal|accessory|glossopharyngeal|ansa cervicalis|sympathetic trunk|superior cervical|middle cervical|inferior cervical/i.test(exactName);
    const limb=inferredLimb(geoCenter),bodyRegion=spinalCordLike?'head':bodyNerveBindings[exactName]??(inferredHeadNerve?'head':limb==='leftLeg'||limb==='rightLeg'?limb:undefined);
    if(bodyRegion){mesh.userData.bodyRegion=bodyRegion;mesh.userData.bodySkin=bindBodyTissue(bodyRigs[bodyRegion],mesh.userData.basePositions,spinalCordLike?false:cranialNerveRigid(exactName));}
    // Include otherwise unbound thoracic roots/rami in trunk motion. Long
    // head-to-thorax nerves use the continuous spinal field; articulated arm
    // nerves inherit the upper-thorax carrier.
    mesh.userData.spineSkin=mesh.userData.skin?bindSpineCarrier(bodyRigs.spine,mesh.userData.basePositions,mesh.userData.skin):bindBodyTissue(bodyRigs.spine,mesh.userData.basePositions,limb==='arm');
    nerveRoot.add(mesh);nerveMeshes.push(mesh);
   }};
  // Keep successful nerve packages when another one fails. No browser Draco
  // worker or monolithic GLB decode is needed for the peripheral nerve layer.
  scheduleSupplementary(async()=>{
   const [catalogue,followers]=await Promise.all([fetchSupplementaryJson('nerve-stream.json') as Promise<NerveCatalogue>,import('./biomechanics-v2/deltoid-nerve-followers.json')]);
   if(disposed)return;setDeltoidFollowers(followers.default.parts as unknown as DeltoidFollowers);
   catalogue.chunks.forEach((chunk,i)=>scheduleSupplementary(async()=>{
    const bytes=await fetchModelBuffer(`${import.meta.env.BASE_URL}${chunk.url.replace(/^\//,'')}`,chunk.bytes,true,abort.signal);
    const group=nerveChunkScene(chunk,bytes,false);
    try{await installNerves(group);}finally{group.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>m.dispose());}});}
   },()=>{},`周邊神經 ${i+1}/${catalogue.chunks.length}`));
  },()=>{},'周邊神經目錄');
  // The pinned Brain Project asset ships with the site. No runtime CDN or
  // silent model substitution: a failed load is reported to the user.
  const brainMotionRoot=new T.Group(),brainVisualRoot=new T.Group(),brainPickers:T.Mesh[]=[];
  brainMotionRoot.name='MJ integrated Brain Project';brainMotionRoot.matrixAutoUpdate=false;brainMotionRoot.visible=false;brainMotionRoot.add(brainVisualRoot);scene.add(brainMotionRoot);
  let brainRequested=false,brainLoaded=false;
  const brainTargetPattern=/cerebr|cerebell|brainstem|midbrain|pons|medulla oblongata|thalam|hypothalam|corpus callosum|hippocamp|amygdal|caudate|putamen|globus pallidus|internal capsule|fornix|ventricle|cortex|gyrus|lobule/i;
  const brainTargetBox=new T.Box3();
  atlas.parts.forEach(p=>{if(p.system==='nervous'&&brainTargetPattern.test(p.name))brainTargetBox.union(new T.Box3(new T.Vector3().fromArray(p.bounds[0]),new T.Vector3().fromArray(p.bounds[1])));});
  const brainAtlasCandidates=atlas.parts.filter(p=>p.system==='nervous'&&brainTargetPattern.test(p.name));
  const normalizeBrainName=(value:string)=>value.toLowerCase().replace(/brain project|right|left|bilateral|hemisphere|part of/gi,' ').replace(/[^a-z0-9]+/g,' ').trim();
  const brainAtlasIdFor=(label:string,category:string)=>{
   const target=normalizeBrainName(label+' '+category);
   if(!target)return brainAtlasCandidates[0]?.id;
   const tokens=new Set(target.split(' ').filter(t=>t.length>2));
   let bestId=brainAtlasCandidates[0]?.id,best=-1;
   for(const p of brainAtlasCandidates){
    const n=normalizeBrainName(p.name);
    let score=n===target?100:n.includes(target)||target.includes(n)?70:0;
    const pt=n.split(' ').filter(t=>t.length>2);
    let overlap=0;for(const t of pt)if(tokens.has(t))overlap++;
    score+=overlap*8-Math.abs(pt.length-tokens.size);
    if(score>best){best=score;bestId=p.id;}
   }
   return bestId;
  };
  const brainMaterials=new Map<string,T.MeshStandardMaterial>();
  const brainAppearance=(label:string,category:string)=>{
   const s=(label+' '+category).toLowerCase();
   if(/ventricle|aqueduct/.test(s))return{key:'ventricle',color:0x99bdc7,transparent:true,opacity:.22};
   if(/white matter|capsule|commissure|corpus callosum|fornix/.test(s))return{key:'white',color:0xe7ddd0,transparent:false,opacity:1};
   if(/cerebell/.test(s))return{key:'cerebellum',color:0xb86f68,transparent:false,opacity:1};
   if(/brainstem|midbrain|pons|medulla/.test(s))return{key:'brainstem',color:0xd39780,transparent:false,opacity:1};
   if(/deep|thalam|hypothalam|caudate|putamen|globus|amygdal|hippocamp/.test(s))return{key:'deep',color:0xc58d83,transparent:false,opacity:1};
   return{key:'cortex',color:0xc9857d,transparent:false,opacity:1};
  };
  const ensureBrain=()=>{
   if(brainRequested)return;brainRequested=true;
   scheduleSupplementary(()=>new Promise<void>((resolve,reject)=>{const brainUrls=[`${import.meta.env.BASE_URL}models/brain.glb`];let bi=0;
   const attempt=()=>loader.load(brainUrls[bi],gltf=>{
    if(disposed){resolve();return;}
    gltf.scene.updateMatrixWorld(true);
    const sourceBox=new T.Box3(),added:T.Mesh[]=[];
    gltf.scene.traverse(o=>{
     if(!(o instanceof T.Mesh))return;
     const label=String(o.userData?.bx_label||o.name||'Brain structure');
     const category=String(o.userData?.bx_cat||'');
     if(/arter|vein|cranial.?nerve|\bnerve\b|tracts?|fibres?/i.test(category+' '+label))return;
     const geometry=o.geometry.clone();geometry.applyMatrix4(o.matrixWorld);geometry.computeBoundingBox();geometry.computeVertexNormals();
     const appearance=brainAppearance(label,category);
     let material=brainMaterials.get(appearance.key);
     if(!material){material=new T.MeshStandardMaterial({color:appearance.color,roughness:.72,metalness:0,side:T.FrontSide,transparent:appearance.transparent,opacity:appearance.opacity,depthWrite:!appearance.transparent});brainMaterials.set(appearance.key,material);}
     const meshMaterial=material.clone();materials.push(meshMaterial);
     const mesh=new T.Mesh(geometry,meshMaterial);mesh.name='Brain Project · '+label;mesh.frustumCulled=false;mesh.userData.mjBrainProject=true;mesh.userData.mjBrainLabel=label;mesh.userData.mjAtlasId=brainAtlasIdFor(label,category);mesh.userData.mjBrainBaseColor=appearance.color;mesh.userData.mjBrainBaseOpacity=appearance.opacity;brainVisualRoot.add(mesh);brainPickers.push(mesh);added.push(mesh);
     if(geometry.boundingBox)sourceBox.union(geometry.boundingBox);
    });
    if(sourceBox.isEmpty()||brainTargetBox.isEmpty()||!added.length){brainVisualRoot.clear();brainPickers.length=0;resolve();return;}
    const sc=sourceBox.getCenter(new T.Vector3()),ss=sourceBox.getSize(new T.Vector3()),tc=brainTargetBox.getCenter(new T.Vector3()),ts=brainTargetBox.getSize(new T.Vector3());
    const scale=Math.min(ts.x/Math.max(ss.x,1e-6),ts.y/Math.max(ss.y,1e-6),ts.z/Math.max(ss.z,1e-6))*.97;
    brainVisualRoot.scale.setScalar(scale);brainVisualRoot.position.copy(tc).addScaledVector(sc,-scale);brainVisualRoot.updateMatrixWorld(true);
    brainLoaded=true;lastState=null;dirty=true;resolve();
   },undefined,err=>{bi++;if(bi<brainUrls.length)attempt();else reject(err);});attempt();}),()=>onError('腦模型載入失敗，請重新載入頁面。Brain Project model failed to load.'));
  };
  const updateBrainMotion=(s:SceneState)=>{
   const m=new T.Matrix4();
   if(s.bodyMotion?.region==='head'){const built=buildBodyMotion(bodyRigs.head,s.bodyMotion.pose);m.copy(built.matrices[built.matrices.length-1]);}
   else if(s.bodyMotion?.region==='spine'){const built=buildBodyMotion(bodyRigs.spine,s.bodyMotion.pose);m.copy(built.matrices[built.matrices.length-1]);}
   brainMotionRoot.matrix.copy(m);brainMotionRoot.matrixWorldNeedsUpdate=true;
  };
  const transformMatrix=(t:NonNullable<SceneState['partTransforms']>[string]|undefined)=>{const m=new T.Matrix4();if(!t)return m.identity();return m.compose(new T.Vector3(...t.translation),new T.Quaternion(...t.quaternion),new T.Vector3(1,1,1));};
  const updateNerveMotion=(s:SceneState)=>{
   const hosts=new Map<string,{base:Float32Array;posed:Float32Array}>();
   if(!s.bodyMotion&&s.tissueMotion)atlas.parts.forEach((part,i)=>{
    if(tissueBindings[part.id]?.profile!=='deltoid')return;
    const mesh=pickers[i],base=mesh?.userData.baseMotionPositions as Float32Array|undefined;
    const solved=s.partTransforms===completedPose?workerPositions.get(part.id):undefined;
    if(base&&(solved||mesh?.userData.tissuePosed))hosts.set(part.id,{base,posed:solved?.positions??mesh!.geometry.getAttribute('position').array as Float32Array});
   });
   const body=s.bodyMotion?buildBodyMotion(bodyRigs[s.bodyMotion.region],s.bodyMotion.pose):null;
   const palettes={left:softRigs.left?makePalette(softRigs.left,s.partTransforms??{}):null,right:softRigs.right?makePalette(softRigs.right,s.partTransforms??{}):null};
   for(const mesh of nerveMeshes){
    const base=mesh.userData.basePositions as Float32Array,skin=mesh.userData.skin as SkinBinding|undefined;
    const binding=nerveBindings[mesh.name],rig=binding?softRigs[binding.side]:null;
    const bodyActive=!!(body&&mesh.userData.bodySkin&&mesh.userData.bodyRegion===s.bodyMotion?.region);
    const spineCarry=!!(body&&s.bodyMotion?.region==='spine'&&mesh.userData.spineSkin);
    const limbActive=!!(!s.bodyMotion&&s.tissueMotion&&skin&&rig&&s.partTransforms?.[rig.ids[3]!]);
    // Drag preview: the nerve shader blends the rest shape with the live palette, so restore the rest shape once and stop.
    const flag=mesh.userData.previewFlag as {value:number}|undefined,previewing=!!(s.previewMotion&&limbActive&&flag);
    if(flag)flag.value=previewing?1:0;
    if(previewing){
     if(mesh.userData.tissuePosed){
      const attr=mesh.geometry.getAttribute('position') as T.BufferAttribute;(attr.array as Float32Array).set(base);attr.needsUpdate=true;
      const normal=mesh.geometry.getAttribute('normal') as T.BufferAttribute;(normal.array as Float32Array).set(mesh.userData.baseNormals);normal.needsUpdate=true;mesh.userData.tissuePosed=false;
     }
     continue;
    }
    const active=bodyActive||spineCarry||limbActive;
    if(!active&&!mesh.userData.tissuePosed)continue;
    const attr=mesh.geometry.getAttribute('position') as T.BufferAttribute;
    if(bodyActive)deformTissue(mesh.userData.bodySkin,base,body!.palette,attr.array as Float32Array);
    else if(spineCarry)deformTissue(mesh.userData.spineSkin,base,body!.palette,attr.array as Float32Array);
    else if(limbActive)deformTissue(skin!,base,palettes[binding.side]!,attr.array as Float32Array);
    else (attr.array as Float32Array).set(base);
    if(limbActive)followDeltoidSurface(mesh.name,base,attr.array as Float32Array,id=>hosts.get(id));
    mesh.userData.tissuePosed=active;
    attr.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();
   }
  };

  camera.position.set(1.4,1.05,3.6);controls.target.set(0,.85,0);controls.enableDamping=true;controls.dampingFactor=.085;controls.enablePan=true;controls.screenSpacePanning=true;controls.panSpeed=1;controls.zoomSpeed=1;controls.minDistance=.04;controls.maxDistance=40;controls.maxPolarAngle=Math.PI*.96;controls.mouseButtons.LEFT=T.MOUSE.PAN;controls.mouseButtons.RIGHT=T.MOUSE.ROTATE;controls.touches.ONE=T.TOUCH.PAN;controls.touches.TWO=T.TOUCH.DOLLY_ROTATE;let focusTarget:T.Vector3|null=null,focusPosition:T.Vector3|null=null;controls.addEventListener('start',()=>{focusTarget=null;focusPosition=null;});controls.addEventListener('change',()=>{dirty=true;});
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight(0xffffff,0xa7acb2,1.05));
  const key=new T.DirectionalLight(0xfffaf4,2.3);key.position.set(-2,4,3);scene.add(key);
  const rim=new T.DirectionalLight(0xe9f0ff,1.8);rim.position.set(2,2,-3);scene.add(rim);
  const width=T.MathUtils.ceilPowerOfTwo(atlas.parts.length),data=new Float32Array(width*4),partTexture=new T.DataTexture(data,width,1,T.RGBAFormat,T.FloatType);partTexture.needsUpdate=true;
  const selectedData=new Uint8Array(width*4),selectionTexture=new T.DataTexture(selectedData,width,1);selectionTexture.needsUpdate=true;
  // Pointer hover: the part under the cursor gets a lighter mint of the selection green (channel G of the selection texture).
  let hoverIndex=-1,hoverNerve:string|null=null,lastHoverAt=0;
  const setHover=(index:number,nerve:string|null)=>{
   if(index===hoverIndex&&nerve===hoverNerve)return;
   if(hoverIndex>=0)selectedData[hoverIndex*4+1]=0;
   hoverIndex=index;hoverNerve=nerve;if(index>=0)selectedData[index*4+1]=255;
   selectionTexture.needsUpdate=true;dirty=true;
  };
  const motionData=new Float32Array(width*4),motionTexture=new T.DataTexture(motionData,width,1,T.RGBAFormat,T.FloatType);motionTexture.needsUpdate=true;
  const rotationData=new Float32Array(width*4);for(let i=0;i<width;i++)rotationData[i*4+3]=1;
  const rotationTexture=new T.DataTexture(rotationData,width,1,T.RGBAFormat,T.FloatType);rotationTexture.needsUpdate=true;
  const anchorMotionData=new Float32Array(width*4),anchorMotionTexture=new T.DataTexture(anchorMotionData,width,1,T.RGBAFormat,T.FloatType);anchorMotionTexture.needsUpdate=true;
  const anchorRotationData=new Float32Array(width*4);for(let i=0;i<width;i++)anchorRotationData[i*4+3]=1;
  const anchorRotationTexture=new T.DataTexture(anchorRotationData,width,1,T.RGBAFormat,T.FloatType);anchorRotationTexture.needsUpdate=true;
  // GPU stage of biomechanics-v2 skinning: soft-rig palettes as dual quaternions (see gpu-skinning.ts).
  const paletteData=new Float32Array(PALETTE_WIDTH*4);writePalette(paletteData,{left:null,right:null});const paletteTexture=new T.DataTexture(paletteData,PALETTE_WIDTH,1,T.RGBAFormat,T.FloatType);paletteTexture.needsUpdate=true;
  const gpuBindings=new Map<string,GpuBinding>();let skinPalettes:Record<'left'|'right',Float64Array|null>={left:null,right:null},paletteVersion=0;
  const materials:T.Material[]=[],geometries:T.BufferGeometry[]=[],pickers:(T.Mesh|undefined)[]=[],centers=atlas.parts.map(p=>new T.Vector3().fromArray(p.bounds[0]).add(new T.Vector3().fromArray(p.bounds[1])).multiplyScalar(.5));
  const softP=new T.Vector3(),softA=new T.Vector3(),softB=new T.Vector3(),softD=new T.Vector3();
  const offsets:T.Vector3[]=[],bounds=atlas.parts.map(p=>new T.Box3(new T.Vector3().fromArray(p.bounds[0]),new T.Vector3().fromArray(p.bounds[1])));
  let packingWidth=1,packingHeight=1;
  const markerPositions=new Float32Array(atlas.parts.length*3),markerGeometry=new T.BufferGeometry();markerGeometry.setAttribute('position',new T.BufferAttribute(markerPositions,3));
  const markerMaterial=new T.PointsMaterial({color:0x64748b,size:5,sizeAttenuation:false,transparent:true,opacity:.72,depthTest:false});
  markerMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif (distance(gl_PointCoord, vec2(0.5)) > 0.5) discard;');};
  const markers=new T.Points(markerGeometry,markerMaterial);markers.frustumCulled=false;markers.renderOrder=10;markers.visible=false;scene.add(markers);
  const hover=document.createElement('div');hover.className='part-hover';hover.setAttribute('role','tooltip');hover.hidden=true;el.appendChild(hover);
  type Target={index:number;x:number;y:number;left:number;right:number;top:number;bottom:number};let targets:Target[]=[];
  const projected=new T.Vector3();
  const findTarget=(x:number,y:number,radius:number)=>{
   let best=-1,score=Infinity;
   for(const t of targets){const dx=Math.max(t.left-x,0,x-t.right),dy=Math.max(t.top-y,0,y-t.bottom),distance=Math.hypot(dx,dy);if(distance>radius)continue;const candidate=distance+Math.hypot(t.x-x,t.y-y)*.025;if(candidate<score){score=candidate;best=t.index;}}
   return best;
  };
  const smoothFade=!constrainedDevice;
  const materialFor=(system:string,shellOpacity?:number,overlay=false)=>{
   const m=new T.MeshStandardMaterial({color:SYSTEMS.find(s=>s.id===system)?.color??'#aebbb8',metalness:.08,roughness:.53,side:T.DoubleSide,transparent:system==='integumentary'||shellOpacity!==undefined,opacity:shellOpacity??(system==='integumentary'?.1:1),depthWrite:system!=='integumentary'&&shellOpacity===undefined});
   m.alphaToCoverage=smoothFade&&!m.transparent;
   m.onBeforeCompile=shader=>{
    shader.uniforms.partState={value:partTexture};shader.uniforms.paletteState={value:paletteTexture};shader.uniforms.paletteWidth={value:PALETTE_WIDTH};shader.uniforms.selectionState={value:selectionTexture};shader.uniforms.motionState={value:motionTexture};shader.uniforms.rotationState={value:rotationTexture};shader.uniforms.anchorMotionState={value:anchorMotionTexture};shader.uniforms.anchorRotationState={value:anchorRotationTexture};shader.uniforms.stateWidth={value:width};Object.assign(shader.uniforms,rangeU);shader.uniforms.maxSoftDisplacement={value:system==='arterial'||system==='venous'?.16:system==='muscular'?.24:1.0};
    shader.vertexShader=GPU_SKIN_PARS+'attribute float partIndex; attribute float motionWeight; uniform sampler2D partState; uniform sampler2D selectionState; uniform sampler2D motionState; uniform sampler2D rotationState; uniform sampler2D anchorMotionState; uniform sampler2D anchorRotationState; uniform float stateWidth; uniform float maxSoftDisplacement; varying float partVisible; varying float partSelected; varying float partHovered; varying float partFaded; varying float partLimited; varying vec3 vRangePos; vec3 qrot(vec4 q, vec3 v){ return v + 2.0*cross(q.xyz, cross(q.xyz,v)+q.w*v); }\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\n'+GPU_SKIN_NORMAL+'\nvec2 normalStateUv = vec2((partIndex + 0.5) / stateWidth, 0.5); vec4 normalRot = normalize(texture2D(rotationState,normalStateUv)); vec4 normalAnchorRot = normalize(texture2D(anchorRotationState,normalStateUv)); if(dot(normalAnchorRot,normalRot)<0.0) normalRot=-normalRot; vec4 normalBlend=normalize(mix(normalAnchorRot,normalRot,motionWeight)); objectNormal=qrot(normalBlend,objectNormal);');
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n'+GPU_SKIN_POSITION+'\nvec2 stateUv = vec2((partIndex + 0.5) / stateWidth, 0.5); vec4 state = texture2D(partState, stateUv); vec3 motion = texture2D(motionState,stateUv).xyz; vec4 rotation = normalize(texture2D(rotationState,stateUv)); vec3 anchorMotion = texture2D(anchorMotionState,stateUv).xyz; vec4 anchorRotation = normalize(texture2D(anchorRotationState,stateUv)); vec3 anchorPosition=qrot(anchorRotation,transformed)+anchorMotion; vec3 movingPosition=qrot(rotation,transformed)+motion; vec3 softDelta=movingPosition-anchorPosition; float softLen=length(softDelta); if(softLen>maxSoftDisplacement) softDelta*=maxSoftDisplacement/softLen; transformed=anchorPosition+softDelta*motionWeight+state.xyz; partVisible = state.w; partSelected = texture2D(selectionState, stateUv).r; partHovered = texture2D(selectionState, stateUv).g; partFaded = texture2D(selectionState, stateUv).b; partLimited = texture2D(selectionState, stateUv).a;');
    shader.fragmentShader='varying float partVisible; varying float partSelected; varying float partHovered; varying float partFaded; varying float partLimited; varying vec3 vRangePos;\n'+RANGE_FRAG+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif (partVisible < 0.5) discard;'+(smoothFade?'':'\n// Without multisampling (small or low-power devices) a faded part is drawn see-through with 30 % of the pixels of a 4x4 ordered pattern, so depth and sorting stay those of an opaque mesh.\nif (partFaded > 0.5) { float bx = mod(floor(gl_FragCoord.x), 4.0); float by = mod(floor(gl_FragCoord.y), 4.0); float t = (mod(bx * 4.0 + by * 7.0, 16.0) + 0.5) / 16.0; if (t > 0.30) discard; }'));
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n// The selection colour depends on the code stored in the selection texture: boundaries and tendons mint, arteries red, veins blue, nerves yellow, lymphatics green. A part limited to a special region is coloured only inside the sphere.\nfloat selCode = floor(partSelected * 255.0 + 0.5); float selOn = partSelected > 0.5 ? 1.0 : 0.0; float selM = partLimited > 0.5 ? rangeMask(vRangePos) : 1.0; float selAmt = selOn * selM; vec3 selCol = selCode >= 250.0 ? vec3(0.365, 0.722, 0.604) : selCode >= 215.0 ? vec3(0.85, 0.16, 0.16) : selCode >= 185.0 ? vec3(0.16, 0.42, 0.88) : selCode >= 155.0 ? vec3(0.98, 0.80, 0.12) : vec3(0.30, 0.70, 0.30);\ndiffuseColor.rgb = mix(diffuseColor.rgb, selCol, selAmt * 0.6); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.88), partFaded * 0.5);');
    // Selection: soft mint (#5DB89A) at 0.85, no outline; hover: lighter tint of the same hue. Applied after lighting so it reads on white and on red muscle.
    shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n{ if (selOn > 0.5) { gl_FragColor.rgb = mix(gl_FragColor.rgb, selCol, 0.85 * selAmt); if (selCode < 250.0) { float rimN = 1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))); gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0), pow(rimN, 3.0) * 0.55 * selAmt); } gl_FragColor.a = 1.0; } else if (partHovered > 0.5) { gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.655, 0.863, 0.796), 0.7); } }'+(smoothFade?'\n// A faded part is a smooth 30 % translucent surface: alpha-to-coverage on the multisampled buffer blends it without a dot pattern and keeps depth order exact.\nif (partFaded > 0.5) gl_FragColor.a = 0.3;':''));
    // A selected part is pulled slightly towards the camera (the shader equivalent of polygonOffset) so it shows whole where it overlaps neighbouring meshes.
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvRangePos = transformed;\nif (partSelected > 0.5) gl_Position.z -= 0.002 * gl_Position.w;');
    // The outline of a special region (spaceOutline) is made of vertices that carry the skin of the boundary meshes; it moves with them but takes no part in selection, hover or fade.
    if(overlay)shader.vertexShader=shader.vertexShader.replace('partSelected = texture2D(selectionState, stateUv).r; partHovered = texture2D(selectionState, stateUv).g; partFaded = texture2D(selectionState, stateUv).b; partLimited = texture2D(selectionState, stateUv).a;','partSelected = 0.0; partHovered = 0.0; partFaded = 0.0; partLimited = 0.0;');

   };materials.push(m);return m;
  };
  const mats=new Map<string,T.MeshStandardMaterial>(SYSTEMS.map(s=>[s.id,materialFor(s.id)]));
  // Organ-surface shells (lung lobes, serous membranes) are drawn translucent so the airways, vessels and heart inside stay visible.
  // The pelvic organs get one soft tone each, from the same hue family (the reproductive pink-mauve), so that uterus, cervix, ovary, tube, vagina, ligaments and the
  // external genitalia read apart; the bladder, ureters and urethra are amber and the rectum tan. [name test, key, colour, opacity]
  const PELVIC_TONES:[RegExp,string,string,number|undefined,string][]=[
   [/^(?:left |right )?(?:broad ligament|mesosalpinx|mesovarium)/i,'broad','#e9cdd2',.5,'reproductive'],
   [/ligament/i,'lig','#e4c4bd',undefined,'reproductive'],
   [/^(?:body|fundus) of uterus|^lower uterine segment|^uterine cornua|^uterus$/i,'uterus','#d79aa8',undefined,'reproductive'],
   [/^cervi|cervicovaginal/i,'cervix','#bd7a8b',undefined,'reproductive'],
   [/^vagina$|^vaginal/i,'vagina','#c98c97',undefined,'reproductive'],
   [/\bovary$/i,'ovary','#eec3c9',undefined,'reproductive'],
   [/uterine tube|fimbriae|ampulla of|isthmus of|infundibulum of/i,'tube','#dfa49a',undefined,'reproductive'],
   [/labi|clitor|vestibul|mons pubis|vulva|prepuce of clitoris/i,'vulva','#cf9488',undefined,'reproductive'],
   [/^urinary bladder$|trigone of urinary bladder|^(?:left |right )?ureter$|^female urethra$|^urethra$/i,'urinary','#dfbd6a',undefined,'urinary'],
   [/^rectum$/i,'rectum','#c7a27c',undefined,'digestive']
  ];
  const pelvicTone=(p:{name:string;system:string})=>PELVIC_TONES.find(t=>t[4]===p.system&&t[0].test(p.name));
  const shellOf=(p:{name:string;system:string;kind?:string})=>p.system==='serous'&&PERITONEUM_KEYS.includes(serousLayerKey(p.name))?'serous:peritoneum':pelvicTone(p)?'pelvic:'+pelvicTone(p)![1]:p.kind==='space'||p.kind==='sheath'?'connective:space':p.kind==='fascia'||p.kind==='aponeurosis'?'connective:fascia':p.kind==='surface'?'respiratory:mark':isShellSurface(p.name)?p.system+':shell':p.system;
  {const lungMat=materialFor('respiratory',.32);lungMat.color.set('#d9a29d');lungMat.roughness=.62;lungMat.metalness=0;mats.set('respiratory:shell',lungMat);}mats.set('serous:shell',materialFor('serous',.28));
  {const pm=materialFor('serous',.3);pm.color.set('#e8b7c0');mats.set('serous:peritoneum',pm);for(const [,key,color,opacity,sys] of PELVIC_TONES){const m=materialFor(sys,opacity);m.color.set(color);mats.set('pelvic:'+key,m);}}
  // Course-summary structures: spaces and sheaths are faint volumes, fasciae thin translucent sheets, lung surface marks a deeper tint of the lung colour.
  mats.set('connective:space',materialFor('connective',.2));mats.set('connective:fascia',materialFor('connective',.62));{const mark=materialFor('respiratory');mark.color.set('#c97b8b');mats.set('respiratory:mark',mark);}
  const renderBatches:{mesh:T.Mesh;parts:{index:number;offset:number;geometry:T.BufferGeometry}[];mask:string}[]=[];
  const updateVisibleBatches=()=>{
   for(const batch of renderBatches){
    const visible=batch.parts.filter(p=>data[p.index*4+3]>.5),mask=visible.map(p=>p.index).join(',');
    batch.mesh.visible=visible.length>0;
    if(mask===batch.mask)continue;batch.mask=mask;
    const index=batch.mesh.geometry.index!;let count=0;
    for(const part of visible){const source=part.geometry.index!.array;for(let j=0;j<source.length;j++)index.array[count++]=source[j]+part.offset;}
    batch.mesh.geometry.setDrawRange(0,count);
    if(count){index.clearUpdateRanges();index.addUpdateRange(0,count);index.needsUpdate=true;}
   }
  };
  
  const smoothstep=(t:number)=>{const x=T.MathUtils.clamp(t,0,1);return x*x*(3-2*x);};
  const vertexMotionWeight=(p:(typeof atlas.parts)[number],x:number,y:number,z:number)=>{
   const name=p.name.toLowerCase(),min=p.bounds[0],max=p.bounds[1],cy=(min[1]+max[1])*.5,dy=Math.max(1e-5,max[1]-min[1]),dx=Math.max(1e-5,max[0]-min[0]);
   const right=(min[0]+max[0])*.5<0;
   const lateral=right?(max[0]-x)/dx:(x-min[0])/dx;

   // Blood vessels are blended using shared anatomical height bands rather
   // than each little mesh's local endpoints. Adjacent arterial/venous pieces
   // therefore receive compatible motion and no longer look severed.
   if(p.system==='arterial'||p.system==='venous'){
    if(cy>1.30)return smoothstep((1.42-y)/.18);      // trunk -> shoulder
    if(cy>1.08)return smoothstep((1.30-y)/.24);      // shoulder -> elbow
    if(cy>.88)return smoothstep((1.10-y)/.24);       // elbow -> forearm
    if(cy>.80)return smoothstep((.88-y)/.10);        // forearm -> hand
    return 1;
   }

   // Deltoid and long upper-limb muscles retain their proximal attachment and
   // increasingly follow the distal insertion. This stops the deltoid from
   // lifting away as one rigid lump when the arm elevates.
   if(/deltoid|biceps brachii|triceps brachii|\bbrachialis\b|coracobrachialis|brachioradialis|pronator|supinator|flexor|extensor|palmaris/.test(name)){
    return smoothstep((((max[1]-y)/dy)-.04)/.92);
   }

   // Pectoralis major should keep almost all of its broad sternal/rib origin
   // on the chest. Only the lateral humeral insertion is allowed to travel
   // strongly with the arm, which keeps the ribs covered during elevation.
   if(/pectoralis major/.test(name))return smoothstep((lateral-.70)/.24);
   if(/latissimus dorsi/.test(name))return smoothstep((lateral-.76)/.18);

   // Rotator cuff and scapular muscles blend from their medial/trunk origin to
   // the lateral scapular/humeral attachment.
   if(/pectoralis minor|serratus anterior|trapezius|rhomboid|levator scapulae|subclavius|supraspinatus|infraspinatus|subscapularis|teres major|teres minor/.test(name)){
    return smoothstep((lateral-.12)/.78);
   }
   void z;
   return 1;
  };
  const resolveModelUrl=(url:string)=>url.startsWith('/')?`${import.meta.env.BASE_URL}${url.slice(1)}`:url;
  const loadedChunks=new Set<number>(),loadingChunks=new Set<number>(),failedChunks=new Map<number,string>();
  const warmBindings:T.Mesh[]=[];let warmHandle:number|undefined;
  const warmNext=()=>{
   warmHandle=undefined;if(disposed)return;
   // One tissue per idle turn. A first drag should not build a whole limb's
   // bindings and shading workspace synchronously.
   warmBindings.shift()?.userData.prepareMotion?.('upper');
   if(warmBindings.length)scheduleWarm();
  };
  const scheduleWarm=()=>{if(warmHandle!==undefined)return;warmHandle=typeof window.requestIdleCallback==='function'?window.requestIdleCallback(warmNext,{timeout:1000}):window.setTimeout(warmNext,0);};
  const chunkParts=atlas.chunks.map(()=>[] as {p:(typeof atlas.parts)[number];i:number}[]);
  atlas.parts.forEach((p,i)=>chunkParts[p.chunk]?.push({p,i}));
  const deltoidCore=/deltoid/i,shoulderMuscle=/supraspinatus|infraspinatus|subscapularis|teres (?:major|minor)/i;
  const shoulderBone=/\b(?:humerus|scapula|clavicle)\b/i;
  const chunkPriority=(ci:number)=>chunkParts[ci].reduce((score,{p})=>score+
   (p.system==='muscular'&&deltoidCore.test(p.name)?50000:0)+
   (p.system==='muscular'&&shoulderMuscle.test(p.name)?10000:0)+
   (p.system==='skeletal'&&shoulderBone.test(p.name)?10000:0)+
   (p.system==='skeletal'?5:p.system==='muscular'?3:0),0);
  const eagerChunks=atlas.chunks.map((_,i)=>i).filter(i=>!atlas.chunks[i].deferUntil);
  // Start with the supporting skeleton, then cover missing tissue systems.
  // A muscle-only first package must never masquerade as a complete atlas.
  const initialSystems=['skeletal','muscular','arterial','venous','nervous','connective'];
  const orderedChunks:number[]=[],coveredSystems=new Set<string>();
  while(eagerChunks.length){
   eagerChunks.sort((a,b)=>{
    const score=(ci:number)=>!orderedChunks.length?chunkParts[ci].filter(({p})=>p.system==='skeletal').length:
     new Set(chunkParts[ci].filter(({p})=>initialSystems.includes(p.system)&&!coveredSystems.has(p.system)).map(({p})=>p.system)).size*1e6+chunkPriority(ci);
    return score(b)-score(a);
   });
   const ci=eagerChunks.shift()!;orderedChunks.push(ci);chunkParts[ci].forEach(({p})=>coveredSystems.add(p.system));
  }
  let primaryAtlasReady=false,loadBusy=false;
  const requestedChunks=new Set(orderedChunks);
  reportLoading=()=>{
   if(disposed)return;
   const loadedParts=atlas.parts.filter(p=>loadedChunks.has(p.chunk)),primaryCount=loadedParts.filter(p=>requestedChunks.has(p.chunk)).length;
   const totalPrimary=atlas.parts.filter(p=>requestedChunks.has(p.chunk)).length;
   const systems:Record<string,number>={};loadedParts.forEach(p=>{systems[p.system]=(systems[p.system]??0)+1;});
   const failed=[...failedChunks.values(),...failedSupplementary.map(item=>`${item.label} 未完成`)];
   const complete=primaryCount===totalPrimary&&supplementaryPending===0&&failed.length===0;
   onProgress(complete?100:Math.min(99,Math.floor(primaryCount/Math.max(1,totalPrimary)*100)));
   onLoadStatus?.({loaded:primaryCount,total:totalPrimary,systems,failed,busy:loadBusy||supplementaryPending>0,interactive:ready,supplementaryPending});
  };
  const loadChunk=async(ci:number)=>{
   if(loadedChunks.has(ci)||loadingChunks.has(ci))return;
   loadingChunks.add(ci);
   const chunk=atlas.chunks[ci];
   try{
   // Streaming decompression avoids keeping two full files in memory and
   // halves the transfer size, including on iPad. Raw remains the fallback.
   const compressed=!!chunk.gzip&&typeof DecompressionStream!=='undefined';
   let buffer:ArrayBuffer;
   try{buffer=await fetchModelBuffer(resolveModelUrl(compressed?chunk.gzip!:chunk.url),chunk.bytes,compressed,abort.signal);}
   catch(firstError){
    if(disposed||abort.signal.aborted)throw firstError;
    if(!compressed)throw firstError;
    buffer=await fetchModelBuffer(resolveModelUrl(chunk.url),chunk.bytes,false,abort.signal);
   }
   if(disposed)return;
   const groups=new Map<string,T.BufferGeometry[]>(),pendingPickers=new Map<number,T.Mesh>();let partOrdinal=0;
   for(const {p,i} of chunkParts[ci]){
    const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(buffer,p.positions,p.vertexCount*3),3));
    // GPU normalized signed-short normals keep the complete atlas compact in memory.
    g.setAttribute('normal',new T.BufferAttribute(new Int16Array(buffer,p.normals,p.vertexCount*3),3,true));g.setIndex(new T.BufferAttribute(new Uint32Array(buffer,p.indices,p.indexCount),1));
    const position=g.getAttribute('position') as T.BufferAttribute,weights=new Float32Array(p.vertexCount);let variableWeights=false;
    for(let vi=0;vi<p.vertexCount;vi++){const weight=vertexMotionWeight(p,position.getX(vi),position.getY(vi),position.getZ(vi));weights[vi]=weight;if(weight<.999)variableWeights=true;}
    g.setAttribute('motionWeight',new T.BufferAttribute(weights,1));
    g.boundingBox=bounds[i].clone();g.computeBoundingSphere();const pick=new T.Mesh(g);pick.matrixAutoUpdate=false;pick.userData.partSystem=p.system;
    const ensureMotionBase=()=>{pick.userData.baseMotionNormals??=(g.getAttribute('normal').array as Int16Array).slice();return pick.userData.baseMotionPositions??(pick.userData.baseMotionPositions=new Float32Array(position.array as ArrayLike<number>));};
    // Building fibre bindings and sheet constraints is for motion, not for
    // opening the atlas. Keep the first static view inexpensive and complete.
    const preparedModes=new Set<string>();
    const bodyPrepared=new Map<string,ReturnType<typeof bindBodyPart>>();
    pick.userData.prepareMotion=(mode='upper')=>{
    if(mode!=='upper'){
     if(!bodyPrepared.has(mode))bodyPrepared.set(mode,bindBodyPart(p,ensureMotionBase(),bodyRigs[mode as BodyRegion],softRigs));
     const binding=bodyPrepared.get(mode);
     pick.userData.bodySkin=binding?.skin;pick.userData.bodyRegion=mode;
     const guards=pick.userData.bodyGuards??=(new Map());
     if(binding?.guard&&!guards.has(mode))guards.set(mode,makeSurfaceConstraints(ensureMotionBase(),g.index!.array,binding.skin));
     pick.userData.bodySurfaceGuard=guards.get(mode);
     if(binding)prepareSurfaceNormals(g);
     return;
    }
    if(preparedModes.has(mode))return;
    preparedModes.add(mode);
    if(variableWeights){ensureMotionBase();pick.userData.motionWeights=weights;}
    const binding=tissueBindings[p.id];
    const canonicalRegion=anatomicalRegion(p),canonicalSide=anatomicalSide(p);
    const bindingSide=binding?(canonicalSide==='midline'?binding.side:canonicalSide):null;
    const rig=bindingSide?softRigs[bindingSide]:null;
    // A curated attachment can cross the display-region boundary: subclavian
    // and thoracic vessels still need their proximal-to-distal blend. Lower
    // limbs and quarantined source meshes must never enter an arm rig.
    if(binding?.name===p.name&&rig&&(canonicalRegion==='upper-limb'||canonicalRegion==='trunk')&&!isMotionQuarantined(p)){
     const profile=(p.system==='arterial'||p.system==='venous')?resolveNeurovascularProfile(p.name,binding.profile):binding.profile;
     pick.userData.skin=bindTissue(rig,profile,ensureMotionBase(),p,'',g.index!.array);
     pick.userData.tissueSide=bindingSide;
    }
    if(!pick.userData.skin&&p.system==='connective'&&canonicalRegion==='upper-limb'&&!isMotionQuarantined(p)){
     const side=canonicalSide==='midline'?connectiveSide(p.name):canonicalSide,profile=connectiveProfile(p.name),jointRig=side?softRigs[side]:null;
     if(side&&profile&&jointRig){
      pick.userData.skin=bindTissue(jointRig,profile,ensureMotionBase(),p);
      pick.userData.tissueSide=side;pick.userData.mjJointBinding=profile;
     }
    }

    if(pick.userData.skin&&['chest','scapular'].includes(pick.userData.skin.profile)&&!pick.userData.surfaceGuard)
     pick.userData.surfaceGuard=makeSurfaceConstraints(ensureMotionBase(),g.index!.array,pick.userData.skin);
    if(pick.userData.skin||pick.userData.bodySkin||pick.userData.spineSkin)prepareSurfaceNormals(g);
    };
    pendingPickers.set(i,pick);geometries.push(g);
    g.setAttribute('partIndex',new T.BufferAttribute(new Float32Array(p.vertexCount).fill(i),1));
    const key=shellOf(p),list=groups.get(key)??[];list.push(g);groups.set(key,list);
    partOrdinal++;
    if(partOrdinal%12===0)await cooperativeYield();
   }
   groups.forEach((gs,system)=>{const geometry=mergeGeometries(gs,false);if(!geometry)throw new Error('Could not assemble anatomy geometry.');geometries.push(geometry);let vertexOffset=0;
    const parts:{index:number;offset:number;geometry:T.BufferGeometry}[]=[];
    for(const g of gs){const index=g.getAttribute('partIndex').getX(0),pick=pendingPickers.get(index)!;pick.userData.mergedGeometry=geometry;pick.userData.mergedOffset=vertexOffset;parts.push({index,offset:vertexOffset,geometry:g});vertexOffset+=g.getAttribute('position').count;g.deleteAttribute('partIndex');g.deleteAttribute('motionWeight');pickers[index]=pick;}
    geometry.index!.setUsage(T.DynamicDrawUsage);for(const key of ['position','normal'])(geometry.getAttribute(key) as T.BufferAttribute).setUsage(T.DynamicDrawUsage);
    const mesh=new T.Mesh(geometry,mats.get(system as never));mesh.frustumCulled=false;scene.add(mesh);renderBatches.push({mesh,parts,mask:'pending'});});
   for(const [i,pick] of pendingPickers)if((!workerAvailable&&tissueBindings[atlas.parts[i].id])||(atlas.parts[i].system==='connective'&&anatomicalRegion(atlas.parts[i])==='upper-limb'))warmBindings.push(pick);
   if(warmBindings.length)scheduleWarm();
   loadedChunks.add(ci);failedChunks.delete(ci);lastState=null;ready=true;dirty=true;reportLoading();
   }finally{loadingChunks.delete(ci);}
  };
  let supplementaryReleased=false;
  const loadAllMissing=async()=>{
   if(loadBusy||disposed)return;
   loadBusy=true;reportLoading();
   const missing=[...requestedChunks].filter(ci=>!loadedChunks.has(ci));
   await loadMissingChunks(missing,loadChunk,abort.signal,(ci,error)=>{failedChunks.set(ci,`組織包 ${ci+1}: ${error instanceof Error?error.message:'載入失敗'}`);reportLoading();},constrainedDevice?2:3);
   if(disposed)return;
   primaryAtlasReady=orderedChunks.every(ci=>loadedChunks.has(ci));
   if(!supplementaryReleased){supplementaryReleased=true;supplementaryQueue.start();}
   // Failed packages are retried independently; success never gets discarded.
   const retryTasks=failedSupplementary.splice(0);retryTasks.forEach(({task,onFailure,label})=>scheduleSupplementary(task,onFailure,label));
   await supplementaryQueue.drain();
   loadBusy=false;reportLoading();dirty=true;
   // A head request can arrive while the baseline is downloading. Finish
   // that request using the same serialized loader instead of losing it.
   if([...requestedChunks].some(ci=>!loadedChunks.has(ci)&&!failedChunks.has(ci)))void loadAllMissing();
  };
  retryLoad.current=()=>{void loadAllMissing();};
  void loadAllMissing();
  const shoulderGroups=new Map<string,{meshes:T.Mesh[];model:ReturnType<typeof makeShoulderMuscles>}>();
  // Keep the full attachment/volume solve off the pointer/render thread.
  // At most one solve is in flight; intermediate pointer events are coalesced.
  // Bones, muscles and neurovascular followers commit the same completed pose.
  let shoulderWorker:Worker|null=null,workerBusy=false,workerInitialized=false,workerGeneration=0;
  let submittedPose:SceneState['partTransforms'],submittedCount=0,completedPose:SceneState['partTransforms'],collisionSent=false;
  let submittedBody:SceneState['bodyMotion'],completedBody:SceneState['bodyMotion'];
  let workerPositions=new Map<string,import('./biomechanics-v2/shoulder-worker').ShoulderResult>();
  const workerParts=new Set<string>();
  // Live preview while a pose is being dragged: bones follow the latest input at once and tissue is skinned on the GPU from
  // the binding weights the worker handed over. A full solve starts only when no new pose has arrived for PREVIEW_QUIET_MS
  // (the slider/drag was released) and replaces the preview atomically when it completes.
  const PREVIEW_QUIET_MS=150;
  let previewReady=false,lastWantedPose:SceneState['partTransforms'],lastPoseInput=0;
  const poseForFrame=(wanted:SceneState):SceneState=>{
   const active=!!(workerAvailable&&(wanted.bodyMotion||(wanted.tissueMotion&&(wanted.visible.includes('muscular')||wanted.visible.includes('nervous'))&&Object.keys(wanted.partTransforms??{}).length)));
   if(!active){if(completedPose||submittedPose||completedBody||submittedBody){workerGeneration++;completedPose=undefined;submittedPose=undefined;completedBody=undefined;submittedBody=undefined;workerPositions.clear();}return wanted;}
   if(!shoulderWorker){try{shoulderWorker=new Worker(new URL('./biomechanics-v2/shoulder-worker.ts',import.meta.url),{type:'module'});}catch{workerAvailable=false;return wanted;}}
   if(wanted.partTransforms!==lastWantedPose){lastWantedPose=wanted.partTransforms;lastPoseInput=performance.now();}
   const canPreview=previewReady&&!wanted.bodyMotion,quiet=performance.now()-lastPoseInput>=PREVIEW_QUIET_MS;
   if(!workerBusy&&(!canPreview||quiet)&&(submittedPose!==wanted.partTransforms||submittedBody!==wanted.bodyMotion||submittedCount!==loadedChunks.size)){
    workerBusy=true;submittedPose=wanted.partTransforms;submittedBody=wanted.bodyMotion;submittedCount=loadedChunks.size;
    const pose=submittedPose,bodyMotion=submittedBody,generation=workerGeneration;
    const inputs:import('./biomechanics-v2/shoulder-worker').ShoulderInput[]=[];
    atlas.parts.forEach((part,i)=>{
     const binding=tissueBindings[part.id],mesh=pickers[i];
     if(!mesh||workerParts.has(part.id))return;
     if(bodyMotion?!bodyPartRule(part,bodyRigs[bodyMotion.region]):(!binding||binding.name!==part.name||isMotionQuarantined(part)||!['upper-limb','trunk'].includes(anatomicalRegion(part))))return;
     mesh.userData.baseMotionPositions??=(mesh.geometry.getAttribute('position').array as Float32Array).slice();
     mesh.userData.baseMotionNormals??=(mesh.geometry.getAttribute('normal').array as Int16Array).slice();
     inputs.push({part,base:mesh.userData.baseMotionPositions.slice(),normals:mesh.userData.baseMotionNormals.slice(),triangles:(mesh.geometry.index!.array as Uint32Array).slice()});workerParts.add(part.id);
    });
    shoulderWorker!.onmessage=event=>{
     workerBusy=false;if(disposed)return;
     if(event.data.error){console.warn('Motion worker failed; using local solver',event.data.error);shoulderWorker?.terminate();shoulderWorker=null;workerAvailable=false;previewReady=false;lastState=null;dirty=true;return;}
     // Linear bindings arrive once and are skinned on the GPU from then on.
     for(const g of (event.data.gpu??[]) as import('./biomechanics-v2/shoulder-worker').GpuSkinResult[]){gpuBindings.set(g.id,gpuBinding(g.side,g,g.exact,g.lbs));previewReady=true;}
     if(generation===workerGeneration){completedPose=pose;completedBody=bodyMotion;workerPositions=new Map(event.data.results.map((r:import('./biomechanics-v2/shoulder-worker').ShoulderResult)=>[r.id,r]));dirty=true;}
    };
    shoulderWorker!.onerror=()=>{workerBusy=false;shoulderWorker?.terminate();shoulderWorker=null;workerAvailable=false;previewReady=false;lastState=null;dirty=true;};
    // Once the whole bony thorax is loaded, hand the worker its surface samples so broad shoulder sheets cannot sink into the chest.
    let collision:Float32Array|undefined;
    if(!collisionSent){
     const bony=atlas.parts.map((part,i)=>({part,mesh:pickers[i]})).filter(({part})=>part.system==='skeletal'&&/\b(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) rib$|manubrium|body of sternum|xiphoid process|thoracic vertebra$/i.test(part.name));
     if(bony.length>=36&&bony.every(({mesh})=>!!mesh)){
      const samples:number[]=[];
      for(const {mesh} of bony){const a=mesh!.geometry.getAttribute('position').array as Float32Array,source=(mesh!.userData.baseMotionPositions??a) as Float32Array;for(let k=0;k<source.length;k+=6)samples.push(source[k],source[k+1],source[k+2]);}
      collision=Float32Array.from(samples);collisionSent=true;
     }
    }
    shoulderWorker!.postMessage({atlas:workerInitialized?undefined:atlas,inputs,transforms:pose??{},bodyMotion,collision},[...inputs.flatMap(input=>[input.base.buffer,input.normals.buffer,input.triangles.buffer]),...(collision?[collision.buffer]:[])]);workerInitialized=true;
   }
   if(canPreview&&!(completedPose===wanted.partTransforms&&completedBody===wanted.bodyMotion))return {...wanted,previewMotion:true};
   return {...wanted,partTransforms:completedPose,bodyMotion:completedBody};
  };
  const updateTissueMotion=(s:SceneState)=>{
   // Prepare the active limb only. Building every head/leg/spine binding on
   // the first shoulder input used to block pointer handling for seconds.
   // A drag preview is all GPU: binding anything on the main thread here would defeat it.
   if(!s.previewMotion&&(s.bodyMotion||Object.keys(s.partTransforms??{}).length))for(const [i,mesh] of pickers.entries()){
    const p=atlas.parts[i],binding=tissueBindings[p.id];
    if(s.partTransforms===completedPose&&s.bodyMotion===completedBody&&workerPositions.has(p.id))continue;
    if(!s.bodyMotion&&gpuBindings.get(p.id)?.exact)continue;
    if(s.bodyMotion||s.partTransforms?.[p.id]||(binding&&softRigs[binding.side]&&s.partTransforms?.[softRigs[binding.side]!.ids[3]!]))mesh?.userData.prepareMotion?.(s.bodyMotion?.region??'upper');
   }
   const touched=new Set<T.Mesh>(),normalsReady=new Set<T.Mesh>();
   const enabled=new Set(s.visible),focused=s.focusParts?new Set(s.focusParts):null,hidden=new Set(s.hiddenParts??[]);
   const body=s.bodyMotion?buildBodyMotion(bodyRigs[s.bodyMotion.region],s.bodyMotion.pose):null;
   const palettes={left:softRigs.left?makePalette(softRigs.left,s.partTransforms??{}):null,right:softRigs.right?makePalette(softRigs.right,s.partTransforms??{}):null};
   // The palette carries the displayed pose: the worker-completed one, or the live drag pose while previewing.
   const legActive=!!body&&(s.bodyMotion!.region==='leftLeg'||s.bodyMotion!.region==='rightLeg');
   writePalette(paletteData,palettes,{left:legActive&&s.bodyMotion!.region==='leftLeg'?body!.palette:null,right:legActive&&s.bodyMotion!.region==='rightLeg'?body!.palette:null});paletteTexture.needsUpdate=true;skinPalettes=palettes;paletteVersion++;
   for(const [index,mesh] of pickers.entries()){
    const part=atlas.parts[index];
    if(!mesh)continue;
    if(!enabled.has(part.system)&&!(enabled.has('nervous')&&tissueBindings[part.id]?.profile==='deltoid')){mesh.userData.gpuSkinned=false;mesh.userData.skinMode=0;continue;}
    // Linear bindings: one dual-quaternion blend per vertex, done by the shader (gpu-skinning.ts).
    const localSkin=mesh.userData.skin as SkinBinding|undefined;
    if(!s.bodyMotion&&!gpuBindings.has(part.id)&&localSkin&&mesh.userData.tissueSide&&isLinearBinding(localSkin))gpuBindings.set(part.id,gpuBinding(mesh.userData.tissueSide,localSkin));
    const live=!!s.previewMotion;
    const surface=surfaceBindings.get(part.id),gpu=surface??(s.bodyMotion?undefined:gpuBindings.get(part.id)),gpuRig=gpu?.side?softRigs[gpu.side]:null;
    mesh.userData.gpuSkinned=surface?!!(s.tissueMotion&&(legActive||(!s.bodyMotion&&Object.keys(s.partTransforms??{}).length>0))):!!(gpu&&(gpu.exact||live)&&gpuRig&&s.tissueMotion&&s.partTransforms?.[gpuRig.ids[3]!]&&!s.partTransforms?.[part.id]);
    mesh.userData.skinMode=skinMode(gpu,mesh.userData.gpuSkinned);
    if(mesh.userData.gpuSkinned){
     if(mesh.userData.tissuePosed||mesh.userData.workerPosed){
      (mesh.geometry.getAttribute('position').array as Float32Array).set(mesh.userData.baseMotionPositions);
      if(mesh.userData.baseMotionNormals)(mesh.geometry.getAttribute('normal').array as Int16Array).set(mesh.userData.baseMotionNormals);
      mesh.geometry.boundingBox!.copy(bounds[index]);mesh.geometry.boundingBox!.getBoundingSphere(mesh.geometry.boundingSphere!);
      mesh.userData.tissuePosed=false;mesh.userData.workerPosed=false;touched.add(mesh);normalsReady.add(mesh);
     }
     if(!mesh.userData.gpuWritten){
      const merged=mesh.userData.mergedGeometry as T.BufferGeometry,offset=mesh.userData.mergedOffset as number;
      // Created on first use, so loading the atlas pays nothing for the GPU stage. Unset vertices stay on the identity slot.
      if(!merged.getAttribute('segIndex')){const count=merged.getAttribute('position').count,a=new Uint8Array(count*4),b=new Uint16Array(count*4);clearGpuAttributes(a,b,0,count);merged.setAttribute('segIndex',new T.BufferAttribute(a,4));merged.setAttribute('segWeight',new T.BufferAttribute(b,4,true));}
      const slots=merged.getAttribute('segIndex') as T.BufferAttribute,weights=merged.getAttribute('segWeight') as T.BufferAttribute;
      writeGpuAttributes(gpu!,slots.array as Uint8Array,weights.array as Uint16Array,offset);
      for(const a of [slots,weights]){a.addUpdateRange(offset*4,part.vertexCount*4);a.needsUpdate=true;}
      mesh.userData.gpuWritten=true;
     }
     continue;
    }
    const solved=(s.tissueMotion||s.bodyMotion)&&s.partTransforms===completedPose&&s.bodyMotion===completedBody?workerPositions.get(part.id):undefined;
    if(solved){
     (mesh.geometry.getAttribute('position').array as Float32Array).set(solved.positions);
     (mesh.geometry.getAttribute('normal').array as Int16Array).set(solved.normals);
     mesh.geometry.boundingBox!.set(new T.Vector3().fromArray(solved.bounds[0]),new T.Vector3().fromArray(solved.bounds[1]));
     mesh.geometry.boundingBox!.getBoundingSphere(mesh.geometry.boundingSphere!);
     mesh.userData.tissuePosed=true;mesh.userData.workerPosed=true;touched.add(mesh);normalsReady.add(mesh);continue;
    }
    if(live)continue;// no GPU binding yet: keep its last shape rather than solving on the main thread mid-drag
    if(mesh.userData.workerPosed){
     (mesh.geometry.getAttribute('position').array as Float32Array).set(mesh.userData.baseMotionPositions);
     (mesh.geometry.getAttribute('normal').array as Int16Array).set(mesh.userData.baseMotionNormals);
     mesh.geometry.boundingBox!.copy(bounds[index]);mesh.geometry.boundingBox!.getBoundingSphere(mesh.geometry.boundingSphere!);
     mesh.userData.tissuePosed=false;mesh.userData.workerPosed=false;touched.add(mesh);normalsReady.add(mesh);
    }
    const skin=mesh.userData.skin as SkinBinding|undefined;
    // A hidden shoulder head still participates in its mechanical group.
    // Visibility/focus controls rendering, not the shape of its neighbours.
    const shoulderParticipant=!s.bodyMotion&&s.tissueMotion&&skin&&(skin.fibre||['deltoid','cuff'].includes(skin.profile)||(SHEET_PROFILES.includes(skin.profile)&&!skin.wrap&&part.system==='muscular'));
    if(!shoulderParticipant&&(hidden.has(part.id)||(focused&&!focused.has(part.id))))continue;
    if(!skin&&!mesh.userData.bodySkin&&!mesh.userData.spineSkin&&!mesh.userData.tissuePosed)continue;
    const side=mesh.userData.tissueSide as 'left'|'right',rig=softRigs[side];
    const bodyActive=!!(body&&mesh.userData.bodySkin&&mesh.userData.bodyRegion===s.bodyMotion?.region);
    const spineCarry=!!(body&&s.bodyMotion?.region==='spine'&&mesh.userData.spineSkin);
    const active=bodyActive||spineCarry||!!(!s.bodyMotion&&skin&&s.tissueMotion&&rig&&s.partTransforms?.[rig.ids[3]!]);
    if(!active&&!mesh.userData.tissuePosed)continue;
    touched.add(mesh);
    const attr=mesh.geometry.getAttribute('position') as T.BufferAttribute,base=mesh.userData.baseMotionPositions as Float32Array;
    normalsReady.delete(mesh);
    if(bodyActive)deformTissue(mesh.userData.bodySkin,base,body!.palette,attr.array as Float32Array);else if(spineCarry)deformTissue(mesh.userData.spineSkin,base,body!.palette,attr.array as Float32Array);else if(active)deformTissue(skin!,base,palettes[side]!,attr.array as Float32Array);else (attr.array as Float32Array).set(base);
    const guard=bodyActive?mesh.userData.bodySurfaceGuard:active&&!spineCarry?mesh.userData.surfaceGuard:null;if(guard)constrainSurface(guard,attr.array as Float32Array);
    mesh.userData.tissuePosed=active;
   }
   if(!shoulderWorker&&!s.bodyMotion&&s.tissueMotion&&(enabled.has('muscular')||enabled.has('nervous')))for(const side of ['left','right'] as const){
    const rig=softRigs[side],palette=palettes[side];if(!rig||!palette)continue;
    const groups=new Map<string,T.Mesh[]>();
    for(const mesh of pickers){
     if(!mesh?.userData.tissuePosed||mesh.userData.tissueSide!==side)continue;
     const profile=mesh.userData.skin?.profile;if(!mesh.userData.skin?.fibre&&!['deltoid','cuff'].includes(profile)&&!(SHEET_PROFILES.includes(profile)&&!mesh.userData.skin?.wrap&&mesh.userData.partSystem==='muscular'))continue;
     const key=['deltoid','biceps','triceps'].includes(profile)?`${side}:${profile}`:mesh.uuid;
     const list=groups.get(key)??[];list.push(mesh);groups.set(key,list);
    }
    const head=deformPoint(rig.shoulder,[0,0,0,1,0,0,0],palette);
    for(const [key,meshes] of groups){
     let entry=shoulderGroups.get(key);
     if(!entry||entry.meshes.length!==meshes.length||entry.meshes.some((m,i)=>m!==meshes[i])){
      entry={meshes,model:makeShoulderMuscles(meshes.map(m=>({base:m.userData.baseMotionPositions,triangles:m.geometry.index!.array,skin:m.userData.skin,positions:m.geometry.getAttribute('position').array as Float32Array})),rig.shoulder,shoulderLandmarks.sides[side].headRadius)};
      shoulderGroups.set(key,entry);
     }
     solveShoulderMuscles(entry.model,head);
    }
   }
   for(const mesh of touched){
    const attr=mesh.geometry.getAttribute('position') as T.BufferAttribute;
    attr.needsUpdate=true;if(!normalsReady.has(mesh)){updateSurfaceNormals(mesh.geometry);mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();}
    const merged=mesh.userData.mergedGeometry as T.BufferGeometry,offset=mesh.userData.mergedOffset*3;
    for(const key of ['position','normal']){const to=merged.getAttribute(key) as T.BufferAttribute,source=mesh.geometry.getAttribute(key).array;to.array.set(source,offset);to.addUpdateRange(offset,source.length);to.needsUpdate=true;}
   }
  };
  const fit=(view:string,extent=0)=>{
   const aspect=camera.aspect,mobile=el.clientWidth<768,normalDistance=mobile?Math.max(4.5,1.8*el.clientHeight/Math.max(160,el.clientHeight-350)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))):4.2;
   const reservedHeight=mobile?350:270;const availableAspect=Math.max(.35,(el.clientWidth-(mobile?40:340))/Math.max(160,el.clientHeight-reservedHeight));const atlasDistance=Math.max(packingHeight,packingWidth/availableAspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*(el.clientHeight/Math.max(160,el.clientHeight-reservedHeight))*1.08;
   const distance=T.MathUtils.lerp(normalDistance,Math.max(.2,atlasDistance),extent);if(extent>.8)view='front';
   const direction=view==='front'?new T.Vector3(0,.02,1):view==='back'?new T.Vector3(0,.02,-1):view==='side'?new T.Vector3(1,.02,0):new T.Vector3(.35,.06,1).normalize();
   controls.target.set(extent>.1&&el.clientWidth>767?-packingWidth*.12:0,extent>.1||mobile?.85:.93,0);camera.position.copy(controls.target).addScaledVector(direction,distance);controls.update();dirty=true;
  };
  const resize=()=>{layoutKey='';lastState=null;lastCameraFocus=-1;camera.clearViewOffset();renderer.setPixelRatio(Math.min(devicePixelRatio,constrainedDevice?1:el.clientWidth<768||el.clientHeight<600?1.5:2));camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);fit(latest.current.view,amount);};const observer=new ResizeObserver(resize);observer.observe(el);
  // Labels of a picked special region: one small label per boundary / content structure, joined by a thin line to the point of the structure nearest the middle of the region.
  const labelLayer=document.createElement('div');labelLayer.className='space-labels';labelLayer.setAttribute('aria-hidden','true');el.appendChild(labelLayer);
  const labelSvg=document.createElementNS('http://www.w3.org/2000/svg','svg');labelSvg.setAttribute('class','space-label-lines');labelLayer.appendChild(labelSvg);
  type LabelItem={anchor:T.Vector3;centre:T.Vector3;box:HTMLDivElement;line:SVGLineElement;content:boolean;color?:string};
  let labelKey='',labelItems:LabelItem[]=[],labelMissing=0,labelRetries=0,labelLast=0;
  const nearestPoint=(geometry:T.BufferGeometry,centre:T.Vector3,best:{d:number;p:T.Vector3})=>{const pos=geometry.getAttribute('position');if(!pos)return;const step=Math.max(1,Math.floor(pos.count/6000));for(let i=0;i<pos.count;i+=step){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),d=(x-centre.x)**2+(y-centre.y)**2+(z-centre.z)**2;if(d<best.d){best.d=d;best.p.set(x,y,z);}}};
  const rebuildLabels=(s:SceneState)=>{
   const key=s.spaceLabels?.length&&s.spaceRange?.length?JSON.stringify([s.spaceLabels.map(l=>l.key),s.spaceRange]):'';
   if(key===labelKey){if(!key)labelMissing=0;return;}labelKey=key;labelMissing=0;
   for(const it of labelItems){it.box.remove();it.line.remove();}labelItems=[];
   if(!key)return;
   // with both sides shown, only the first side (the one the camera looks at) is labelled
   const centres=s.spaceRange!.slice(0,1).map(r=>new T.Vector3(...r.c));
   for(const l of s.spaceLabels!){
    const best={d:Infinity,p:new T.Vector3()};let centre=centres[0];
    for(const c of centres){const here={d:Infinity,p:new T.Vector3()};
     for(const id of l.ids){const i=atlas.parts.findIndex(q=>q.id===id),mesh=i>=0?pickers[i]:undefined;if(mesh)nearestPoint(mesh.geometry,c,here);}
     for(const name of l.nerves){const base=name.replace(/\.001$/,'');for(const o of nerveMeshes){if(((o.userData.mjExactName as string|undefined)||o.name).replace(/\.001$/,'')===base)nearestPoint(o.geometry,c,here);}}
     if(here.d<best.d){best.d=here.d;best.p.copy(here.p);centre=c;}}
    if(!isFinite(best.d)){labelMissing++;continue;}
    const box=document.createElement('div');box.className='space-label'+(l.content?' is-content':'');box.textContent=l.text;labelLayer.appendChild(box);
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');labelSvg.appendChild(line);
    if(l.color){box.style.borderColor=l.color;box.style.boxShadow=`inset 5px 0 0 ${l.color}`;box.style.paddingLeft='13px';line.style.stroke=l.color;line.style.strokeOpacity='1';line.style.strokeWidth='2';}
    labelItems.push({anchor:best.p.clone(),centre:centre.clone(),box,line,content:l.content,color:l.color});
   }
  };
  const updateLabels=()=>{
   // structures that are still streaming in have no mesh yet: look again about once a second
   if(labelMissing&&labelRetries<600&&performance.now()-labelLast>1500){labelKey='';labelRetries++;labelLast=performance.now();}
   if(!labelMissing&&labelKey)labelRetries=0;
   rebuildLabels(latest.current);
   if(labelMissing)dirty=true;
   if(!labelItems.length)return;
   const w=el.clientWidth,h=el.clientHeight;labelSvg.setAttribute('viewBox',`0 0 ${w} ${h}`);
   const proj=(v:T.Vector3)=>{const q=v.clone().project(camera);return{x:(q.x*.5+.5)*w,y:(-q.y*.5+.5)*h,behind:q.z>1};};
   // a boundary label points at the middle of its coloured edge, which moves with the joint
   for(const it of labelItems){const live=it.color?spaceOutline.midpoint(it.color):null;if(live)it.anchor.copy(live);}
   const placed=labelItems.map(it=>({it,a:proj(it.anchor),c:proj(it.centre)}));
   // two columns, one at each edge of the free part of the view (between the side panels), stacked in the order of the structures' height on screen so labels never overlap
   const rect=el.getBoundingClientRect(),panelRight=document.querySelector('.left-workspace')?.getBoundingClientRect(),rightEdges=['.right-tool-panel','.right-tool-rail','.detail-sheet'].map(q=>document.querySelector(q)?.getBoundingClientRect()).filter((r):r is DOMRect=>!!r&&r.width>0);
   const freeLeft=Math.max(12,panelRight&&panelRight.width>0?panelRight.right-rect.left+14:12),freeRight=Math.min(w-12,...rightEdges.map(r=>r.left-rect.left-14));
   const centreX=placed.length?placed.reduce((sum,p)=>sum+p.c.x,0)/placed.length:w/2;
   for(const right of [true,false]){
    const group=placed.filter(p=>(p.a.x>=centreX)===right).sort((x,y)=>x.a.y-y.a.y);let lastY=-Infinity;
    for(const p of group){
     const ly=Math.min(h-30,Math.max(p.a.y,lastY+27,80));lastY=ly;
     const bw=p.it.box.offsetWidth||180,lx=right?Math.max(freeLeft,freeRight-bw):freeLeft,edge=right?lx:lx+bw;
     const visible=!p.a.behind;
     p.it.box.style.display=visible?'':'none';p.it.line.style.display=visible?'':'none';
     if(!visible)continue;
     p.it.box.style.left=`${lx}px`;p.it.box.style.top=`${ly}px`;p.it.box.style.transform='translate(0,-50%)';
     p.it.line.setAttribute('x1',String(edge));p.it.line.setAttribute('y1',String(ly));p.it.line.setAttribute('x2',String(p.a.x));p.it.line.setAttribute('y2',String(p.a.y));
    }
   }
  };
  const raycaster=new T.Raycaster(),pointer=new T.Vector2(),tap=new PointerTap(),worldBox=new T.Box3(),hitPoint=new T.Vector3();
  /** GPU-skinned parts are raycast against their CPU twin (linearSkin) at the displayed pose. */
  const pickProxies=new Map<number,{mesh:T.Mesh;version:number}>();
  const pickTarget=(i:number,mesh:T.Mesh)=>{
   const id=atlas.parts[i].id,gpu=mesh.userData.gpuSkinned?surfaceBindings.get(id)??gpuBindings.get(id):undefined,palette=gpu?.side?skinPalettes[gpu.side]:null;
   if(!gpu||(gpu.side&&!palette))return mesh;
   const base=(mesh.userData.baseMotionPositions??mesh.geometry.getAttribute('position').array) as Float32Array;
   let proxy=pickProxies.get(i);const skinOf=gpu.lbs?lbsSkin:linearSkin;
   if(!proxy){const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(base.length),3));g.setIndex(mesh.geometry.index);proxy={mesh:new T.Mesh(g),version:-1};proxy.mesh.matrixAutoUpdate=false;pickProxies.set(i,proxy);}
   if(proxy.version!==paletteVersion){const g=proxy.mesh.geometry,a=g.getAttribute('position') as T.BufferAttribute;if(gpu.side)skinOf(gpu,base,palette!,a.array as Float32Array);else slotSkin(gpu,base,paletteData,a.array as Float32Array);a.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();proxy.version=paletteVersion;}
   proxy.mesh.matrixWorld.copy(mesh.matrixWorld);return proxy.mesh;
  };
  const pickPartAt=(clientX:number,clientY:number)=>{
   const rect=renderer.domElement.getBoundingClientRect();pointer.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
   let nearest=Infinity,found=-1;const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);
   pickers.forEach((picker,i)=>{if(!picker||data[i*4+3]<.5||(hasSolid&&atlas.parts[i].system==='integumentary'))return;const mesh=pickTarget(i,picker);worldBox.copy(mesh.geometry.boundingBox??bounds[i]).applyMatrix4(mesh.matrixWorld);if(!raycaster.ray.intersectBox(worldBox,hitPoint))return;const hits=raycaster.intersectObject(mesh,false);if(hits[0]&&hits[0].distance<nearest){nearest=hits[0].distance;found=i;}});
   for(const {mesh,parent} of cervicalVessels.rows){if(!mesh.visible)continue;const hit=raycaster.intersectObject(mesh,false)[0];if(hit&&hit.distance<nearest){nearest=hit.distance;found=atlas.parts.findIndex(p=>p.id===parent.id);}}
   return found>=0?{index:found,distance:nearest}:null;
  };
  const pickAt=(clientX:number,clientY:number)=>pickPartAt(clientX,clientY)?.index??-1;
  const pickNerveAt=(clientX:number,clientY:number)=>{
   if(!nerveRoot.visible||!selectNerve.current)return null;
   const rect=renderer.domElement.getBoundingClientRect();pointer.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
   let nearest=Infinity,found:NerveMesh|null=null;
   for(const mesh of nerveMeshes){if(!mesh.visible)continue;const hits=raycaster.intersectObject(mesh,false);if(hits[0]&&hits[0].distance<nearest){nearest=hits[0].distance;found=mesh;}}
   return found?{name:found.name,distance:nearest}:null;
  };
  const pickBrainAt=(clientX:number,clientY:number)=>{
   if(!brainMotionRoot.visible||!brainLoaded)return null;
   const rect=renderer.domElement.getBoundingClientRect();pointer.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
   let nearest=Infinity,found:T.Mesh|null=null;
   for(const mesh of brainPickers){if(!mesh.visible)continue;const hits=raycaster.intersectObject(mesh,false);if(hits[0]&&hits[0].distance<nearest){nearest=hits[0].distance;found=mesh;}}
   const id=found?.userData.mjAtlasId as string|undefined;
   return found&&id?{id,distance:nearest,label:String(found.userData.mjBrainLabel??found.name)}:null;
  };
  const frontHit=(clientX:number,clientY:number)=>{
   const part=pickPartAt(clientX,clientY),nerve=pickNerveAt(clientX,clientY),brain=pickBrainAt(clientX,clientY);
   if(brain&&(!part||brain.distance<=part.distance+.002)&&(!nerve||brain.distance<=nerve.distance+.002))return{kind:'brain' as const,id:brain.id,label:brain.label};
   if(nerve&&(!part||nerve.distance<=part.distance+.002))return{kind:'nerve' as const,name:nerve.name};
   return part?{kind:'part' as const,index:part.index}:null;
  };
  type JointGesture={pointerId:number;side:'left'|'right';joint:'shoulderAbduction'|'shoulderFlexion'|'elbowFlexion';startX:number;startY:number;lastX:number;lastY:number;hitIndex:number;dragging:boolean};
  let jointGesture:JointGesture|null=null;
  const jointForPart=(index:number)=>{
   if(index<0)return null;
   const p=atlas.parts[index],cx=(p.bounds[0][0]+p.bounds[1][0])/2,cy=(p.bounds[0][1]+p.bounds[1][1])/2,ax=Math.abs(cx);
   if(anatomicalRegion(p)!=='upper-limb'||isMotionQuarantined(p))return null;
   if(ax<.12||cy<.72||cy>1.44)return null;
   const side: 'left'|'right'=cx<0?'right':'left';
   if(cy>=1.10)return {side,joint:'shoulderAbduction' as const};
   return {side,joint:'elbowFlexion' as const};
  };
  const touchPointers=new Set<number>();
  const down=(e:PointerEvent)=>{
   hover.hidden=true;
   focusTarget=null;focusPosition=null;
   if(e.pointerType==='touch'){
    touchPointers.add(e.pointerId);
    if(touchPointers.size>1){jointGesture=null;tap.cancel(e.pointerId);resetPrimaryGesture();return;}
   }
   if(e.button===0){
    const front=ready?frontHit(e.clientX,e.clientY):null;
    const hit=front?.kind==='part'?front.index:-1,jointInfo=jointForPart(hit);
    if(viewerContext.current.jointMotionEnabled&&jointInfo&&jointDrag.current){
     // Treat a press as a possible anatomy tap first. Only convert it into a
     // joint drag after the pointer actually moves. This keeps muscles, bones
     // and other visible structures selectable while Motion Lab is active.
     jointGesture={pointerId:e.pointerId,side:jointInfo.side,joint:jointInfo.joint,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,hitIndex:hit,dragging:false};
     // OrbitControls still records this pointer, so adding a second finger
     // can begin a pinch. A single finger is reserved for the joint gesture.
     controls.enableRotate=false;controls.enablePan=false;renderer.domElement.setPointerCapture?.(e.pointerId);renderer.domElement.style.cursor='grab';e.preventDefault();return;
    }
    const onAnatomy=!!front;controls.mouseButtons.LEFT=onAnatomy?T.MOUSE.ROTATE:T.MOUSE.PAN;if(e.pointerType==='touch')controls.touches.ONE=onAnatomy?T.TOUCH.ROTATE:T.TOUCH.PAN;renderer.domElement.style.cursor=onAnatomy?'grabbing':'move';
   }
   tap.down(e.pointerId,e.clientX,e.clientY,e.pointerType==='touch'?12:5);
  };
  const move=(e:PointerEvent)=>{
   if(jointGesture&&jointGesture.pointerId===e.pointerId){
    const total=Math.hypot(e.clientX-jointGesture.startX,e.clientY-jointGesture.startY);
    if(!jointGesture.dragging&&total<7){e.preventDefault();return;}
    if(!jointGesture.dragging){
     if(jointGesture.joint==='shoulderAbduction'&&Math.abs(e.clientY-jointGesture.startY)>Math.abs(e.clientX-jointGesture.startX))jointGesture.joint='shoulderFlexion';
     jointGesture.dragging=true;
     jointGesture.lastX=e.clientX;jointGesture.lastY=e.clientY;
     renderer.domElement.style.cursor=jointGesture.joint==='shoulderAbduction'?'ew-resize':'ns-resize';
     e.preventDefault();return;
    }
    const dx=e.clientX-jointGesture.lastX,dy=e.clientY-jointGesture.lastY;
    const delta=jointGesture.joint==='shoulderAbduction'?(jointGesture.side==='right'?-dx:dx)*.65:-dy*.65;
    if(Math.abs(delta)>.05)jointDrag.current?.(jointGesture.side,jointGesture.joint,delta);
    jointGesture.lastX=e.clientX;jointGesture.lastY=e.clientY;e.preventDefault();return;
   }
   tap.move(e.pointerId,e.clientX,e.clientY);if(e.buttons||amount<.5||e.pointerType==='touch'){hover.hidden=true;setHover(-1,null);return;}
   {const now=performance.now();if(now-lastHoverAt>50){lastHoverAt=now;const f=ready?frontHit(e.clientX,e.clientY):null;setHover(f?.kind==='part'?f.index:-1,f?.kind==='nerve'?f.name:null);}}const rect=el.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,index=findTarget(x,y,12);hover.hidden=index<0;renderer.domElement.style.cursor=index<0?'move':'grab';if(index>=0){hover.textContent=atlas.parts[index].name;hover.style.left=`${Math.max(8,Math.min(x+14,el.clientWidth-260))}px`;hover.style.top=`${Math.max(8,Math.min(y+18,el.clientHeight-55))}px`;}
  };
  const resetPrimaryGesture=()=>{controls.enabled=true;controls.enableRotate=true;controls.enablePan=true;controls.mouseButtons.LEFT=T.MOUSE.PAN;controls.touches.ONE=T.TOUCH.PAN;renderer.domElement.style.cursor='move';};
  const cancel=(e:PointerEvent)=>{touchPointers.delete(e.pointerId);if(jointGesture?.pointerId===e.pointerId)jointGesture=null;tap.cancel(e.pointerId);resetPrimaryGesture();};
  const up=(e:PointerEvent)=>{
   touchPointers.delete(e.pointerId);
   if(jointGesture?.pointerId===e.pointerId){
    const gesture=jointGesture;jointGesture=null;renderer.domElement.releasePointerCapture?.(e.pointerId);resetPrimaryGesture();
    if(!gesture.dragging&&gesture.hitIndex>=0&&ready){hover.hidden=true;select.current(atlas.parts[gesture.hitIndex].id);}
    return;
   }
   const validTap=tap.up(e.pointerId,e.clientX,e.clientY);resetPrimaryGesture();if(!validTap||!ready)return;
   const front=frontHit(e.clientX,e.clientY);if(front?.kind==='brain'){hover.hidden=true;select.current(front.id);return;}if(front?.kind==='nerve'){hover.hidden=true;selectNerve.current?.(front.name);return;}
   let found=front?.kind==='part'?front.index:-1;const rect=renderer.domElement.getBoundingClientRect();if(found<0&&amount>.45)found=findTarget(e.clientX-rect.left,e.clientY-rect.top,e.pointerType==='touch'?24:16);if(found>=0){hover.hidden=true;select.current(atlas.parts[found].id);}
  };
  renderer.domElement.addEventListener('pointerdown',down,true);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerleave',()=>setHover(-1,null));renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',cancel);
  // ?mjview=1 exposes the camera for the screenshot scripts (view a structure from a chosen side and distance); nothing in the app uses it.
  if(typeof location!=='undefined'&&new URLSearchParams(location.search).has('mjview'))(window as unknown as {__mjView:unknown}).__mjView={look:(target:[number,number,number],dir:[number,number,number],distance:number)=>{controls.target.set(...target);camera.clearViewOffset();camera.position.set(target[0]+dir[0]*distance,target[1]+dir[1]*distance,target[2]+dir[2]*distance);controls.update();dirty=true;}};
  // Outline of the picked special region (edges as tubes, opening as a pale fill); its vertices are copies of boundary-mesh vertices, see space-outline.ts.
  const partIndexById=new Map(atlas.parts.map((p,i)=>[p.id,i]));
  const outlineTube=materialFor('overlay',undefined,true),outlineFill=materialFor('overlay',1,true);
  for(const m of [outlineTube,outlineFill]){m.vertexColors=true;m.color.set('#ffffff');m.roughness=.5;m.metalness=0;}
  outlineTube.depthTest=false;outlineFill.depthTest=false;outlineFill.depthWrite=false;outlineFill.polygonOffset=true;outlineFill.polygonOffsetFactor=-1;outlineFill.polygonOffsetUnits=-1;
  const spaceOutline=createSpaceOutline({scene,tubeMaterial:outlineTube,fillMaterial:outlineFill,pick:id=>{const i=partIndexById.get(id);return i===undefined?undefined:pickers[i];},edgeColor:hex=>new T.Color(hex),fillColor:new T.Color('#ffe8a3'),fillAlpha:.3});
  let outlineSeen:SceneState|null=null;
  const clock=new T.Clock();let lastExtent=-1;
  const animate=()=>{
   if(disposed)return;frame=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),s=poseForFrame(latest.current);
   // the lung lobes are solid and lit by default; they turn translucent only when the opacity slider is moved
   {const lm=mats.get('respiratory:shell'),o=latest.current.lungOpacity??1;if(lm){const t=o<.995;if(lm.opacity!==o||lm.transparent!==t){lm.opacity=o;lm.transparent=t;lm.depthWrite=!t;lm.needsUpdate=true;dirty=true;}}}
   {const pm=mats.get('serous:peritoneum'),o=latest.current.peritoneumOpacity??.3;if(pm&&pm.opacity!==o){pm.opacity=o;dirty=true;}}
   if(focusTarget&&focusPosition){const a=1-Math.exp(-8*dt);controls.target.lerp(focusTarget,a);camera.position.lerp(focusPosition,a);dirty=true;if(controls.target.distanceToSquared(focusTarget)<1e-7&&camera.position.distanceToSquared(focusPosition)<1e-7){controls.target.copy(focusTarget);camera.position.copy(focusPosition);focusTarget=null;focusPosition=null;}}
   const changed=lastState?.jointSurfaces!==s.jointSurfaces||lastState?.visible!==s.visible||lastState?.selected!==s.selected||lastState?.hiddenParts!==s.hiddenParts||lastState?.fadedParts!==s.fadedParts||lastState?.spaceRange!==s.spaceRange||lastState?.spaceRangeIds!==s.spaceRangeIds||lastState?.spaceContentIds!==s.spaceContentIds||autoFadeDirty||lastState?.highlightNerves!==s.highlightNerves||lastState?.depthFilter!==s.depthFilter||lastState?.muscleLayer!==s.muscleLayer||lastState?.faceMuscleLayer!==s.faceMuscleLayer||lastState?.focusParts!==s.focusParts||lastState?.isolate!==s.isolate||lastState?.partTransforms!==s.partTransforms||lastState?.bodyMotion!==s.bodyMotion;
   const tissueChanged=!lastState||lastState.partTransforms!==s.partTransforms||lastState.tissueMotion!==s.tissueMotion||lastState.previewMotion!==s.previewMotion||lastState.bodyMotion!==s.bodyMotion||lastState.visible!==s.visible||lastState.focusParts!==s.focusParts||lastState.hiddenParts!==s.hiddenParts;
   if(tissueChanged){updateTissueMotion(s);updateNerveMotion(s);updateBrainMotion(s);}
   const ctx=viewerContext.current;
   // Head view: everything below the collarbones is cut away, including vessels and muscles that run on into the chest.
   {const want=ctx.bodyArea==='head'&&!s.bodyMotion;if(want!==!!renderer.clippingPlanes?.length){renderer.clippingPlanes=want?[headCut]:[];dirty=true;}}
   if(primaryAtlasReady&&s.visible.includes('nervous')&&(ctx.bodyArea==='head'||s.bodyMotion?.region==='head'||s.bodyMotion?.region==='spine'||!s.visible.includes('skeletal')||(s.hiddenParts?.length??0)>0))ensureBrain();
   if(spaceOutline.update(s.spaceOutlines,!outlineSeen||outlineSeen.partTransforms!==s.partTransforms||outlineSeen.bodyMotion!==s.bodyMotion||outlineSeen.tissueMotion!==s.tissueMotion||outlineSeen.previewMotion!==s.previewMotion||outlineSeen.spaceOutlines!==s.spaceOutlines||tissueChanged)){dirty=true;}
   outlineSeen=s;
   {const ranges=s.spaceRange??[],a=ranges[0],b=ranges[1];rangeU.rangeN.value=ranges.length;if(a)rangeU.rangeA.value.set(a.c[0],a.c[1],a.c[2],a.r);if(b)rangeU.rangeB.value.set(b.c[0],b.c[1],b.c[2],b.r);}
   if(nerveMeshes.length){
    const nervesOn=s.visible.includes('nervous')&&(!s.isolate||!!selectedNerve.current);
    // Schematic veins (suboccipital plexus) live in the nerve mesh group but belong to the Veins system.
    const veinsOn=s.visible.includes('venous')&&!s.isolate;
    nerveRoot.visible=(nervesOn||veinsOn)&&nervesReady();
    nerveMeshes.forEach(o=>{
     if(!nervesReady()||(o.userData.mjVein?!veinsOn:!nervesOn)){o.visible=false;return;}
     const name=(o.userData.mjExactName as string|undefined)||o.name,side=nerveSide(name),boundRegion=o.userData.bodyRegion as BodyRegion|undefined;
     const sideOk=ctx.focusSide==='both'||side==='both'||side===ctx.focusSide;
     if(s.bodyMotion?.region==='spine')o.visible=sideOk;
     else if(s.bodyMotion?.region==='head')o.visible=sideOk&&boundRegion==='head';
     else if(s.bodyMotion?.region==='leftLeg'||s.bodyMotion?.region==='rightLeg')o.visible=sideOk&&boundRegion===s.bodyMotion.region;
     else if(ctx.bodyArea==='head')o.visible=boundRegion==='head';
     else if(ctx.bodyArea==='lower')o.visible=sideOk&&(boundRegion==='leftLeg'||boundRegion==='rightLeg');
     else if(ctx.bodyArea==='organs')o.visible=false;
     else if(ctx.bodyArea==='upper'&&ctx.region==='whole-body')o.visible=sideOk&&!!nerveBindings[name];
     else if(ctx.motionActive)o.visible=sideOk&&!!nerveBindings[name]&&nerveMatchesRegion(name,ctx.region,false);
     else o.visible=sideOk&&nerveMatchesRegion(name,ctx.region,false);
     const inHighlight=!!s.highlightNerves?.length&&s.highlightNerves.some(h=>h.replace(/\.001$/,'')===name.replace(/\.001$/,'')),ranged=!!s.spaceRange?.length&&inHighlight;
     const isSelectedNerve=!ranged&&((!!selectedNerve.current&&name===selectedNerve.current)||inHighlight);
     {const rf=o.userData.rangeFlag as {value:number}|undefined;if(rf&&rf.value!==(ranged?1:0)){rf.value=ranged?1:0;dirty=true;}}
     // a nerve picked from search, a list or a card is always shown (whatever region, side or system filter is active) unless it was hidden on purpose; with Isolate only that nerve stays
     if((ranged||(selectedNerve.current&&name===selectedNerve.current))&&!s.hiddenNerves?.includes(name))o.visible=true;
     else if(s.isolate&&selectedNerve.current)o.visible=false;
     if(s.hiddenNerves?.includes(name))o.visible=false;
     const isHoverNerve=!isSelectedNerve&&hoverNerve===name;
     const isVein=!!o.userData.mjVein,targetColor=isSelectedNerve?SELECT_COLOR:isHoverNerve?HOVER_COLOR:isVein?0x3f7bd0:0xf1cb4f,targetEmissive=isSelectedNerve?SELECT_COLOR:isHoverNerve?HOVER_COLOR:isVein?0x0f2c5c:0x6b5100,targetIntensity=isSelectedNerve?.4:isHoverNerve?.3:.28;
     {const nm=(o as T.Mesh).material as T.MeshStandardMaterial,lift=isSelectedNerve;if(nm.polygonOffset!==lift){nm.polygonOffset=lift;nm.polygonOffsetFactor=-4;nm.polygonOffsetUnits=-4;nm.needsUpdate=true;}}
     if(o.material.color.getHex()!==targetColor||o.material.emissive.getHex()!==targetEmissive||o.material.emissiveIntensity!==targetIntensity||!o.material.depthTest||o.material.opacity!==1){
      o.material.color.setHex(targetColor);o.material.emissive.setHex(targetEmissive);o.material.emissiveIntensity=targetIntensity;o.material.depthTest=true;o.material.depthWrite=true;o.material.transparent=false;o.material.opacity=1;o.material.needsUpdate=true;
     }
    });
   }
   const moving=Math.abs(amount-s.explode)>.0001;
   if(moving){amount=T.MathUtils.damp(amount,s.explode,8,dt);dirty=true;}
   if(changed||moving||tissueChanged||lastExtent<0){
    supplementaryJoints.update(s,amount,!!s.previewMotion);cervicalVessels.update(s,amount);
    const visible=new Set(s.visible),selection=new Set(s.selected),hidden=new Set(s.hiddenParts??[]),focus=s.focusParts?new Set(s.focusParts):null;const rangeIds=new Set(s.spaceRange?.length?s.spaceRangeIds??[]:[]),contentCodes=new Map<string,number>();for(const id of s.spaceContentIds??[]){const sys=atlas.parts.find(q=>q.id===id)?.system;contentCodes.set(id,sys==='arterial'?220:sys==='venous'?190:sys==='nervous'?160:sys==='lymphatic'?130:255);}
    const fadedSet=s.fadedParts?.length||autoFade?.size?new Set([...(s.fadedParts??[]),...(autoFade??[])]):null;
    const cranialVault=/^(frontal bone|left parietal bone|right parietal bone|left temporal bone|right temporal bone|occipital bone|sphenoid bone|ethmoid)$/i;
    const intracranial=/brain|cerebr|cerebell|\bgyrus\b|lobule|\blobe\b|hemisphere|white matter|gray matter|cortex|insula|midbrain|pons|medulla oblongata|thalam|hypothalam|fornix|ventricle|choroid plexus|corpus callosum|hippocamp|amygdal|caudate|putamen|globus pallidus|internal capsule|commissure|colliculus|geniculate|habenula|mammillary|stria terminalis|stria medullaris|septum of telencephalon|tuber cinereum|interpeduncular fossa|lamina terminalis|optic chiasm|optic tract|peduncle of midbrain|cerebral aqueduct|pineal|pituitary|cerebral artery|cerebellar artery|basilar artery|callosomarginal artery|pericallosal artery|pontine artery|thalamogeniculate artery|thalamoperforating artery/i;
    const baseVisible=(p:(typeof atlas.parts)[number])=>{
     if(hidden.has(p.id))return false;
     if(!matchesDepth(p,s.depthFilter)||!matchesMuscleLayer(p,s.muscleRegion,s.muscleLayer)||!matchesFacialMuscleLayer(p,s.faceMuscleLayer)||!matchesHeartLayer(p,s.heartOpen)||!matchesSex(p,s.sex)||(p.system==='serous'&&(s.hiddenSerous??[]).includes(serousLayerKey(p.name))))return false;
     if(s.isolate)return false;
     return focus?focus.has(p.id)&&visible.has(p.system):visible.has(p.system);
    };
    // In the intact-body view the cranial vault should visually contain the
    // brain, just like a real head. BodyParts3D contains separately rendered
    // intracranial meshes that can protrude through tiny gaps in the skull, so
    // keep those deep structures occluded while the cranial bones are present.
    // They become available again when the skull is hidden/peeled or when an
    // intracranial structure is explicitly isolated.
    const vaultParts=atlas.parts.filter(part=>cranialVault.test(part.name));
    const cranialVaultVisible=vaultParts.length>0&&vaultParts.every(baseVisible);
    const brainInFocus=!focus||atlas.parts.some(p=>p.system==='nervous'&&brainTargetPattern.test(p.name)&&focus.has(p.id));
    const legacyBrainParenchyma=/brain|cerebr|cerebell|telenceph|dienceph|mesenceph|metenceph|myelenceph|\bgyrus\b|sulcus|lobule|\blobe\b|hemisphere|white matter|gray matter|cortex|insula|midbrain|pons|medulla oblongata|thalam|hypothalam|fornix|ventricle|choroid plexus|corpus callosum|hippocamp|amygdal|caudate|putamen|globus pallidus|internal capsule|commissure|colliculus|geniculate|habenula|mammillary|stria terminalis|stria medullaris|septum of telencephalon|tuber cinereum|interpeduncular fossa|lamina terminalis|peduncle of midbrain|cerebral aqueduct/i;
    const selectedBrain=brainAtlasCandidates.some(p=>selection.has(p.id));
    brainMotionRoot.visible=brainLoaded&&visible.has('nervous')&&brainInFocus&&!cranialVaultVisible&&(!s.isolate||selectedBrain);
    for(const mesh of brainPickers){
     const atlasId=mesh.userData.mjAtlasId as string|undefined,selected=!!atlasId&&selection.has(atlasId);
     mesh.visible=brainMotionRoot.visible&&(!s.isolate||selected);
     const mat=mesh.material as T.MeshStandardMaterial,baseColor=mesh.userData.mjBrainBaseColor as number|undefined,baseOpacity=mesh.userData.mjBrainBaseOpacity as number|undefined;
     const targetColor=selected?SELECT_COLOR:(baseColor??0xc9857d),targetEmissive=selected?SELECT_COLOR:0x000000,targetIntensity=selected?.35:0;
     if(mat.color.getHex()!==targetColor||mat.emissive.getHex()!==targetEmissive||mat.emissiveIntensity!==targetIntensity){
      mat.color.setHex(targetColor);mat.emissive.setHex(targetEmissive);mat.emissiveIntensity=targetIntensity;mat.opacity=selected?1:(baseOpacity??1);mat.needsUpdate=true;
     }
    }
    const isVisible=(p:(typeof atlas.parts)[number])=>{
     if(amount<.01&&cervicalVessels.replaced.has(p.id))return false;
     // A space (axillary fossa, carpal tunnel, quadrangular space …) is not a solid: its boundaries and contents are highlighted by the dissection panel, so the placeholder volume is never drawn as a plate or box.
     if((p as {kind?:string}).kind==='space')return false;
     if(hidden.has(p.id))return false;
     const cx=(p.bounds[0][0]+p.bounds[1][0])*.5,cy=(p.bounds[0][1]+p.bounds[1][1])*.5,cz=(p.bounds[0][2]+p.bounds[1][2])*.5;
     const intracranialLegacy=p.system==='nervous'&&cy>1.38&&Math.abs(cx)<.36&&Math.abs(cz)<.34&&!/cranial.?nerve|\bnerve\b|tract|root|ganglion/i.test(p.name);
     const replacedBrain=brainLoaded&&(legacyBrainParenchyma.test(p.name)||intracranialLegacy);
     if(selection.has(p.id)&&!replacedBrain&&(!cranialVaultVisible||!intracranial.test(p.name)||s.isolate))return true;
     if(!baseVisible(p))return false;
     if(cranialVaultVisible&&intracranial.test(p.name))return false;
     if(replacedBrain)return false;
     return true;
    };
    const visibleParts=atlas.parts.filter(isVisible);
    const nextLayoutKey=visibleParts.map(p=>p.id).join(',')+':'+camera.aspect.toFixed(3);
    if(nextLayoutKey!==layoutKey){const layout=createExplosionLayout(visibleParts,camera.aspect);packingWidth=layout.width;packingHeight=layout.height;atlas.parts.forEach((p,i)=>{const cell=layout.cells.get(p.id);offsets[i]=cell?new T.Vector3(cell.x,cell.y+.85,0):centers[i].clone();});layoutKey=nextLayoutKey;if(amount>.05&&!s.isolate)fit(s.view,Math.max(0,(amount-.3)/.7));}

    atlas.parts.forEach((p,i)=>{
     const c=centers[i],destination=offsets[i];let dx=0,dy=0,dz=0;
     if(amount<=.45){const t=amount/.45;const group=SYSTEMS.findIndex(sys=>sys.id===p.system);const angle=group/SYSTEMS.length*Math.PI*2;dx=Math.sin(angle)*t*.48;dy=(c.y-.85)*t*.28;dz=Math.cos(angle)*t*.48;}
     else {const t=(amount-.45)/.55,group=SYSTEMS.findIndex(sys=>sys.id===p.system),angle=group/SYSTEMS.length*Math.PI*2;dx=T.MathUtils.lerp(Math.sin(angle)*.48,destination.x-c.x,t);dy=T.MathUtils.lerp((c.y-.85)*.28,destination.y-c.y,t);dz=T.MathUtils.lerp(Math.cos(angle)*.48,-c.z,t);}
     const selected=selection.has(p.id);data.set([dx,dy,dz,isVisible(p)?1:0],i*4);selectedData[i*4]=selected?(contentCodes.get(p.id)??255):0;selectedData[i*4+3]=selected&&rangeIds.has(p.id)?255:0;selectedData[i*4+2]=fadedSet&&fadedSet.has(p.id)?255:0;
     // CPU skinning already includes the active frame. Never apply it twice.
     const transform=pickers[i]?.userData.tissuePosed?undefined:s.partTransforms?.[p.id];
     if(transform){
      motionData.set([...transform.translation,pickers[i]?.userData.skinMode??0],i*4);rotationData.set(transform.quaternion,i*4);
      anchorMotionData.set([...(transform.anchorTranslation??transform.translation),0],i*4);anchorRotationData.set(transform.anchorQuaternion??transform.quaternion,i*4);
     }else{
      motionData.set([0,0,0,pickers[i]?.userData.skinMode??0],i*4);rotationData.set([0,0,0,1],i*4);anchorMotionData.set([0,0,0,0],i*4);anchorRotationData.set([0,0,0,1],i*4);
     }
     const mesh=pickers[i];
     if(mesh){
      const isSoft=!!(transform?.anchorTranslation&&transform?.anchorQuaternion),base=mesh.userData.baseMotionPositions as Float32Array|undefined,weights=mesh.userData.motionWeights as Float32Array|undefined,attr=mesh.geometry.getAttribute('position') as T.BufferAttribute;
      if(isSoft&&base&&weights&&transform){
       const movingM=transformMatrix(transform),anchorM=transformMatrix({translation:transform.anchorTranslation!,quaternion:transform.anchorQuaternion!});
       const maxSoft=p.system==='arterial'||p.system==='venous'?.16:p.system==='muscular'?.24:1;
       for(let vi=0;vi<attr.count;vi++){
        const w=weights[vi];
        softP.set(base[vi*3],base[vi*3+1],base[vi*3+2]);
        softA.copy(softP).applyMatrix4(anchorM);softB.copy(softP).applyMatrix4(movingM);
        softD.copy(softB).sub(softA);if(softD.length()>maxSoft)softD.setLength(maxSoft);
        softA.addScaledVector(softD,w);attr.setXYZ(vi,softA.x,softA.y,softA.z);
       }
       attr.needsUpdate=true;mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();mesh.userData.mjSoftDeformed=true;mesh.quaternion.identity();mesh.position.set(dx,dy,dz);
      }else{
       if(mesh.userData.mjSoftDeformed&&base){for(let vi=0;vi<attr.count;vi++)attr.setXYZ(vi,base[vi*3],base[vi*3+1],base[vi*3+2]);attr.needsUpdate=true;mesh.geometry.boundingBox=bounds[i].clone();mesh.geometry.computeBoundingSphere();mesh.userData.mjSoftDeformed=false;}
       if(transform){mesh.quaternion.set(...transform.quaternion);mesh.position.set(...transform.translation).add(new T.Vector3(dx,dy,dz));}else{mesh.quaternion.identity();mesh.position.set(dx,dy,dz);}
      }
      mesh.updateMatrix();mesh.updateMatrixWorld(true);
     }
     if(data[i*4+3]>.5){const marker=mesh?(mesh.geometry.boundingBox??bounds[i]).getCenter(softP).clone().applyMatrix4(mesh.matrixWorld):c.clone().add(new T.Vector3(dx,dy,dz));markerPositions.set([marker.x,marker.y,marker.z],i*3);}else markerPositions.set([10000,10000,10000],i*3);
    });updateVisibleBatches();partTexture.needsUpdate=true;selectionTexture.needsUpdate=true;motionTexture.needsUpdate=true;rotationTexture.needsUpdate=true;anchorMotionTexture.needsUpdate=true;anchorRotationTexture.needsUpdate=true;markerGeometry.attributes.position.needsUpdate=true;lastState=s;lastExtent=amount;dirty=true;
   }
   if(s.view!==lastView||s.reset!==lastReset){camera.clearViewOffset();lastCameraFocus=-1;fit(s.view,amount);lastView=s.view;lastReset=s.reset;}
   if(moving&&!s.isolate)fit(amount>.5?'front':s.view,Math.max(0,(amount-.3)/.7));
   const isolateKey=s.isolate?s.selected.join(',')+':'+s.reset+':'+s.inspectorOpen+':'+camera.aspect:'';
   if(isolateKey!==lastIsolate||(s.isolate&&moving)){
    if(s.isolate){const box=new T.Box3();atlas.parts.forEach((p,i)=>{if(s.selected.includes(p.id)){const mesh=pickers[i];box.union(mesh?(mesh.geometry.boundingBox??bounds[i]).clone().applyMatrix4(mesh.matrixWorld):bounds[i].clone().translate(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])));}});
     if(!box.isEmpty()){const center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());const w=el.clientWidth,h=el.clientHeight,mobile=w<768,landscape=w>h&&h<=600;let left=20,right=w-20,top=mobile?175:110,bottom=h-170;if(s.inspectorOpen){if(landscape){right=w-335;top=100;bottom=h-125;}else if(mobile){const sheet=document.querySelector('.detail-sheet')?.getBoundingClientRect(),header=document.querySelector('.identity')?.getBoundingClientRect();top=(header?.bottom??94)+16;bottom=(sheet?.top??h*.58-139)-16;}else{right=w-370;left=w>1100?285:25;}}const availableWidth=Math.max(150,right-left),availableHeight=Math.max(40,bottom-top);camera.setViewOffset(w,h,w/2-(left+right)/2,h/2-(top+bottom)/2,w,h);const distance=Math.max(.07,Math.max(size.y*h/availableHeight,size.x*w/availableWidth/camera.aspect,size.z)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*1.35);controls.maxDistance=Math.max(40,distance*2);controls.target.copy(center);camera.position.copy(center).add(new T.Vector3(.2,.1,1).normalize().multiplyScalar(distance));controls.update();dirty=true;}
    }else if(lastIsolate){camera.clearViewOffset();fit(s.view,amount);}
    lastIsolate=isolateKey;
   }
   if(autoFadeDirty)autoFadeDirty=false;
   if(!s.selected.length&&!selectedNerve.current&&!s.highlightNerves?.length&&autoFade){autoFade=null;autoFadeDirty=true;dirty=true;}
   if((s.cameraFocusNonce??0)!==lastCameraFocus&&(s.cameraFocusParts?.length||s.cameraFocusNerve||s.cameraFocusRange)){
    const wanted=new Set(s.cameraFocusParts),box=new T.Box3();
    atlas.parts.forEach((p,i)=>{if(!wanted.has(p.id))return;const replacement=s.visible.includes(p.system)&&!(s.hiddenParts??[]).includes(p.id)&&(!s.focusParts||s.focusParts.includes(p.id))&&(cervicalVessels.replaced.has(p.id)||brainPickers.some(m=>m.visible&&m.userData.mjAtlasId===p.id));if(data[i*4+3]<.5&&!replacement)return;const mesh=pickers[i];box.union(mesh?(mesh.geometry.boundingBox??bounds[i]).clone().applyMatrix4(mesh.matrixWorld):bounds[i].clone());});
    if(s.cameraFocusRange){const rg=s.cameraFocusRange;box.union(new T.Box3(new T.Vector3(rg.c[0]-rg.r,rg.c[1]-rg.r,rg.c[2]-rg.r),new T.Vector3(rg.c[0]+rg.r,rg.c[1]+rg.r,rg.c[2]+rg.r)));}
    if(s.cameraFocusNerve)for(const o of nerveMeshes){if(((o.userData.mjExactName as string|undefined)||o.name)===s.cameraFocusNerve){o.updateWorldMatrix(true,false);box.union(new T.Box3().setFromObject(o));}}
    if(!box.isEmpty()){
     const center=box.getCenter(new T.Vector3()),dir=s.cameraFocusRange?new T.Vector3(...s.cameraFocusRange.dir).normalize():camera.position.clone().sub(controls.target).normalize();
     const rect=el.getBoundingClientRect(),w=el.clientWidth,h=el.clientHeight;
     const panel=document.querySelector('.left-workspace')?.getBoundingClientRect(),nav=document.querySelector('.body-region-nav')?.getBoundingClientRect(),rail=document.querySelector('.right-tool-rail')?.getBoundingClientRect();
     const left=panel&&panel.width>0?Math.min(w*.48,panel.right-rect.left+18):20;
     const right=rail&&rail.width>0?rail.left-rect.left-16:w-20;
     const top=nav?nav.bottom-rect.top+20:160,bottom=h-64;
     const availableWidth=Math.max(100,right-left),availableHeight=Math.max(100,bottom-top);
     camera.setViewOffset(w,h,w/2-(left+right)/2,h/2-(top+bottom)/2,w,h);
     const focusScale=T.MathUtils.clamp(s.cameraFocusScale??1,.62,1.15);
     const distance=framingDistance(box,dir,camera.fov,camera.aspect,availableWidth/w,availableHeight/h)*focusScale;
     focusTarget=center.clone();focusPosition=center.clone().addScaledVector(dir.lengthSq()>.5?dir:new T.Vector3(.3,.1,1).normalize(),distance);dirty=true;
     // Whatever stands between the camera and the structure is drawn see-through, so the structure is found even when buried; it goes back to normal when the selection is cleared.
     if(!s.cameraFocusRange){const eye=focusPosition,size=box.getSize(new T.Vector3()),samples=[center,...[[-1,-1,-1],[1,1,1],[-1,1,1],[1,-1,-1],[1,-1,1]].map(([a,b,c])=>new T.Vector3(center.x+a*size.x*.35,center.y+b*size.y*.35,center.z+c*size.z*.35))];
      const ray=new T.Raycaster(),hits=new Set<string>(),box3=new T.Box3(),dirv=new T.Vector3();
      for(const target of samples){dirv.copy(target).sub(eye);const dist=dirv.length();if(dist<1e-4)continue;dirv.normalize();ray.set(eye,dirv);ray.far=dist-.004;
       atlas.parts.forEach((p,i)=>{const mesh=pickers[i];if(!mesh||wanted.has(p.id)||data[i*4+3]<.5||p.system==='integumentary'||hits.has(p.id))return;box3.copy(mesh.geometry.boundingBox??bounds[i]).applyMatrix4(mesh.matrixWorld);if(!ray.ray.intersectsBox(box3))return;if(ray.intersectObject(mesh,false).length)hits.add(p.id);});}
      autoFade=hits.size?hits:null;autoFadeDirty=true;}
    }
    // the nerve streams in after its layer is switched on: keep trying (up to about half a minute) until its mesh exists
    if(s.cameraFocusNerve&&box.isEmpty()&&nerveFocusWait++<1800)dirty=true;else{lastCameraFocus=s.cameraFocusNonce??0;nerveFocusWait=0;}
   }
   controls.enableRotate=!jointGesture;controls.enablePan=!jointGesture;controls.mouseButtons.RIGHT=T.MOUSE.ROTATE;controls.touches.TWO=T.TOUCH.DOLLY_ROTATE;markers.visible=amount>.75;controls.autoRotate=s.rotate&&!s.isolate&&amount<.4&&!jointGesture;controls.autoRotateSpeed=.65;controls.update();if(controls.autoRotate)dirty=true;
   if(dirty){renderer.render(scene,camera);updateLabels();targets=[];if(amount>.45){const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);atlas.parts.forEach((p,i)=>{if(data[i*4+3]<.5||(hasSolid&&p.system==='integumentary'))return;let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;for(let corner=0;corner<8;corner++){projected.set(p.bounds[(corner&1)?1:0][0]+data[i*4],p.bounds[(corner&2)?1:0][1]+data[i*4+1],p.bounds[(corner&4)?1:0][2]+data[i*4+2]).project(camera);const x=(projected.x+1)*el.clientWidth/2,y=(1-projected.y)*el.clientHeight/2;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}projected.copy(centers[i]).add(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])).project(camera);if(projected.z< -1||projected.z>1)return;targets.push({index:i,x:(projected.x+1)*el.clientWidth/2,y:(1-projected.y)*el.clientHeight/2,left,right,top,bottom});});}dirty=false;}

  };animate();
  // ?mjview=1 exposes the camera for the screenshot scripts (view a structure from a chosen side and distance); nothing in the app uses it.
  if(typeof location!=='undefined'&&new URLSearchParams(location.search).has('mjview'))(window as unknown as {__mjView:unknown}).__mjView={look:(target:[number,number,number],dir:[number,number,number],distance:number)=>{controls.target.set(...target);camera.clearViewOffset();camera.position.set(target[0]+dir[0]*distance,target[1]+dir[1]*distance,target[2]+dir[2]*distance);controls.update();dirty=true;}};
  const contextLost=(e:Event)=>{e.preventDefault();onError('The 3D session was paused by your device. Reload to continue.');};renderer.domElement.addEventListener('webglcontextlost',contextLost);
  return()=>{labelLayer.remove();disposed=true;shoulderWorker?.terminate();retryLoad.current=null;abort.abort();cancelAnimationFrame(frame);observer.disconnect();controls.dispose();cervicalVessels.dispose();supplementaryJoints.dispose();draco.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());scene.traverse(o=>{if(o instanceof T.Mesh&&!geometries.includes(o.geometry)){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});env.dispose();partTexture.dispose();selectionTexture.dispose();motionTexture.dispose();rotationTexture.dispose();anchorMotionTexture.dispose();anchorRotationTexture.dispose();paletteTexture.dispose();markerGeometry.dispose();markerMaterial.dispose();hover.remove();renderer.dispose();renderer.domElement.remove();};
 },[atlas]);
 useEffect(()=>{if(retryNonce>0)retryLoad.current?.();},[retryNonce]);
 return <div className="scene" ref={host}/>;
}

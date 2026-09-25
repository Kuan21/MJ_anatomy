import {useEffect,useRef} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createExplosionLayout} from './explosion-layout';
import {decodeModelResponse} from './model-download';
import {PointerTap} from './pointer-tap';
import {framingDistance} from './camera-framing';
import {SYSTEMS,type Atlas,type SceneState} from './anatomy';
import {matchesUpperLimbMuscleLayer} from './mj-muscle-layers';
import {matchesFacialMuscleLayer} from './mj-facial-layers';
import {matchesDepth} from './mj-depth';
import {anatomicalRegion,anatomicalSide,isMotionQuarantined} from './mj-part-regions';
import {makeSoftRig,bindTissue,makePalette,deformTissue,registerNerveRest,resolveNeurovascularProfile,tissueBindings,nerveBindings,type SkinBinding,type Profile} from './biomechanics-v2/soft-tissue';
import {makeBodyRig,buildBodyMotion,bindBodyTissue,cranialNerveRigid,bodyBindings,type BodyRegion} from './biomechanics-v2/body-motion';
import {makeSurfaceConstraints,constrainSurface,makeSurfaceGroup,constrainSurfaceGroup} from './biomechanics-v2/surface-constraints';
import bodyNerveData from './biomechanics-v2/body-nerve-bindings.json';
const bodyNerveBindings=bodyNerveData as Record<string,BodyRegion>;
interface Props {atlas:Atlas;state:SceneState;onSelect:(id:string)=>void;onSelectNerve?:(name:string)=>void;onProgress:(n:number)=>void;onError:(s:string)=>void;onJointDrag?:(side:'left'|'right',joint:'shoulderAbduction'|'shoulderFlexion'|'elbowFlexion',delta:number)=>void;region?:'whole-body'|'shoulder'|'arm'|'forearm'|'hand';focusSide?:'both'|'left'|'right';motionActive?:boolean;jointMotionEnabled?:boolean;selectedExternalNerve?:string|null;bodyArea?:'whole'|'upper'|'lower'|'head'|'organs'}
export default function AnatomyScene({atlas,state,onSelect,onSelectNerve,onProgress,onError,onJointDrag,region='whole-body',focusSide='both',motionActive=false,jointMotionEnabled=false,selectedExternalNerve=null,bodyArea='whole'}:Props){
 const host=useRef<HTMLDivElement>(null),latest=useRef(state),select=useRef(onSelect),selectNerve=useRef(onSelectNerve),selectedNerve=useRef<string|null>(selectedExternalNerve),jointDrag=useRef(onJointDrag),viewerContext=useRef({region,focusSide,motionActive,jointMotionEnabled,bodyArea});
 latest.current=state;select.current=onSelect;selectNerve.current=onSelectNerve;selectedNerve.current=selectedExternalNerve;jointDrag.current=onJointDrag;viewerContext.current={region,focusSide,motionActive,jointMotionEnabled,bodyArea};
 useEffect(()=>{
  const el=host.current!;let disposed=false,frame=0,dirty=true,ready=false,lastView='',lastReset=-1,lastIsolate='',layoutKey='',amount=0,lastCameraFocus=-1;
  let lastState:SceneState|null=null;
  const abort=new AbortController();
  let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch{onError('This browser could not start the 3D viewer. Please try a browser with WebGL enabled.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<768?1.5:2));renderer.setClearColor('#cbd2d6');renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;el.appendChild(renderer.domElement);
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
  const partCenter=(p:(typeof atlas.parts)[number])=>new T.Vector3().fromArray(p.bounds[0]).add(new T.Vector3().fromArray(p.bounds[1])).multiplyScalar(.5);
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
  const draco=new DRACOLoader();draco.setDecoderPath(`${import.meta.env.BASE_URL}draco/`);const loader=new GLTFLoader();loader.setDRACOLoader(draco);loader.load(`${import.meta.env.BASE_URL}models/nervous.glb`,gltf=>{if(disposed)return;gltf.scene.updateMatrixWorld(true);gltf.scene.traverse(o=>{if(!(o instanceof T.Mesh))return;
    const exactName=meshSourceName(o)||'',fullName=nerveName(o);
    // The source GLB contains a freestanding 3-D title at x≈-0.81. Remove it
    // deterministically, and never import central-nervous-system meshes from
    // this legacy overlay (the BodyParts3D atlas already owns the brain/CNS).
    if(/nervous system\s*&\s*sense organs/i.test(exactName))return;
    if(!nerveBindings[exactName]&&!bodyNerveBindings[exactName]&&!/nerve|ganglion|plexus|ramus|rami/i.test(exactName))return;
    if(hasNamedAncestor(o,/central nervous system/i))return;
    if(/brain|cerebr|cerebell|\bgyrus\b|lobule|\blobe\b|hemisphere|white matter|gray matter|cortex|corpus callosum|thalam|hypothalam|hippocamp|amygdal|caudate|putamen|globus pallidus|internal capsule|colliculus|geniculate|midbrain|pons|medulla|fornix|commissure|ventricle|choroid plexus|optic chiasm|optic tract|pituitary|pineal/i.test(fullName))return;
    const geometry=o.geometry.clone();geometry.applyMatrix4(o.matrixWorld);geometry.computeBoundingBox();const geoCenter=geometry.boundingBox?.getCenter(new T.Vector3())??new T.Vector3(),geoSize=geometry.boundingBox?.getSize(new T.Vector3())??new T.Vector3();
    // Fallback for the title geometry even if a future exporter renames it.
    if(geoCenter.x<-.58&&geoCenter.y>.68&&geoCenter.y<1.12)return;
    // Some legacy CNS children have no useful anatomical node label. Reject
    // broad intracranial sheets by geometry as well, while retaining slender
    // cranial/peripheral nerves. The integrated brain model owns this volume.
    if(geoCenter.y>1.49&&Math.abs(geoCenter.x)<.16&&geoSize.x>.045&&geoSize.z>.045)return;
    geometry.boundingSphere=new T.Sphere(new T.Vector3(0,.9,0),2.5);const position=geometry.getAttribute('position');if(!position)return;const material=new T.MeshStandardMaterial({color:0xf1cb4f,metalness:0,roughness:.42,emissive:0x6b5100,emissiveIntensity:.28,depthTest:true,depthWrite:false,transparent:true,opacity:.82});geometry.computeBoundingBox();const nerveCenter=geometry.boundingBox?.getCenter(new T.Vector3())??new T.Vector3();
    const binding=nerveBindings[exactName];
    const mesh=new T.Mesh(geometry,material);mesh.name=exactName||fullName;mesh.frustumCulled=false;mesh.renderOrder=0;
    mesh.userData.mjNerve=true;mesh.userData.mjExactName=exactName;mesh.userData.mjSide=binding?.side??nerveSide(exactName);
    if(binding&&softRigs[binding.side]){registerNerveRest(softRigs[binding.side]!,position.array as Float32Array);position.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingBox();}
    mesh.userData.basePositions=new Float32Array(position.array as ArrayLike<number>);
    if(binding&&softRigs[binding.side])mesh.userData.skin=bindTissue(softRigs[binding.side]!,resolveNeurovascularProfile(exactName,'path'),mesh.userData.basePositions);
    const inferredHeadNerve=/cervical|vagus|phrenic|hypoglossal|accessory|glossopharyngeal|ansa cervicalis|sympathetic trunk|superior cervical|middle cervical|inferior cervical/i.test(exactName);
    const bodyRegion=bodyNerveBindings[exactName]??(inferredHeadNerve?'head':undefined);
    if(bodyRegion){mesh.userData.bodyRegion=bodyRegion;mesh.userData.bodySkin=bindBodyTissue(bodyRigs[bodyRegion],mesh.userData.basePositions,cranialNerveRigid(exactName));}
    if(binding||bodyRegion==='head')mesh.userData.spineSkin=bindBodyTissue(bodyRigs.spine,mesh.userData.basePositions,true);
    nerveRoot.add(mesh);nerveMeshes.push(mesh);
   });lastState=null;dirty=true;},undefined,err=>{if(!disposed)console.warn('Could not load legacy nervous system model',err);});
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
   const brainUrls=[`${import.meta.env.BASE_URL}models/brain.glb`];
   let bi=0;
   const attempt=()=>loader.load(brainUrls[bi],gltf=>{
    if(disposed)return;
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
     if(!material){material=new T.MeshStandardMaterial({color:appearance.color,roughness:.72,metalness:0,side:T.FrontSide,transparent:appearance.transparent,opacity:appearance.opacity,depthWrite:!appearance.transparent});brainMaterials.set(appearance.key,material);materials.push(material);}
     const mesh=new T.Mesh(geometry,material);mesh.name='Brain Project · '+label;mesh.frustumCulled=false;mesh.userData.mjBrainProject=true;mesh.userData.mjBrainLabel=label;mesh.userData.mjAtlasId=brainAtlasIdFor(label,category);brainVisualRoot.add(mesh);brainPickers.push(mesh);added.push(mesh);
     if(geometry.boundingBox)sourceBox.union(geometry.boundingBox);
    });
    if(sourceBox.isEmpty()||brainTargetBox.isEmpty()||!added.length){brainVisualRoot.clear();brainPickers.length=0;return;}
    const sc=sourceBox.getCenter(new T.Vector3()),ss=sourceBox.getSize(new T.Vector3()),tc=brainTargetBox.getCenter(new T.Vector3()),ts=brainTargetBox.getSize(new T.Vector3());
    const scale=Math.min(ts.x/Math.max(ss.x,1e-6),ts.y/Math.max(ss.y,1e-6),ts.z/Math.max(ss.z,1e-6))*.97;
    brainVisualRoot.scale.setScalar(scale);brainVisualRoot.position.copy(tc).addScaledVector(sc,-scale);brainVisualRoot.updateMatrixWorld(true);
    brainLoaded=true;lastState=null;dirty=true;
   },undefined,err=>{bi++;if(bi<brainUrls.length)attempt();else if(!disposed)onError('腦模型載入失敗，請重新載入頁面。Brain Project model failed to load.');});
   attempt();
  };
  const updateBrainMotion=(s:SceneState)=>{
   const m=new T.Matrix4();
   if(s.bodyMotion?.region==='head'){const built=buildBodyMotion(bodyRigs.head,s.bodyMotion.pose);m.copy(built.matrices[built.matrices.length-1]);}
   else if(s.bodyMotion?.region==='spine'){const built=buildBodyMotion(bodyRigs.spine,s.bodyMotion.pose);m.copy(built.matrices[built.matrices.length-1]);}
   brainMotionRoot.matrix.copy(m);brainMotionRoot.matrixWorldNeedsUpdate=true;
  };
  const transformMatrix=(t:NonNullable<SceneState['partTransforms']>[string]|undefined)=>{const m=new T.Matrix4();if(!t)return m.identity();return m.compose(new T.Vector3(...t.translation),new T.Quaternion(...t.quaternion),new T.Vector3(1,1,1));};
  const updateNerveMotion=(s:SceneState)=>{
   const body=s.bodyMotion?buildBodyMotion(bodyRigs[s.bodyMotion.region],s.bodyMotion.pose):null;
   const palettes={left:softRigs.left?makePalette(softRigs.left,s.partTransforms??{}):null,right:softRigs.right?makePalette(softRigs.right,s.partTransforms??{}):null};
   for(const mesh of nerveMeshes){
    const base=mesh.userData.basePositions as Float32Array,skin=mesh.userData.skin as SkinBinding|undefined;
    const binding=nerveBindings[mesh.name],rig=binding?softRigs[binding.side]:null;
    const bodyActive=!!(body&&mesh.userData.bodySkin&&mesh.userData.bodyRegion===s.bodyMotion?.region);
    const spineCarry=!!(body&&s.bodyMotion?.region==='spine'&&mesh.userData.spineSkin);
    const limbActive=!!(!s.bodyMotion&&s.tissueMotion&&skin&&rig&&s.partTransforms?.[rig.ids[3]!]);
    const active=bodyActive||spineCarry||limbActive;
    if(!active&&!mesh.userData.tissuePosed)continue;
    const attr=mesh.geometry.getAttribute('position') as T.BufferAttribute;
    if(bodyActive)deformTissue(mesh.userData.bodySkin,base,body!.palette,attr.array as Float32Array);
    else if(spineCarry)deformTissue(mesh.userData.spineSkin,base,body!.palette,attr.array as Float32Array);
    else if(limbActive)deformTissue(skin!,base,palettes[binding.side]!,attr.array as Float32Array);
    else (attr.array as Float32Array).set(base);
    mesh.userData.tissuePosed=active;
    attr.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();
   }
  };

  camera.position.set(1.4,1.05,3.6);controls.target.set(0,.85,0);controls.enableDamping=true;controls.dampingFactor=.085;controls.enablePan=true;controls.screenSpacePanning=true;controls.panSpeed=1;controls.zoomSpeed=1;controls.minDistance=.04;controls.maxDistance=40;controls.maxPolarAngle=Math.PI*.96;controls.mouseButtons.LEFT=T.MOUSE.PAN;controls.mouseButtons.RIGHT=T.MOUSE.ROTATE;controls.touches.ONE=T.TOUCH.PAN;controls.touches.TWO=T.TOUCH.DOLLY_ROTATE;let focusTarget:T.Vector3|null=null,focusPosition:T.Vector3|null=null;controls.addEventListener('start',()=>{focusTarget=null;focusPosition=null;});controls.addEventListener('change',()=>{dirty=true;});
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight(0xffffff,0xa7acb2,1.05));
  const key=new T.DirectionalLight(0xfffaf4,2.3);key.position.set(-2,4,3);scene.add(key);
  const rim=new T.DirectionalLight(0xe9f0ff,1.8);rim.position.set(2,2,-3);scene.add(rim);
  const ground=new T.Mesh(new T.CircleGeometry(30,96),new T.MeshStandardMaterial({color:0xd5d9dc,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.019;scene.add(ground);
  const platform=new T.Mesh(new T.CylinderGeometry(.68,.7,.028,100),new T.MeshStandardMaterial({color:0xeeeeec,metalness:.12,roughness:.67}));platform.position.y=-.016;scene.add(platform);
  const ring=new T.Mesh(new T.RingGeometry(.63,.632,128),new T.MeshBasicMaterial({color:0x8c969f,transparent:true,opacity:.4,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.001;scene.add(ring);
  const innerRing=new T.Mesh(new T.RingGeometry(.55,.551,128),new T.MeshBasicMaterial({color:0xa4aeb8,transparent:true,opacity:.16,side:T.DoubleSide}));innerRing.rotation.x=-Math.PI/2;innerRing.position.y=.001;scene.add(innerRing);
  const width=T.MathUtils.ceilPowerOfTwo(atlas.parts.length),data=new Float32Array(width*4),partTexture=new T.DataTexture(data,width,1,T.RGBAFormat,T.FloatType);partTexture.needsUpdate=true;
  const selectedData=new Uint8Array(width*4),selectionTexture=new T.DataTexture(selectedData,width,1);selectionTexture.needsUpdate=true;
  const motionData=new Float32Array(width*4),motionTexture=new T.DataTexture(motionData,width,1,T.RGBAFormat,T.FloatType);motionTexture.needsUpdate=true;
  const rotationData=new Float32Array(width*4);for(let i=0;i<width;i++)rotationData[i*4+3]=1;
  const rotationTexture=new T.DataTexture(rotationData,width,1,T.RGBAFormat,T.FloatType);rotationTexture.needsUpdate=true;
  const anchorMotionData=new Float32Array(width*4),anchorMotionTexture=new T.DataTexture(anchorMotionData,width,1,T.RGBAFormat,T.FloatType);anchorMotionTexture.needsUpdate=true;
  const anchorRotationData=new Float32Array(width*4);for(let i=0;i<width;i++)anchorRotationData[i*4+3]=1;
  const anchorRotationTexture=new T.DataTexture(anchorRotationData,width,1,T.RGBAFormat,T.FloatType);anchorRotationTexture.needsUpdate=true;
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
  const materialFor=(system:string)=>{
   const m=new T.MeshStandardMaterial({color:SYSTEMS.find(s=>s.id===system)?.color??'#aebbb8',metalness:.08,roughness:.53,side:T.DoubleSide,transparent:system==='integumentary',opacity:system==='integumentary'?.1:1,depthWrite:system!=='integumentary'});
   m.onBeforeCompile=shader=>{
    shader.uniforms.partState={value:partTexture};shader.uniforms.selectionState={value:selectionTexture};shader.uniforms.motionState={value:motionTexture};shader.uniforms.rotationState={value:rotationTexture};shader.uniforms.anchorMotionState={value:anchorMotionTexture};shader.uniforms.anchorRotationState={value:anchorRotationTexture};shader.uniforms.stateWidth={value:width};shader.uniforms.maxSoftDisplacement={value:system==='arterial'||system==='venous'?.16:system==='muscular'?.24:1.0};
    shader.vertexShader='attribute float partIndex; attribute float motionWeight; uniform sampler2D partState; uniform sampler2D selectionState; uniform sampler2D motionState; uniform sampler2D rotationState; uniform sampler2D anchorMotionState; uniform sampler2D anchorRotationState; uniform float stateWidth; uniform float maxSoftDisplacement; varying float partVisible; varying float partSelected; vec3 qrot(vec4 q, vec3 v){ return v + 2.0*cross(q.xyz, cross(q.xyz,v)+q.w*v); }\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nvec2 normalStateUv = vec2((partIndex + 0.5) / stateWidth, 0.5); vec4 normalRot = normalize(texture2D(rotationState,normalStateUv)); vec4 normalAnchorRot = normalize(texture2D(anchorRotationState,normalStateUv)); if(dot(normalAnchorRot,normalRot)<0.0) normalRot=-normalRot; vec4 normalBlend=normalize(mix(normalAnchorRot,normalRot,motionWeight)); objectNormal=qrot(normalBlend,objectNormal);');
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvec2 stateUv = vec2((partIndex + 0.5) / stateWidth, 0.5); vec4 state = texture2D(partState, stateUv); vec3 motion = texture2D(motionState,stateUv).xyz; vec4 rotation = normalize(texture2D(rotationState,stateUv)); vec3 anchorMotion = texture2D(anchorMotionState,stateUv).xyz; vec4 anchorRotation = normalize(texture2D(anchorRotationState,stateUv)); vec3 anchorPosition=qrot(anchorRotation,transformed)+anchorMotion; vec3 movingPosition=qrot(rotation,transformed)+motion; vec3 softDelta=movingPosition-anchorPosition; float softLen=length(softDelta); if(softLen>maxSoftDisplacement) softDelta*=maxSoftDisplacement/softLen; transformed=anchorPosition+softDelta*motionWeight+state.xyz; partVisible = state.w; partSelected = texture2D(selectionState, stateUv).r;');
    shader.fragmentShader='varying float partVisible; varying float partSelected;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif (partVisible < 0.5) discard;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.61, 0.97, 0.69), partSelected * 0.99);');
   };materials.push(m);return m;
  };
  const mats=new Map(SYSTEMS.map(s=>[s.id,materialFor(s.id)]));
  
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
  const loadedChunks=new Set<number>(),loadingChunks=new Set<number>();
  const eagerChunks=atlas.chunks.map((_,i)=>i).filter(i=>!atlas.chunks[i].deferUntil),facialChunkIndex=atlas.chunks.findIndex(ch=>ch.deferUntil==='head');
  let eagerLoaded=0;
  const loadChunk=async(ci:number)=>{
   if(loadedChunks.has(ci)||loadingChunks.has(ci))return;
   loadingChunks.add(ci);
   const chunk=atlas.chunks[ci],compressed=!!chunk.gzip&&typeof DecompressionStream!=='undefined';const response=await fetch(resolveModelUrl(compressed?chunk.gzip!:chunk.url),{signal:abort.signal});const buffer=await decodeModelResponse(response,chunk.bytes,compressed);if(disposed)return;
   const groups=new Map<string,T.BufferGeometry[]>();
   atlas.parts.forEach((p,i)=>{
    if(p.chunk!==ci)return;
    const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(buffer,p.positions,p.vertexCount*3),3));
    // GPU normalized signed-short normals keep the complete atlas compact in memory.
    g.setAttribute('normal',new T.BufferAttribute(Float32Array.from(new Int16Array(buffer,p.normals,p.vertexCount*3),n=>Math.max(-1,n/32767)),3));g.setIndex(new T.BufferAttribute(new Uint32Array(buffer,p.indices,p.indexCount),1));
    const position=g.getAttribute('position') as T.BufferAttribute,weights=new Float32Array(p.vertexCount);
    for(let vi=0;vi<p.vertexCount;vi++)weights[vi]=vertexMotionWeight(p,position.getX(vi),position.getY(vi),position.getZ(vi));
    g.setAttribute('motionWeight',new T.BufferAttribute(weights,1));
    g.boundingBox=bounds[i].clone();g.computeBoundingSphere();const pick=new T.Mesh(g);pick.matrixAutoUpdate=false;pick.userData.baseMotionPositions=new Float32Array(position.array as ArrayLike<number>);pick.userData.motionWeights=weights;
    const binding=tissueBindings[p.id];
    const canonicalRegion=anatomicalRegion(p),canonicalSide=anatomicalSide(p);
    const bindingSide=binding?(canonicalSide==='midline'?binding.side:canonicalSide):null;
    const rig=bindingSide?softRigs[bindingSide]:null;
    // A curated attachment can cross the display-region boundary: subclavian
    // and thoracic vessels still need their proximal-to-distal blend. Lower
    // limbs and quarantined source meshes must never enter an arm rig.
    if(binding?.name===p.name&&rig&&(canonicalRegion==='upper-limb'||canonicalRegion==='trunk')&&!isMotionQuarantined(p)){
     const profile=(p.system==='arterial'||p.system==='venous')?resolveNeurovascularProfile(p.name,binding.profile):binding.profile;
     pick.userData.skin=bindTissue(rig,profile,pick.userData.baseMotionPositions,p);
     pick.userData.tissueSide=bindingSide;
    }
    if(!pick.userData.skin&&p.system==='connective'&&canonicalRegion==='upper-limb'&&!isMotionQuarantined(p)){
     const side=canonicalSide==='midline'?connectiveSide(p.name):canonicalSide,profile=connectiveProfile(p.name),jointRig=side?softRigs[side]:null;
     if(side&&profile&&jointRig){
      pick.userData.skin=bindTissue(jointRig,profile,pick.userData.baseMotionPositions,p);
      pick.userData.tissueSide=side;pick.userData.mjJointBinding=profile;
     }
    }

    // Whole-body bindings are keyed by stable source ID. The curated binding
    // name may intentionally correct a bad BodyParts3D label (for example the
    // dorsal foot veins mislabelled as metacarpal), so do not reject the
    // binding merely because the raw source name differs.
    const bb=bodyBindings[p.id];
    let resolvedBodyRegion:BodyRegion|undefined=bb?.rig;
    if(resolvedBodyRegion==='leftLeg'||resolvedBodyRegion==='rightLeg'){
     if(canonicalRegion!=='lower-limb'||isMotionQuarantined(p))resolvedBodyRegion=undefined;
     else if(canonicalSide==='left')resolvedBodyRegion='leftLeg';
     else if(canonicalSide==='right')resolvedBodyRegion='rightLeg';
    }
    if(bb&&bb.frame===null&&resolvedBodyRegion){
     pick.userData.bodySkin=bindBodyTissue(bodyRigs[resolvedBodyRegion],pick.userData.baseMotionPositions,false,p);
     pick.userData.bodyRegion=resolvedBodyRegion;
    }

    const pc=partCenter(p),spinalCordPart=/spinal cord|central canal/i.test(p.name),spansNeck=p.bounds[1][1]>=1.10&&p.bounds[0][1]<=1.72;
    const cervicalFollower=(pc.y>=1.08&&pc.y<=1.72&&Math.abs(pc.x)<=.34&&
      /trachea|esophagus|laryn|pharyn|hyoid|thyroid|cricoid|epiglott|longus|scalen|sternocleidomastoid|splenius|semispinalis|carotid|jugular|vertebral artery|vertebral vein|cervical fascia|nuchal ligament/i.test(p.name)
     )||(spinalCordPart&&spansNeck);
    if(!pick.userData.bodySkin&&cervicalFollower){
     pick.userData.bodySkin=bindBodyTissue(bodyRigs.head,pick.userData.baseMotionPositions,false,p);
     pick.userData.bodyRegion='head';
    }

    // Head/neck and upper-limb tissues inherit trunk motion as one carried
    // chain, but their own head/arm deformation fields remain independent.
    const headDescendant=(bb?.rig==='head'||p.id.startsWith('BP3-FMA')||cervicalFollower)&&p.system!=='skeletal';
    if(headDescendant)pick.userData.spineSkin=bindBodyTissue(bodyRigs.spine,pick.userData.baseMotionPositions,!spinalCordPart,p);
    if(binding?.name===p.name)pick.userData.spineSkin=bindBodyTissue(bodyRigs.spine,pick.userData.baseMotionPositions,true,p);

    const spineCenter=pc.y,spineLevels=bodyRigs.spine.levels;
    const spineSoft=!bb&&spineCenter>=spineLevels[0]-.12&&spineCenter<=spineLevels[spineLevels.length-1]+.13&&/pectoralis|serratus|intercostal|costal cartilage|costochondral|sternocostal|rectus abdominis|oblique|transversus abdominis|latissimus|trapezius|erector spinae|multifidus|semispinalis thoracis|quadratus lumborum|psoas|thoracolumbar|aorta|vena cava|intercostal (?:artery|vein)|thoracic duct/i.test(p.name);
    if(spineSoft){
     pick.userData.bodySkin=bindBodyTissue(bodyRigs.spine,pick.userData.baseMotionPositions,false,p);
     pick.userData.bodyRegion='spine';
    }
    if(pick.userData.skin&&['chest','cuff','scapular'].includes(pick.userData.skin.profile))
     pick.userData.surfaceGuard=makeSurfaceConstraints(pick.userData.baseMotionPositions,g.index!.array,pick.userData.skin);
    if(((bb?.rig==='head'&&/platysma|sternocleidomastoid/.test(p.name))||spineSoft)&&pick.userData.bodySkin)
     pick.userData.bodySurfaceGuard=makeSurfaceConstraints(pick.userData.baseMotionPositions,g.index!.array,pick.userData.bodySkin);
    pickers[i]=pick;geometries.push(g);
    g.setAttribute('partIndex',new T.BufferAttribute(new Float32Array(p.vertexCount).fill(i),1));
    const list=groups.get(p.system)??[];list.push(g);groups.set(p.system,list);
   });
   groups.forEach((gs,system)=>{const geometry=mergeGeometries(gs,false);if(!geometry)throw new Error('Could not assemble anatomy geometry.');geometries.push(geometry);let vertexOffset=0;
    for(const g of gs){const index=g.getAttribute('partIndex').getX(0),pick=pickers[index]!;pick.userData.mergedGeometry=geometry;pick.userData.mergedOffset=vertexOffset;vertexOffset+=g.getAttribute('position').count;}
    const mesh=new T.Mesh(geometry,mats.get(system as never));mesh.frustumCulled=false;scene.add(mesh);});
   loadedChunks.add(ci);loadingChunks.delete(ci);lastState=null;
   if(!chunk.deferUntil){eagerLoaded++;onProgress(Math.round(eagerLoaded/Math.max(1,eagerChunks.length)*100));}
   dirty=true;
  };
  (async()=>{try{let cursor=0;await Promise.all(Array.from({length:3},async()=>{while(cursor<eagerChunks.length){const i=eagerChunks[cursor++];await loadChunk(i);}}));if(!disposed){ready=true;onProgress(100);dirty=true;}}catch(e){if(!disposed)onError(e instanceof Error?e.message:'Could not load the anatomy.');}})();
  const shoulderGroups=new Map<string,{count:number;group:ReturnType<typeof makeSurfaceGroup>}>();
  const updateTissueMotion=(s:SceneState)=>{
   const touched=new Set<T.Mesh>();
   const body=s.bodyMotion?buildBodyMotion(bodyRigs[s.bodyMotion.region],s.bodyMotion.pose):null;
   const palettes={left:softRigs.left?makePalette(softRigs.left,s.partTransforms??{}):null,right:softRigs.right?makePalette(softRigs.right,s.partTransforms??{}):null};
   for(const mesh of pickers){
    if(!mesh)continue;const skin=mesh.userData.skin as SkinBinding|undefined;if(!skin&&!mesh.userData.bodySkin&&!mesh.userData.spineSkin)continue;
    const side=mesh.userData.tissueSide as 'left'|'right',rig=softRigs[side];
    const bodyActive=!!(body&&mesh.userData.bodySkin&&mesh.userData.bodyRegion===s.bodyMotion?.region);
    const spineCarry=!!(body&&s.bodyMotion?.region==='spine'&&mesh.userData.spineSkin);
    const active=bodyActive||spineCarry||!!(!s.bodyMotion&&skin&&s.tissueMotion&&rig&&s.partTransforms?.[rig.ids[3]!]);
    if(!active&&!mesh.userData.tissuePosed)continue;
    touched.add(mesh);
    const attr=mesh.geometry.getAttribute('position') as T.BufferAttribute,base=mesh.userData.baseMotionPositions as Float32Array;
    if(bodyActive)deformTissue(mesh.userData.bodySkin,base,body!.palette,attr.array as Float32Array);else if(spineCarry)deformTissue(mesh.userData.spineSkin,base,body!.palette,attr.array as Float32Array);else if(active)deformTissue(skin!,base,palettes[side]!,attr.array as Float32Array);else (attr.array as Float32Array).set(base);
    const guard=bodyActive?mesh.userData.bodySurfaceGuard:active&&!spineCarry?mesh.userData.surfaceGuard:null;if(guard)constrainSurface(guard,attr.array as Float32Array);
    mesh.userData.tissuePosed=active;
   }
   // Solve the complete deltoid envelope before rendering; per-head correction
   // would separate duplicated vertices along shared surface seams.
   if(!s.bodyMotion&&s.tissueMotion)for(const side of ['left','right'] as const){
    const meshes=pickers.filter(m=>m?.userData.tissuePosed&&m.userData.tissueSide===side&&m.userData.skin?.profile==='deltoid');
    if(!meshes.length)continue;
    let entry=shoulderGroups.get(side);
    if(!entry||entry.count!==meshes.length){entry={count:meshes.length,group:makeSurfaceGroup(meshes.map(m=>({base:m!.userData.baseMotionPositions,triangles:m!.geometry.index!.array,skin:m!.userData.skin,positions:m!.geometry.getAttribute('position').array as Float32Array})))};shoulderGroups.set(side,entry);}
    constrainSurfaceGroup(entry.group);
   }
   for(const mesh of touched){
    const attr=mesh.geometry.getAttribute('position') as T.BufferAttribute;
    attr.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();
    const merged=mesh.userData.mergedGeometry as T.BufferGeometry,offset=mesh.userData.mergedOffset*3;
    for(const key of ['position','normal']){const to=merged.getAttribute(key) as T.BufferAttribute;(to.array as Float32Array).set(mesh.geometry.getAttribute(key).array,offset);to.needsUpdate=true;}
   }
  };
  const fit=(view:string,extent=0)=>{
   const aspect=camera.aspect,mobile=el.clientWidth<768,normalDistance=mobile?Math.max(4.5,1.8*el.clientHeight/Math.max(160,el.clientHeight-350)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))):4;
   const reservedHeight=mobile?350:270;const availableAspect=Math.max(.35,(el.clientWidth-(mobile?40:340))/Math.max(160,el.clientHeight-reservedHeight));const atlasDistance=Math.max(packingHeight,packingWidth/availableAspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*(el.clientHeight/Math.max(160,el.clientHeight-reservedHeight))*1.08;
   const distance=T.MathUtils.lerp(normalDistance,Math.max(.2,atlasDistance),extent);if(extent>.8)view='front';
   const direction=view==='front'?new T.Vector3(0,.02,1):view==='back'?new T.Vector3(0,.02,-1):view==='side'?new T.Vector3(1,.02,0):new T.Vector3(.35,.06,1).normalize();
   controls.target.set(extent>.1&&el.clientWidth>767?-packingWidth*.12:0,extent>.1||mobile?.85:.68,0);camera.position.copy(controls.target).addScaledVector(direction,distance);controls.update();dirty=true;
  };
  const resize=()=>{layoutKey='';lastState=null;lastCameraFocus=-1;camera.clearViewOffset();renderer.setPixelRatio(Math.min(devicePixelRatio,el.clientWidth<768||el.clientHeight<600?1.5:2));camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);fit(latest.current.view,amount);};const observer=new ResizeObserver(resize);observer.observe(el);
  const raycaster=new T.Raycaster(),pointer=new T.Vector2(),tap=new PointerTap(),worldBox=new T.Box3(),hitPoint=new T.Vector3();
  const pickPartAt=(clientX:number,clientY:number)=>{
   const rect=renderer.domElement.getBoundingClientRect();pointer.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
   let nearest=Infinity,found=-1;const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);
   pickers.forEach((mesh,i)=>{if(!mesh||data[i*4+3]<.5||(hasSolid&&atlas.parts[i].system==='integumentary'))return;worldBox.copy(mesh.geometry.boundingBox??bounds[i]).applyMatrix4(mesh.matrixWorld);if(!raycaster.ray.intersectBox(worldBox,hitPoint))return;const hits=raycaster.intersectObject(mesh,false);if(hits[0]&&hits[0].distance<nearest){nearest=hits[0].distance;found=i;}});
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
   if(ax<.12||cy<.72||cy>1.44)return null;
   const side: 'left'|'right'=cx<0?'right':'left';
   if(cy>=1.10)return {side,joint:'shoulderAbduction' as const};
   return {side,joint:'elbowFlexion' as const};
  };
  const down=(e:PointerEvent)=>{
   hover.hidden=true;
   if(e.button===0){
    const front=ready?frontHit(e.clientX,e.clientY):null;
    const hit=front?.kind==='part'?front.index:-1,jointInfo=jointForPart(hit);
    if(viewerContext.current.jointMotionEnabled&&jointInfo&&jointDrag.current){
     // Treat a press as a possible anatomy tap first. Only convert it into a
     // joint drag after the pointer actually moves. This keeps muscles, bones
     // and other visible structures selectable while Motion Lab is active.
     jointGesture={pointerId:e.pointerId,side:jointInfo.side,joint:jointInfo.joint,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,hitIndex:hit,dragging:false};
     controls.enabled=false;renderer.domElement.setPointerCapture?.(e.pointerId);renderer.domElement.style.cursor='grab';e.preventDefault();return;
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
   tap.move(e.pointerId,e.clientX,e.clientY);if(e.buttons||amount<.5||e.pointerType==='touch'){hover.hidden=true;return;}const rect=el.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,index=findTarget(x,y,12);hover.hidden=index<0;renderer.domElement.style.cursor=index<0?'move':'grab';if(index>=0){hover.textContent=atlas.parts[index].name;hover.style.left=`${Math.max(8,Math.min(x+14,el.clientWidth-260))}px`;hover.style.top=`${Math.max(8,Math.min(y+18,el.clientHeight-55))}px`;}
  };
  const resetPrimaryGesture=()=>{controls.enabled=true;controls.mouseButtons.LEFT=T.MOUSE.PAN;controls.touches.ONE=T.TOUCH.PAN;renderer.domElement.style.cursor='move';};
  const cancel=(e:PointerEvent)=>{if(jointGesture?.pointerId===e.pointerId)jointGesture=null;tap.cancel(e.pointerId);resetPrimaryGesture();};
  const up=(e:PointerEvent)=>{
   if(jointGesture?.pointerId===e.pointerId){
    const gesture=jointGesture;jointGesture=null;renderer.domElement.releasePointerCapture?.(e.pointerId);resetPrimaryGesture();
    if(!gesture.dragging&&gesture.hitIndex>=0&&ready){hover.hidden=true;select.current(atlas.parts[gesture.hitIndex].id);}
    return;
   }
   const validTap=tap.up(e.pointerId,e.clientX,e.clientY);resetPrimaryGesture();if(!validTap||!ready)return;
   const front=frontHit(e.clientX,e.clientY);if(front?.kind==='brain'){hover.hidden=true;select.current(front.id);return;}if(front?.kind==='nerve'){hover.hidden=true;selectNerve.current?.(front.name);return;}
   let found=front?.kind==='part'?front.index:-1;const rect=renderer.domElement.getBoundingClientRect();if(found<0&&amount>.45)found=findTarget(e.clientX-rect.left,e.clientY-rect.top,e.pointerType==='touch'?24:16);if(found>=0){hover.hidden=true;select.current(atlas.parts[found].id);}
  };
  renderer.domElement.addEventListener('pointerdown',down,true);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',cancel);
  const clock=new T.Clock();let lastExtent=-1;
  const animate=()=>{
   if(disposed)return;frame=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),s=latest.current;
   if(focusTarget&&focusPosition){const a=1-Math.exp(-8*dt);controls.target.lerp(focusTarget,a);camera.position.lerp(focusPosition,a);dirty=true;if(controls.target.distanceToSquared(focusTarget)<1e-7&&camera.position.distanceToSquared(focusPosition)<1e-7){controls.target.copy(focusTarget);camera.position.copy(focusPosition);focusTarget=null;focusPosition=null;}}
   const changed=lastState?.visible!==s.visible||lastState?.selected!==s.selected||lastState?.hiddenParts!==s.hiddenParts||lastState?.depthFilter!==s.depthFilter||lastState?.muscleLayer!==s.muscleLayer||lastState?.faceMuscleLayer!==s.faceMuscleLayer||lastState?.focusParts!==s.focusParts||lastState?.isolate!==s.isolate||lastState?.partTransforms!==s.partTransforms||lastState?.bodyMotion!==s.bodyMotion;
   const tissueChanged=!lastState||lastState.partTransforms!==s.partTransforms||lastState.tissueMotion!==s.tissueMotion||lastState.bodyMotion!==s.bodyMotion;
   if(tissueChanged){updateTissueMotion(s);updateNerveMotion(s);updateBrainMotion(s);}
   const ctx=viewerContext.current;
   if(s.visible.includes('nervous')&&(ctx.bodyArea==='head'||ctx.bodyArea==='whole'||s.bodyMotion?.region==='head'||s.bodyMotion?.region==='spine'||!s.visible.includes('skeletal')||(s.hiddenParts?.length??0)>0))ensureBrain();
   if(ctx.bodyArea==='head'&&facialChunkIndex>=0&&!loadedChunks.has(facialChunkIndex)&&!loadingChunks.has(facialChunkIndex)){void loadChunk(facialChunkIndex).catch(e=>{loadingChunks.delete(facialChunkIndex);if(!disposed)onError(e instanceof Error?`Facial muscles: ${e.message}`:'Could not load facial muscles.');});}
   if(nerveMeshes.length){
    const nervesOn=s.visible.includes('nervous')&&!s.isolate;
    nerveRoot.visible=nervesOn;
    nerveMeshes.forEach(o=>{
     if(!nervesOn){o.visible=false;return;}
     const name=(o.userData.mjExactName as string|undefined)||o.name,side=nerveSide(name);
     const sideOk=ctx.focusSide==='both'||side==='both'||side===ctx.focusSide;
     if(s.bodyMotion?.region==='spine')o.visible=sideOk;
     else if(s.bodyMotion?.region==='head')o.visible=sideOk&&bodyNerveBindings[name]==='head';
     else if(s.bodyMotion?.region==='leftLeg'||s.bodyMotion?.region==='rightLeg')o.visible=sideOk&&bodyNerveBindings[name]===s.bodyMotion.region;
     else if(ctx.bodyArea==='head')o.visible=bodyNerveBindings[name]==='head';
     else if(ctx.bodyArea==='lower')o.visible=bodyNerveBindings[name]==='leftLeg'||bodyNerveBindings[name]==='rightLeg';
     else if(ctx.bodyArea==='organs')o.visible=false;
     else if(ctx.bodyArea==='upper'&&ctx.region==='whole-body')o.visible=sideOk&&!!nerveBindings[name];
     else if(ctx.motionActive)o.visible=sideOk&&!!nerveBindings[name];
     else o.visible=sideOk&&nerveMatchesRegion(name,ctx.region,false);
     const isSelectedNerve=!!selectedNerve.current&&name===selectedNerve.current;
     const targetColor=isSelectedNerve?0x9cf7b0:0xf1cb4f,targetEmissive=isSelectedNerve?0x3f9a5d:0x6b5100,targetIntensity=isSelectedNerve?.60:.28;
     if(o.material.color.getHex()!==targetColor||o.material.emissive.getHex()!==targetEmissive||o.material.emissiveIntensity!==targetIntensity||!o.material.depthTest||o.material.opacity!==1){
      o.material.color.setHex(targetColor);o.material.emissive.setHex(targetEmissive);o.material.emissiveIntensity=targetIntensity;o.material.depthTest=true;o.material.depthWrite=true;o.material.transparent=false;o.material.opacity=1;o.material.needsUpdate=true;
     }
    });
   }
   const moving=Math.abs(amount-s.explode)>.0001;
   if(moving){amount=T.MathUtils.damp(amount,s.explode,8,dt);dirty=true;}
   if(changed||moving||lastExtent<0){
    const visible=new Set(s.visible),selection=new Set(s.selected),hidden=new Set(s.hiddenParts??[]),focus=s.focusParts?new Set(s.focusParts):null;
    const cranialVault=/^(frontal bone|left parietal bone|right parietal bone|left temporal bone|right temporal bone|occipital bone|sphenoid bone|ethmoid)$/i;
    const intracranial=/brain|cerebr|cerebell|\bgyrus\b|lobule|\blobe\b|hemisphere|white matter|gray matter|cortex|insula|midbrain|pons|medulla oblongata|thalam|hypothalam|fornix|ventricle|choroid plexus|corpus callosum|hippocamp|amygdal|caudate|putamen|globus pallidus|internal capsule|commissure|colliculus|geniculate|habenula|mammillary|stria terminalis|stria medullaris|septum of telencephalon|tuber cinereum|interpeduncular fossa|lamina terminalis|optic chiasm|optic tract|peduncle of midbrain|cerebral aqueduct|pineal|pituitary|cerebral artery|cerebellar artery|basilar artery|callosomarginal artery|pericallosal artery|pontine artery|thalamogeniculate artery|thalamoperforating artery/i;
    const baseVisible=(p:(typeof atlas.parts)[number])=>{
     if(hidden.has(p.id))return false;
     if(!matchesDepth(p,s.depthFilter)||!matchesUpperLimbMuscleLayer(p,s.muscleLayer)||!matchesFacialMuscleLayer(p,s.faceMuscleLayer))return false;
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
    brainMotionRoot.visible=brainLoaded&&visible.has('nervous')&&brainInFocus&&!cranialVaultVisible&&!s.isolate;
    const isVisible=(p:(typeof atlas.parts)[number])=>{
     if(hidden.has(p.id))return false;
     const cx=(p.bounds[0][0]+p.bounds[1][0])*.5,cy=(p.bounds[0][1]+p.bounds[1][1])*.5,cz=(p.bounds[0][2]+p.bounds[1][2])*.5;
     const intracranialLegacy=p.system==='nervous'&&cy>1.38&&Math.abs(cx)<.36&&Math.abs(cz)<.34&&!/cranial.?nerve|\bnerve\b|tract|root|ganglion/i.test(p.name);
     const replacedBrain=brainLoaded&&!s.isolate&&(legacyBrainParenchyma.test(p.name)||intracranialLegacy);
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
     const selected=selection.has(p.id);data.set([dx,dy,dz,isVisible(p)?1:0],i*4);selectedData[i*4]=selected?255:0;
     // CPU skinning already includes the active frame. Never apply it twice.
     const transform=pickers[i]?.userData.tissuePosed?undefined:s.partTransforms?.[p.id];
     if(transform){
      motionData.set([...transform.translation,0],i*4);rotationData.set(transform.quaternion,i*4);
      anchorMotionData.set([...(transform.anchorTranslation??transform.translation),0],i*4);anchorRotationData.set(transform.anchorQuaternion??transform.quaternion,i*4);
     }else{
      motionData.set([0,0,0,0],i*4);rotationData.set([0,0,0,1],i*4);anchorMotionData.set([0,0,0,0],i*4);anchorRotationData.set([0,0,0,1],i*4);
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
    });partTexture.needsUpdate=true;selectionTexture.needsUpdate=true;motionTexture.needsUpdate=true;rotationTexture.needsUpdate=true;anchorMotionTexture.needsUpdate=true;anchorRotationTexture.needsUpdate=true;markerGeometry.attributes.position.needsUpdate=true;lastState=s;lastExtent=amount;dirty=true;
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
   if((s.cameraFocusNonce??0)!==lastCameraFocus&&s.cameraFocusParts?.length){
    const wanted=new Set(s.cameraFocusParts),box=new T.Box3();
    atlas.parts.forEach((p,i)=>{if(!wanted.has(p.id))return;const mesh=pickers[i];box.union(mesh?(mesh.geometry.boundingBox??bounds[i]).clone().applyMatrix4(mesh.matrixWorld):bounds[i].clone());});
    if(!box.isEmpty()){
     const center=box.getCenter(new T.Vector3()),dir=camera.position.clone().sub(controls.target).normalize();
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
    }
    lastCameraFocus=s.cameraFocusNonce??0;
   }
   controls.enableRotate=true;controls.enablePan=true;controls.mouseButtons.RIGHT=T.MOUSE.ROTATE;controls.touches.TWO=T.TOUCH.DOLLY_ROTATE;ground.visible=platform.visible=ring.visible=innerRing.visible=amount<.5&&!s.isolate;markers.visible=amount>.75;controls.autoRotate=s.rotate&&!s.isolate&&amount<.4;controls.autoRotateSpeed=.65;controls.update();if(controls.autoRotate)dirty=true;
   if(dirty){renderer.render(scene,camera);targets=[];if(amount>.45){const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);atlas.parts.forEach((p,i)=>{if(data[i*4+3]<.5||(hasSolid&&p.system==='integumentary'))return;let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;for(let corner=0;corner<8;corner++){projected.set(p.bounds[(corner&1)?1:0][0]+data[i*4],p.bounds[(corner&2)?1:0][1]+data[i*4+1],p.bounds[(corner&4)?1:0][2]+data[i*4+2]).project(camera);const x=(projected.x+1)*el.clientWidth/2,y=(1-projected.y)*el.clientHeight/2;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}projected.copy(centers[i]).add(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])).project(camera);if(projected.z< -1||projected.z>1)return;targets.push({index:i,x:(projected.x+1)*el.clientWidth/2,y:(1-projected.y)*el.clientHeight/2,left,right,top,bottom});});}dirty=false;}

  };animate();
  const contextLost=(e:Event)=>{e.preventDefault();onError('The 3D session was paused by your device. Reload to continue.');};renderer.domElement.addEventListener('webglcontextlost',contextLost);
  return()=>{disposed=true;abort.abort();cancelAnimationFrame(frame);observer.disconnect();controls.dispose();draco.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());scene.traverse(o=>{if(o instanceof T.Mesh&&!geometries.includes(o.geometry)){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});env.dispose();partTexture.dispose();selectionTexture.dispose();motionTexture.dispose();rotationTexture.dispose();anchorMotionTexture.dispose();anchorRotationTexture.dispose();markerGeometry.dispose();markerMaterial.dispose();hover.remove();renderer.dispose();renderer.domElement.remove();};
 },[atlas]);
 return <div className="scene" ref={host}/>;
}

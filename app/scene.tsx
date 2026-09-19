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
import {SYSTEMS,type Atlas,type SceneState} from './anatomy';
interface Props {atlas:Atlas;state:SceneState;onSelect:(id:string)=>void;onProgress:(n:number)=>void;onError:(s:string)=>void;onJointDrag?:(side:'left'|'right',joint:'shoulderAbduction'|'elbowFlexion',delta:number)=>void;region?:'whole-body'|'shoulder'|'arm'|'forearm'|'hand';focusSide?:'both'|'left'|'right';motionActive?:boolean}
export default function AnatomyScene({atlas,state,onSelect,onProgress,onError,onJointDrag,region='whole-body',focusSide='both',motionActive=false}:Props){
 const host=useRef<HTMLDivElement>(null),latest=useRef(state),select=useRef(onSelect),jointDrag=useRef(onJointDrag),viewerContext=useRef({region,focusSide,motionActive});
 latest.current=state;select.current=onSelect;jointDrag.current=onJointDrag;viewerContext.current={region,focusSide,motionActive};
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
  const nerveRoot=new T.Group();nerveRoot.name='MJ external nervous system';scene.add(nerveRoot);const nerveMeshes:NerveMesh[]=[];
  const shoulderNerve=/brachial plexus|trunk of brachial plexus|division of .*brachial plexus|cord of brachial plexus|roots of brachial plexus|axillary nerve|suprascapular nerve|long thoracic nerve|thoracodorsal nerve|pectoral nerve|subscapular nerve|dorsal scapular nerve|subclavian nerve/i;
  const armNerve=/musculocutaneous nerve|radial nerve|median nerve|ulnar nerve|brachial cutaneous nerve|antebrachial cutaneous nerve|muscular branches of (radial|axillary|median|ulnar) nerve/i;
  const forearmNerve=/median nerve|ulnar nerve|radial nerve|antebrachial cutaneous nerve|interosseous nerve|superficial branch of radial nerve|deep branch of radial nerve|dorsal branch of ulnar nerve|palmar branch of (median|ulnar) nerve/i;
  const handNerve=/median nerve|ulnar nerve|radial nerve|palmar digital|dorsal digital|deep branch of ulnar nerve|superficial branch of ulnar nerve|palmar branch of (median|ulnar) nerve/i;
  const upperLimbNerve=new RegExp([shoulderNerve.source,armNerve.source,forearmNerve.source,handNerve.source].join('|'),'i');
  const nerveSide=(name:string)=>/\.r(?:\.|$)/i.test(name)?'right':/\.l(?:\.|$)/i.test(name)?'left':'both';
  const nerveName=(o:T.Object3D)=>[o.name,o.parent?.name,o.parent?.parent?.name].filter(Boolean).join(' ');
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
  const draco=new DRACOLoader();draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');const loader=new GLTFLoader();loader.setDRACOLoader(draco);loader.load(`${import.meta.env.BASE_URL}models/nervous.glb`,gltf=>{if(disposed)return;gltf.scene.updateMatrixWorld(true);gltf.scene.traverse(o=>{if(!(o instanceof T.Mesh))return;const fullName=nerveName(o);if(/nervous system\s*&\s*sense organs/i.test(fullName))return;const geometry=o.geometry.clone();geometry.applyMatrix4(o.matrixWorld);const position=geometry.getAttribute('position');if(!position)return;const material=new T.MeshStandardMaterial({color:0xe2bd4a,metalness:0,roughness:.5,emissive:0x352700,emissiveIntensity:.08,depthTest:true,depthWrite:true,transparent:false,opacity:1});const mesh=new T.Mesh(geometry,material);mesh.name=fullName;mesh.frustumCulled=false;mesh.renderOrder=2;mesh.userData.mjNerve=true;mesh.userData.basePositions=new Float32Array((position.array as ArrayLike<number>));nerveRoot.add(mesh);nerveMeshes.push(mesh);});dirty=true;},undefined,err=>{if(!disposed)console.warn('Could not load legacy nervous system model',err);});
  const boneMotionId=(side:'left'|'right',pattern:RegExp)=>atlas.parts.find(p=>{if(p.system!=='skeletal'||!pattern.test(p.name.toLowerCase()))return false;const cx=(p.bounds[0][0]+p.bounds[1][0])/2;return side==='right'?cx<-.04:cx>.04;})?.id;
  const nerveMotionIds={
   right:{upper:boneMotionId('right',/^right humerus$/i),forearm:boneMotionId('right',/^right radius$/i),hand:boneMotionId('right',/right .*?(metacarpal|carpal|scaphoid|lunate|capitate|hamate)/i)},
   left:{upper:boneMotionId('left',/^left humerus$/i),forearm:boneMotionId('left',/^left radius$/i),hand:boneMotionId('left',/left .*?(metacarpal|carpal|scaphoid|lunate|capitate|hamate)/i)}
  };
  const transformMatrix=(t:NonNullable<SceneState['partTransforms']>[string]|undefined)=>{const m=new T.Matrix4();if(!t)return m.identity();return m.compose(new T.Vector3(...t.translation),new T.Quaternion(...t.quaternion),new T.Vector3(1,1,1));};
  const nerveP=new T.Vector3(),nerveA=new T.Vector3(),nerveB=new T.Vector3();
  const updateNerveMotion=(s:SceneState)=>{
   const ctx=viewerContext.current;
   for(const mesh of nerveMeshes){
    const attr=mesh.geometry.getAttribute('position') as T.BufferAttribute,base=mesh.userData.basePositions as Float32Array|undefined;if(!base)continue;
    const name=mesh.name,side=nerveSide(name);
    const ids=side==='left'?nerveMotionIds.left:side==='right'?nerveMotionIds.right:null;
    const active=ctx.motionActive&&ids&&upperLimbNerve.test(name)&&s.partTransforms;
    const upper=active?transformMatrix(ids!.upper?s.partTransforms?.[ids!.upper]:undefined):new T.Matrix4();
    const fore=active?transformMatrix(ids!.forearm?s.partTransforms?.[ids!.forearm]:undefined):new T.Matrix4();
    const hand=active?transformMatrix(ids!.hand?s.partTransforms?.[ids!.hand]:undefined):fore;
    for(let i=0;i<attr.count;i++){
     nerveP.set(base[i*3],base[i*3+1],base[i*3+2]);
     if(!active){attr.setXYZ(i,nerveP.x,nerveP.y,nerveP.z);continue;}
     const y=nerveP.y;
     if(y>=1.36){attr.setXYZ(i,nerveP.x,nerveP.y,nerveP.z);continue;}
     if(y>1.28){const t=(1.36-y)/.08;nerveA.copy(nerveP);nerveB.copy(nerveP).applyMatrix4(upper);nerveA.lerp(nerveB,t);attr.setXYZ(i,nerveA.x,nerveA.y,nerveA.z);continue;}
     if(y>=1.08){nerveA.copy(nerveP).applyMatrix4(upper);attr.setXYZ(i,nerveA.x,nerveA.y,nerveA.z);continue;}
     if(y>.98){const t=(1.08-y)/.10;nerveA.copy(nerveP).applyMatrix4(upper);nerveB.copy(nerveP).applyMatrix4(fore);nerveA.lerp(nerveB,t);attr.setXYZ(i,nerveA.x,nerveA.y,nerveA.z);continue;}
     if(y>=.76){nerveA.copy(nerveP).applyMatrix4(fore);attr.setXYZ(i,nerveA.x,nerveA.y,nerveA.z);continue;}
     if(y>.68){const t=(.76-y)/.08;nerveA.copy(nerveP).applyMatrix4(fore);nerveB.copy(nerveP).applyMatrix4(hand);nerveA.lerp(nerveB,t);attr.setXYZ(i,nerveA.x,nerveA.y,nerveA.z);continue;}
     nerveA.copy(nerveP).applyMatrix4(hand);attr.setXYZ(i,nerveA.x,nerveA.y,nerveA.z);
    }
    attr.needsUpdate=true;
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
  const materials:T.Material[]=[],geometries:T.BufferGeometry[]=[],pickers:(T.Mesh|undefined)[]=[],centers=atlas.parts.map(p=>new T.Vector3().fromArray(p.bounds[0]).add(new T.Vector3().fromArray(p.bounds[1])).multiplyScalar(.5));
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
    shader.uniforms.partState={value:partTexture};shader.uniforms.selectionState={value:selectionTexture};shader.uniforms.motionState={value:motionTexture};shader.uniforms.rotationState={value:rotationTexture};shader.uniforms.stateWidth={value:width};
    shader.vertexShader='attribute float partIndex; uniform sampler2D partState; uniform sampler2D selectionState; uniform sampler2D motionState; uniform sampler2D rotationState; uniform float stateWidth; varying float partVisible; varying float partSelected; vec3 qrot(vec4 q, vec3 v){ return v + 2.0*cross(q.xyz, cross(q.xyz,v)+q.w*v); }\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvec2 stateUv = vec2((partIndex + 0.5) / stateWidth, 0.5); vec4 state = texture2D(partState, stateUv); vec3 motion = texture2D(motionState,stateUv).xyz; vec4 rotation = normalize(texture2D(rotationState,stateUv)); transformed = qrot(rotation, transformed)+motion+state.xyz; partVisible = state.w; partSelected = texture2D(selectionState, stateUv).r;');
    shader.fragmentShader='varying float partVisible; varying float partSelected;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif (partVisible < 0.5) discard;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.42, 0.85, 0.78), partSelected * 0.75);');
   };materials.push(m);return m;
  };
  const mats=new Map(SYSTEMS.map(s=>[s.id,materialFor(s.id)]));
  let loaded=0;
  const resolveModelUrl=(url:string)=>url.startsWith('/')?`${import.meta.env.BASE_URL}${url.slice(1)}`:url;
  const loadChunk=async(ci:number)=>{
   const chunk=atlas.chunks[ci],compressed=!!chunk.gzip&&typeof DecompressionStream!=='undefined';const response=await fetch(resolveModelUrl(compressed?chunk.gzip!:chunk.url),{signal:abort.signal});const buffer=await decodeModelResponse(response,chunk.bytes,compressed);if(disposed)return;
   const groups=new Map<string,T.BufferGeometry[]>();
   atlas.parts.forEach((p,i)=>{
    if(p.chunk!==ci)return;
    const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(buffer,p.positions,p.vertexCount*3),3));
    // GPU normalized signed-short normals keep the complete atlas compact in memory.
    g.setAttribute('normal',new T.BufferAttribute(new Int16Array(buffer,p.normals,p.vertexCount*3),3,true));g.setIndex(new T.BufferAttribute(new Uint32Array(buffer,p.indices,p.indexCount),1));
    g.boundingBox=bounds[i].clone();g.computeBoundingSphere();const pick=new T.Mesh(g);pick.matrixAutoUpdate=false;pickers[i]=pick;geometries.push(g);
    g.setAttribute('partIndex',new T.BufferAttribute(new Float32Array(p.vertexCount).fill(i),1));
    const list=groups.get(p.system)??[];list.push(g);groups.set(p.system,list);
   });
   groups.forEach((gs,system)=>{const geometry=mergeGeometries(gs,false);if(!geometry)throw new Error('Could not assemble anatomy geometry.');geometries.push(geometry);const mesh=new T.Mesh(geometry,mats.get(system as never));mesh.frustumCulled=false;scene.add(mesh);});
   lastState=null;loaded++;onProgress(Math.round(loaded/atlas.chunks.length*100));dirty=true;
  };
  (async()=>{try{let cursor=0;await Promise.all(Array.from({length:3},async()=>{while(cursor<atlas.chunks.length){const i=cursor++;await loadChunk(i);}}));if(!disposed){ready=true;dirty=true;}}catch(e){if(!disposed)onError(e instanceof Error?e.message:'Could not load the anatomy.');}})();
  const fit=(view:string,extent=0)=>{
   const aspect=camera.aspect,mobile=el.clientWidth<768,normalDistance=mobile?Math.max(4.5,1.8*el.clientHeight/Math.max(160,el.clientHeight-350)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))):4;
   const reservedHeight=mobile?350:270;const availableAspect=Math.max(.35,(el.clientWidth-(mobile?40:340))/Math.max(160,el.clientHeight-reservedHeight));const atlasDistance=Math.max(packingHeight,packingWidth/availableAspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*(el.clientHeight/Math.max(160,el.clientHeight-reservedHeight))*1.08;
   const distance=T.MathUtils.lerp(normalDistance,Math.max(.2,atlasDistance),extent);if(extent>.8)view='front';
   const direction=view==='front'?new T.Vector3(0,.02,1):view==='back'?new T.Vector3(0,.02,-1):view==='side'?new T.Vector3(1,.02,0):new T.Vector3(.35,.06,1).normalize();
   controls.target.set(extent>.1&&el.clientWidth>767?-packingWidth*.12:0,extent>.1||mobile?.85:.68,0);camera.position.copy(controls.target).addScaledVector(direction,distance);controls.update();dirty=true;
  };
  const resize=()=>{layoutKey='';lastState=null;renderer.setPixelRatio(Math.min(devicePixelRatio,el.clientWidth<768||el.clientHeight<600?1.5:2));camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);fit(latest.current.view,amount);};const observer=new ResizeObserver(resize);observer.observe(el);
  const raycaster=new T.Raycaster(),pointer=new T.Vector2(),tap=new PointerTap(),worldBox=new T.Box3(),hitPoint=new T.Vector3();
  const pickAt=(clientX:number,clientY:number)=>{
   const rect=renderer.domElement.getBoundingClientRect();pointer.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
   let nearest=Infinity,found=-1;const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);
   pickers.forEach((mesh,i)=>{if(!mesh||data[i*4+3]<.5||(hasSolid&&atlas.parts[i].system==='integumentary'))return;worldBox.copy(bounds[i]).applyMatrix4(mesh.matrixWorld);if(!raycaster.ray.intersectBox(worldBox,hitPoint))return;const hits=raycaster.intersectObject(mesh,false);if(hits[0]&&hits[0].distance<nearest){nearest=hits[0].distance;found=i;}});
   return found;
  };
  type JointGesture={pointerId:number;side:'left'|'right';joint:'shoulderAbduction'|'elbowFlexion';startX:number;startY:number;lastX:number;lastY:number;hitIndex:number;dragging:boolean};
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
    const hit=ready?pickAt(e.clientX,e.clientY):-1,jointInfo=jointForPart(hit);
    if(jointInfo&&jointDrag.current){
     // Treat a press as a possible anatomy tap first. Only convert it into a
     // joint drag after the pointer actually moves. This keeps muscles, bones
     // and other visible structures selectable while Motion Lab is active.
     jointGesture={pointerId:e.pointerId,side:jointInfo.side,joint:jointInfo.joint,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,hitIndex:hit,dragging:false};
     controls.enabled=false;renderer.domElement.setPointerCapture?.(e.pointerId);renderer.domElement.style.cursor='grab';e.preventDefault();return;
    }
    const onAnatomy=hit>=0;controls.mouseButtons.LEFT=onAnatomy?T.MOUSE.ROTATE:T.MOUSE.PAN;if(e.pointerType==='touch')controls.touches.ONE=onAnatomy?T.TOUCH.ROTATE:T.TOUCH.PAN;renderer.domElement.style.cursor=onAnatomy?'grabbing':'move';
   }
   tap.down(e.pointerId,e.clientX,e.clientY,e.pointerType==='touch'?12:5);
  };
  const move=(e:PointerEvent)=>{
   if(jointGesture&&jointGesture.pointerId===e.pointerId){
    const total=Math.hypot(e.clientX-jointGesture.startX,e.clientY-jointGesture.startY);
    if(!jointGesture.dragging&&total<7){e.preventDefault();return;}
    if(!jointGesture.dragging){
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
   let found=pickAt(e.clientX,e.clientY);const rect=renderer.domElement.getBoundingClientRect();if(found<0&&amount>.45)found=findTarget(e.clientX-rect.left,e.clientY-rect.top,e.pointerType==='touch'?24:16);if(found>=0){hover.hidden=true;select.current(atlas.parts[found].id);}
  };
  renderer.domElement.addEventListener('pointerdown',down,true);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',cancel);
  const clock=new T.Clock();let lastExtent=-1;
  const animate=()=>{
   if(disposed)return;frame=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),s=latest.current;
   if(focusTarget&&focusPosition){const a=1-Math.exp(-8*dt);controls.target.lerp(focusTarget,a);camera.position.lerp(focusPosition,a);dirty=true;if(controls.target.distanceToSquared(focusTarget)<1e-7&&camera.position.distanceToSquared(focusPosition)<1e-7){controls.target.copy(focusTarget);camera.position.copy(focusPosition);focusTarget=null;focusPosition=null;}}
   const changed=lastState?.visible!==s.visible||lastState?.selected!==s.selected||lastState?.focusParts!==s.focusParts||lastState?.isolate!==s.isolate||lastState?.partTransforms!==s.partTransforms;
   if(changed&&nerveMeshes.length)updateNerveMotion(s);
   if(nerveMeshes.length){
    const nervesOn=s.visible.includes('nervous'),ctx=viewerContext.current;
    nerveRoot.visible=nervesOn;
    nerveMeshes.forEach(o=>{
     if(!nervesOn){o.visible=false;return;}
     const name=nerveName(o),side=nerveSide(name);
     const sideOk=ctx.focusSide==='both'||side==='both'||side===ctx.focusSide;
     o.visible=sideOk&&nerveMatchesRegion(name,ctx.region,ctx.motionActive);
    });
   }
   const moving=Math.abs(amount-s.explode)>.0001;
   if(moving){amount=T.MathUtils.damp(amount,s.explode,8,dt);dirty=true;}
   if(changed||moving||lastExtent<0){
    const visible=new Set(s.visible),selection=new Set(s.selected),focus=s.focusParts?new Set(s.focusParts):null;
    const isVisible=(p:(typeof atlas.parts)[number])=>s.isolate?selection.has(p.id):focus?(focus.has(p.id)&&visible.has(p.system))||selection.has(p.id):visible.has(p.system)||selection.has(p.id);
    const visibleParts=atlas.parts.filter(isVisible);
    const nextLayoutKey=visibleParts.map(p=>p.id).join(',')+':'+camera.aspect.toFixed(3);
    if(nextLayoutKey!==layoutKey){const layout=createExplosionLayout(visibleParts,camera.aspect);packingWidth=layout.width;packingHeight=layout.height;atlas.parts.forEach((p,i)=>{const cell=layout.cells.get(p.id);offsets[i]=cell?new T.Vector3(cell.x,cell.y+.85,0):centers[i].clone();});layoutKey=nextLayoutKey;if(amount>.05&&!s.isolate)fit(s.view,Math.max(0,(amount-.3)/.7));}

    atlas.parts.forEach((p,i)=>{
     const c=centers[i],destination=offsets[i];let dx=0,dy=0,dz=0;
     if(amount<=.45){const t=amount/.45;const group=SYSTEMS.findIndex(sys=>sys.id===p.system);const angle=group/SYSTEMS.length*Math.PI*2;dx=Math.sin(angle)*t*.48;dy=(c.y-.85)*t*.28;dz=Math.cos(angle)*t*.48;}
     else {const t=(amount-.45)/.55,group=SYSTEMS.findIndex(sys=>sys.id===p.system),angle=group/SYSTEMS.length*Math.PI*2;dx=T.MathUtils.lerp(Math.sin(angle)*.48,destination.x-c.x,t);dy=T.MathUtils.lerp((c.y-.85)*.28,destination.y-c.y,t);dz=T.MathUtils.lerp(Math.cos(angle)*.48,-c.z,t);}
     const selected=selection.has(p.id);data.set([dx,dy,dz,isVisible(p)?1:0],i*4);selectedData[i*4]=selected?255:0;
     const transform=s.partTransforms?.[p.id];if(transform){motionData.set([...transform.translation,0],i*4);rotationData.set(transform.quaternion,i*4);}else{motionData.set([0,0,0,0],i*4);rotationData.set([0,0,0,1],i*4);}
     const mesh=pickers[i];if(mesh){if(transform){mesh.quaternion.set(...transform.quaternion);mesh.position.set(...transform.translation).add(new T.Vector3(dx,dy,dz));}else{mesh.quaternion.identity();mesh.position.set(dx,dy,dz);}mesh.updateMatrix();mesh.updateMatrixWorld(true);}if(data[i*4+3]>.5){const marker=mesh?c.clone().applyMatrix4(mesh.matrixWorld):c.clone().add(new T.Vector3(dx,dy,dz));markerPositions.set([marker.x,marker.y,marker.z],i*3);}else markerPositions.set([10000,10000,10000],i*3);
    });partTexture.needsUpdate=true;selectionTexture.needsUpdate=true;motionTexture.needsUpdate=true;rotationTexture.needsUpdate=true;markerGeometry.attributes.position.needsUpdate=true;lastState=s;lastExtent=amount;dirty=true;
   }
   if(s.view!==lastView||s.reset!==lastReset){fit(s.view,amount);lastView=s.view;lastReset=s.reset;}
   if(moving&&!s.isolate)fit(amount>.5?'front':s.view,Math.max(0,(amount-.3)/.7));
   const isolateKey=s.isolate?s.selected.join(',')+':'+s.reset+':'+s.inspectorOpen+':'+camera.aspect:'';
   if(isolateKey!==lastIsolate||(s.isolate&&moving)){
    if(s.isolate){const box=new T.Box3();atlas.parts.forEach((p,i)=>{if(s.selected.includes(p.id))box.union(bounds[i].clone().translate(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])));});
     if(!box.isEmpty()){const center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());const w=el.clientWidth,h=el.clientHeight,mobile=w<768,landscape=w>h&&h<=600;let left=20,right=w-20,top=mobile?175:110,bottom=h-170;if(s.inspectorOpen){if(landscape){right=w-335;top=100;bottom=h-125;}else if(mobile){const sheet=document.querySelector('.detail-sheet')?.getBoundingClientRect(),header=document.querySelector('.identity')?.getBoundingClientRect();top=(header?.bottom??94)+16;bottom=(sheet?.top??h*.58-139)-16;}else{right=w-370;left=w>1100?285:25;}}const availableWidth=Math.max(150,right-left),availableHeight=Math.max(40,bottom-top);camera.setViewOffset(w,h,w/2-(left+right)/2,h/2-(top+bottom)/2,w,h);const distance=Math.max(.07,Math.max(size.y*h/availableHeight,size.x*w/availableWidth/camera.aspect,size.z)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*1.35);controls.maxDistance=Math.max(40,distance*2);controls.target.copy(center);camera.position.copy(center).add(new T.Vector3(.2,.1,1).normalize().multiplyScalar(distance));controls.update();dirty=true;}
    }else if(lastIsolate){camera.clearViewOffset();fit(s.view,amount);}
    lastIsolate=isolateKey;
   }
   if((s.cameraFocusNonce??0)!==lastCameraFocus&&s.cameraFocusParts?.length){
    const wanted=new Set(s.cameraFocusParts),box=new T.Box3();
    atlas.parts.forEach((p,i)=>{if(!wanted.has(p.id))return;const mesh=pickers[i];box.union(mesh?bounds[i].clone().applyMatrix4(mesh.matrixWorld):bounds[i].clone());});
    if(!box.isEmpty()){
     camera.clearViewOffset();const center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3()),dir=camera.position.clone().sub(controls.target).normalize();
     const fitSize=Math.max(size.y,size.x/Math.max(.45,camera.aspect),size.z*1.6,.18);
     const distance=Math.max(.28,fitSize/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*1.45);
     focusTarget=center.clone();focusPosition=center.clone().addScaledVector(dir.lengthSq()>.5?dir:new T.Vector3(.3,.1,1).normalize(),distance);dirty=true;
    }
    lastCameraFocus=s.cameraFocusNonce??0;
   }
   controls.enableRotate=true;controls.enablePan=true;controls.mouseButtons.RIGHT=T.MOUSE.ROTATE;controls.touches.TWO=T.TOUCH.DOLLY_ROTATE;ground.visible=platform.visible=ring.visible=innerRing.visible=amount<.5&&!s.isolate;markers.visible=amount>.75;controls.autoRotate=s.rotate&&!s.isolate&&amount<.4;controls.autoRotateSpeed=.65;controls.update();if(controls.autoRotate)dirty=true;
   if(dirty){renderer.render(scene,camera);targets=[];if(amount>.45){const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);atlas.parts.forEach((p,i)=>{if(data[i*4+3]<.5||(hasSolid&&p.system==='integumentary'))return;let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;for(let corner=0;corner<8;corner++){projected.set(p.bounds[(corner&1)?1:0][0]+data[i*4],p.bounds[(corner&2)?1:0][1]+data[i*4+1],p.bounds[(corner&4)?1:0][2]+data[i*4+2]).project(camera);const x=(projected.x+1)*el.clientWidth/2,y=(1-projected.y)*el.clientHeight/2;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}projected.copy(centers[i]).add(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])).project(camera);if(projected.z< -1||projected.z>1)return;targets.push({index:i,x:(projected.x+1)*el.clientWidth/2,y:(1-projected.y)*el.clientHeight/2,left,right,top,bottom});});}dirty=false;}

  };animate();
  const contextLost=(e:Event)=>{e.preventDefault();onError('The 3D session was paused by your device. Reload to continue.');};renderer.domElement.addEventListener('webglcontextlost',contextLost);
  return()=>{disposed=true;abort.abort();cancelAnimationFrame(frame);observer.disconnect();controls.dispose();draco.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());scene.traverse(o=>{if(o instanceof T.Mesh&&!geometries.includes(o.geometry)){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});env.dispose();partTexture.dispose();selectionTexture.dispose();motionTexture.dispose();rotationTexture.dispose();markerGeometry.dispose();markerMaterial.dispose();hover.remove();renderer.dispose();renderer.domElement.remove();};
 },[atlas]);
 return <div className="scene" ref={host}/>;
}

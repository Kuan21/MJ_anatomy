import {useEffect,useMemo,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {VTKLoader} from 'three/examples/jsm/loaders/VTKLoader.js';
import {ArrowLeft,ChevronDown,Eye,EyeOff,Focus,Layers3,RotateCcw,Scissors} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Slider} from '@/components/ui/slider';
import {decodeModelResponse} from './model-download';
import {EYE_LAYERS,EYE_PARTS} from './mj-eye-atlas';

export type MicroAtlasId='brain'|'eye'|'ear';

export const MICRO_ATLASES:Record<MicroAtlasId,{title:string;subtitle:string;source:string;license:string}> = {
 brain:{title:'Brain',subtitle:'Neuroanatomy micro-atlas',source:'Brain Project · Z-Anatomy / BodyParts3D',license:'CC BY-SA 4.0'},
 eye:{title:'Eye & orbit',subtitle:'左眼：眼球分層、眼外肌、神經、淚器與視覺路徑',source:'BodyParts3D · Human Reference Atlas',license:'CC BY 4.0'},
 ear:{title:'Inner ear',subtitle:'Vestibular & cochlear micro-atlas',source:'IE-Map · LMU Munich',license:'CC BY 4.0'},
};

interface Props {atlasId:MicroAtlasId;onExit:()=>void}
interface RecordInfo {id:string;name:string;zh?:string;text?:string;textZh?:string;group:string;groupZh?:string;rank:number}
interface Record3D extends RecordInfo {
 object:T.Mesh;
 /** Bounding-box centre in atlas-root coordinates. */
 center:T.Vector3;
 /** Offset in atlas-root coordinates when fully separated. */
 spread:T.Vector3;
 color:T.Color;
 opacity:number;
}
interface EyeManifest {bytes:number;gzip:string;globe:{center:number[];axis:number[];length:number};parts:{id:string;vertexCount:number;indexCount:number;positions:number;normals:number;indices:number;bounds:[number[],number[]]}[]}
interface SceneApi {frame:(smooth:boolean,direction?:T.Vector3)=>void;invalidate:()=>void;plane:T.Plane}

const BRAIN_URLS=[`${import.meta.env.BASE_URL}models/brain.glb`];
const EYE_MANIFEST=`${import.meta.env.BASE_URL}models/eye/eye-atlas.json`;
const DRACO_PATH=`${import.meta.env.BASE_URL}draco/`;

const EAR_BASE='https://media.githubusercontent.com/media/pydsgz/IEMap/master/data/';
const EAR_FILES=[
 {file:'seg_coch_outer_T2.vtk',name:'Cochlea · outer contour',group:'Bony labyrinth',rank:0},
 {file:'mesh_david_cochlea.vtk',name:'Cochlear labyrinth',group:'Bony labyrinth',rank:0},
 {file:'ls_Hsapiens_Sa.vtk',name:'Anterior semicircular canal',group:'Bony labyrinth',rank:0},
 {file:'ls_Hsapiens_Sl.vtk',name:'Lateral semicircular canal',group:'Bony labyrinth',rank:0},
 {file:'ls_Hsapiens_Sp.vtk',name:'Posterior semicircular canal',group:'Bony labyrinth',rank:0},
 {file:'ls_Hsapiens_Aa.vtk',name:'Anterior ampulla',group:'Vestibular labyrinth',rank:1},
 {file:'ls_Hsapiens_Al.vtk',name:'Lateral ampulla',group:'Vestibular labyrinth',rank:1},
 {file:'ls_Hsapiens_Ap.vtk',name:'Posterior ampulla',group:'Vestibular labyrinth',rank:1},
 {file:'ls_Hsapiens_utricle.vtk',name:'Utricle',group:'Vestibular labyrinth',rank:1},
 {file:'mesh_david_sacculus.vtk',name:'Saccule',group:'Vestibular labyrinth',rank:1},
 {file:'ls_Hsapiens_Ant_Cup_Wall.vtk',name:'Anterior canal cupula wall',group:'Membranous labyrinth',rank:2},
 {file:'ls_Hsapiens_Lat_Cup_Wall.vtk',name:'Lateral canal cupula wall',group:'Membranous labyrinth',rank:2},
 {file:'ls_Hsapiens_Post_Cup_Wall.vtk',name:'Posterior canal cupula wall',group:'Membranous labyrinth',rank:2},
 {file:'ls_Hsapiens_Ant_Cup_Duct.vtk',name:'Anterior semicircular duct',group:'Membranous labyrinth',rank:2},
 {file:'ls_Hsapiens_Lat_Cup_Duct.vtk',name:'Lateral semicircular duct',group:'Membranous labyrinth',rank:2},
 {file:'ls_Hsapiens_Post_Cup_Duct.vtk',name:'Posterior semicircular duct',group:'Membranous labyrinth',rank:2},
 {file:'seg_coch_inner_scala_vestibuli.vtk',name:'Scala vestibuli',group:'Cochlear spaces',rank:3},
 {file:'seg_coch_inner_scala_tympani.vtk',name:'Scala tympani',group:'Cochlear spaces',rank:3},
 {file:'seg_coch_inner_cupula.vtk',name:'Cochlear cupula',group:'Cochlear spaces',rank:3},
] as const;

const pretty=(s:string)=>s.replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim().replace(/\b\w/g,m=>m.toUpperCase());
const humanize=(s:string)=>s.replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();

function brainGroup(label:string,cat:string){
 const s=(cat+' '+label).toLowerCase();
 if(/dura|falx|tentor/.test(s))return {group:'Meninges & dural reflections',rank:0};
 if(/cortex|gyrus|gyri|sulcus|sulci|lobe/.test(s))return {group:'Cerebral cortex',rank:1};
 if(/tract|white matter|fascicul|radiation|commissur|capsule/.test(s))return {group:'White-matter pathways',rank:2};
 if(/caudate|putamen|pallid|accumb|amygdal|nuclei|nucleus|subthalam|substantia/.test(s))return {group:'Deep nuclei',rank:3};
 if(/thalam|hypothalam|dienceph/.test(s))return {group:'Diencephalon',rank:4};
 if(/ventric|aqueduct|choroid plexus/.test(s))return {group:'Ventricular system',rank:5};
 if(/brainstem|midbrain|pons|medulla/.test(s))return {group:'Brainstem',rank:6};
 if(/cerebell/.test(s))return {group:'Cerebellum',rank:7};
 if(/cranial|nerve|cn /.test(s))return {group:'Cranial nerves',rank:8};
 if(/arter|willis/.test(s))return {group:'Arterial circulation',rank:9};
 if(/sinus|venous|vein/.test(s))return {group:'Dural venous sinuses',rank:10};
 return {group:cat?pretty(cat):'Other neuroanatomy',rank:6};
}

const meshColor=(rank:number)=>[
 '#d7c0a9','#c59b91','#e1c9a4','#ad8b8f','#b5a1c7','#8ca9bf',
 '#c99b87','#b7a58b','#e0c96e','#c96c62','#708aa0',
][rank%11];
const SELECTED_COLOR=new T.Color('#9dfc8f');
const HOME_DIRECTION=new T.Vector3(2.7,1.35,3.35).normalize();
/** Looks onto the cut face once the lateral half is removed. */
const SECTION_DIRECTION=new T.Vector3(1,.22,.42).normalize();
const DEFAULT_HIDDEN:Record<MicroAtlasId,string[]> = {brain:[],ear:[],eye:EYE_LAYERS.filter(l=>l.hiddenByDefault).map(l=>l.name)};
const defaultHidden=(id:MicroAtlasId)=>new Set(DEFAULT_HIDDEN[id]);

export default function MicroAtlasScene({atlasId,onExit}:Props){
 const host=useRef<HTMLDivElement>(null);
 const recordsRef=useRef<Record3D[]>([]);
 const apiRef=useRef<SceneApi|null>(null);
 const framed=useRef(false);
 const [records,setRecords]=useState<RecordInfo[]>([]);
 const [selected,setSelected]=useState<string|null>(null);
 const [explode,setExplode]=useState(0);
 const [hiddenGroups,setHiddenGroups]=useState<Set<string>>(()=>defaultHidden(atlasId));
 const [openGroup,setOpenGroup]=useState<string|null>(null);
 const [isolate,setIsolate]=useState(false);
 const [cut,setCut]=useState(false);
 const [loading,setLoading]=useState(0);
 const [error,setError]=useState('');

 useEffect(()=>{setRecords([]);setSelected(null);setExplode(0);setHiddenGroups(defaultHidden(atlasId));setOpenGroup(null);setIsolate(false);setCut(false);setLoading(0);setError('');framed.current=false;},[atlasId]);

 useEffect(()=>{
  const el=host.current;if(!el)return;
  let disposed=false,frame=0,dirty=true;
  const abort=new AbortController();
  const scene=new T.Scene();scene.background=new T.Color('#f2f3f3');
  const camera=new T.PerspectiveCamera(32,1,.001,100);camera.position.copy(HOME_DIRECTION).multiplyScalar(4.5);
  let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch{setError('這個瀏覽器無法啟動 3D 檢視器。');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.localClippingEnabled=true;
  renderer.domElement.setAttribute('aria-label',MICRO_ATLASES[atlasId].title+' 詳細模式：拖曳旋轉、滾輪或雙指縮放、點選構造查看說明。');
  el.appendChild(renderer.domElement);
  const invalidate=()=>{dirty=true;};
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=.12;controls.maxDistance=14;controls.target.set(0,0,0);controls.addEventListener('change',invalidate);
  scene.add(new T.HemisphereLight(0xffffff,0x9aa1a8,2.1));
  const key=new T.DirectionalLight(0xffffff,2.2);key.position.set(-3,4,5);scene.add(key);
  const fill=new T.DirectionalLight(0xdbe8ff,1.35);fill.position.set(3,1,-4);scene.add(fill);

  const atlasRoot=new T.Group();scene.add(atlasRoot);
  const loaded:Record3D[]=[];
  // Section plane in world space; keeps the medial side (x below the plane).
  const plane=new T.Plane(new T.Vector3(-1,0,0),0);

  const standardMaterial=(color:T.Color,opacity:number)=>new T.MeshStandardMaterial({color,roughness:.58,metalness:.02,side:T.DoubleSide,transparent:opacity<1,opacity,depthWrite:opacity>=1});
  /** Registers a mesh whose geometry is already in atlas-root coordinates. */
  const register=(mesh:T.Mesh,info:RecordInfo,color:T.Color,opacity=1)=>{
   if(!mesh.geometry.getAttribute('normal'))mesh.geometry.computeVertexNormals();
   mesh.geometry.computeBoundingBox();
   mesh.userData.__microId=info.id;
   if(opacity<1)mesh.renderOrder=100-info.rank;
   atlasRoot.add(mesh);
   loaded.push({...info,object:mesh,center:mesh.geometry.boundingBox!.getCenter(new T.Vector3()),spread:new T.Vector3(),color,opacity});
  };
  /** Copies a GLB mesh into atlas-root coordinates, optionally through an extra transform. */
  const bake=(src:T.Mesh,transform?:T.Matrix4)=>{
   const geometry=src.geometry.clone(),matrix=transform?transform.clone().multiply(src.matrixWorld):src.matrixWorld;
   geometry.applyMatrix4(matrix);
   if(matrix.determinant()<0&&geometry.index){
    // A mirrored copy needs its triangle winding reversed to keep faces outward.
    const index=geometry.index.array;
    for(let i=0;i<index.length;i+=3){const t=index[i+1];index[i+1]=index[i+2];index[i+2]=t;}
    geometry.index.needsUpdate=true;
   }
   return geometry;
  };
  const meshesOf=(source:T.Object3D)=>{source.updateMatrixWorld(true);const list:T.Mesh[]=[];source.traverse(o=>{if(o instanceof T.Mesh)list.push(o);});return list;};
  const disposeSource=(source:T.Object3D)=>source.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});

  const addBrain=(source:T.Object3D)=>{
   meshesOf(source).forEach((src,index)=>{
    const label=String(src.userData?.bx_label||src.name||`Brain structure ${index+1}`),classified=brainGroup(label,String(src.userData?.bx_cat||''));
    const color=new T.Color(meshColor(classified.rank));
    register(new T.Mesh(bake(src),standardMaterial(color,1)),{id:String(src.userData?.bx_id||`brain-${index}`),name:humanize(label),group:classified.group,rank:classified.rank},color);
   });
   disposeSource(source);
  };

  /** Centres and scales the atlas, then derives the default (radial) separation for parts without one. */
  const finish=(focus?:T.Vector3)=>{
   if(disposed)return;
   if(!loaded.length){setError('詳細模式的模型無法載入。');return;}
   const box=new T.Box3();loaded.forEach(r=>box.union(r.object.geometry.boundingBox!));
   const center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());
   const scale=2.45/(Math.max(size.x,size.y,size.z)||1);
   atlasRoot.scale.setScalar(scale);atlasRoot.position.copy(center).multiplyScalar(-scale);atlasRoot.updateMatrixWorld(true);
   const origin=focus??center;
   loaded.forEach(r=>{
    if(r.spread.lengthSq()>0)return;
    const direction=r.center.clone().sub(origin);
    if(direction.lengthSq()<1e-10)direction.set((r.rank%3)-1,((r.rank+1)%3)-1,1);
    r.spread.copy(direction.normalize().multiplyScalar(.58/scale*(1+r.rank*.04)));
   });
   plane.constant=origin.clone().applyMatrix4(atlasRoot.matrixWorld).x;
   recordsRef.current=loaded;
   setRecords(loaded.map(({id,name,zh,text,textZh,group,groupZh,rank})=>({id,name,zh,text,textZh,group,groupZh,rank})));
   setLoading(100);
  };

  const loadGlb=(urls:string[],onProgress:(fraction:number)=>void)=>new Promise<T.Object3D>((resolve,reject)=>{
   const draco=new DRACOLoader();draco.setDecoderPath(DRACO_PATH);
   const loader=new GLTFLoader();loader.setDRACOLoader(draco);
   let ix=0;
   const attempt=()=>loader.load(urls[ix],g=>{draco.dispose();resolve(g.scene);},
    e=>{if(e.total)onProgress(Math.min(1,e.loaded/e.total));},
    err=>{ix++;if(ix<urls.length&&!disposed)attempt();else{draco.dispose();reject(err);}});
   attempt();
  });

  const loadBrain=async()=>{
   try{const source=await loadGlb(BRAIN_URLS,f=>setLoading(Math.max(2,Math.round(f*95))));if(disposed){disposeSource(source);return;}addBrain(source);finish();}
   catch{if(!disposed)setError('腦部模型無法載入，請檢查網路連線後再試一次。');}
  };

  const loadEar=async()=>{
   const loader=new VTKLoader();let done=0;
   await Promise.all(EAR_FILES.map((entry,index)=>new Promise<void>(resolve=>{
    const step=()=>{done++;if(!disposed)setLoading(Math.min(99,Math.round(done/EAR_FILES.length*100)));resolve();};
    loader.load(EAR_BASE+entry.file,geometry=>{
     if(disposed){geometry.dispose();resolve();return;}
     geometry.computeVertexNormals();
     const color=new T.Color(meshColor(entry.rank));
     register(new T.Mesh(geometry,standardMaterial(color,1)),{id:`ear-${index}`,name:entry.name,group:entry.group,rank:entry.rank},color);step();
    },undefined,step);
   })));
   if(disposed)return;
   if(loaded.length)finish();else setError('內耳模型無法載入，請檢查網路連線後再試一次。');
  };

  const loadEye=async()=>{
   let manifest:EyeManifest,buffer:ArrayBuffer;
   try{
    manifest=await(await fetch(EYE_MANIFEST,{signal:abort.signal})).json() as EyeManifest;
    setLoading(15);
    buffer=await decodeModelResponse(await fetch(import.meta.env.BASE_URL+manifest.gzip,{signal:abort.signal}),manifest.bytes,true);
   }catch{if(!disposed)setError('眼部模型無法載入，請檢查網路連線後再試一次。');return;}
   if(disposed)return;
   setLoading(80);
   const globeCenter=new T.Vector3().fromArray(manifest.globe.center),axis=new T.Vector3().fromArray(manifest.globe.axis),length=manifest.globe.length;
   for(const p of manifest.parts){
    const part=EYE_PARTS[p.id];if(!part)continue;
    const layer=EYE_LAYERS[part.layer],color=new T.Color(part.color??layer.color),opacity=part.opacity??1;
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(buffer,p.positions,p.vertexCount*3),3));
    geometry.setAttribute('normal',new T.BufferAttribute(new Int16Array(buffer,p.normals,p.vertexCount*3),3,true));
    geometry.setIndex(new T.BufferAttribute(new Uint32Array(buffer,p.indices,p.indexCount),1));
    register(new T.Mesh(geometry,standardMaterial(color,opacity)),{id:p.id,name:part.name,zh:part.zh,text:part.text,textZh:part.textZh,group:layer.name,groupZh:layer.zh,rank:part.layer},color,opacity);
    const record=loaded[loaded.length-1];
    // Globe layers separate along the optical axis; everything else moves radially away from the globe.
    if(part.axial!==undefined)record.spread.copy(axis).multiplyScalar(part.axial*length*.75);
    else{
     const direction=record.center.clone().sub(globeCenter);
     if(direction.lengthSq()<1e-10)direction.copy(axis);
     // Structures far behind the globe travel further so the orbital apex opens up too.
     const reach=1+Math.min(2,direction.length()/length)*.45;
     record.spread.copy(direction.normalize().multiplyScalar(length*(part.layer===0?1.5:.9)*reach));
    }
   }
   finish(globeCenter);
  };

  if(atlasId==='brain')void loadBrain();
  else if(atlasId==='eye')void loadEye();
  else void loadEar();

  /** Part of the canvas not covered by the side panel (desktop) or bottom sheet (phone), in canvas pixels. */
  const freeRegion=()=>{
   const w=el.clientWidth,h=el.clientHeight,panel=el.parentElement?.querySelector('.micro-atlas-panel');
   if(!panel)return {cx:w/2,cy:h/2,w,h};
   const pr=panel.getBoundingClientRect(),er=el.getBoundingClientRect();
   if(pr.width>w*.6){const top=Math.min(150,h*.2),bottom=Math.max(top+80,pr.top-er.top);return {cx:w/2,cy:(top+bottom)/2,w,h:bottom-top};}
   const top=Math.min(96,h*.15),right=Math.max(80,pr.left-er.left);return {cx:right/2,cy:(top+h)/2,w:right,h:h-top};
  };
  const resize=()=>{
   const w=el.clientWidth,h=Math.max(el.clientHeight,1),free=freeRegion();
   camera.aspect=w/h;camera.setViewOffset(w,h,w/2-free.cx,h/2-free.cy,w,h);renderer.setSize(w,h);invalidate();
  };
  resize();
  const observer=new ResizeObserver(resize);observer.observe(el);

  let tween:{start:number;fromPosition:T.Vector3;fromTarget:T.Vector3;toPosition:T.Vector3;toTarget:T.Vector3}|null=null;
  /** Fits everything currently visible into the free part of the canvas. */
  const frameVisible=(smooth:boolean,direction?:T.Vector3,only?:string[])=>{
   const box=new T.Box3(),part=new T.Box3();
   atlasRoot.updateMatrixWorld(true);
   for(const r of loaded){if(!r.object.visible||(only&&!only.includes(r.id)))continue;r.object.updateMatrixWorld(true);box.union(part.copy(r.object.geometry.boundingBox!).applyMatrix4(r.object.matrixWorld));}
   if(box.isEmpty())return;
   const sphere=box.getBoundingSphere(new T.Sphere()),free=freeRegion(),h=Math.max(el.clientHeight,1);
   const tan=Math.tan(T.MathUtils.degToRad(camera.fov/2)),half=Math.atan(tan*Math.min(free.w,free.h)/h);
   const distance=T.MathUtils.clamp(sphere.radius/Math.sin(half)*1.04,controls.minDistance,controls.maxDistance);
   const toTarget=sphere.center,toPosition=toTarget.clone().addScaledVector(direction??camera.position.clone().sub(controls.target).normalize(),distance);
   if(smooth)tween={start:performance.now(),fromPosition:camera.position.clone(),fromTarget:controls.target.clone(),toPosition,toTarget};
   else{tween=null;camera.position.copy(toPosition);controls.target.copy(toTarget);controls.update();}
   invalidate();
  };
  apiRef.current={frame:frameVisible,invalidate,plane};
  // Review aid (?review=1 only): fixed camera directions and screen positions of structures, for labelled screenshots.
  const dev=new URLSearchParams(location.search).has('review');
  if(dev)(window as unknown as {__microAtlas?:unknown}).__microAtlas={
   view:(x:number,y:number,z:number,only?:string[],back=1)=>{frameVisible(false,new T.Vector3(x,y,z).normalize(),only);camera.position.sub(controls.target).multiplyScalar(back).add(controls.target);controls.update();invalidate();},
   project:(id:string)=>{const r=loaded.find(v=>v.id===id);if(!r||!r.object.visible)return null;const p=r.center.clone().add(r.object.position).applyMatrix4(atlasRoot.matrixWorld).project(camera);return [(p.x+1)/2*el.clientWidth,(1-p.y)/2*el.clientHeight];},
  };

  const raycaster=new T.Raycaster(),pointer=new T.Vector2();let down:{x:number;y:number}|null=null;
  const pointerDown=(e:PointerEvent)=>{down={x:e.clientX,y:e.clientY};tween=null;};
  const pointerUp=(e:PointerEvent)=>{
   if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>7){down=null;return;}down=null;
   const rect=renderer.domElement.getBoundingClientRect();
   pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
   raycaster.setFromCamera(pointer,camera);
   const candidates=recordsRef.current.map(r=>r.object).filter(o=>o.visible);
   // Ignore surface that the section plane has cut away.
   const sectioned=(candidates[0]?.material as T.Material|undefined)?.clippingPlanes?.length;
   const hit=raycaster.intersectObjects(candidates,false).find(i=>!sectioned||plane.distanceToPoint(i.point)>=0);
   const id=hit?.object.userData.__microId as string|undefined;
   if(id)setSelected(id);
  };
  const wheel=()=>{tween=null;};
  renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('wheel',wheel,{passive:true});
  const animate=()=>{
   if(disposed)return;frame=requestAnimationFrame(animate);
   if(tween){
    const k=Math.min(1,(performance.now()-tween.start)/420),e=1-Math.pow(1-k,3);
    camera.position.lerpVectors(tween.fromPosition,tween.toPosition,e);controls.target.lerpVectors(tween.fromTarget,tween.toTarget,e);
    if(k>=1)tween=null;dirty=true;
   }
   controls.update();
   if(dirty){
    dirty=false;
    // Depth range follows the orbit distance, so thin layers lying on one another keep their order when zoomed in.
    const distance=camera.position.distanceTo(controls.target),near=Math.max(.0005,distance*.02),far=distance*40+10;
    if(Math.abs(camera.near-near)>near*.05){camera.near=near;camera.far=far;camera.updateProjectionMatrix();}
    renderer.render(scene,camera);
   }
  };animate();
  return()=>{
   disposed=true;abort.abort();cancelAnimationFrame(frame);observer.disconnect();controls.dispose();
   renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);renderer.domElement.removeEventListener('wheel',wheel);
   if(dev)delete (window as unknown as {__microAtlas?:unknown}).__microAtlas;
   disposeSource(scene);renderer.dispose();renderer.domElement.remove();recordsRef.current=[];apiRef.current=null;
  };
 },[atlasId]);

 const groups=useMemo(()=>{
  const map=new Map<string,{rank:number;count:number;zh?:string}>();
  records.forEach(r=>{const g=map.get(r.group);if(g){g.count++;g.rank=Math.min(g.rank,r.rank);}else map.set(r.group,{rank:r.rank,count:1,zh:r.groupZh});});
  return [...map.entries()].sort((a,b)=>a[1].rank-b[1].rank).map(([name,g])=>({name,...g,color:atlasId==='eye'?EYE_LAYERS.find(l=>l.name===name)?.color??meshColor(g.rank):meshColor(g.rank)}));
 },[records,atlasId]);
 const shown=groups.filter(g=>!hiddenGroups.has(g.name));
 // Peeling works from the outside in: the outermost shown layer goes first, and comes back last.
 const outermost=shown[0],restorable=[...groups].reverse().find(g=>hiddenGroups.has(g.name)&&(!outermost||g.rank<outermost.rank));
 const selectedRecord=records.find(r=>r.id===selected);

 useEffect(()=>{
  const api=apiRef.current;
  recordsRef.current.forEach(r=>{
   const chosen=r.id===selected;
   r.object.visible=isolate&&selected?chosen:!hiddenGroups.has(r.group);
   r.object.position.copy(r.spread).multiplyScalar(explode/100);
   const material=r.object.material as T.MeshStandardMaterial;
   material.color.copy(chosen?SELECTED_COLOR:r.color);
   material.emissive.set(chosen?'#193b18':'#000000');
   material.opacity=chosen?Math.max(r.opacity,.9):r.opacity;
   material.clippingPlanes=cut&&api&&!(isolate&&selected)?[api.plane]:null;
  });
  api?.invalidate();
 },[explode,hiddenGroups,isolate,selected,records,cut]);

 // Keep whatever is visible in frame; follow the separation slider without easing.
 const isolated=isolate?selected:null;
 useEffect(()=>{if(!records.length)return;apiRef.current?.frame(framed.current,framed.current?undefined:HOME_DIRECTION);framed.current=true;},[records,hiddenGroups,isolated]);
 useEffect(()=>{if(records.length&&framed.current)apiRef.current?.frame(false);},[explode]);
 useEffect(()=>{if(records.length&&framed.current)apiRef.current?.frame(true,cut?SECTION_DIRECTION:undefined);},[cut]);

 const reset=()=>{setExplode(0);setHiddenGroups(defaultHidden(atlasId));setSelected(null);setIsolate(false);setCut(false);setOpenGroup(null);requestAnimationFrame(()=>apiRef.current?.frame(true,HOME_DIRECTION));};
 const setGroupHidden=(name:string,hidden:boolean)=>{setIsolate(false);setHiddenGroups(prev=>{const next=new Set(prev);if(hidden)next.add(name);else next.delete(name);return next;});};
 const pick=(r:RecordInfo)=>{setSelected(r.id);if(hiddenGroups.has(r.group))setGroupHidden(r.group,false);};
 const meta=MICRO_ATLASES[atlasId];

 return <div className="micro-atlas-shell">
  <div className="micro-atlas-canvas" ref={host}/>
  <section className="micro-atlas-panel glass" aria-label={meta.title+' 詳細模式'}>
   <div className="micro-atlas-heading"><Button variant="ghost" className="micro-back" onClick={onExit}><ArrowLeft size={15}/>返回</Button><span className="eyebrow">DETAIL ATLAS</span><h2>{meta.title}</h2><p>{meta.subtitle}</p></div>
   <div className="micro-atlas-actions">
    <Button variant="ghost" disabled={!restorable} onClick={()=>restorable&&setGroupHidden(restorable.name,false)}>還原上一層</Button>
    <Button variant="ghost" disabled={shown.length<2} onClick={()=>outermost&&setGroupHidden(outermost.name,true)}>剝開一層</Button>
   </div>
   <div className="micro-layer-list">{groups.map(g=>{
    const on=!hiddenGroups.has(g.name),open=openGroup===g.name,label=g.zh??g.name;
    return <div key={g.name} className={'micro-layer'+(on?' enabled':'')} ref={open?node=>{node?.scrollIntoView({block:'nearest'});}:undefined}>
     <div className="micro-layer-row">
      <Button variant="ghost" className="micro-layer-toggle" aria-pressed={on} aria-label={(on?'隱藏':'顯示')+label} title={on?'隱藏這一層':'顯示這一層'} onClick={()=>setGroupHidden(g.name,on)}>{on?<Eye size={13}/>:<EyeOff size={13}/>}</Button>
      <Button variant="ghost" className="micro-layer-name" aria-expanded={open} aria-label={label+'：構造清單'} onClick={()=>setOpenGroup(open?null:g.name)}><i style={{background:g.color}}/><span>{g.name}{g.zh&&<small lang="zh-Hant">{g.zh}</small>}</span><small>{g.count}</small><ChevronDown size={12} className={open?'open':''}/></Button>
     </div>
     {open&&<div className="micro-part-list">{records.filter(r=>r.group===g.name).map(r=><Button variant="ghost" key={r.id} className={r.id===selected?'active':''} aria-pressed={r.id===selected} onClick={()=>pick(r)}><span>{r.name}</span>{r.zh&&<small lang="zh-Hant">{r.zh}</small>}</Button>)}</div>}
    </div>;
   })}</div>
   <div className="micro-explode"><Layers3 size={14}/><span id="micro-explode-label">分離</span><Slider aria-labelledby="micro-explode-label" min={0} max={100} step={1} value={[explode]} onValueChange={v=>setExplode(Array.isArray(v)?v[0]:v)}/><output>{explode}%</output></div>
   <div className="micro-selected" aria-live="polite"><span className="eyebrow">已選構造</span><strong>{selectedRecord?.name??'點選模型上的構造，或從上方清單選擇'}</strong>{selectedRecord?.zh&&<em lang="zh-Hant">{selectedRecord.zh}</em>}{selectedRecord&&<small>{selectedRecord.group}{selectedRecord.groupZh&&' · '+selectedRecord.groupZh}</small>}{selectedRecord?.text&&<p>{selectedRecord.text}</p>}{selectedRecord?.textZh&&<p lang="zh-Hant">{selectedRecord.textZh}</p>}</div>
   <div className="micro-selected-actions"><Button className={isolate?'active':''} disabled={!selected} onClick={()=>setIsolate(v=>!v)}><Focus size={13}/>{isolate?'顯示周圍':'單獨顯示'}</Button><Button variant="ghost" className={cut?'active':''} aria-pressed={cut} disabled={isolate&&!!selected} onClick={()=>setCut(v=>!v)}><Scissors size={13}/>{cut?'完整':'切面'}</Button><Button variant="ghost" onClick={reset}><RotateCcw size={13}/>重設</Button></div>
   <div className="micro-credit"><span>{meta.source}</span><span>{meta.license}</span></div>
  </section>
  {loading<100&&!error&&<div className="micro-loading glass" role="status"><strong>正在載入 {meta.title}</strong><span>{loading}%</span><div><i style={{width:loading+'%'}}/></div></div>}
  {error&&<div className="micro-loading glass error" role="alert"><strong>詳細模式無法使用</strong><span>{error}</span><Button variant="ghost" onClick={onExit}>返回人體</Button></div>}
 </div>;
}

import {useEffect,useMemo,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {VTKLoader} from 'three/examples/jsm/loaders/VTKLoader.js';
import {ArrowLeft,Focus,Layers3,RotateCcw} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Slider} from '@/components/ui/slider';

export type MicroAtlasId='brain'|'eye'|'ear';

export const MICRO_ATLASES:Record<MicroAtlasId,{title:string;subtitle:string;source:string;license:string}> = {
 brain:{title:'Brain',subtitle:'Neuroanatomy micro-atlas',source:'Brain Project · Z-Anatomy / BodyParts3D',license:'CC BY-SA 4.0'},
 eye:{title:'Eye & orbit',subtitle:'Eyeball, extraocular muscles, nerve & vessels',source:'Human Reference Atlas · Ocularium',license:'CC BY 4.0'},
 ear:{title:'Inner ear',subtitle:'Vestibular & cochlear micro-atlas',source:'IE-Map · LMU Munich',license:'CC BY 4.0'},
};

interface Props {atlasId:MicroAtlasId;onExit:()=>void}
interface Record3D {
 id:string;
 name:string;
 group:string;
 rank:number;
 object:T.Mesh;
 center:T.Vector3;
 baseColor?:T.Color;
}

const BRAIN_URLS=[
 'https://cdn.jsdelivr.net/gh/itayinbarr/brainproject@main/brain-atlas/models/brain.glb',
 'https://raw.githubusercontent.com/itayinbarr/brainproject/main/brain-atlas/models/brain.glb',
];
const EYE_URLS=[
 'https://cdn.jsdelivr.net/gh/huahbo/ocularium@main/public/models/eye-anatomy.glb',
 'https://raw.githubusercontent.com/huahbo/ocularium/main/public/models/eye-anatomy.glb',
];
const EYE_ORBIT_URLS=[
 'https://cdn.humanatlas.io/digital-objects/ref-organ/eye-male-left/v1.3/assets/3d-vh-m-eye-l.glb',
 'https://3d.nih.gov/api/submissions/29116/runs/365c5e09-2486-4d48-a725-f707520ab9a3/output-files/741947',
 'https://cdn.jsdelivr.net/gh/huahbo/ocularium@main/source/eye-anatomy.glb',
 'https://raw.githubusercontent.com/huahbo/ocularium/main/source/eye-anatomy.glb',
];
const DRACO_PATH='https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

const EYE_PARTS:Record<string,{name:string;group:string;rank:number}> = {
 VH_M_palpebral_conjunctiva_of_upper_eyelid_L:{name:'Upper palpebral conjunctiva',group:'Surface & conjunctiva',rank:0},
 VH_M_palpebral_conjunctiva_of_lower_eyelid_L:{name:'Lower palpebral conjunctiva',group:'Surface & conjunctiva',rank:0},
 VH_M_bulbar_conjunctiva_L:{name:'Bulbar conjunctiva',group:'Surface & conjunctiva',rank:0},
 VH_M_cornea_L:{name:'Cornea',group:'Outer fibrous coat',rank:1},
 VH_M_corneo_scleral_junction_L:{name:'Corneoscleral junction (limbus)',group:'Outer fibrous coat',rank:1},
 VH_M_sclera_L:{name:'Sclera',group:'Outer fibrous coat',rank:1},
 VH_M_schlemms_canal_L:{name:"Schlemm's canal",group:'Anterior chamber outflow',rank:2},
 VH_M_trabecular_meshwork_L:{name:'Trabecular meshwork',group:'Anterior chamber outflow',rank:2},
 VH_M_iris_L:{name:'Iris',group:'Anterior uvea',rank:3},
 VH_M_pupil_L:{name:'Pupil',group:'Anterior uvea',rank:3},
 VH_M_ciliary_body_L:{name:'Ciliary body',group:'Anterior uvea',rank:3},
 VH_M_ciliary_muscle_L:{name:'Ciliary muscle',group:'Anterior uvea',rank:3},
 VH_M_ciliary_processes_L:{name:'Ciliary processes',group:'Anterior uvea',rank:3},
 VH_M_suspensory_ligament_of_lens_L:{name:'Suspensory ligament / zonules',group:'Lens apparatus',rank:4},
 VH_M_lens_L:{name:'Lens',group:'Lens apparatus',rank:4},
 VH_M_aqueous_humor_L:{name:'Aqueous humour',group:'Ocular media',rank:5},
 VH_M_vitreous_humor_L:{name:'Vitreous humour',group:'Ocular media',rank:5},
 VH_M_optic_choroid_L:{name:'Choroid',group:'Vascular & neural coats',rank:6},
 VH_M_retina_L:{name:'Retina',group:'Vascular & neural coats',rank:7},
 VH_M_ora_serrata_of_retina_L:{name:'Ora serrata',group:'Retinal landmarks',rank:8},
 VH_M_optic_disc_L:{name:'Optic disc',group:'Retinal landmarks',rank:8},
 VH_M_macula_lutea_L:{name:'Macula lutea',group:'Retinal landmarks',rank:8},
 VH_M_fovea_L:{name:'Fovea',group:'Retinal landmarks',rank:8},
};

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

function eyeOrbitMeta(raw:string){
 const s=raw.toLowerCase().replace(/[_-]+/g,' ');
 if(/ciliary muscle|ciliary body|ciliary process/.test(s))return null;
 if(/superior rectus|inferior rectus|medial rectus|lateral rectus|superior oblique|inferior oblique/.test(s))
  return {name:humanize(raw).replace(/^VH M /i,''),group:'Extraocular muscles',rank:0};
 if(/optic nerve/.test(s))
  return {name:'Optic nerve',group:'Orbital nerves',rank:1};
 if(/oculomotor|trochlear|abducens|ophthalmic nerve|nasociliary|lacrimal nerve|frontal nerve/.test(s))
  return {name:humanize(raw).replace(/^VH M /i,''),group:'Orbital nerves',rank:1};
 if(/artery|arterial|vein|venous/.test(s))
  return {name:humanize(raw).replace(/^VH M /i,''),group:/vein|venous/.test(s)?'Orbital veins':'Orbital arteries',rank:2};
 if(/lacrimal gland/.test(s))
  return {name:'Lacrimal gland',group:'Orbital adnexa',rank:2};
 return null;
}

function structureColor(name:string,group:string,rank:number){
 const s=(name+' '+group).toLowerCase();
 if(/muscle/.test(s))return '#b96863';
 if(/nerve/.test(s))return '#dec45e';
 if(/vein|venous/.test(s))return '#6f8fba';
 if(/artery|arterial|vascular/.test(s))return '#c7605b';
 if(/cornea/.test(s))return '#9ccfd5';
 if(/sclera/.test(s))return '#e4ddd2';
 if(/conjunctiva/.test(s))return '#d8aaa3';
 if(/iris/.test(s))return '#8f765b';
 if(/lens/.test(s))return '#d5cb91';
 if(/retina/.test(s))return '#c98b73';
 if(/choroid/.test(s))return '#865249';
 if(/aqueous|vitreous/.test(s))return '#abcbd4';
 return meshColor(rank);
}

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

export default function MicroAtlasScene({atlasId,onExit}:Props){
 const host=useRef<HTMLDivElement>(null);
 const recordsRef=useRef<Record3D[]>([]);
 const rootRef=useRef<T.Group|null>(null);
 const cameraRef=useRef<T.PerspectiveCamera|null>(null);
 const controlsRef=useRef<OrbitControls|null>(null);
 const [records,setRecords]=useState<{id:string;name:string;group:string;rank:number}[]>([]);
 const [selected,setSelected]=useState<string|null>(null);
 const [depth,setDepth]=useState(0);
 const [explode,setExplode]=useState(0);
 const [hiddenGroups,setHiddenGroups]=useState<Set<string>>(()=>new Set());
 const [isolate,setIsolate]=useState(false);
 const [loading,setLoading]=useState(0);
 const [error,setError]=useState('');

 useEffect(()=>{setSelected(null);setDepth(0);setExplode(0);setHiddenGroups(new Set());setIsolate(false);setLoading(0);setError('');},[atlasId]);

 useEffect(()=>{
  const el=host.current;if(!el)return;
  let disposed=false,frame=0;
  const scene=new T.Scene();scene.background=new T.Color('#f2f3f3');
  const camera=new T.PerspectiveCamera(32,1,.001,100);camera.position.set(2.6,1.4,3.3);
  const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  el.appendChild(renderer.domElement);cameraRef.current=camera;
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=.35;controls.maxDistance=10;controls.target.set(0,0,0);controlsRef.current=controls;
  scene.add(new T.HemisphereLight(0xffffff,0x9aa1a8,2.1));
  const key=new T.DirectionalLight(0xffffff,2.2);key.position.set(-3,4,5);scene.add(key);
  const fill=new T.DirectionalLight(0xdbe8ff,1.35);fill.position.set(3,1,-4);scene.add(fill);
  const ground=new T.Mesh(new T.CircleGeometry(5,96),new T.MeshStandardMaterial({color:0xe1e3e3,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-1.55;scene.add(ground);

  const atlasRoot=new T.Group();scene.add(atlasRoot);rootRef.current=atlasRoot;
  const loaded:Record3D[]=[];

  const registerMesh=(mesh:T.Mesh,name:string,group:string,rank:number,id:string)=>{
   mesh.geometry=mesh.geometry.clone();
   if(!mesh.geometry.getAttribute('normal'))mesh.geometry.computeVertexNormals();
   const color=new T.Color(structureColor(name,group,rank));
   const n=name.toLowerCase();
   const transparent=/cornea|conjunctiva|aqueous|vitreous|lens/.test(n);
   const opacity=/aqueous|vitreous/.test(n)?.14:/cornea/.test(n)?.28:/conjunctiva/.test(n)?.38:/lens/.test(n)?.48:1;
   mesh.material=new T.MeshStandardMaterial({
    color,roughness:.58,metalness:0,side:T.FrontSide,
    transparent,opacity,depthWrite:!transparent
   });
   mesh.geometry.computeBoundingBox();
   const center=mesh.geometry.boundingBox?.getCenter(new T.Vector3())??new T.Vector3();
   mesh.userData.__microId=id;
   loaded.push({id,name,group,rank,object:mesh,center,baseColor:color.clone()});
  };

  const flattenGlb=(source:T.Object3D,kind:'brain'|'eye')=>{
   source.updateMatrixWorld(true);
   const meshes:T.Mesh[]=[];
   source.traverse(o=>{if(o instanceof T.Mesh)meshes.push(o);});
   meshes.forEach((src,index)=>{
    const mesh=src.clone(false) as T.Mesh;
    mesh.geometry=src.geometry.clone();
    mesh.geometry.applyMatrix4(src.matrixWorld);
    mesh.position.set(0,0,0);mesh.rotation.set(0,0,0);mesh.scale.set(1,1,1);mesh.updateMatrix();
    let name=src.name||`Structure ${index+1}`,group='Anatomy',rank=0,id=`${kind}-${index}`;
    if(kind==='eye'){
      const meta=EYE_PARTS[src.name];
      if(!meta)return;
      name=meta.name;group=meta.group;rank=meta.rank+3;id='eye-'+src.name;
    }else{
      const label=String(src.userData?.bx_label||src.name||`Brain structure ${index+1}`);
      const cat=String(src.userData?.bx_cat||'');
      const classified=brainGroup(label,cat);
      name=humanize(label);group=classified.group;rank=classified.rank;id=String(src.userData?.bx_id||`brain-${index}`);
    }
    registerMesh(mesh,name,group,rank,id);atlasRoot.add(mesh);
   });
  };

  const flattenEyeOrbit=(source:T.Object3D)=>{
   source.updateMatrixWorld(true);
   const meshes:T.Mesh[]=[];
   source.traverse(o=>{if(o instanceof T.Mesh)meshes.push(o);});
   meshes.forEach((src,index)=>{
    const raw=String(src.name||src.userData?.name||'');
    const meta=eyeOrbitMeta(raw);
    if(!meta)return;
    const mesh=src.clone(false) as T.Mesh;
    mesh.geometry=src.geometry.clone();
    mesh.geometry.applyMatrix4(src.matrixWorld);
    mesh.position.set(0,0,0);mesh.rotation.set(0,0,0);mesh.scale.set(1,1,1);mesh.updateMatrix();
    registerMesh(mesh,meta.name,meta.group,meta.rank,'orbit-'+raw+'-'+index);
    atlasRoot.add(mesh);
   });
  };

  const normalizeRoot=()=>{
   if(!loaded.length)return;
   atlasRoot.updateMatrixWorld(true);
   const box=new T.Box3().setFromObject(atlasRoot),center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());
   const max=Math.max(size.x,size.y,size.z)||1;
   const scale=2.45/max;
   atlasRoot.scale.setScalar(scale);
   atlasRoot.position.copy(center).multiplyScalar(-scale);
   atlasRoot.updateMatrixWorld(true);
   loaded.forEach(r=>{
    r.object.geometry.computeBoundingBox();
    r.center=(r.object.geometry.boundingBox?.getCenter(new T.Vector3())??new T.Vector3()).sub(center);
   });
   recordsRef.current=loaded;
   setRecords(loaded.map(({id,name,group,rank})=>({id,name,group,rank})));
   setLoading(100);
   if(atlasId==='eye')camera.position.set(3.5,1.35,3.05);
   else camera.position.set(2.7,1.35,3.35);
   controls.target.set(0,0,0);controls.update();
  };

  const loadGlbRaw=(urls:string[],onLoad:(scene:T.Object3D)=>void,onFail:(err:unknown)=>void,from=2,to=95)=>{
   const draco=new DRACOLoader();draco.setDecoderPath(DRACO_PATH);
   const loader=new GLTFLoader();loader.setDRACOLoader(draco);
   let ix=0;
   const attempt=()=>{
    loader.load(urls[ix],g=>{if(disposed){draco.dispose();return;}onLoad(g.scene);draco.dispose();},
      e=>{if(e.total)setLoading(Math.max(from,Math.min(to,Math.round(from+(e.loaded/e.total)*(to-from)))));},
      err=>{ix++;if(ix<urls.length)attempt();else{draco.dispose();onFail(err);}});
   };attempt();
  };
  const loadGlb=(urls:string[],kind:'brain'|'eye')=>{
   loadGlbRaw(urls,scene=>{flattenGlb(scene,kind);normalizeRoot();},
    err=>setError(err instanceof Error?err.message:'Could not load this detail atlas.'));
  };
  const loadEye=()=>{
   loadGlbRaw(EYE_URLS,scene=>{
    flattenGlb(scene,'eye');setLoading(58);
    loadGlbRaw(EYE_ORBIT_URLS,orbit=>{
      flattenEyeOrbit(orbit);normalizeRoot();
    },()=>normalizeRoot(),60,96);
   },err=>setError(err instanceof Error?err.message:'Could not load the eye atlas.'),2,56);
  };

  const loadEar=async()=>{
   const loader=new VTKLoader();let done=0;
   const jobs=EAR_FILES.map((entry,index)=>new Promise<void>((resolve)=>{
    loader.load(EAR_BASE+entry.file,geometry=>{
      if(disposed){resolve();return;}
      geometry.computeVertexNormals();
      const mesh=new T.Mesh(geometry,new T.MeshStandardMaterial({color:meshColor(entry.rank),roughness:.62,side:T.DoubleSide}));
      registerMesh(mesh,entry.name,entry.group,entry.rank,`ear-${index}`);atlasRoot.add(mesh);done++;setLoading(Math.round(done/EAR_FILES.length*100));resolve();
    },undefined,()=>{done++;setLoading(Math.round(done/EAR_FILES.length*100));resolve();});
   }));
   await Promise.all(jobs);
   if(!disposed){
    if(loaded.length)normalizeRoot();
    else setError('The inner-ear surface models could not be loaded.');
   }
  };

  if(atlasId==='brain')loadGlb(BRAIN_URLS,'brain');
  else if(atlasId==='eye')loadEye();
  else void loadEar();

  const resize=()=>{const w=el.clientWidth,h=el.clientHeight;camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix();renderer.setSize(w,h);};resize();
  const observer=new ResizeObserver(resize);observer.observe(el);
  const raycaster=new T.Raycaster(),pointer=new T.Vector2();let down:{x:number;y:number}|null=null;
  const pointerDown=(e:PointerEvent)=>{down={x:e.clientX,y:e.clientY};};
  const pointerUp=(e:PointerEvent)=>{
   if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>7){down=null;return;}down=null;
   const rect=renderer.domElement.getBoundingClientRect();
   pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
   raycaster.setFromCamera(pointer,camera);
   const candidates=recordsRef.current.map(r=>r.object).filter(o=>o.visible);
   const hit=raycaster.intersectObjects(candidates,false)[0]?.object as T.Mesh|undefined;
   const id=hit?.userData.__microId as string|undefined;
   if(id)setSelected(id);
  };
  renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);
  const animate=()=>{if(disposed)return;frame=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);};animate();
  return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();recordsRef.current=[];rootRef.current=null;};
 },[atlasId]);

 const groups=useMemo(()=>{
  const map=new Map<string,number>();
  records.forEach(r=>map.set(r.group,Math.min(map.get(r.group)??999,r.rank)));
  return [...map.entries()].sort((a,b)=>a[1]-b[1]).map(([name,rank])=>({name,rank,count:records.filter(r=>r.group===name).length}));
 },[records]);
 const maxDepth=groups.length?Math.max(...groups.map(g=>g.rank)):0;
 const selectedRecord=records.find(r=>r.id===selected);

 useEffect(()=>{
  const selectedId=selected;
  recordsRef.current.forEach(r=>{
   const visible=isolate&&selectedId?r.id===selectedId:r.rank>=depth&&!hiddenGroups.has(r.group);
   r.object.visible=visible;
   const direction=r.center.clone();
   if(direction.lengthSq()<1e-8)direction.set((r.rank%3)-1,((r.rank+1)%3)-1,1);
   direction.normalize();
   const rootScale=rootRef.current?.scale.x||1;
   const amount=(explode/100)*(.58/rootScale);
   r.object.position.copy(direction.multiplyScalar(amount*(1+r.rank*.04)));
   const mats=Array.isArray(r.object.material)?r.object.material:[r.object.material];
   mats.forEach(m=>{
    const mm=m as T.MeshStandardMaterial;
    if(mm.color)mm.color.copy(r.id===selectedId?new T.Color('#9dfc8f'):r.baseColor??new T.Color(meshColor(r.rank)));
    if('emissive' in mm)(mm as T.MeshStandardMaterial).emissive.set(r.id===selectedId?'#193b18':'#000000');
   });
  });
 },[depth,explode,hiddenGroups,isolate,selected,records]);

 const reset=()=>{setDepth(0);setExplode(0);setHiddenGroups(new Set());setSelected(null);setIsolate(false);const c=controlsRef.current,cam=cameraRef.current;if(c&&cam){c.target.set(0,0,0);cam.position.set(2.7,1.35,3.35);c.update();}};
 const toggleGroup=(name:string)=>setHiddenGroups(prev=>{const next=new Set(prev);if(next.has(name))next.delete(name);else next.add(name);return next;});
 const meta=MICRO_ATLASES[atlasId];

 return <div className="micro-atlas-shell">
  <div className="micro-atlas-canvas" ref={host}/>
  <section className="micro-atlas-panel glass" aria-label={meta.title+' detail atlas'}>
   <div className="micro-atlas-heading"><Button variant="ghost" className="micro-back" onClick={onExit}><ArrowLeft size={15}/>Body</Button><span className="eyebrow">DETAIL ATLAS</span><h2>{meta.title}</h2><p>{meta.subtitle}</p></div>
   <div className="micro-atlas-actions">
    <Button variant="ghost" disabled={depth<=0} onClick={()=>setDepth(d=>Math.max(0,d-1))}>Layer back</Button>
    <Button variant="ghost" disabled={depth>=maxDepth} onClick={()=>setDepth(d=>Math.min(maxDepth,d+1))}>Peel deeper</Button>
   </div>
   <div className="micro-atlas-depth"><span>Depth</span><strong>{groups.find(g=>g.rank===depth)?.name??'All layers'}</strong></div>
   <div className="micro-layer-list">{groups.map(g=><Button key={g.name} variant="ghost" className={!hiddenGroups.has(g.name)&&g.rank>=depth?'enabled':''} onClick={()=>toggleGroup(g.name)}><i style={{background:meshColor(g.rank)}}/><span>{g.name}</span><small>{g.count}</small></Button>)}</div>
   <div className="micro-explode"><div><Layers3 size={14}/><span>Separate details</span><output>{explode}%</output></div><Slider min={0} max={100} step={1} value={[explode]} onValueChange={v=>setExplode(Array.isArray(v)?v[0]:v)}/></div>
   <div className="micro-selected"><span className="eyebrow">SELECTED STRUCTURE</span><strong>{selectedRecord?.name??'Tap any visible structure'}</strong><small>{selectedRecord?.group??'Structure remains in its anatomical layer until isolated.'}</small></div>
   <div className="micro-selected-actions"><Button className={isolate?'active':''} disabled={!selected} onClick={()=>setIsolate(v=>!v)}><Focus size={13}/>{isolate?'Show layer context':'Isolate'}</Button><Button variant="ghost" onClick={reset}><RotateCcw size={13}/>Reset</Button></div>
   <div className="micro-credit"><span>{meta.source}</span><span>{meta.license}</span></div>
  </section>
  {loading<100&&!error&&<div className="micro-loading glass"><strong>Loading {meta.title}</strong><span>{loading}%</span><div><i style={{width:loading+'%'}}/></div></div>}
  {error&&<div className="micro-loading glass error"><strong>Detail atlas unavailable</strong><span>{error}</span><Button variant="ghost" onClick={onExit}>Return to body</Button></div>}
 </div>;
}

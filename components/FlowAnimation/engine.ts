import * as THREE from 'three';
import type {PathwayDataset,Pt,Step} from './types';

/** 人體模型提供的東西：每個肌肉群組的材質（引擎依步驟調整透明度），以及（下肢）梨狀肌的材質 */
export interface FlowModel{muscleMats:Record<string,THREE.MeshStandardMaterial>;pirifMat?:THREE.MeshStandardMaterial;dispose?:()=>void}
export interface FlowElements{
 stage:HTMLElement;tagLayer:HTMLElement;leaders:SVGSVGElement;legend:HTMLElement;steps:HTMLElement;body:HTMLElement;
 h1:HTMLElement;modeButtons:HTMLButtonElement[];
 count:HTMLElement;title:HTMLElement;en:HTMLElement;where:HTMLElement;branches:HTMLElement;brH:HTMLElement;clinical:HTMLElement;
}
export interface FlowOptions{
 els:FlowElements;data:PathwayDataset;buildModel:(scene:THREE.Scene,col:(hex:number)=>THREE.Color)=>FlowModel;
 mode?:number;step?:number;
 /** 把資料裡的座標（原型座標）搬到模型座標；沒有給就不變形 */
 map?:(p:Pt)=>Pt;
 /** 模型座標相對原型座標的大小（路徑粗細、光點、鏡頭距離都乘上這個比例） */
 unit?:number;
}
export interface FlowEngine{setMode:(m:number,step?:number)=>void;dispose:()=>void}

const V=(p:Pt)=>new THREE.Vector3(p[0],p[1],p[2]);
const RAW=new THREE.Vector3();
/** 原型（three r128）的顏色與光照都沒有色彩管理；這裡把十六進位色當作線性值使用，輸出也不轉換，畫面與原型一致，且不影響網站主場景。 */
const col=(hex:number)=>new THREE.Color().setRGB(((hex>>16)&255)/255,((hex>>8)&255)/255,(hex&255)/255,THREE.LinearSRGBColorSpace);
const COLORS:Record<string,number>={nerve:0xd9a300,artery:0xcc3b36,vein:0x2c5bb5,vcom:0x8db2e6};
const STEP_DUR=10.5,GROW=4.2,CAM=1.8;
const ease=(t:number)=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

interface PathNode{
 id:string;group:string;curve:THREE.CatmullRomCurve3;len:number;mesh:THREE.Mesh<THREE.TubeGeometry,THREE.MeshStandardMaterial>;geo:THREE.TubeGeometry;
 total:number;unit:number;head:THREE.Sprite;flow:THREE.Sprite[];p:number;state:string;fade:number;of?:string;wasDone?:boolean;
}
interface TagEl{el:HTMLDivElement;p:THREE.Vector3;line:SVGLineElement;dot:SVGCircleElement;w:number;h:number}

export function createFlowEngine(opt:FlowOptions):FlowEngine{
 const {els,data}=opt;
 const {stage}=els;
 const unit=opt.unit??1,warp=opt.map??((p:Pt)=>p);
 const W=(p:Pt)=>V(warp(p));
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 renderer.outputColorSpace=THREE.LinearSRGBColorSpace;
 (renderer as unknown as {useLegacyLights:boolean}).useLegacyLights=true;
 stage.insertBefore(renderer.domElement,stage.firstChild);
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(38,1,0.1*unit,200*unit);
 scene.add(new THREE.HemisphereLight(col(0xffffff),col(0x8a9aa5),0.95));
 const key=new THREE.DirectionalLight(col(0xffffff),0.7);key.position.set(4*unit,8*unit,6*unit);scene.add(key);
 const back=new THREE.DirectionalLight(col(0xffffff),0.35);back.position.set(-5*unit,2*unit,-8*unit);scene.add(back);
 const model=opt.buildModel(scene,col);

 function glow(rgb:string){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d')!;const r=g.createRadialGradient(32,32,0,32,32,32);
  r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba('+rgb+',.8)');r.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);}
 const GLOW:Record<string,THREE.CanvasTexture>={nerve:glow('255,200,40'),artery:glow('235,70,60'),vein:glow('60,110,220'),vcom:glow('140,180,240')};
 const paths:Record<string,PathNode>={};
 function make(id:string,pts:Pt[],group:string,extra?:Partial<PathNode>){
  const curve=new THREE.CatmullRomCurve3(pts.map(W),false,'centripetal');const len=curve.getLength();
  const ulen=len/unit,seg=Math.max(24,Math.round(ulen*28)),rad=10;
  let r=data.thickPaths.test(id)?(group==='nerve'?.05:.058):.032;
  if(id==='aorta')r=.11;if(group==='vcom')r=(id==='v_aorta'?.1:(data.thickPaths.test(id.slice(2))?.045:.026));if(id==='sci')r=.065;
  r*=unit;
  const geo=new THREE.TubeGeometry(curve,seg,r,rad,false);
  const c=col(COLORS[group]);
  const mat=new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.3,roughness:.45,transparent:true,opacity:1,depthWrite:group!=='vcom'});
  const mesh=new THREE.Mesh(geo,mat);mesh.visible=false;scene.add(mesh);
  const head=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW[group],depthWrite:false,transparent:true}));head.scale.set(.42*unit,.42*unit,1);head.visible=false;scene.add(head);
  const flow:THREE.Sprite[]=[];for(let i=0;i<Math.max(2,Math.round(ulen*1.3));i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW[group],depthWrite:false,transparent:true,opacity:.85}));s.scale.set((group==='vcom'?.15:.2)*unit,(group==='vcom'?.15:.2)*unit,1);s.visible=false;s.userData.o=Math.random();scene.add(s);flow.push(s);}
  paths[id]={id,group,curve,len:ulen,mesh,geo,total:geo.index!.count,unit:rad*6,head,flow,p:0,state:'hidden',fade:0,...(extra||{})};
 }
 for(const id in data.nerves)make(id,data.nerves[id],'nerve');
 const posterior=new RegExp('^('+data.posteriorArteries.join('|')+')$');
 for(const id in data.arteries){make(id,data.arteries[id],'artery');
  // 同名伴行靜脈：由動脈資料自動產生（偏移＋反向，血流回心臟）
  const off=posterior.test(id)?[0,0,-.085]:[.075,0,-.03];
  const pts=data.arteries[id].map(p=>[p[0]+off[0],p[1]+off[1],p[2]+off[2]] as Pt).reverse();
  make('v_'+id,pts,'vcom',{of:id});}
 for(const id in data.veins)make(id,data.veins[id],'vein');
 function setGrow(n:PathNode,p:number){n.p=p;n.mesh.visible=p>0;n.geo.setDrawRange(0,Math.floor(n.total*p/n.unit)*n.unit);
  n.head.visible=p>0&&p<1;if(n.head.visible)n.head.position.copy(n.curve.getPointAt(p));}

 /* ---------- UI ---------- */
 const MODES=data.modes;
 const {leaders,steps:stepsEl,body:bodyEl,tagLayer,legend:legendEl,modeButtons}=els;
 let tagEls:TagEl[]=[];
 let mode=0,stepIdx=-1,stepT=0,growPhases:string[][]=[];
 let camFrom:THREE.Vector3[]=[new THREE.Vector3(3.2,1.6,8.5),new THREE.Vector3(-.6,.9,-.3)];
 const camNow:THREE.Vector3[]=[camFrom[0].clone(),camFrom[1].clone()];
 let fadeTimer:ReturnType<typeof setTimeout>|undefined;
 function buildBars(){stepsEl.innerHTML='';MODES[mode].steps.forEach(()=>{const li=document.createElement('li');li.innerHTML='<span></span>';stepsEl.appendChild(li);});
  legendEl.innerHTML='';MODES[mode].legend.forEach(([t,c])=>{const s=document.createElement('span');const i=document.createElement('i');i.style.background=c;s.appendChild(i);s.appendChild(document.createTextNode(t));legendEl.appendChild(s);});}
 function showStep(){
  const s=MODES[mode].steps[stepIdx];
  [...stepsEl.children].forEach((li,k)=>{li.className=k<stepIdx?'done':(k===stepIdx?'now':'');});
  bodyEl.classList.add('fade');
  if(fadeTimer)clearTimeout(fadeTimer);
  fadeTimer=setTimeout(()=>{
   els.count.textContent=(stepIdx+1)+' / '+MODES[mode].steps.length;
   els.title.textContent=s.t;els.en.textContent=s.en;els.where.textContent=s.where;els.branches.textContent=s.br;
   els.brH.textContent=MODES[mode].brH;els.clinical.textContent=s.cl;
   bodyEl.scrollTop=0;bodyEl.classList.remove('fade');
  },300);
  tagEls.forEach(e=>{e.el.remove();e.line.remove();e.dot.remove();});
  const NS='http://www.w3.org/2000/svg';
  tagEls=s.tags.map(([zh,en,p,c])=>{const el=document.createElement('div');el.className='fa-tag';el.appendChild(document.createTextNode(zh));
   if(en){const sm=document.createElement('small');sm.textContent=en;el.appendChild(sm);}
   el.style.setProperty('--c',c);el.style.opacity='0';tagLayer.appendChild(el);
   const line=document.createElementNS(NS,'line');line.setAttribute('stroke',c);line.setAttribute('stroke-width','1.2');line.style.transition='opacity .4s';
   const dot=document.createElementNS(NS,'circle');dot.setAttribute('r','3');dot.setAttribute('fill',c);dot.style.transition='opacity .4s';
   leaders.appendChild(line);leaders.appendChild(dot);
   return{el,p:W(p),line,dot,w:0,h:0};});
 }
 function resetAll(){for(const id in paths){const n=paths[id];setGrow(n,0);n.state='hidden';n.fade=0;n.flow.forEach(f=>f.visible=false);}}
 function setMode(m:number,step=0){mode=m;resetAll();buildBars();
  els.h1.textContent=MODES[m].name;
  modeButtons.forEach((b,k)=>b.setAttribute('aria-pressed',k===m?'true':'false'));
  // 從中間某一步開始時，先把之前的步驟畫成「已完成」
  for(let i=0;i<step;i++){MODES[m].steps[i].ph.flat().forEach(id=>{const n=paths[id];setGrow(n,1);n.state='done';});}
  startStep(step);}
 function startStep(i:number){
  const st:Step=MODES[mode].steps[i];
  for(const id in paths){const n=paths[id];if(n.group==='vcom')continue;
   if(n.state==='active')n.state='done';
   else if(n.state==='ctx'){n.state=n.wasDone?'done':'hidden';if(n.state==='hidden')setGrow(n,0);}}
  st.ph.flat().forEach(id=>{paths[id].state='active';});
  (st.ctx||[]).forEach(id=>{const n=paths[id];if(n.state!=='active'){n.wasDone=n.state==='done';n.state='ctx';setGrow(n,1);}});
  if(st.orbit)for(const id in paths){const n=paths[id];if(MODES[mode].groups.includes(n.group)){n.state='active';setGrow(n,1);}}
  growPhases=st.ph.filter(ph=>ph.some(id=>paths[id].p<1));
  camFrom=[camNow[0].clone(),camNow[1].clone()];
  stepIdx=i;stepT=0;showStep();
 }
 const onMode=modeButtons.map((b,k)=>{const f=()=>setMode(k);b.addEventListener('click',f);return f;});
 let camScale=1;
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w/h<0.8?50:40;camScale=w<520?1.5:(w<820?1.25:1);camera.updateProjectionMatrix();tagEls.forEach(t=>t.w=0);}
 window.addEventListener('resize',resize);
 const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;ro?.observe(stage);
 resize();

 const clock=new THREE.Clock(),tmp=new THREE.Vector3();
 setMode(opt.mode??0,opt.step??0);
 let raf=0,alive=true;
 function frame(){
  if(!alive)return;
  raf=requestAnimationFrame(frame);
  if(document.hidden){clock.getDelta();return;}
  const dt=Math.min(clock.getDelta(),.05);
  stepT+=dt;
  if(stepT>STEP_DUR){if(stepIdx+1<MODES[mode].steps.length)startStep(stepIdx+1);else setMode((mode+1)%MODES.length);}
  const s=MODES[mode].steps[stepIdx];
  const ct=ease(Math.min(stepT/CAM,1));
 const tgt=W(s.cam[1]);let pos=RAW.copy(V(s.cam[0])).sub(V(s.cam[1])).multiplyScalar(unit).add(tgt).clone();
  if(s.orbit){const off=pos.clone().sub(tgt);off.applyAxisAngle(new THREE.Vector3(0,1,0),stepT*.33);pos=tgt.clone().add(off);}
  else pos.x+=Math.sin(stepT*.4)*.25*unit;
  pos=tgt.clone().add(pos.clone().sub(tgt).multiplyScalar(camScale));
  camNow[0].copy(camFrom[0]).lerp(pos,ct);camNow[1].copy(camFrom[1]).lerp(tgt,ct);
  camera.position.copy(camNow[0]);camera.lookAt(camNow[1]);
  const gt=Math.max(0,stepT-CAM*.6);
  const per=GROW/Math.max(growPhases.length,1);
  growPhases.forEach((ph,k)=>{const p=ease(Math.min(Math.max((gt-k*per)/per,0),1));ph.forEach(id=>setGrow(paths[id],p));});
  const tm=clock.elapsedTime;
  for(const id in paths){const n=paths[id];
   if(n.group==='vcom'){
    const a=paths[n.of!];
    const target=(a.p>=1&&a.state!=='hidden')?(a.state==='active'?1:(a.state==='ctx'?.45:.6)):0;
    n.fade+=(target-n.fade)*Math.min(dt*2.5,1);
    if(n.fade>.01&&n.p<1)setGrow(n,1);
    if(n.fade<=.01&&n.p>0){setGrow(n,0);}
    n.head.visible=false;
    n.mesh.material.opacity=.6*n.fade;n.mesh.material.emissiveIntensity=.2;
    const fo=a.state==='active'&&n.fade>.5;
    n.flow.forEach((f,i)=>{f.visible=fo;if(fo){const u=(tm*0.7/n.len+f.userData.o+i/n.flow.length)%1;f.position.copy(n.curve.getPointAt(u));f.material.opacity=.7*n.fade;}});
    continue;}
   const on=n.state==='active',done=n.state==='done',ctx=n.state==='ctx';
   if((done||ctx)&&n.p<1)setGrow(n,1);
   n.mesh.material.opacity=on?1:(done?.45:(ctx?.3:0));
   n.mesh.material.emissiveIntensity=on?.45:.12;
   const flowOn=on&&n.p>=1;
   n.flow.forEach((f,i)=>{f.visible=flowOn;if(flowOn){const u=(tm*0.9/n.len+f.userData.o+i/n.flow.length)%1;f.position.copy(n.curve.getPointAt(u));}});
  }
  for(const k in model.muscleMats){const mat=model.muscleMats[k];const want=(s.mus||[]).includes(k)?1:0;
   const t=(mat.userData.t=(mat.userData.t??0)+(want-(mat.userData.t??0))*Math.min(dt*3,1));
   mat.opacity=.08+t*.42;mat.emissiveIntensity=t*.25;}
  if(model.pirifMat)model.pirifMat.opacity=s.pir?.75:.3;
  renderer.render(scene,camera);
  const w=stage.clientWidth,h=stage.clientHeight;
  // 標籤排版：放在結構上方，再把重疊的推開，並限制在畫面內、不遮住圖例
  const boxes:{t:TagEl;ax:number;ay:number;x:number;y:number;vis:boolean}[]=[];
  tagEls.forEach((t,i)=>{tmp.copy(t.p).project(camera);
   const ax=(tmp.x*.5+.5)*w,ay=(-tmp.y*.5+.5)*h;
   const vis=tmp.z<1&&stepT>CAM*.7+i*.4;
   if(!t.w){t.w=t.el.offsetWidth;t.h=t.el.offsetHeight;}
   const x=Math.min(Math.max(ax-t.w/2,6),w-t.w-6),y=ay-t.h-18;
   boxes.push({t,ax,ay,x,y,vis});});
  boxes.sort((a,b)=>a.y-b.y);
  for(let it=0;it<6;it++){for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
   const a=boxes[i],b=boxes[j];
   const ox=Math.min(a.x+a.t.w,b.x+b.t.w)-Math.max(a.x,b.x),oy=Math.min(a.y+a.t.h,b.y+b.t.h)-Math.max(a.y,b.y);
   if(ox>0&&oy>0){const d=(oy+4)/2;a.y-=d;b.y+=d;}}}
  boxes.forEach(b=>{b.y=Math.min(Math.max(b.y,legendEl.offsetHeight+14),h-b.t.h-6);
   b.t.el.style.transform='translate('+b.x.toFixed(1)+'px,'+b.y.toFixed(1)+'px)';
   b.t.el.style.opacity=b.vis?'1':'0';
   const cx=Math.min(Math.max(b.ax,b.x+6),b.x+b.t.w-6),cy=b.y+(b.ay>b.y?b.t.h:0);
   b.t.line.setAttribute('x1',String(b.ax));b.t.line.setAttribute('y1',String(b.ay));b.t.line.setAttribute('x2',String(cx));b.t.line.setAttribute('y2',String(cy));
   b.t.dot.setAttribute('cx',String(b.ax));b.t.dot.setAttribute('cy',String(b.ay));
   const o=b.vis?'.9':'0';b.t.line.style.opacity=o;b.t.dot.style.opacity=o;});
  const now=stepsEl.children[stepIdx] as HTMLElement|undefined;if(now&&now.firstElementChild)(now.firstElementChild as HTMLElement).style.transform='scaleX('+Math.min(stepT/STEP_DUR,1)+')';
 }
 frame();

 function dispose(){
  alive=false;cancelAnimationFrame(raf);if(fadeTimer)clearTimeout(fadeTimer);
  window.removeEventListener('resize',resize);ro?.disconnect();
  modeButtons.forEach((b,k)=>b.removeEventListener('click',onMode[k]));
  tagEls.forEach(e=>{e.el.remove();e.line.remove();e.dot.remove();});
  scene.traverse(o=>{const m=o as THREE.Mesh;m.geometry?.dispose?.();const mat=m.material as THREE.Material|THREE.Material[]|undefined;
   (Array.isArray(mat)?mat:mat?[mat]:[]).forEach(x=>x.dispose());});
  model.dispose?.();
  Object.values(GLOW).forEach(t=>t.dispose());
  renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
 }
 return {setMode,dispose};
}

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
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
 /** 從資訊卡進來時要高亮的路徑 id（只在起始的那一步生效；該步驟其他路徑稍微淡化） */
 highlight?:string[];
 /** 暫停狀態改變時通知介面（使用者拖曳或縮放會自動暫停，停在目前這一步） */
 onPausedChange?:(paused:boolean)=>void;
}
/** 視角：auto = 每一步照導覽預設的角度；front／back = 固定從前面／後面看（高度與距離不變） */
export type ViewSide='auto'|'front'|'back';
export interface FlowEngine{setMode:(m:number,step?:number)=>void;prev:()=>void;next:()=>void;togglePause:()=>void;setView:(v:ViewSide)=>void;dispose:()=>void}

const V=(p:Pt)=>new THREE.Vector3(p[0],p[1],p[2]);
const RAW=new THREE.Vector3();
/** 原型（three r128）的顏色與光照都沒有色彩管理；這裡把十六進位色當作線性值使用，輸出也不轉換，畫面與原型一致，且不影響網站主場景。 */
const col=(hex:number)=>new THREE.Color().setRGB(((hex>>16)&255)/255,((hex>>8)&255)/255,(hex&255)/255,THREE.LinearSRGBColorSpace);
const COLORS:Record<string,number>={nerve:0xd9a300,artery:0xcc3b36,vein:0x2c5bb5,vcom:0x8db2e6};
const STEP_DUR=10.5,GROW=4.2,CAM=1.8;
/** 流動光點的速度（原型單位／秒）；比原型慢很多（約四成），較容易跟著看 */
const FLOW_SPEED=.22,FLOW_SPEED_VEIN=.18;
/** 神經比原型細（原型的粗細是示意；放到真實模型上會顯得太粗） */
const NERVE_THICKNESS=.6;
const ease=(t:number)=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

interface PathNode{
 id:string;group:string;curve:THREE.CatmullRomCurve3;len:number;mesh:THREE.Mesh<THREE.TubeGeometry,THREE.MeshStandardMaterial>;geo:THREE.TubeGeometry;
 total:number;unit:number;head:THREE.Sprite;flow:THREE.Sprite[];p:number;state:string;fade:number;of?:string;wasDone?:boolean;
}
interface TagEl{el:HTMLDivElement;p:THREE.Vector3;line:SVGLineElement;dot:SVGCircleElement;w:number;h:number;side?:number}

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
 const controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=true;controls.dampingFactor=.12;controls.minDistance=.25*unit;controls.maxDistance=60*unit;
 controls.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};
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
  if(group==='nerve')r*=NERVE_THICKNESS;
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
  const off=posterior.test(id)?[0,0,-.085]:(data.veinOffset??[.075,0,-.03]);
  const pts=data.arteries[id].map(p=>[p[0]+off[0],p[1]+off[1],p[2]+off[2]] as Pt).reverse();
  make('v_'+id,pts,'vcom',{of:id});}
 for(const id in data.veins)make(id,data.veins[id],'vein');
 function setGrow(n:PathNode,p:number){n.p=p;n.mesh.visible=p>0;n.geo.setDrawRange(0,Math.floor(n.total*p/n.unit)*n.unit);
  n.head.visible=p>0&&p<1;if(n.head.visible)n.head.position.copy(n.curve.getPointAt(p));}

 /* ---------- UI ---------- */
 const MODES=data.modes;
 const {leaders,steps:stepsEl,body:bodyEl,tagLayer,legend:legendEl,modeButtons}=els;
 let tagEls:TagEl[]=[];
 let mode=0,stepIdx=-1,stepT=0,camT=0,growPhases:string[][]=[];
 // 使用者隨時可以轉動、縮放：一動就接手鏡頭並停在目前這一步（paused）；按下一步、上一步或播放會把鏡頭平順接回導覽視角。
 let paused=false,manual=false,viewSide:ViewSide='auto';
 function setPaused(v:boolean){if(paused===v)return;paused=v;opt.onPausedChange?.(v);}
 function resumeGuide(){if(!manual)return;camNow[0].copy(camera.position);camNow[1].copy(controls.target);camFrom=[camNow[0].clone(),camNow[1].clone()];camT=0;manual=false;}
 function setView(v:ViewSide){if(viewSide===v)return;viewSide=v;if(manual)resumeGuide();else{camFrom=[camNow[0].clone(),camNow[1].clone()];camT=0;}}
 controls.addEventListener('start',()=>{if(!manual){controls.target.copy(camNow[1]);manual=true;}setPaused(true);});
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
  resumeGuide();
  camFrom=[camNow[0].clone(),camNow[1].clone()];
  stepIdx=i;stepT=0;camT=0;showStep();
 }
 const onMode=modeButtons.map((b,k)=>{const f=()=>setMode(k);b.addEventListener('click',f);return f;});
 let camScale=1;
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w/h<0.8?50:40;camScale=w<520?1.5:(w<820?1.25:1);camera.updateProjectionMatrix();tagEls.forEach(t=>t.w=0);}
 window.addEventListener('resize',resize);
 const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;ro?.observe(stage);
 resize();

 const clock=new THREE.Clock(),tmp=new THREE.Vector3();
 setMode(opt.mode??0,opt.step??0);
 const hl=opt.highlight?.length?new Set(opt.highlight):null,hlMode=opt.mode??0,hlStep=opt.step??0;
 let raf=0,alive=true;
 function frame(){
  if(!alive)return;
  raf=requestAnimationFrame(frame);
  if(document.hidden){clock.getDelta();return;}
  const dt=Math.min(clock.getDelta(),.05);
  stepT+=dt;camT+=dt;
  if(stepT>STEP_DUR){if(paused)stepT=STEP_DUR;else if(stepIdx+1<MODES[mode].steps.length)startStep(stepIdx+1);else setMode((mode+1)%MODES.length);}
  const s=MODES[mode].steps[stepIdx];
  const ct=ease(Math.min(camT/CAM,1));
 const tgt=W(s.cam[1]);let pos=RAW.copy(V(s.cam[0])).sub(V(s.cam[1])).multiplyScalar(unit).add(tgt).clone();
  // 鏡頭不再持續晃動；總覽步驟在「導覽」視角下才繞一圈。選了前面／後面就固定從那一側看。
  if(viewSide!=='auto'){const off=pos.clone().sub(tgt),r=Math.hypot(off.x,off.z);pos=tgt.clone().add(new THREE.Vector3(0,off.y,viewSide==='front'?r:-r));}
  else if(s.orbit){const off=pos.clone().sub(tgt);off.applyAxisAngle(new THREE.Vector3(0,1,0),stepT*.33);pos=tgt.clone().add(off);}
  pos=tgt.clone().add(pos.clone().sub(tgt).multiplyScalar(camScale));
  if(manual)controls.update();
  else{
   // 鏡頭繞著目標轉過去（方向用球面插值、距離線性插值），切換前後面時不會穿過模型內部
   camNow[1].copy(camFrom[1]).lerp(tgt,ct);
   const offF=camFrom[0].clone().sub(camFrom[1]),offT=pos.clone().sub(tgt),lenF=offF.length(),lenT=offT.length();
   const dF=offF.clone().normalize(),dT=offT.clone().normalize(),q=new THREE.Quaternion();
   if(dF.dot(dT)<-.9999)q.setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI);else q.setFromUnitVectors(dF,dT);
   const qi=new THREE.Quaternion().slerp(q,ct);
   camNow[0].copy(camNow[1]).add(dF.applyQuaternion(qi).multiplyScalar(lenF+(lenT-lenF)*ct));
   camera.position.copy(camNow[0]);camera.lookAt(camNow[1]);}
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
    const hv=!!hl&&mode===hlMode&&stepIdx===hlStep&&hl.has(id);
    n.mesh.material.opacity=hv?Math.max(.6*n.fade,n.fade>.5?.9:0):.6*n.fade;n.mesh.material.emissiveIntensity=hv?.7+.3*Math.sin(clock.elapsedTime*5):.2;
    const fo=a.state==='active'&&n.fade>.5;
    n.flow.forEach((f,i)=>{f.visible=fo;if(fo){const u=(tm*FLOW_SPEED_VEIN/n.len+f.userData.o+i/n.flow.length)%1;f.position.copy(n.curve.getPointAt(u));f.material.opacity=.7*n.fade;}});
    continue;}
   const on=n.state==='active',done=n.state==='done',ctx=n.state==='ctx';
   if((done||ctx)&&n.p<1)setGrow(n,1);
   const hv=!!hl&&mode===hlMode&&stepIdx===hlStep,mine=hv&&hl!.has(id);
   n.mesh.material.opacity=mine?1:(on?(hv?.5:1):(done?.45:(ctx?.3:0)));
   n.mesh.material.emissiveIntensity=mine?.7+.3*Math.sin(clock.elapsedTime*5):(on?.45:.12);
   const flowOn=on&&n.p>=1;
   n.flow.forEach((f,i)=>{f.visible=flowOn;if(flowOn){const u=(tm*FLOW_SPEED/n.len+f.userData.o+i/n.flow.length)%1;f.position.copy(n.curve.getPointAt(u));}});
  }
  for(const k in model.muscleMats){const mat=model.muscleMats[k];const want=(s.mus||[]).includes(k)?1:0;
   const t=(mat.userData.t=(mat.userData.t??0)+(want-(mat.userData.t??0))*Math.min(dt*3,1));
   mat.opacity=.08+t*.42;mat.emissiveIntensity=t*.25;}
  if(model.pirifMat)model.pirifMat.opacity=s.pir?.75:.3;
  renderer.render(scene,camera);
  const w=stage.clientWidth,h=stage.clientHeight;
  // 標籤排版：標籤放在畫面左右兩側（模型外面），用細線連到結構上的小圓點，不蓋住結構。
  // 錨點偏左的放左欄、偏右的放右欄（鏡頭移動期間重新分配，穩定後固定），各欄依高度排序並推開重疊，不遮住圖例與關閉按鈕。
  const M=8,GAP=6,items:{t:TagEl;ax:number;ay:number;vis:boolean;i:number}[]=[];
  tagEls.forEach((t,i)=>{tmp.copy(t.p).project(camera);
   const ax=(tmp.x*.5+.5)*w,ay=(-tmp.y*.5+.5)*h;
   if(!t.w){t.w=t.el.offsetWidth;t.h=t.el.offsetHeight;}
   items.push({t,ax,ay,vis:tmp.z<1&&stepT>CAM*.7+i*.4,i});});
  if(stepT<CAM+.3){
   const xs=items.map(o=>o.ax).sort((a,b)=>a-b),med=xs.length?xs[Math.floor((xs.length-1)/2)]:w/2;
   items.forEach(o=>{o.t.side=items.length===1?(o.ax<w/2?0:1):(o.ax<=med?0:1);});
   // 一邊空一邊滿時，把最靠中間的移到另一邊，兩欄大致均衡
   const left=items.filter(o=>o.t.side===0),right=items.filter(o=>o.t.side===1);
   if(left.length-right.length>1){const m=left.sort((a,b)=>b.ax-a.ax)[0];m.t.side=1;}
   else if(right.length-left.length>1){const m=right.sort((a,b)=>a.ax-b.ax)[0];m.t.side=0;}
  }
  const topLeft=legendEl.offsetHeight+14,topRight=60;
  for(const side of [0,1]){
   const col=items.filter(o=>o.t.side===side).sort((a,b)=>a.ay-b.ay);
   const minY=side===0?topLeft:topRight;
   const ys=col.map(o=>o.ay-o.t.h/2);
   for(let k=0;k<col.length;k++){ys[k]=Math.max(ys[k],k?ys[k-1]+col[k-1].t.h+GAP:minY);}
   // 超出底部時往上推
   let bottom=side===0?h-34:h-12;
   for(let k=col.length-1;k>=0;k--){ys[k]=Math.min(ys[k],bottom-col[k].t.h);bottom=ys[k]-GAP;}
   for(let k=0;k<col.length;k++){ys[k]=Math.max(ys[k],k?ys[k-1]+col[k-1].t.h+GAP:minY);}
   col.forEach((o,k)=>{
    const x=side===0?M:w-M-o.t.w,y=ys[k];
    o.t.el.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px)';
    o.t.el.style.opacity=o.vis?'1':'0';
    const ex=side===0?x+o.t.w:x,ey=y+o.t.h/2;
    o.t.line.setAttribute('x1',String(o.ax));o.t.line.setAttribute('y1',String(o.ay));o.t.line.setAttribute('x2',String(ex));o.t.line.setAttribute('y2',String(ey));
    o.t.dot.setAttribute('cx',String(o.ax));o.t.dot.setAttribute('cy',String(o.ay));
    const op=o.vis?'.9':'0';o.t.line.style.opacity=op;o.t.dot.style.opacity=op;});
  }
  const now=stepsEl.children[stepIdx] as HTMLElement|undefined;if(now&&now.firstElementChild)(now.firstElementChild as HTMLElement).style.transform='scaleX('+Math.min(stepT/STEP_DUR,1)+')';
 }
 frame();

 function dispose(){
  alive=false;cancelAnimationFrame(raf);controls.dispose();if(fadeTimer)clearTimeout(fadeTimer);
  window.removeEventListener('resize',resize);ro?.disconnect();
  modeButtons.forEach((b,k)=>b.removeEventListener('click',onMode[k]));
  tagEls.forEach(e=>{e.el.remove();e.line.remove();e.dot.remove();});
  scene.traverse(o=>{const m=o as THREE.Mesh;m.geometry?.dispose?.();const mat=m.material as THREE.Material|THREE.Material[]|undefined;
   (Array.isArray(mat)?mat:mat?[mat]:[]).forEach(x=>x.dispose());});
  model.dispose?.();
  Object.values(GLOW).forEach(t=>t.dispose());
  renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
 }
 const go=(d:number)=>{const n=MODES.length;let i=stepIdx+d;
  if(i<0){const m=(mode-1+n)%n;setMode(m,MODES[m].steps.length-1);}
  else if(i>=MODES[mode].steps.length)setMode((mode+1)%n);
  else if(d>0)startStep(i);
  else setMode(mode,i);};
 const prev=()=>go(-1),next=()=>go(1);
 const togglePause=()=>{if(paused){resumeGuide();setPaused(false);}else setPaused(true);};
 return {setMode,prev,next,togglePause,setView,dispose};
}

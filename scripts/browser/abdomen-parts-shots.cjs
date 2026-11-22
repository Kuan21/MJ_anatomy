// Parts of the abdominal organs (A1–A3, scripts/paokao-structures/abdomen-parts.mjs): screenshots of a production build served by vite preview (software GL, light theme). No annotations are drawn.
// usage: node scripts/browser/abdomen-parts-shots.cjs <port> <outDir> <before|after|both> [base=/]
// Only the digestive organs and the spleen are shown. The parts are decals: they are drawn when picked, hovered or tinted, so each scene tints one group of parts that do not overlap
// (each part its own colour, the same tint the lung view uses). Tag "before": nothing tinted or picked. The parts are decals that are not drawn until picked or tinted and the organ
// meshes are not changed, so this is what the page showed before the parts were added (same build, same views). Every scene is shot at desktop size
// (1500×950) and the main ones again at phone size (390×844). Loading takes 20–25 minutes with software WebGL.
const {chromium}=require('playwright');const fs=require('fs');
const [port='4173',out='/tmp/abdomen-parts',tag='after',base='/']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const COLORS=['#e6194b','#3cb44b','#4363d8','#f58231','#911eb4','#42d4f4','#f032e6','#bfef45','#fabed4','#469990','#dcbeff','#9a6324'];
// the small intestine, transverse colon, mesenteries and omenta cover the stomach and the duodenum from the front
const GUT='jejun|ileum|transverse colon|mesentery|mesocolon|omentum|sigmoid|descending colon|rectum';
const LIVER='hepatovenous|caudate lobe|hepatic biliary|hepatic duct|duct of caudate';
// [scene, parts tinted, parts hidden (regex), views: [name, target (m), direction from target to camera, distance (m), phone?]]
const SCENES=[
 ['regions',['Fundus of stomach','Body of stomach','Pylorus','Superior part of duodenum (duodenal cap)','Descending part of duodenum','Inferior (horizontal) part of duodenum','Ascending part of duodenum','Cecum','Neck of gallbladder','Body of gallbladder','Fundus of gallbladder'],GUT,[
  ['front',[0,1.08,0.03],[0,0,1],0.6,true],['back',[0,1.08,0.03],[0,0,-1],0.6],['right',[0,1.08,0.03],[-1,0,0],0.6],['left',[0,1.08,0.03],[1,0,0],0.6]]],
 ['liver-lobes',['Right lobe of liver','Left lobe of liver','Quadrate lobe of liver'],GUT,[
  ['front',[-0.01,1.19,0.05],[0,0,1],0.32,true],['below',[-0.01,1.18,0.05],[0,-0.75,0.66],0.3],['back',[-0.01,1.19,0.05],[0,0.2,-1],0.32]]],
 ['stomach-marks',['Cardia (cardial orifice)','Cardial notch','Angular incisure (angular notch)','Lesser curvature of stomach','Greater curvature of stomach','Pyloric sphincter'],GUT+'|'+LIVER+'|gallbladder|cystic duct',[
  ['front',[0.035,1.175,0.04],[0,0,1],0.22,true],['back',[0.035,1.175,0.04],[0,0,-1],0.22],['left-front',[0.035,1.175,0.04],[0.7,0.15,0.7],0.22],['above',[0.035,1.175,0.04],[0,0.85,0.5],0.22]]],
 ['pyloric-part',['Pyloric antrum','Pyloric canal'],GUT+'|'+LIVER+'|gallbladder|cystic duct',[
  ['front',[0.0,1.15,0.05],[0,0,1],0.15,true],['below',[0.0,1.15,0.05],[0,-0.7,0.7],0.15]]],
 ['duodenum-papillae',['Major duodenal papilla','Minor duodenal papilla'],GUT+'|'+LIVER+'|gallbladder|cystic duct|pancrea|^stomach$|spleen',[
  ['medial',[-0.05,1.11,0.03],[1,0,0.25],0.12,true],['front',[-0.05,1.11,0.03],[0,0,1],0.14]]],
 ['esophagus-colon',['Abdominal esophagus','Diaphragmatic (esophagogastric) constriction of esophagus','Right colic flexure','Left colic flexure','Duodenojejunal flexure'],'jejun|ileum|mesentery|mesocolon|omentum|sigmoid|rectum|'+LIVER+'|gallbladder|cystic duct',[
  ['front',[0,1.15,0.03],[0,0,1],0.36,true],['eso-left',[0.012,1.215,0.005],[0.8,0.1,0.6],0.12]]],
 ['z-line',['Esophagogastric junction (Z-line)'],GUT+'|'+LIVER+'|gallbladder|cystic duct',[['eso-left',[0.012,1.21,0.01],[0.8,0.1,0.6],0.12]]],
 ['spleen',['Hilum of spleen (splenic hilum)','Gastric surface of spleen','Renal surface of spleen','Colic surface of spleen'],GUT+'|^stomach$|pancrea|kidney|'+LIVER,[
  ['medial',[0.08,1.16,-0.005],[-1,0.1,0.15],0.2,true],['front',[0.08,1.16,-0.005],[-0.3,0,1],0.2]]],
 ['liver-marks',['Bare area of liver','Porta hepatis'],GUT+'|^stomach$|gallbladder|cystic duct',[['back',[-0.03,1.2,0.0],[0,0.25,-1],0.3,true],['below',[-0.02,1.18,0.05],[0,-0.8,0.6],0.22]]],
 ['cecum-valve',['Ileocecal valve'],'jejunum|transverse colon|mesentery|mesocolon|omentum|sigmoid|descending colon|rectum|proximal part of ileum|middle part of ileum',[
  ['front',[-0.09,0.985,0.02],[0.45,0,1],0.13,true],['medial',[-0.09,0.985,0.02],[1,0.1,0.2],0.13]]],
];
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:1500,height:950},deviceScaleFactor:1,colorScheme:'light'});const p=await ctx.newPage();p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,200)));
 await p.goto(`http://127.0.0.1:${port}${base}?mjview=1`);
 {const t0=Date.now();await p.waitForFunction(()=>document.querySelector('[data-testid=load-bar]')?.getAttribute('aria-valuenow')==='100',null,{timeout:3600000,polling:2000});console.log('loaded',Math.round((Date.now()-t0)/1000)+'s');}
 await sleep(8000);
 // the page state is set through React, as the system panel and the Hide button would; nothing in the app is changed
 const setScene=(hideRx,tint,selected)=>p.evaluate(([hideRx,tint,selected,COLORS])=>{
  const all=window.__mjView.partsState('.'),hide=new RegExp(hideRx+'|thoracic duct|lymph|node|tonsil|thymus|cisterna','i'),id=n=>all.filter(x=>x.name===n).map(x=>x.id);
  const hiddenParts=all.filter(x=>hide.test(x.name)).map(x=>x.id),lungTint=tint.map((n,k)=>({ids:id(n),color:COLORS[k%COLORS.length]})).filter(t=>t.ids.length),sel=selected.flatMap(id);
  const el=document.querySelector('.layers-panel'),k=Object.keys(el).find(k=>k.startsWith('__reactFiber$'));
  for(let f=el[k];f;f=f.return)for(let h=f.memoizedState;h;h=h.next){const v=h.memoizedState;
   if(v&&typeof v==='object'&&!Array.isArray(v)&&'hiddenParts' in v&&'visible' in v&&h.queue?.dispatch){h.queue.dispatch(s=>({...s,visible:['digestive','lymphatic'],hiddenParts,selected:sel,isolate:false,lungTint}));return {hidden:hiddenParts.length,tinted:lungTint.length,selected:sel.length};}}
  return null;
 },[hideRx,tint,selected,COLORS]);
 await p.mouse.click(5,300);await sleep(1000);
 let cur=tag;const shot=async (n,vp)=>{await sleep(3500);await p.screenshot({path:`${out}/${cur}-${vp}-${n}.png`,timeout:240000});console.log('shot',vp,n);};
 const look=([t,d,r],k=1)=>p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,r*k]);
 const DESK={width:1500,height:950},PHONE={width:390,height:844};
 const TAGS=tag==='both'?['before','after']:[tag];
 for(const tg of TAGS){const tag=tg;cur=tg;
 for(const [scene,tint,hide,views] of SCENES){
  await p.setViewportSize(DESK);await sleep(3000);
  console.log(scene,JSON.stringify(await setScene(hide,tag==='before'?[]:tint,[])));await sleep(4000);
  for(const [n,...v] of views){await look(v);await shot(`${scene}-${n}`,'desktop');}
  await p.setViewportSize(PHONE);await sleep(4000);
  for(const [n,...v] of views.filter(v=>v[4])){await look(v,2.2);await shot(`${scene}-${n}`,'mobile');}
 }
 // what a student sees: one part picked (from the search or the list), the organ drawn as usual
 for(const [n,part,hide,v] of [['pick-greater-curvature','Greater curvature of stomach',GUT+'|'+LIVER+'|gallbladder|cystic duct',[[0.035,1.175,0.04],[0,0,1],0.22]],['pick-lesser-curvature','Lesser curvature of stomach',GUT+'|'+LIVER+'|gallbladder|cystic duct',[[0.01,1.17,0.04],[-0.3,0.1,1],0.18]],['pick-body-of-stomach','Body of stomach',GUT,[[0.035,1.175,0.04],[0,0,1],0.24]],['pick-major-papilla','Major duodenal papilla',GUT+'|'+LIVER+'|pancrea|^stomach$',[[-0.05,1.11,0.03],[1,0,0.25],0.12]]]){
  await p.setViewportSize(DESK);await sleep(3000);console.log(n,JSON.stringify(await setScene(hide,[],tag==='before'?[]:[part])));await sleep(4000);await look(v);await shot(n,'desktop');
  await p.setViewportSize(PHONE);await sleep(4000);await look(v,2.2);await shot(n,'mobile');
 }
 }
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1);});

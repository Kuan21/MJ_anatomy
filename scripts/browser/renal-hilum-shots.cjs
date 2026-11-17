// Renal hilum order (AB-01): screenshots of a production build served by vite preview (software GL, light theme). No annotations are drawn.
// usage: node scripts/browser/renal-hilum-shots.cjs <port> <outDir> <tag> [base=/MJ_anatomy/]
// Shown: kidneys, ureters, renal arteries and veins (with divisions and branches), abdominal aorta and inferior vena cava only. Views: front, from above (front-to-back order reads top to bottom), and close obliques of each hilum;
// then the same views with both kidneys hidden, so the renal pelvis (the upper end of the ureter, otherwise inside the kidney) shows behind the artery and vein;
// each series at desktop size (1500×950) and phone size (390×844). Colours: veins blue, arteries red, ureter and renal pelvis brown (urinary). Loading takes 20–25 minutes with software WebGL.
const {chromium}=require('playwright');const fs=require('fs');
const [port='5800',out='/tmp/renal-hilum',tag='after',base='/MJ_anatomy/']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// [name, target (m), direction from target to camera, distance (m)]
const VIEWS=[
 ['front',[0,1.108,0],[0,0,1],0.26],
 ['above',[0,1.11,-0.005],[0,1,0.02],0.24],
 ['left-hilum-above',[0.036,1.118,-0.008],[0.15,1,0.25],0.085],
 ['left-hilum-oblique',[0.036,1.118,-0.008],[0.55,0.35,0.75],0.09],
 ['right-hilum-above',[-0.034,1.108,-0.006],[-0.15,1,0.25],0.085],
 ['right-hilum-oblique',[-0.034,1.108,-0.006],[-0.55,0.35,0.75],0.09],
];
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:1500,height:950},deviceScaleFactor:1,colorScheme:'light'});const p=await ctx.newPage();p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,200)));
 await p.goto(`http://127.0.0.1:${port}${base}?mjview=1`);
 {const t0=Date.now();await p.waitForFunction(()=>document.querySelector('[data-testid=load-bar]')?.getAttribute('aria-valuenow')==='100',null,{timeout:3600000,polling:2000});console.log('loaded',Math.round((Date.now()-t0)/1000)+'s');}
 await sleep(8000);
 // Only the hilum structures: urinary, arterial and venous systems on, every other part of them hidden (the page state is set through React, as the system panel and the Hide
 // button would; nothing in the app is changed). Kept: kidneys, ureters, renal arteries and veins with their divisions and branches, abdominal aorta, inferior vena cava.
 const KEEP='kidney|ureter$|renal (artery|vein)|division of (left|right) renal artery|segmental branch of (left|right) renal artery|Ureteric segment|Abdominal aorta|Inferior vena cava';
 const setScene=(hideRx)=>p.evaluate(([KEEP,hideRx])=>{
  const keep=new RegExp(KEEP,'i'),hide=hideRx?new RegExp(hideRx,'i'):null,all=window.__mjView.partsState('.');
  const hiddenParts=all.filter(x=>!keep.test(x.name)||(hide&&hide.test(x.name))).map(x=>x.id);
  const el=document.querySelector('.layers-panel'),k=Object.keys(el).find(k=>k.startsWith('__reactFiber$'));
  for(let f=el[k];f;f=f.return)for(let h=f.memoizedState;h;h=h.next){const v=h.memoizedState;
   if(v&&typeof v==='object'&&!Array.isArray(v)&&'hiddenParts' in v&&'visible' in v&&h.queue?.dispatch){h.queue.dispatch(s=>({...s,visible:['arterial','venous','urinary'],hiddenParts,selected:[],isolate:false}));return hiddenParts.length;}}
  return -1;
 },[KEEP,hideRx]);
 console.log('hidden parts',await setScene(null));await sleep(4000);
 console.log('shown',await p.evaluate(()=>window.__mjView.partsState('.').filter(x=>x.visible>0).map(x=>x.name).filter((v,i,a)=>a.indexOf(v)===i).join(', ')));
 await p.mouse.click(5,300);await sleep(1000);
 const DESK={width:1500,height:950},PHONE={width:390,height:844},PHONE_VIEWS=[VIEWS[1],VIEWS[2],VIEWS[4]];
 const series=async suffix=>{
  await p.setViewportSize(DESK);await sleep(5000);
  for(const [n,...v] of VIEWS){await look(v);await shot(n+suffix);}
  await p.setViewportSize(PHONE);await sleep(6000);
  for(const [n,...v] of PHONE_VIEWS){await look(v,1.6);await shot(n+suffix,'mobile');}
 };
 await series('');
 // hide both kidneys: the renal pelvis, the upper end of the ureter, is otherwise inside the kidney
 await p.setViewportSize(DESK);await sleep(5000);
 console.log('hidden parts',await setScene('kidney'));await sleep(4000);
 console.log('kidneys',await p.evaluate(()=>window.__mjView.partsState('^(Left|Right) kidney$').map(x=>x.name+':'+x.visible).join(' ')));
 await series('-no-kidney');
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1);});

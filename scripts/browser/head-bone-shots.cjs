// Fine bony features of the skull (foramina, canals, fissures, processes, lines): screenshots of a production build served by vite preview (software GL, light theme).
// usage: node scripts/browser/head-bone-shots.cjs <port> <outDir> <tag>
// Only the skeletal system is switched on, so the marked areas lie directly on the bone. No annotations are drawn.
const {chromium}=require('playwright');const fs=require('fs');
const [port='5800',out='/tmp/head-bone',tag='after']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const SIZE={width:1500,height:950};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const C=[0,1.6,0.0];
// [structure to select, name of the picture, camera target, direction from the target to the camera, distance]
const SHOTS=[
 ['Left zygomatic arch','front',[0,1.6,0.03],[0,0,1],0.32],['Left zygomatic arch','back',[0,1.62,-0.04],[0,0,-1],0.32],['Left zygomatic arch','left',[0.0,1.6,-0.01],[1,0,0],0.34],['Left zygomatic arch','top',[0,1.64,-0.02],[0,1,0],0.32],
 ['Foramen magnum','base',[0,1.57,-0.01],[0,-1,0],0.28],
 ['Right foramen ovale','close-foramen-ovale',[-0.025,1.58,0.0],[0,-1,0],0.10],
 ['Left lateral plate of pterygoid process','close-pterygoid-plate',[0.03,1.575,0.01],[0,-1,0],0.12],
 ['Left stylomastoid foramen','close-stylomastoid',[0.04,1.571,-0.022],[0,-1,0],0.08],
 ['Left mental foramen','close-mental-foramen',[0.022,1.514,0.058],[0,0.2,1],0.07],
 ['Left angle of mandible','close-mandible-angle',[0.04,1.53,0.007],[1,0,0],0.10],
 ['Left infraorbital foramen','close-infraorbital',[0.026,1.568,0.062],[0,0,1],0.08],
 ['Left supraorbital foramen','close-supraorbital',[0.027,1.62,0.07],[0,0,1],0.08],
 ['Left superior orbital fissure','close-orbital-fissure',[0.02,1.607,0.02],[0,0,1],0.12],
 ['Left external acoustic meatus','close-ear-opening',[0.06,1.585,-0.02],[1,0,0],0.08],
 ['Left mandibular fossa','close-mandibular-fossa',[0.043,1.585,-0.006],[1,0,0],0.07],
 ['Left carotid tubercle','close-carotid-tubercle',[0.023,1.468,-0.014],[1,0,0.3],0.08]];
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:SIZE,deviceScaleFactor:1,colorScheme:'light'});const p=await ctx.newPage();p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,200)));
 console.log('goto');await p.goto(`http://127.0.0.1:${port}/MJ_anatomy/?mjview=1`,{waitUntil:'commit',timeout:120000});console.log('committed');
 {const t0=Date.now();await p.waitForFunction(()=>document.querySelector('[data-testid=load-bar]')?.getAttribute('aria-valuenow')==='100',null,{timeout:3600000,polling:2000});console.log('loaded',Math.round((Date.now()-t0)/1000),'s');}
 await sleep(8000);
 for(const name of [/Muscles/,/Connective/,/Arteries/,/Veins/,/Nervous/]){const r=p.locator('.system-row',{hasText:name}).first();if(await r.count()){const on=await r.evaluate(e=>e.classList.contains('enabled'));if(on){await r.locator('button.system-name').click();await sleep(2500);}}}
 console.log('systems',await p.locator('.system-row.enabled').allTextContents().then(a=>a.map(t=>t.replace(/\s+/g,' ').slice(0,24)).join(' | ')));
 const shot=async n=>{await sleep(3000);await p.screenshot({path:`${out}/${tag}-${n}.png`,timeout:240000});console.log('shot',n);};
 const searchBtn=p.locator('button[aria-label*="搜尋"]').first();
 for(const [name,n,t,d,r] of SHOTS){
  try{
   if(!(await p.locator('input[aria-label="輸入構造的中文或英文名稱"]').count())){await searchBtn.click();await sleep(1500);}
   const inp=p.locator('input[aria-label="輸入構造的中文或英文名稱"]');await inp.fill('');await inp.fill(name);await sleep(2500);
   await p.locator('[role=option]').first().click({timeout:20000});await sleep(2500);
  }catch(e){console.log('select failed',name,e.message.slice(0,100));}
  await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,r]);await shot(n);
 }
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1);});

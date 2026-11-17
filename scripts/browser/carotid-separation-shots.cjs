// Carotid bifurcation at the upper edge of the thyroid cartilage: screenshots of a production build served by vite preview (software GL, light theme). No annotations are drawn.
// usage: node scripts/browser/carotid-separation-shots.cjs <port> <outDir> <tag> <desktop|mobile>  (HN-21b: front, left and right close-ups of the carotid bifurcation)
// Systems shown: skeletal (cartilages, hyoid, mandible, vertebrae), arteries, veins and nerves; muscles and connective tissue are switched off.
const {chromium}=require('playwright');const fs=require('fs');
const [port='5800',out='/tmp/carotid-c4',tag='after',vp='desktop']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const SIZE=vp==='mobile'?{width:390,height:844}:{width:1500,height:950};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const LT=[0.031,1.496,-0.005],RT=[-0.031,1.496,-0.005];
const VIEWS=[['front-close',[0,1.505,0],[0,0,1],0.16],['left-close',[0.03,1.505,-0.005],[1,0,0],0.09],['right-close',[-0.03,1.505,-0.005],[-1,0,0],0.09]];
const OLDVIEWS=[
 ['L-front',LT,[0,0,1],0.09],['L-side',LT,[1,0,0],0.09],['R-front',RT,[0,0,1],0.09],['R-side',RT,[-1,0,0],0.09],
 ['L-landmarks-side',[0.02,1.505,-0.005],[1,0,0],0.2],['R-landmarks-side',[-0.02,1.505,-0.005],[-1,0,0],0.2],['landmarks-front',[0,1.505,0],[0,0,1],0.22]];
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:SIZE,deviceScaleFactor:1,colorScheme:'light'});const p=await ctx.newPage();p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,200)));
 await p.goto(`http://127.0.0.1:${port}/MJ_anatomy/?mjview=1`);
 {const t0=Date.now();await p.waitForFunction(()=>document.querySelector('[data-testid=load-bar]')?.getAttribute('aria-valuenow')==='100',null,{timeout:3600000,polling:2000});console.log('loaded',Math.round((Date.now()-t0)/1000)+'s');}
 await sleep(8000);
 const panel=p.locator('.system-list').first();
 const openSystems=async()=>{ if(vp==='mobile'&&!(await panel.isVisible().catch(()=>false))){await p.locator('button[aria-label="開啟系統面板"]').click();await sleep(1500);} };
 const closePanel=async()=>{ if(vp==='mobile'){const c=p.locator('.close-systems').first();if(await c.isVisible().catch(()=>false))await c.click();await sleep(1500);} };
 await openSystems();
 for(const name of [/Muscles/,/Connective/]){await p.locator('.system-row',{hasText:name}).first().locator('button.system-name').click();await sleep(2500);}
 console.log('systems',await p.locator('.system-row.enabled').allTextContents().then(a=>a.map(t=>t.replace(/\s+/g,' ').slice(0,24)).join(' | ')));
 await closePanel();
 const shot=async n=>{await sleep(3000);await p.screenshot({path:`${out}/${tag}-${vp}-${n}.png`,timeout:240000});console.log('shot',n);};
 for(const [n,t,d,r] of VIEWS){await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,r]);await shot(n);}
  await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1);});

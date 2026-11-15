// Larynx and carotid bifurcation screenshots of a production build served by vite preview (software GL, light theme). The page is loaded once.
// usage: node scripts/browser/larynx-shots.cjs <port> <outDir> <tag> <desktop|mobile>
// Systems shown: skeletal (cartilages, hyoid), arteries, veins, nerves and connective tissue; muscles (and their tendons) are switched off.
const {chromium}=require('playwright');const fs=require('fs');
const [port='5800',out='/tmp/larynx-shots',tag='after',vp='desktop']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const SIZE=vp==='mobile'?{width:390,height:844}:{width:1500,height:950};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const VIEWS=[['larynx-front',[0,1.49,0.008],[0,0,1],0.2],['larynx-side',[0,1.49,0.008],[1,0,0],0.2],['larynx-back',[0,1.49,0.008],[0,0,-1],0.2],
 ['carotid-front',[0.03,1.495,-0.004],[0,0,1],0.12],['carotid-side',[0.03,1.495,-0.004],[1,0,0],0.12]];
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:SIZE,deviceScaleFactor:1,colorScheme:'light'});const p=await ctx.newPage();p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,200)));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);
 {const t0=Date.now();await p.waitForFunction(()=>document.querySelector('[data-testid=load-bar]')?.getAttribute('aria-valuenow')==='100',null,{timeout:3600000,polling:2000});console.log('loaded',Math.round((Date.now()-t0)/1000)+'s');}
 await sleep(8000);
 const panel=p.locator('.system-list').first();
 const openSystems=async()=>{ if(vp==='mobile'&&!(await panel.isVisible().catch(()=>false))){await p.locator('button[aria-label="開啟系統面板"]').click();await sleep(1500);} };
 const closePanel=async()=>{ if(vp==='mobile'){const c=p.locator('.close-systems').first();if(await c.isVisible().catch(()=>false))await c.click();await sleep(1500);} };
 await openSystems();
 const row=p.locator('.system-row',{hasText:/Muscles/}).first();await row.locator('button.system-name').click();await sleep(3000);
 console.log('systems',await p.locator('.system-row.enabled').allTextContents().then(a=>a.map(t=>t.replace(/\s+/g,' ').slice(0,24)).join(' | ')));
 await closePanel();
 for(const [n,t,d,r] of VIEWS){await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,r]);await sleep(3000);await p.screenshot({path:`${out}/${tag}-${vp}-${n}.png`,timeout:240000});console.log('shot',n);}
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1);});

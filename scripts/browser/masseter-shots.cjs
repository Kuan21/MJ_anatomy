const {chromium}=require('playwright');
const [port,out]=process.argv.slice(2);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:1500,height:950},deviceScaleFactor:1,colorScheme:'light'});const p=await ctx.newPage();p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,200)));
 await p.goto(`http://127.0.0.1:${port}/MJ_anatomy/?mjview=1`);
 const t0=Date.now();await p.waitForFunction(()=>document.querySelector('[data-testid=load-bar]')?.getAttribute('aria-valuenow')==='100',null,{timeout:3300000,polling:2000});console.log('loaded',Math.round((Date.now()-t0)/1000)+'s');
 await sleep(8000);
 console.log(JSON.stringify(await p.evaluate(()=>window.__mjView.partsState('masseter'))));
 const panel=p.locator('.system-list').first();
 for(const name of [/Connective/,/Vascular|Arteries|Veins/,/Nervous|Nerves/]){try{await p.locator('.system-row',{hasText:name}).first().locator('button.system-name').click({timeout:5000});await sleep(1500);}catch{}}
 console.log('systems',await p.locator('.system-row.enabled').allTextContents().then(a=>a.map(t=>t.replace(/\s+/g,' ').slice(0,24)).join(' | ')));
 const T=[0.05,1.55,0.02];
 for(const [n,d,r] of [['front',[0.5,0,1],0.35],['side',[1,0,0],0.3],['close',[1,0.1,0.3],0.12]]){await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[T,d,r]);await sleep(4000);await p.screenshot({path:`${out}/after-${n}.png`,timeout:240000});console.log('shot',n);}
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1);});

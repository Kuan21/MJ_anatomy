// Recurrent laryngeal nerves in the neck, upper ends and right hook (HN-24 follow-up): screenshots of production builds served by vite preview (software GL, light theme, desktop 1500x950).
// usage: node scripts/browser/rln-ends-shots.cjs <outDir> <tag>=<port>[,<tag>=<port>...]   (the builds are loaded in parallel in one browser; loading the neck vessels and nerves takes 20 to 25 minutes on software GL)
// Set 1: arteries on (skeleton, veins, muscles and connective tissue off) for the right hook under the subclavian artery. Set 2: only nerves, trachea and oesophagus. No annotations are drawn.
const {chromium}=require('playwright');const fs=require('fs');
const [out='/tmp/rln-ends',spec='after=5812']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const runs=spec.split(',').map(s=>s.split('=')).map(([tag,port])=>({tag,port}));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const R=[-0.045,1.412,-0.004];   // right hook under the subclavian artery
const N=[0,1.445,-0.010];        // neck, nerves beside the trachea
const SET1=[['hook-front-below',R,[-0.25,-0.45,0.85],0.11],['hook-back',R,[-0.3,0.05,-0.95],0.11],['hook-right',R,[-1,-0.05,0],0.11],['hook-wide',[-0.04,1.41,-0.004],[-0.2,-0.2,0.95],0.2]];
const SET2=[['neck-front-close',N,[0,0,1],0.1],['neck-back-close',N,[0,0,-1],0.1],['neck-right-side',N,[-1,0,0],0.1],['neck-left-side',N,[1,0,0],0.1],['neck-back-oblique-left',N,[0.6,0.1,-0.8],0.1],['neck-back-oblique-right',N,[-0.6,0.1,-0.8],0.1],['larynx-back-close',[0,1.466,-0.006],[0,0.1,-1],0.06],['larynx-top-down',[0,1.466,-0.006],[0,1,0],0.07]];
async function toggles(p,names){for(const name of names){await p.locator('.system-row',{hasText:name}).first().locator('button.system-name').click();await sleep(2500);}}
async function organs(p){for(const name of ['Respiratory','Digestive']){await p.evaluate(n=>{const rows=[...document.querySelectorAll('div,li,label')].filter(e=>e.children.length<8&&e.textContent.trim().startsWith(n)&&e.querySelector('input,button[role=switch],button'));const r=rows.sort((a,b)=>a.textContent.length-b.textContent.length)[0];if(!r)return 'none';const t=r.querySelector('input[type=checkbox],button[role=switch]')||r.querySelector('input,button');t.click();return r.textContent.trim().slice(0,30);},name);await sleep(2500);}}
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 await Promise.all(runs.map(async({tag,port})=>{
  const ctx=await b.newContext({viewport:{width:1500,height:950},deviceScaleFactor:1,colorScheme:'light'});const p=await ctx.newPage();p.setDefaultTimeout(240000);
  p.on('pageerror',e=>console.log(tag,'PAGEERR',e.message.slice(0,200)));
  await p.goto(`http://127.0.0.1:${port}/?mjview=1`);
  {const t0=Date.now();await p.waitForFunction(()=>document.querySelector('[data-testid=load-bar]')?.getAttribute('aria-valuenow')==='100',null,{timeout:3600000,polling:2000});console.log(tag,'loaded',Math.round((Date.now()-t0)/1000)+'s');}
  await sleep(8000);
  await toggles(p,[/Muscles/,/Connective/,/Skeleton/,/Veins/]);await organs(p);
  console.log(tag,'systems',await p.locator('.system-row.enabled').allTextContents().then(a=>a.map(t=>t.replace(/\s+/g,' ').slice(0,24)).join(' | ')));
  for(const [n,t,d,r] of SET1){await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,r]);await sleep(3000);await p.screenshot({path:`${out}/${tag}-${n}.png`,timeout:240000});console.log(tag,'shot',n);}
  await toggles(p,[/Arteries/]);
  console.log(tag,'systems',await p.locator('.system-row.enabled').allTextContents().then(a=>a.map(t=>t.replace(/\s+/g,' ').slice(0,24)).join(' | ')));
  for(const [n,t,d,r] of SET2){await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,r]);await sleep(3000);await p.screenshot({path:`${out}/${tag}-${n}.png`,timeout:240000});console.log(tag,'shot',n);}
 }));
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1);});

// Thoracic duct end and right lymphatic duct at the venous angles: screenshots of production builds served by vite preview (software GL, light theme).
// usage: [VIEWPORT=820x1180] node scripts/browser/lymph-duct-shots.cjs <outDir> <tag>=<port>[,<tag>=<port>...]   (builds are loaded in parallel in one browser)
// Muscles, connective tissue and skeleton are off; arteries, veins, nerves and the lymphatic organ group are on. The duct is selected through the search box (the duct shown, the rest faded).
const {chromium}=require('playwright');const fs=require('fs');
const [out='/tmp/lymph-duct',spec='after=5812']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const runs=spec.split(',').map(s=>s.split('=')).map(([tag,port])=>({tag,port}));
const [VW,VH]=(process.env.VIEWPORT||'1500x950').split('x').map(Number),IPAD=VW<1200;
const PHONE=VW<500;   // the selected structure's card covers the lower half of a phone screen: aim 28 mm below the target so that the target appears in the upper part, a little further away
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const LA=[0.021,1.418,0.016],RA=[-0.024,1.42,0.017];
const SELECTS=[
 {find:'Thoracic duct',views:[['left-front',LA,[0.5,0.25,0.85],0.09],['left-top',LA,[0.1,1,0.25],0.09],['left-back',LA,[0.6,0.2,-0.8],0.09],['left-wide',[0.02,1.40,0.0],[0.2,0.2,1],0.2]]},
 {find:'Right lymphatic duct',only:'after',views:[['right-front',RA,[-0.5,0.25,0.85],0.09],['right-top',RA,[-0.1,1,0.25],0.09],['right-back',RA,[-0.6,0.2,-0.8],0.09],['right-wide',[-0.02,1.40,0.0],[-0.2,0.2,1],0.2]]}];
async function openPanel(p){const row=p.locator('.system-row').first();if(!(await row.isVisible().catch(()=>false))){const b=p.locator('button[aria-label="開啟系統面板"]');if(await b.count()){await b.click();await sleep(1500);}}}
async function toggle(p,name){await openPanel(p);await p.locator('.system-row',{hasText:name}).first().locator('button.system-name').evaluate(e=>e.click());await sleep(2500);}
async function organs(p,names){await openPanel(p);for(const name of names){await p.evaluate(n=>{const rows=[...document.querySelectorAll('div,li,label')].filter(e=>e.children.length<8&&e.textContent.trim().startsWith(n)&&e.querySelector('input,button[role=switch],button'));const r=rows.sort((a,b)=>a.textContent.length-b.textContent.length)[0];if(!r)return 'none';const t=r.querySelector('input[type=checkbox],button[role=switch]')||r.querySelector('input,button');t.click();return r.textContent.trim().slice(0,30);},name);await sleep(2500);}}
async function select(p,find){await p.getByRole('button',{name:'搜尋構造'}).click();await sleep(800);await p.locator('.search-panel input[role=combobox]').first().fill(find);await sleep(1500);await p.locator('[data-slot=combobox-item]').first().click();await sleep(3500);}
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 await Promise.all(runs.map(async({tag,port})=>{
  const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:1,colorScheme:'light'});const p=await ctx.newPage();p.setDefaultTimeout(240000);
  p.on('pageerror',e=>console.log(tag,'PAGEERR',e.message.slice(0,200)));
  await p.goto(`http://127.0.0.1:${port}/?mjview=1`);
  {const t0=Date.now();await p.waitForFunction(()=>document.querySelector('[data-testid=load-bar]')?.getAttribute('aria-valuenow')==='100',null,{timeout:3600000,polling:2000});console.log(tag,'loaded',Math.round((Date.now()-t0)/1000)+'s');}
  await sleep(8000);
  for(const n of [/Muscles/,/Connective/,/Skeleton/])await toggle(p,n);
  await organs(p,['Lymphatic']);
  console.log(tag,'systems',await p.locator('.system-row.enabled').allTextContents().then(a=>a.map(t=>t.replace(/\s+/g,' ').slice(0,24)).join(' | ')));
  for(const sel of SELECTS){if(sel.only&&sel.only!==tag)continue;await select(p,sel.find);
   for(let [n,t,d,r] of sel.views){if(PHONE){t=[t[0],t[1]-0.028,t[2]];r*=1.3;}await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,r]);await sleep(3500);await p.screenshot({path:`${out}/${tag}-${n}.png`,...(IPAD?{}:{clip:{x:330,y:60,width:840,height:830}}),timeout:240000});console.log(tag,'shot',n);}
   await p.keyboard.press('Escape').catch(()=>{});await sleep(800);}
 }));
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1);});

// Recurrent laryngeal nerves in the neck, upper ends and right hook (HN-24 follow-up): screenshots of production builds served by vite preview (software GL, light theme, desktop 1500x950).
// usage: node scripts/browser/rln-ends-shots.cjs <outDir> <tag>=<port>[,<tag>=<port>...]   (the builds are loaded in parallel in one browser)
// Scene 1 (nerves, trachea and oesophagus): each recurrent laryngeal nerve is selected through the search box (the nerve is shown, everything else faded), then photographed from the listed views.
// Scene 2 (nerves and arteries): the right nerve (and the left one for comparison) at the hook under the subclavian artery / aortic arch. No annotations are drawn; the screenshots are cropped to the 3D view.
const {chromium}=require('playwright');const fs=require('fs');
const [out='/tmp/rln-ends',spec='after=5812']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const runs=spec.split(',').map(s=>s.split('=')).map(([tag,port])=>({tag,port}));
const [VW,VH]=(process.env.VIEWPORT||'1500x950').split('x').map(Number),IPAD=VW<1200;   // VIEWPORT=820x1180 for the iPad size: no crop (the panels stack differently)
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const N=[0,1.445,-0.010], LN=[0.012,1.44,-0.01], RN=[-0.012,1.44,-0.01], R=[-0.045,1.412,-0.004], A=[0.015,1.37,-0.01];
const SCENE1=[
 {find:'Left recurrent laryngeal nerve',views:[['left-front',LN,[0.45,0.05,0.9],0.13],['left-side',LN,[1,0,0.1],0.13],['left-back-oblique',LN,[0.6,0.1,-0.8],0.13],['left-back',N,[0.1,0.1,-1],0.12],['left-larynx-back-oblique',[0.008,1.466,-0.006],[0.5,0.3,-0.8],0.06],['left-larynx-side',[0.008,1.466,-0.004],[1,0.1,0],0.06]]},
 {find:'Right recurrent laryngeal nerve',views:[['right-front',RN,[-0.45,0.05,0.9],0.13],['right-side',RN,[-1,0,0.1],0.13],['right-back-oblique',RN,[-0.6,0.1,-0.8],0.13],['right-back',N,[-0.1,0.1,-1],0.12],['right-larynx-back-oblique',[-0.008,1.466,-0.006],[-0.5,0.3,-0.8],0.06],['right-larynx-side',[-0.008,1.466,-0.004],[-1,0.1,0],0.06]]}];
const SCENE2=[
 {find:'Right recurrent laryngeal nerve',views:[['right-hook-front',R,[-0.2,-0.3,0.95],0.14],['right-hook-below',R,[-0.3,-0.9,0.3],0.14],['right-hook-back',R,[-0.3,0.1,-0.95],0.14],['right-hook-wide',[-0.04,1.41,-0.004],[-0.1,0.1,1],0.24]]},
 {find:'Left recurrent laryngeal nerve',views:[['left-hook-front',A,[0.3,-0.1,0.95],0.16]]}];
async function openPanel(p){const row=p.locator('.system-row').first();if(!(await row.isVisible().catch(()=>false))){const b=p.locator('button[aria-label="開啟系統面板"]');if(await b.count()){await b.click();await sleep(1500);}}}
async function closePanel(p){const c=p.locator('.close-systems').first();if(await c.isVisible().catch(()=>false)){await c.click();await sleep(1500);}}
async function toggle(p,name){await openPanel(p);await p.locator('.system-row',{hasText:name}).first().locator('button.system-name').evaluate(e=>e.click());await sleep(2500);}
async function organs(p,names){await openPanel(p);for(const name of names){await p.evaluate(n=>{const rows=[...document.querySelectorAll('div,li,label')].filter(e=>e.children.length<8&&e.textContent.trim().startsWith(n)&&e.querySelector('input,button[role=switch],button'));const r=rows.sort((a,b)=>a.textContent.length-b.textContent.length)[0];if(!r)return 'none';const t=r.querySelector('input[type=checkbox],button[role=switch]')||r.querySelector('input,button');t.click();return r.textContent.trim().slice(0,30);},name);await sleep(2500);}}
async function select(p,find){await p.getByRole('button',{name:'搜尋構造'}).click();await sleep(800);await p.locator('.search-panel input[role=combobox]').first().fill(find);await sleep(1500);await p.locator('[data-slot=combobox-item]').first().click();await sleep(3500);}
async function shoot(p,tag,sel,sceneName){await select(p,sel.find);const side=sel.find.startsWith('Left')?'L':'R';
 for(const [n,t,d,r] of sel.views){await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,r]);await sleep(3500);await p.screenshot({path:`${out}/${tag}-${sceneName}-${n}.png`,...(IPAD?{}:{clip:{x:330,y:60,width:840,height:830}}),timeout:240000});console.log(tag,'shot',n);}
 await p.keyboard.press('Escape').catch(()=>{});await sleep(800);}
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 await Promise.all(runs.map(async({tag,port})=>{
  const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:1,colorScheme:'light'});const p=await ctx.newPage();p.setDefaultTimeout(240000);
  p.on('pageerror',e=>console.log(tag,'PAGEERR',e.message.slice(0,200)));
  await p.goto(`http://127.0.0.1:${port}/?mjview=1`);
  {const t0=Date.now();await p.waitForFunction(()=>document.querySelector('[data-testid=load-bar]')?.getAttribute('aria-valuenow')==='100',null,{timeout:3600000,polling:2000});console.log(tag,'loaded',Math.round((Date.now()-t0)/1000)+'s');}
  await sleep(8000);
  for(const n of [/Muscles/,/Connective/,/Skeleton/,/Veins/,/Arteries/])await toggle(p,n);
  await organs(p,['Respiratory','Digestive']);
  console.log(tag,'scene1',await p.locator('.system-row.enabled').allTextContents().then(a=>a.map(t=>t.replace(/\s+/g,' ').slice(0,24)).join(' | ')));
  await closePanel(p);
  for(const s of SCENE1)await shoot(p,tag,s,'s1');
  await organs(p,['Respiratory','Digestive']);await toggle(p,/Arteries/);
  console.log(tag,'scene2',await p.locator('.system-row.enabled').allTextContents().then(a=>a.map(t=>t.replace(/\s+/g,' ').slice(0,24)).join(' | ')));
  await closePanel(p);
  for(const s of SCENE2)await shoot(p,tag,s,'s2');
 }));
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1);});

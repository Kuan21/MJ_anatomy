// Male / female reproductive-view screenshots of a production build served by vite preview (software GL, light theme).
// usage: node scripts/browser/female-mode-shots.cjs <port> <outDir> <tag> <desktop|mobile>
// The page is loaded once. Flow (the one a visitor follows): Organs > Reproductive > 男 (all default systems on), then 女 (a sex-only change), the same views;
// then the body surface switch on, then Reproductive alone (女), then 男 (a sex-only change) again. Every state gets the same camera views.
const {chromium}=require('playwright');const fs=require('fs');
const [port='5800',out='/tmp/fm-shots',tag='after',vp='desktop',mode='']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const SIZE=vp==='mobile'?{width:390,height:844}:{width:1500,height:950};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ALLV=[['front',[0,0.93,0],[0,0,1],0.5],['side',[0,0.93,0],[1,0,0],0.5],['top',[0,0.9,-0.01],[0,1,0.001],0.45],['close-front',[0,0.9,-0.01],[0,0,1],0.2],['close-side',[0,0.9,-0.01],[1,0,0],0.2]];
const MID=[['mid-front',[0,0.9,0],[0,0,1],1.2],['mid-side',[0,0.9,0],[1,0,0],1.2]];
const VIEWS=vp==='mobile'?ALLV.filter(v=>v[0]!=='close-side'):ALLV;
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:SIZE,deviceScaleFactor:1,colorScheme:'light'});const p=await ctx.newPage();p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,200)));
 const shot=async name=>{await p.screenshot({path:`${out}/${tag}-${vp}-${name}.png`,timeout:240000});console.log('shot',name);};
 const log=[];
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);
 {const t0=Date.now(),tick=setInterval(async()=>{const v=await p.locator('[data-testid=load-bar]').getAttribute('aria-valuenow').catch(()=>'?');console.log('loading',v,Math.round((Date.now()-t0)/1000)+'s');},120000);
  await p.waitForFunction(()=>document.querySelector('[data-testid=load-bar]')?.getAttribute('aria-valuenow')==='100',null,{timeout:3600000,polling:2000});clearInterval(tick);}
 await sleep(8000);
 const panel=p.locator('.system-list').first();
 const openSystems=async()=>{ if(vp==='mobile'&&!(await panel.isVisible().catch(()=>false))){await p.locator('button[aria-label="開啟系統面板"]').click();await sleep(1500);} };
 const closePanel=async()=>{ if(vp==='mobile'){const c=p.locator('.close-systems').first();if(await c.isVisible().catch(()=>false))await c.click();await sleep(1500);} };
 await openSystems();
 const organs=p.locator('.organ-expand');if((await organs.getAttribute('aria-expanded'))!=='true')await organs.click();await sleep(800);
 const arrow=p.locator('button.row-arrow[aria-label*="eproductive"]').first();
 if((await arrow.getAttribute('aria-expanded'))!=='true')await arrow.click();await sleep(800);
 const look=async(t,d,r)=>{await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,r]);await sleep(3000);};
 const views=async(prefix,list=VIEWS)=>{await closePanel();for(const [n,t,d,r] of list){await look(t,d,r);await shot(`${prefix}-${n}`);}await openSystems();};
 const pickSex=async sex=>{await openSystems();await p.locator('.organ-sub[aria-label="生殖系統性別"] button',{hasText:new RegExp('^'+(sex==='male'?'男':'女')+'$')}).click();await sleep(3000);
  const count=await p.locator('.system-row',{hasText:'Reproductive'}).first().locator('.system-count').textContent();log.push(`${sex}: Reproductive count in the panel = ${count}`);};
 const skin=async on=>{await openSystems();const sw=p.locator('.system-row',{hasText:/Body surface/}).first().locator('[data-slot=switch]');if(((await sw.getAttribute('aria-checked'))==='true')!==on)await sw.click();await sleep(3000);};
 if(mode==='skin'){ // body surface only: female then male (a sex-only change), wider views so the whole pelvis and the skin can be judged
  await pickSex('female');await skin(true);await views('female-skin',[...MID,VIEWS[0],VIEWS[3]]);await pickSex('male');await views('male-skin',[...MID,VIEWS[0],VIEWS[3]]);
  fs.writeFileSync(`${out}/${tag}-${vp}-skin-log.txt`,log.join('\n'));await b.close();console.log('done');return;
 }
 // 1 male, 2 female (sex-only change), skin on/off, reproductive alone (female), male (sex-only change)
 await pickSex('male');await views('male-all');
 await skin(true);await views('male-skin',[VIEWS[0],...MID,...VIEWS.filter(v=>v[0].startsWith('close'))]);await skin(false);
 await pickSex('female');await views('female-all');
 await skin(true);await views('female-skin',[VIEWS[0],...MID,...VIEWS.filter(v=>v[0].startsWith('close'))]);await skin(false);
 await openSystems();await p.locator('.system-row',{hasText:'Reproductive'}).first().locator('button.system-name').click();await sleep(3000);
 await views('female-only');
 await pickSex('male');await views('male-only');
 fs.writeFileSync(`${out}/${tag}-${vp}-log.txt`,log.join('\n'));console.log(log.join('\n'));
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1);});

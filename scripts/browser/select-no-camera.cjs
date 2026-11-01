// Browser test (production build, software GL, about 10 minutes): selecting never moves the camera, Focus frames the target inside the free area, the out-of-view hint shows.
// usage: node select-no-camera.cjs <port> <outDir> [width] [height]    needs `vite preview` of a production build and playwright; every click is a real mouse click.
const {chromium}=require('playwright');const fs=require('fs');
const [port='5811',out='/tmp/selshots',W='1500',H='950']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
let failed=0;const ok=(name,pass,info='')=>{if(!pass)failed++;console.log((pass?'PASS ':'FAIL ')+name+(info?'  '+info:''));};
const same=(a,b,eps=1e-6)=>a&&b&&a.length===b.length&&a.every((v,i)=>Math.abs(v-b[i])<eps);
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:+W,height:+H}});p.setDefaultTimeout(240000);p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);await p.waitForSelector('.region-bar',{timeout:240000});await p.waitForTimeout(+(process.env.LOAD_WAIT||150000));
 await p.mouse.move(5,5);
 const real=async loc=>{const bx=await loc.boundingBox();if(!bx)throw new Error('no box');await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);};
 const btn=(text,scope='.region-bar')=>p.locator(`${scope} button`,{hasText:new RegExp('^'+text+'$')}).first();
 const cam=()=>p.evaluate(()=>({c:window.__mjView.camera(),o:window.__mjView.viewOffset()}));
 const title=async()=>(await p.locator('.detail-sheet .structure-title').first().innerText().catch(()=>'')).replace(/\s+/g,' ');
 const shot=async n=>{await p.waitForTimeout(2500);await p.screenshot({path:`${out}/${n}.png`});};
 const idsOf=name=>p.evaluate(rx=>window.__mjView.partsState(rx).filter(x=>x.visible>.5).map(x=>x.id),`^${name}$`);
 const searchPick=async name=>{if(!await p.locator('.search-panel input').count())await real(p.locator('.top-actions button',{hasText:/Find a structure/}).first());await p.waitForSelector('.search-panel input');await p.fill('.search-panel input',name);await p.waitForSelector('.anatomy-search-results [role=option]');await p.waitForTimeout(1200);await p.locator('.anatomy-search-results [role=option]').first().click();await p.waitForTimeout(2000);};
 const unchanged=async(label,before)=>{const a=await cam();ok(`${label}: camera position, target and view offset unchanged`,same(a.c,before.c)&&JSON.stringify(a.o)===JSON.stringify(before.o),JSON.stringify({before:before.c.map(v=>+v.toFixed(4)),after:a.c.map(v=>+v.toFixed(4))}));};
 const inFree=async(label,ids)=>{
  const r=await p.evaluate(ids=>window.__mjView.screenBox(ids),ids),card=await p.locator('.detail-sheet').boundingBox(),panel=await p.evaluate(()=>{const e=document.querySelector('.left-workspace .layers-panel')||document.querySelector('.left-workspace');const q=e?.getBoundingClientRect();return q&&q.width>0?q.right:0;});
  if(!r){ok(`${label}: Focus target has a screen box`,false);return;}
  const x0=r.l,x1=r.r,y0=r.t,y1=r.b,free={l:panel-r.left,r:(card?card.x:r.w)-r.left,t:0,b:r.h};
  ok(`${label}: Focus keeps the whole target inside the free area`,x0>=free.l&&x1<=free.r&&y0>=free.t&&y1<=free.b,JSON.stringify({box:[x0,y0,x1,y1].map(Math.round),free}));
 };
 const pickByModelClick=async(name)=>{const ids=await idsOf(name);if(!ids.length)return null;const r=await p.evaluate(ids=>window.__mjView.screenBox(ids),ids);if(!r)return null;
  const pts=[[.5,.5],[.3,.5],[.7,.5],[.5,.3],[.5,.7],[.4,.4],[.6,.6]];for(const [fx,fy] of pts){const x=r.left+r.l+(r.r-r.l)*fx,y=r.top+r.t+(r.b-r.t)*fy;await p.mouse.click(x,y);await p.waitForTimeout(1500);if((await title()).toLowerCase().includes(name.toLowerCase()))return ids;}
  return ids;};
 const scenario=async(tag,name,prep,farName)=>{
  await prep();await p.waitForTimeout(6000);await shot(`${tag}-0-before`);
  const before=await cam();
  // model click
  const ids=await pickByModelClick(name);ok(`${tag}: a click on the model selects a structure (the one on top, maybe not ${name})`,!!(await title()),await title());
  await unchanged(`${tag} model click`,before);await shot(`${tag}-1-model-click`);
  // list/search
  await p.mouse.click(5,300);await p.waitForTimeout(800);
  await searchPick(name);ok(`${tag}: ${name} opened from search`,(await title()).toLowerCase().includes(name.toLowerCase()),await title());
  await unchanged(`${tag} search`,before);await shot(`${tag}-2-search`);
  // out-of-view hint
  if(farName){await searchPick(farName);const hint=await p.locator('.out-of-view-hint').count();ok(`${tag}: out-of-view hint for ${farName}`,hint===1);await unchanged(`${tag} far search`,before);await shot(`${tag}-3-out-of-view-hint`);await searchPick(name);}
  // Focus
  await real(p.locator('.detail-actions button[title="Focus / 放大"]'));await p.waitForTimeout(3000);
  const after=await cam();ok(`${tag}: Focus moves the camera`,!same(after.c,before.c));
  await inFree(tag,ids??[]);await shot(`${tag}-4-focus`);
 };
 const chest=async()=>{await real(btn('胸腔'));await p.waitForTimeout(2500);await real(btn('胸壁'));await p.waitForTimeout(2500);const side=p.locator('button',{hasText:/^右側$/}).first();if(await side.count())await real(side);};
 await scenario('chest-wall','Right pectoralis minor',chest,'Left calcaneus');
 await p.reload();await p.waitForSelector('.region-bar');await p.waitForTimeout(+(process.env.LOAD_WAIT||150000));
 await scenario('lower-limb','Right rectus femoris',async()=>{await real(btn('下肢'));await p.waitForTimeout(2500);});
 // heart detail mode
 await p.goto(`http://127.0.0.1:${port}/?mjview=1#/organ/heart`);await p.waitForSelector('.organ-chambers button');
 await p.waitForFunction(()=>{const h=document.querySelector('.organ-canvas');return h?.dataset.camera&&JSON.parse(h.dataset.visibleParts||'[]').length>20;},null,{timeout:290000});await p.waitForTimeout(8000);
 const hcam=()=>p.evaluate(()=>document.querySelector('.organ-canvas').dataset.camera);
 const h0=await hcam();await shot('heart-0-before');
 const cv=await p.locator('.organ-canvas canvas').first().boundingBox();await p.mouse.click(cv.x+cv.width*.5,cv.y+cv.height*.5);await p.waitForTimeout(2500);
 ok('heart: a click on the model selects a structure',(await p.locator('.organ-info-title').count())===1,await p.locator('.organ-info-title').first().innerText().catch(()=>''));
 ok('heart: camera unchanged after model click',await hcam()===h0);await shot('heart-1-model-click');
 await real(p.locator('.organ-focus'));await p.waitForTimeout(3000);ok('heart: Focus turns the camera',await hcam()!==h0);await shot('heart-2-focus');
 await b.close();console.log(failed?`${failed} check(s) failed`:'all browser checks passed');process.exit(failed?1:0);
})();

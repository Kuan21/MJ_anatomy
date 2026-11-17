// Renal hilum order (AB-01): screenshots of a production build served by vite preview (software GL, light theme). No annotations are drawn.
// usage: node scripts/browser/renal-hilum-shots.cjs <port> <outDir> <tag> [base=/MJ_anatomy/]
// Shown: urinary organs (kidneys, ureters), arteries and veins only. Views: front, from above (front-to-back order reads top to bottom), and close obliques of each hilum;
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
 // Organs ▸ Urinary: "show only urinary"; then switch on arteries and veins
 const organs=p.locator('.organ-parent .organ-expand').first();if(await organs.getAttribute('aria-expanded')!=='true'){await organs.click();await sleep(1200);}
 await p.locator('.organ-children .system-row',{hasText:/Urinary/}).locator('button.system-name').first().click();await sleep(2500);
 for(const name of [/^\s*Arteries/,/^\s*Veins/]){const row=p.locator('.system-row:not(.enabled)',{hasText:name}).first();if(await row.count()){await row.locator('button.system-name').click();await sleep(2500);}}
 console.log('systems on',await p.locator('.system-row.enabled').allTextContents().then(a=>a.map(t=>t.replace(/\s+/g,' ').slice(0,20)).join(' | ')));
 await p.mouse.click(5,300);await sleep(1000);
 const shot=async (n,vp='desktop')=>{await sleep(3500);await p.screenshot({path:`${out}/${tag}-${vp}-${n}.png`,timeout:240000});console.log('shot',vp,n);};
 const look=([t,d,r],k=1)=>p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,r*k]);
 const DESK={width:1500,height:950},PHONE={width:390,height:844},PHONE_VIEWS=[VIEWS[1],VIEWS[2],VIEWS[4]];
 const series=async suffix=>{
  await p.setViewportSize(DESK);await sleep(5000);
  for(const [n,...v] of VIEWS){await look(v);await shot(n+suffix);}
  await p.setViewportSize(PHONE);await sleep(6000);
  for(const [n,...v] of PHONE_VIEWS){await look(v,1.6);await shot(n+suffix,'mobile');}
 };
 await series('');
 // hide both kidneys (search, then the Hide button of the detail sheet): the renal pelvis, the upper end of the ureter, is otherwise inside the kidney
 await p.setViewportSize(DESK);await sleep(5000);
 const hideByName=async name=>{
  if(!await p.locator('.search-panel input').count())await p.locator('.top-actions button',{hasText:/Find a structure/}).first().click();
  await p.waitForSelector('.search-panel input');await p.fill('.search-panel input',name);await sleep(1500);
  const opt=p.locator('.anatomy-search-results [role=option]',{hasText:new RegExp('^\\s*'+name)}).first();if(!await opt.count()){console.log('no result',name);return;}
  await opt.click();await sleep(1800);const hide=p.locator('.detail-sheet .hide-structure-action').first();
  if(await hide.count()){await hide.click();await sleep(1000);console.log('hid',name);}else console.log('no hide button',name);
 };
 for(const name of ['Left kidney','Right kidney'])await hideByName(name);
 await p.keyboard.press('Escape');await p.mouse.click(5,300);await sleep(1500);
 console.log('kidneys',await p.evaluate(()=>window.__mjView.partsState('^(Left|Right) kidney$').filter(x=>/kidney$/.test(x.name)).map(x=>x.name+':'+x.visible).join(' ')));
 await series('-no-kidney');
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1);});

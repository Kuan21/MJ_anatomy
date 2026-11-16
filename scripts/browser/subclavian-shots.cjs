// Subclavian artery behind the anterior scalene (HN-23): screenshots of a production build served by vite preview (software GL, light theme). No annotations are drawn.
// usage: node scripts/browser/subclavian-shots.cjs <port> <outDir> <tag> <desktop|mobile>
// Shown: bones (the clavicle is hidden so the vessels behind it show), arteries, veins, nerves and only the scalene muscles of the neck root (the other muscles are hidden one by one).
// Loading takes 22 to 25 minutes with software WebGL: the script waits for the load bar to reach 100 and for window.__mjView.neckRows() to be filled.
const {chromium}=require('playwright');const fs=require('fs');
const [port='5800',out='/tmp/subclavian',tag='after',vp='desktop']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const SIZE=vp==='mobile'?{width:390,height:844}:{width:1500,height:950};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const HIDE=['platysma','sternocleidomastoid','omohyoid','sternohyoid','sternothyroid','subclavius','pectoralis minor','clavicular part of # pectoralis major','sternocostal part of # pectoralis major','clavicular part of # deltoid','descending part of # trapezius','# clavicle','# scalenus posterior'];
const VIEWS=[['front',[0,1.43,0.0],[0,0.28,1],0.2],['left-side',[0.045,1.428,-0.005],[1,0.1,0.15],0.11],['left-close',[0.045,1.43,-0.004],[0.45,0.5,0.75],0.065],['right-close',[-0.045,1.43,-0.004],[-0.45,0.5,0.75],0.065]];
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:SIZE,deviceScaleFactor:1,colorScheme:'light'});const p=await ctx.newPage();p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,200)));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);
 {const t0=Date.now();await p.waitForFunction(()=>document.querySelector('[data-testid=load-bar]')?.getAttribute('aria-valuenow')==='100',null,{timeout:3600000,polling:2000});console.log('loaded',Math.round((Date.now()-t0)/1000)+'s');}
 await p.waitForFunction(()=>window.__mjView&&window.__mjView.neckRows().length>0,null,{timeout:600000,polling:2000});console.log('neckRows',await p.evaluate(()=>window.__mjView.neckRows().length));
 await sleep(8000);
 const openSystems=async()=>{ if(vp==='mobile'&&!(await p.locator('.system-list').first().isVisible().catch(()=>false))){await p.locator('button[aria-label="開啟系統面板"]').click();await sleep(1500);} };
 const closePanel=async()=>{ if(vp==='mobile'){const c=p.locator('.close-systems').first();if(await c.isVisible().catch(()=>false))await c.click();await sleep(1500);} };
 await openSystems();
 console.log('systems before',await p.locator('.system-row').evaluateAll(es=>es.map(e=>(e.classList.contains('enabled')?'+':'-')+e.textContent.replace(/\s+/g,' ').slice(0,22))).then(a=>a.join(' | ')));
 for(const name of [/Connective/,/Integument/,/Respiratory/,/Digestive/,/Lymph/,/Urinary/,/Reproductive/,/Endocrine/,/Sensory|Eye|Ear/]){const row=p.locator('.system-row.enabled',{hasText:name}).first();if(await row.count()){await row.locator('button.system-name').click();await sleep(1500);}}
 console.log('systems after',await p.locator('.system-row.enabled').allTextContents().then(a=>a.map(t=>t.replace(/\s+/g,' ').slice(0,24)).join(' | ')));
 await closePanel();
 // hide the muscles (and the clavicle) in front of the neck root, side by side, through the search and the Hide button of the detail sheet
 const search=async name=>{ if(!await p.locator('.search-panel input').count()){await p.locator('.top-actions button',{hasText:/Find a structure/}).first().click();} await p.waitForSelector('.search-panel input');await p.fill('.search-panel input',name);await sleep(1500);
  const opts=p.locator('.anatomy-search-results [role=option]');if(!await opts.count())return false;await opts.first().click();await sleep(1800);return true;};
 let hidden=0;
 if(vp==='desktop') for(const tpl of HIDE) for(const side of ['Left','Right']){
  const name=tpl.includes('#')?tpl.replace('#',side.toLowerCase()):`${side} ${tpl}`;
  try{ if(!await search(name)){console.log('no result',name);continue;}
   const title=(await p.locator('.detail-sheet .structure-title').first().innerText().catch(()=>'')).replace(/\s+/g,' ');
   const hide=p.locator('.detail-sheet button',{hasText:/^Hide$/}).first();
   if(await hide.count()){await hide.click();hidden++;await sleep(800);console.log('hid',name,'|',title.slice(0,50));}else console.log('no hide button',name,title.slice(0,40));
  }catch(e){console.log('hide failed',name,e.message.slice(0,80));}
 }
 console.log('hidden',hidden);
 await p.mouse.click(5,300);await sleep(1000);
 for(const rx of ['^(Left|Right) scalenus','^(Left|Right) subclavian','^(Left|Right) first rib','^(Left|Right) clavicle']){console.log(rx,await p.evaluate(rx=>window.__mjView.partsState(rx).map(x=>x.id+':'+Math.round(x.visible*10)/10).join(' '),rx));}
 const shot=async n=>{await sleep(3000);await p.screenshot({path:`${out}/${tag}-${vp}-${n}.png`,timeout:240000});console.log('shot',n);};
 const views=vp==='mobile'?[VIEWS[0]]:VIEWS;
 for(const [n,t,d,r] of views){await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,r]);await shot(n);}
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1);});

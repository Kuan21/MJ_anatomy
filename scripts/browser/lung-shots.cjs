// Screenshots of the lung focus view for review (production build + vite preview, software GL, several minutes). Real mouse clicks only.
// usage: NODE_PATH=<playwright modules> node lung-shots.cjs <port> <outDir> <tag> [before|after|dark]
const {chromium}=require('playwright');
const fs=require('fs');
const [port='5713',out='/tmp/lungshots',tag='x',mode='after']=process.argv.slice(2);
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1500,height:950}});p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);
 await p.waitForSelector('.detail-atlas-shortcuts',{timeout:240000});
 await p.waitForTimeout(80000);
 await p.mouse.move(5,5);
 await p.locator('.detail-atlas-shortcuts button',{hasText:'肺'}).click();await p.waitForTimeout(3000);
 await p.waitForFunction(()=>{const a=window.__mjView.partsState('lobe of (right|left) lung');return a.length===5&&a.every(x=>x.picker);},null,{timeout:900000,polling:3000});await p.waitForTimeout(5000);
 const real=async s=>{const bx=await p.locator(s).boundingBox();await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);};
 const shot=async n=>{await p.waitForTimeout(2500);await p.screenshot({path:`${out}/${tag}-${n}.png`});console.log('shot',n);};
 const sw='.lung-focus [aria-label="名稱標籤"]';
 const label=async key=>{const t=p.locator(`.part-label[data-key="${key}"]:visible`);if(await t.count()){await t.click();await p.waitForTimeout(4000);return true;}console.log('no label',key);return false;};
 const settle=async()=>{await p.waitForTimeout(30000);await p.waitForFunction(()=>document.querySelectorAll('.part-label').length>=10,null,{timeout:300000,polling:3000});await p.waitForTimeout(15000);};
 const clear=async()=>{await p.keyboard.press('Escape');await p.waitForTimeout(1500);};
 // left lung
 await real('.lung-focus-sides button:nth-child(2)');await p.waitForTimeout(5000);await real(sw);await settle();
 await shot('left-labels-light');
 if(mode==='dark'){await p.emulateMedia({colorScheme:'dark'});await shot('left-labels-dark');await real('.lung-focus-sides button:nth-child(3)');await settle();await shot('right-labels-dark');await b.close();return;}
 if(mode==='after'){
  await p.emulateMedia({colorScheme:'dark'});await shot('left-labels-dark');await p.emulateMedia({colorScheme:'light'});
  // legend: only the veins on
  const cats=await p.locator('.lung-legend [data-cat]').evaluateAll(e=>e.map(x=>x.dataset.cat));console.log('legend',cats.join());
  for(const c of cats)if(c!=='vein')await real(`.lung-legend [data-cat="${c}"]`);await shot('left-legend-veins-only');
  for(const c of cats)if(c!=='vein')await real(`.lung-legend [data-cat="${c}"]`);await p.waitForTimeout(1000);
 }
 if(await label('hilum-Left')){await shot('left-hilum');await clear();}
 if(await label('lingula')){await shot('left-lingula');await clear();}
 if(await label('aortic-arch')){await shot('left-impression-aortic-arch');await clear();}
 // right lung
 await real('.lung-focus-sides button:nth-child(3)');await settle();
 await shot('right-labels-light');
 if(mode==='after'){await p.emulateMedia({colorScheme:'dark'});await shot('right-labels-dark');await p.emulateMedia({colorScheme:'light'});}
 if(await label('svc')){await shot('right-impression-svc');await clear();}
 if(await label('hilum-Right')){await shot('right-hilum');await clear();}
 await b.close();
})().catch(e=>{console.log('FAIL',e.message);process.exit(1);});

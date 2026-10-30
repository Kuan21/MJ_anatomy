// Browser test for the 肺 segment display (肺段): real mouse clicks only. For each lung: switch the segments on, check the legend (bilingual, one row per segment, colour chips),
// the views (lateral / medial), click a legend row and check that its data card opens, then take screenshots (no text drawn onto the images).
// usage: node lung-segments-ui.cjs <port> <outDir> [tag]     needs playwright and a built server (vite preview); software GL, several minutes.
//   SIDES=right | left | right,left   LOAD_WAIT=<ms>
const {chromium}=require('playwright');
const fs=require('fs');
const [port='5613',out='/tmp/lungseg',tag='seg']=process.argv.slice(2);
fs.mkdirSync(out,{recursive:true});
const ok=(name,pass,info='')=>console.log((pass?'PASS ':'FAIL ')+name+(info?'  '+info:''));
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1500,height:950}});p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);
 await p.waitForSelector('.detail-atlas-shortcuts',{timeout:240000});
 await p.waitForTimeout(+(process.env.LOAD_WAIT||80000));
 await p.mouse.move(5,5);
 await p.locator('.detail-atlas-shortcuts button',{hasText:'肺'}).click();await p.waitForTimeout(3000);
 await p.waitForFunction(()=>{const a=window.__mjView.partsState('lobe of (right|left) lung');return a.length===5&&a.every(x=>x.picker);},null,{timeout:900000,polling:3000});await p.waitForTimeout(5000);
 const real=async s=>{const bx=await p.locator(s).boundingBox();await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);};
 const sw='.lung-focus [aria-label="顯示肺段"]';
 const SIDES=(process.env.SIDES||'right,left').split(',');
 await p.screenshot({path:`${out}/${tag}-panel-before.png`});
 for(const [n,side] of SIDES.entries()){
  await real(`.lung-focus-sides button:nth-child(${side==='left'?2:3})`);await p.waitForTimeout(8000);
  if(n===0||(await p.locator(sw).getAttribute('aria-checked'))!=='true'){await real(sw);}
  // the territories are in the last schematic package: wait until all of them are in the scene
  await p.waitForFunction(n=>{const a=window.__mjView.partsState('segment of (right|left) lung');return a.length>=n&&a.every(x=>x.picker);},side==='right'?10:8,{timeout:900000,polling:3000});await p.waitForTimeout(8000);
  ok(side+': switch is on',(await p.locator(sw).getAttribute('aria-checked'))==='true');
  const rows=await p.locator('.lung-seg-row').evaluateAll(es=>es.map(e=>({en:e.querySelector('.bn-en').textContent,zh:e.querySelector('.bn-zh').textContent,no:e.querySelector('.lung-seg-no').textContent,color:getComputedStyle(e.querySelector('.lung-seg-chip')).backgroundColor})));
  ok(side+': legend has '+(side==='right'?10:8)+' rows',rows.length===(side==='right'?10:8),String(rows.length));
  ok(side+': every row has English and Chinese',rows.every(r=>r.en&&/[一-鿿]/.test(r.zh)&&!/[一-鿿]/.test(r.en)));
  ok(side+': chip colours are all different',new Set(rows.map(r=>r.color)).size===rows.length);
  for(const view of ['medial','lateral']){
   await real(`.lung-seg-views button:nth-child(${view==='medial'?2:1})`);await p.waitForTimeout(25000);
   await p.screenshot({path:`${out}/${tag}-${side}-${view}.png`});
  }
  // a real click on a legend row opens that segment's card
  const row=p.locator('.lung-seg-row').nth(side==='right'?9:7);await row.click();await p.waitForTimeout(4000);
  const sheet=await p.locator('.detail-sheet').innerText().catch(()=>'');
  ok(side+': legend click opens the segment card (lobe, segment, segmental bronchus, main relations)',/lobe/i.test(sheet)&&/segmental bronchus/i.test(sheet)&&/main relations/i.test(sheet)&&/肺葉/.test(sheet)&&/段支氣管/.test(sheet)&&/主要毗鄰/.test(sheet),sheet.slice(0,80).replace(/\s+/g,' '));
  await p.screenshot({path:`${out}/${tag}-${side}-card.png`});
  await p.keyboard.press('Escape');await p.waitForTimeout(1500);
 }
 await real(sw);await p.waitForTimeout(4000);
 ok('switch turns the segment legend off',(await p.locator('.lung-seg-row').count())===0);
 await p.screenshot({path:`${out}/${tag}-panel-after-off.png`});
 await b.close();
})().catch(e=>{console.log('FAIL',e.message);process.exit(1);});

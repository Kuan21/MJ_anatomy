// One-session verification of the upper-limb fixes on a built site: auto-framing, every slider min->max (console errors), tab rail and panel metrics, info-card buttons, "not in view" hint for searched structures, close-zoom near plane.
// usage: node scripts/browser/limb-verify.cjs <port> <outDir> <tag>
const {chromium}=require('playwright');const fs=require('fs');
const [port='5800',out='/tmp/limb-verify',tag='after']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const LABELS={shoulderFlexion:'肩屈曲（＋）／伸展（－）',shoulderAbduction:'肩外展',shoulderRotation:'肩內旋（＋）／外旋（－）',elbowFlexion:'肘屈曲（＋）／伸展（－）',forearmRotation:'前臂旋前（＋）／旋後（－）',wristFlexion:'腕屈曲（＋）／伸展（－）',wristDeviation:'腕尺偏（＋）／橈偏（－）'};
const report={};
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1500,height:950}});p.setDefaultTimeout(60000);
 const errors=[];p.on('pageerror',e=>errors.push('pageerror: '+e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text().slice(0,200));});
 const real=async loc=>{const bx=await loc.boundingBox();if(!bx)throw new Error('no box');await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);};
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);await p.waitForSelector('.region-bar',{timeout:240000});
 await p.waitForFunction(()=>{const b=document.querySelector('[data-testid=load-bar]');return !b||+b.getAttribute('aria-valuenow')>=100;},null,{timeout:1200000});await p.waitForTimeout(8000);await p.mouse.move(5,5);
 await real(p.locator('.region-bar button',{hasText:/^上肢$/}).first());await p.waitForTimeout(4000);
 const ws=p.locator('.joint-workspace');if(await ws.getAttribute('open')===null)await real(ws.locator('summary span').first());
 await p.locator('.motion-enable-toggle input').check({timeout:20000});await p.waitForTimeout(1500);
 await real(p.locator('.mj-motion-sides button',{hasText:/Right/}).first());await p.waitForTimeout(2500);
 const setSlider=(key,v)=>p.evaluate(([label,v])=>{const el=document.querySelector(`input[aria-label="${label} angle"]`);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(v));el.dispatchEvent(new Event('input',{bubbles:true}));},[LABELS[key],v]);
 const reset=async()=>{for(const k of Object.keys(LABELS))await setSlider(k,0);await p.waitForTimeout(800);};
 // 1. UI metrics
 report.rail=await p.evaluate(()=>{const r=document.querySelector('.right-tool-rail'),bs=[...r.querySelectorAll('button')].map(x=>x.getBoundingClientRect().top|0),w=document.querySelector('.right-workspace');return{tabs:bs.length,rows:new Set(bs).size,height:r.getBoundingClientRect().height,workspaceOverflow:w.scrollHeight-w.clientHeight};});
 await p.screenshot({path:`${out}/${tag}-ui-rail.png`,clip:{x:1130,y:80,width:360,height:260}});
 // 2. auto-framing: no __mjView.look; only the slider moves
 const cam=()=>p.evaluate(()=>window.__mjView.camera());
 report.camBefore=await cam();await setSlider('shoulderFlexion',73);await setSlider('shoulderAbduction',158);await p.waitForTimeout(9000);report.camAfter=await cam();
 await p.screenshot({path:`${out}/${tag}-autoframe-flex73-abd158.png`});
 await reset();await setSlider('shoulderFlexion',180);await p.waitForTimeout(9000);await p.screenshot({path:`${out}/${tag}-autoframe-flex180.png`});report.camFlex180=await cam();
 await reset();
 // 3. every slider min -> max in steps, errors
 report.sweep={};
 for(const [k,l] of Object.entries(LABELS)){const [lo,hi]=await p.evaluate(l=>{const e=document.querySelector(`input[aria-label="${l} angle"]`);return[+e.min,+e.max];},l);const e0=errors.length;
  for(const v of [lo,Math.round(lo/2),0,Math.round(hi/2),hi]){await setSlider(k,v);await p.waitForTimeout(1800);}
  report.sweep[k]={lo,hi,errors:errors.length-e0};await reset();}
 // 4. info card buttons for a vessel (Play pathway) 
 await real(p.locator('.region-bar button',{hasText:/^全身$/}).first()).catch(()=>{});await p.waitForTimeout(3000);
 const search=async name=>{await real(p.locator('button[aria-label*="搜尋"],button[title*="earch"],.top-actions button').nth(1)).catch(()=>{});await p.waitForTimeout(800);const inp=p.locator('input[aria-label*="名稱"]').first();await inp.fill(name);await p.waitForTimeout(1500);await p.keyboard.press('ArrowDown');await p.keyboard.press('Enter');await p.waitForTimeout(5000);};
 for(const [key,name] of [['dorsal','Right dorsal scapular artery'],['membrane','Left internal intercostal membrane'],['radial','Right radial nerve']]){
  try{await search(name);report[key]=await p.evaluate(()=>{const s=document.querySelector('.detail-sheet');const a=document.querySelector('.detail-actions');const r=a&&a.getBoundingClientRect();return{title:(s?.querySelector('h2')?.innerText||'').split('\n')[0],hint:!!document.querySelector('.out-of-view-hint'),facts:[...document.querySelectorAll('.bilingual-facts .fact,.detail-sheet .fact-row')].map(x=>x.innerText.replace(/\n+/g,' ')).filter(t=>/Region|Origin|區域|來源/.test(t)).slice(0,4),actions:a?{cls:a.className,buttons:a.querySelectorAll('button').length,height:r.height,rows:new Set([...a.querySelectorAll('button')].map(x=>x.getBoundingClientRect().top|0)).size,cut:[...a.querySelectorAll('button span')].some(x=>x.scrollWidth>x.clientWidth+1)}:null};});
   await p.screenshot({path:`${out}/${tag}-card-${key}.png`});}catch(e){report[key]={error:e.message.slice(0,150)};}}
 report.errors=errors;fs.writeFileSync(`${out}/${tag}-verify.json`,JSON.stringify(report,null,1));console.log(JSON.stringify(report,null,1));
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));fs.writeFileSync(`${out}/${tag}-verify.json`,JSON.stringify(report));process.exit(1);});

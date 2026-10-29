// Browser test for the 肺 focus panel: every control is clicked with the real mouse (no element.click()) and must both hit the panel (not an overlapping layer) and change the scene.
// usage: node lung-focus-ui.cjs <port> <outDir> [tag]     needs playwright and a built or dev server; ~2 minutes (software GL).
const {chromium}=require('playwright');
const fs=require('fs');
const [port='5611',out='/tmp/lungshots',tag='ui']=process.argv.slice(2);
fs.mkdirSync(out,{recursive:true});
const results=[];const ok=(name,pass,info='')=>{results.push({name,pass,info});console.log((pass?'PASS ':'FAIL ')+name+(info?'  '+info:''));};
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1500,height:950}});p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);
 await p.waitForSelector('.detail-atlas-shortcuts',{timeout:240000});
 await p.waitForTimeout(+(process.env.LOAD_WAIT||80000));
 await p.mouse.move(5,5);
 const lungBtn=p.locator('.detail-atlas-shortcuts button',{hasText:'肺'});
 await lungBtn.click();await p.waitForTimeout(3000);
 await p.waitForFunction(()=>{const a=window.__mjView.partsState('lobe of (right|left) lung');return a.length===5&&a.every(x=>x.picker);},null,{timeout:900000,polling:3000});await p.waitForTimeout(5000);
 ok('panel appears',await p.locator('.lung-focus').count()===1);
 // What sits on top of each control at its centre?
 const probe=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect(),t=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{hit:!!t&&(e===t||e.contains(t)||t.contains(e)),top:t?(t.className&&String(t.className).slice(0,50))+'<'+t.tagName+'>':null};},sel);
 const sel={both:'.lung-focus-sides button:nth-child(1)',left:'.lung-focus-sides button:nth-child(2)',right:'.lung-focus-sides button:nth-child(3)',minus:'.layer-buttons button:nth-child(1)',plus:'.layer-buttons button:nth-child(2)',slider:'.lung-focus input[type=range]'};
 for(const [k,s] of Object.entries(sel)){const r=await probe(s);ok('hit-test '+k+' reaches the control',!!r&&r.hit,r?r.top:'missing');}
 const shot=async n=>{await p.waitForTimeout(6000);await p.screenshot({path:`${out}/${tag}-${n}.png`});};
 const real=async s=>{const bx=await p.locator(s).boundingBox();await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);};
 const pressed=s=>p.locator(s).getAttribute('aria-pressed');
 await shot('0-initial');
 await real(sel.left);await p.waitForTimeout(3000);ok('left lung button -> pressed',(await pressed(sel.left))==='true');await shot('1-left');
 await real(sel.right);await p.waitForTimeout(3000);ok('right lung button -> pressed',(await pressed(sel.right))==='true'&&(await pressed(sel.left))==='false');await shot('2-right');
 await real(sel.both);await p.waitForTimeout(3000);ok('both button -> pressed',(await pressed(sel.both))==='true');await shot('3-both');
 const layerText=()=>p.locator('.lung-focus .lung-focus-row .bn-en', {hasText:'Layer'}).first().innerText();
 await real(sel.plus);await p.waitForTimeout(3000);ok('plus -> layer 2',/Layer 2/.test(await layerText()),await layerText());await p.waitForFunction(()=>window.__mjView.partsState('pleura').every(x=>x.picker),null,{timeout:600000,polling:3000});await shot('4-layer2');
 await real(sel.minus);await p.waitForTimeout(3000);ok('minus -> layer 1',/Layer 1/.test(await layerText()),await layerText());await shot('5-layer1');
 const bx=await p.locator(sel.slider).boundingBox();
 await p.mouse.click(bx.x+bx.width*0.3,bx.y+bx.height/2);await p.waitForTimeout(3000);
 const v=+(await p.locator(sel.slider).inputValue());ok('opacity slider moves with a real click',v<60,'value '+v);await shot('6-opacity');
 // the slider auto-switches both toggles on; each switch must then turn off and on again with a real click
 for(const [label,name] of [['顯示支氣管樹','bronchial tree'],['顯示肺血管','pulmonary vessels']]){
  const sw=`.lung-focus [aria-label="${label}"]`;const state=()=>p.locator(sw).getAttribute('aria-checked');
  ok(name+' switch on after lowering opacity',(await state())==='true');
  await real(sw);await p.waitForTimeout(3000);ok(name+' switch turns off with a real click',(await state())==='false');await shot('7-'+name.replace(' ','-')+'-off');
  await real(sw);await p.waitForTimeout(3000);ok(name+' switch turns on again',(await state())==='true');await shot('8-'+name.replace(' ','-')+'-on');
 }
 await p.screenshot({path:`${out}/${tag}-final.png`});
 const extra=process.env.EXTRA_TOGGLES?process.env.EXTRA_TOGGLES.split(','):[];
 for(const t of extra){const l=p.locator('.lung-focus label,.lung-focus button',{hasText:t}).first();ok('toggle '+t+' present',await l.count()>0);if(await l.count()){await l.click();await p.waitForTimeout(3000);await shot('7-'+t);}}
 await b.close();
 const fail=results.filter(r=>!r.pass);fs.writeFileSync(`${out}/${tag}-results.json`,JSON.stringify(results,null,1));
 process.exit(fail.length?1:0);
})().catch(e=>{console.log('FAIL',e.message.slice(0,400));process.exit(2);});

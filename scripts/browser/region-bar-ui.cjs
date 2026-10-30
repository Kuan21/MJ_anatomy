// Browser test and screenshots for the top region bar. Every control is clicked with the real mouse.
// usage: node region-bar-ui.cjs <port> <outDir> [width] [height]   needs playwright and a production build served by `vite preview`; ~10 minutes (software GL).
const {chromium}=require('playwright');
const fs=require('fs');
const [port='5611',out='/tmp/regionshots',W='1500',H='950']=process.argv.slice(2);
fs.mkdirSync(out,{recursive:true});
const results=[];const ok=(name,pass,info='')=>{results.push({name,pass,info});console.log((pass?'PASS ':'FAIL ')+name+(info?'  '+info:''));};
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:+W,height:+H}});p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);
 await p.waitForSelector('.region-bar',{timeout:240000});
 // the scene needs about 90-150 s to load; the vessels arrive last
 await p.waitForTimeout(+(process.env.LOAD_WAIT||150000));
 await p.mouse.move(5,5);
 const nav='.region-bar';
 const real=async loc=>{const bx=await loc.boundingBox();if(!bx)throw new Error('no box');await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);};
 const btn=(text,scope=nav)=>p.locator(`${scope} button`,{hasText:new RegExp('^'+text+'$')}).first();
 const shot=async n=>{if(process.env.FAST&&/side/.test(n)&&!/chest|back/.test(n)){await p.waitForTimeout(1500);return;}await p.waitForTimeout(+(process.env.SETTLE||9000));await p.screenshot({path:`${out}/${n}.png`});};
 const visibleCount=async()=>(await p.locator('.panel-foot span').first().innerText()).replace(/\s+/g,' ');
 // 1. labels in order, no wrapping, nothing covering the bar
 const labels=await p.locator(`${nav} > button`).allInnerTexts();
 ok('region buttons head to foot',JSON.stringify(labels.slice(1))===JSON.stringify(['全身','頭頸','上肢','胸腔','背部','腹腔','骨盆與會陰','臀區','下肢']),labels.join('|'));
 const geo=await p.evaluate(()=>{const e=document.querySelector('.region-bar'),r=e.getBoundingClientRect(),t=document.elementFromPoint(r.x+8,r.y+r.height/2);return{covered:!(e===t||e.contains(t)),oneRow:new Set([...e.querySelectorAll(':scope > button')].filter(x=>x.offsetWidth>0).map(x=>Math.round(x.getBoundingClientRect().top))).size===1,scrollW:e.scrollWidth,clientW:e.clientWidth,top:r.top,left:r.left,right:r.right};});
 ok('bar is one row and not covered',geo.oneRow&&!geo.covered,JSON.stringify(geo));
 await shot('00-whole');
 const regions=[['頭頸','head',[]],['上肢','upper',[]],['胸腔','chest',['縱隔與心臟','胸壁','肺與胸膜']],['背部','back',[]],['腹腔','abdomen',['腹腔器官','腹壁','後腹壁（腎、大血管）']],['骨盆與會陰','pelvis',['骨盆器官','骨盆壁','會陰']],['臀區','gluteal',[]],['下肢','lower',[]]];
 for(const [label,key,subs] of regions){
  if(process.env.REGIONS&&!process.env.REGIONS.split(',').includes(key))continue;
  await real(btn(label));await p.waitForTimeout(2500);
  const pressed=await btn(label).getAttribute('aria-pressed');
  ok(`${label}: pressed and second level open`,pressed==='true'&&await p.locator(`${nav}.limb-picked`).count()===1);
  const others=await p.evaluate(()=>[...document.querySelectorAll('.region-bar > button')].filter(b=>b.offsetWidth>4&&b.getAttribute('aria-pressed')!=='true'&&!b.classList.contains('tab-back')).length);
  ok(`${label}: other regions folded away`,others===0,String(others));
  await shot(`${key}-0-${label}`);
  console.log('  visible',await visibleCount());
  if(subs.length){
   for(const [i,sub] of subs.entries()){
    await real(btn(sub));await p.waitForTimeout(2500);
    ok(`${label} → ${sub}: pressed`,(await btn(sub).getAttribute('aria-pressed'))==='true');
    await shot(`${key}-${i+1}-${sub.replace(/[（）、]/g,'')}`);console.log('  visible',await visibleCount());
   }
  }
  if(!['abdomen','pelvis'].includes(key)){
   for(const side of ['左側','右側']){await real(btn(side));await p.waitForTimeout(2500);ok(`${label} ${side}: pressed`,(await btn(side).getAttribute('aria-pressed'))==='true');await shot(`${key}-side-${side}`);console.log('  visible',await visibleCount());}
   if(await p.locator(`${nav} .side-fade-toggle input`).count()){await p.locator(`${nav} .side-fade-toggle input`).check();await shot(`${key}-side-fade`);await p.locator(`${nav} .side-fade-toggle input`).uncheck();}
   await real(btn('雙側'));await p.waitForTimeout(1500);
  }
  await real(p.locator(`${nav} .tab-back`));await p.waitForTimeout(3000);
  ok(`${label}: ← returns to the whole body`,(await btn('全身').getAttribute('aria-pressed'))==='true');
 }
 // bottom 肺 button == 胸腔 → 肺與胸膜
 await real(p.locator('.detail-atlas-shortcuts button',{hasText:'肺'}));await p.waitForTimeout(4000);
 ok('肺 button opens 胸腔 → 肺與胸膜',(await btn('胸腔').getAttribute('aria-pressed'))==='true'&&(await btn('肺與胸膜').getAttribute('aria-pressed'))==='true'&&await p.locator('.lung-focus').count()===1);
 await shot('lung-button');
 await real(p.locator('.title-reset'));await p.waitForTimeout(3000);
 ok('title click resets to 全身',(await btn('全身').getAttribute('aria-pressed'))==='true'&&await p.locator('.lung-focus').count()===0);
 const quiz=await p.locator('.quiz-link').getAttribute('href');
 await real(btn('胸腔'));await p.waitForTimeout(1500);
 ok('quiz link follows the region',(await p.locator('.quiz-link').getAttribute('href'))==='#/quiz/heart',quiz);
 const failed=results.filter(r=>!r.pass);console.log(failed.length?`${failed.length} FAILED`:'all passed');
 await b.close();process.exit(failed.length?1:0);
})().catch(e=>{console.error(e);process.exit(1);});

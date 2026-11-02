// Browser test (production build, software GL) for redesigned special regions: pick each region, photograph it solid, with a structure picked (camera must not move), with 顯示周圍結構,
// and with the roof put on when it has one. usage: SPACES='Quadrangular space,Triangular space' TOP=上肢 node special-region.cjs <port> <outDir>
const {chromium}=require('playwright');const fs=require('fs');
const [port='5851',out='/tmp/regionshots']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const names=(process.env.SPACES||'').split(',').filter(Boolean),top=process.env.TOP||'上肢';
let failed=0;const ok=(n,pass,info='')=>{if(!pass)failed++;console.log((pass?'PASS ':'FAIL ')+n+(info?'  '+info:''));};
const same=(a,b)=>a&&b&&a.every((v,i)=>Math.abs(v-b[i])<1e-6);
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1500,height:950}});p.setDefaultTimeout(240000);p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);await p.waitForSelector('.region-bar');await p.waitForTimeout(+(process.env.LOAD_WAIT||100000));await p.mouse.move(5,5);
 const real=async loc=>{await loc.scrollIntoViewIfNeeded();const bx=await loc.boundingBox();await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);};
 const cam=()=>p.evaluate(()=>window.__mjView.camera());
 await real(p.locator('.region-bar button',{hasText:new RegExp('^'+top+'$')}).first());await p.waitForTimeout(4000);
 const tb=p.locator('.right-tool-rail button',{hasText:/^分層解剖$/}).first();if((await tb.getAttribute('aria-expanded'))!=='true'){await real(tb);await p.waitForTimeout(1500);}
 for(const name of names){
  const id=name.toLowerCase().replace(/[^a-z]+/g,'-');
  await real(p.locator('.space-pick',{hasText:new RegExp('^'+name)}).first());
  for(let k=0;k<60&&!(await p.evaluate(()=>window.__mjView.nerveRows().length));k++)await p.waitForTimeout(5000);
  await p.waitForTimeout(12000);await p.screenshot({path:`${out}/${id}-1-solid.png`});
  const start=await cam();
  const rows=await p.locator('.space-row:not([disabled])').count();ok(`${name}: ${rows} structures listed`,rows>0);
  const roles=(await p.locator('.space-role b').allInnerTexts()).map(t=>t.split('｜')[1]);console.log(name,'groups',roles.join('、'));
  await real(p.locator('.space-row:not([disabled])').first());await p.waitForTimeout(3000);await p.screenshot({path:`${out}/${id}-2-picked.png`});
  ok(`${name}: picking a structure leaves the camera`,same((await cam()),start));
  await real(p.locator('.space-surround input'));await p.waitForTimeout(3500);await p.screenshot({path:`${out}/${id}-3-surround.png`});
  ok(`${name}: surroundings leave the camera`,same((await cam()),start));
  await real(p.locator('.space-surround input'));await p.waitForTimeout(1500);
  if(await p.locator('.space-roof-toggle').count()){await real(p.locator('.space-roof-toggle'));await p.waitForTimeout(3500);await p.screenshot({path:`${out}/${id}-4-roof-on.png`});await real(p.locator('.space-roof-toggle'));await p.waitForTimeout(1500);}
  const over=await p.evaluate(()=>[...document.querySelectorAll('.space-filter *')].filter(e=>e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflowX!=='visible'&&e.clientWidth>0).length);
  ok(`${name}: panel text does not overflow`,over===0);
  const miss=await p.locator('.space-missing small').allInnerTexts();console.log(name,'missing',miss.join(' | '));
 }
 await b.close();console.log(failed?`${failed} check(s) failed`:'all browser checks passed');process.exit(failed?1:0);
})();

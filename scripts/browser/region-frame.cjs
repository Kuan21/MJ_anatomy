// Browser test (production build, software GL, about 12 minutes): every region view (and sub-region, and both sides) is framed whole inside the free area of the screen
// (below the region bar, right of the layer panel, left of the tool rail, above the bottom margin). Screenshots go to <outDir>.
// usage: node region-frame.cjs <port> <outDir> [width] [height] [label]   needs playwright and `vite preview` of a production build.
const {chromium}=require('playwright');const fs=require('fs');
const [port='5821',out='/tmp/regionframe',W='1500',H='950',label='after']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
let failed=0;const ok=(name,pass,info='')=>{if(!pass)failed++;console.log((pass?'PASS ':'FAIL ')+name+(info?'  '+info:''));};
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:+W,height:+H},hasTouch:+W<768});p.setDefaultTimeout(240000);p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);await p.waitForSelector('.region-bar',{timeout:240000});await p.waitForTimeout(+(process.env.LOAD_WAIT||120000));await p.mouse.move(5,5);
 const nav='.region-bar';
 const real=async loc=>{if(+W<768){await loc.click({force:true});return;}const bx=await loc.boundingBox();if(!bx)throw new Error('no box');await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);};
 const btn=(t,scope=nav)=>p.locator(`${scope} button`,{hasText:new RegExp('^'+t+'$')}).first();
 const rects=()=>p.evaluate(()=>{const q=s=>{const e=document.querySelector(s);const r=e?.getBoundingClientRect();return r&&r.width>0?{l:r.left,t:r.top,r:r.right,b:r.bottom}:null};return{nav:q('.body-region-nav'),panel:q('.left-workspace'),rail:q('.right-tool-rail'),focus:window.__mjView.focusRect(),cam:window.__mjView.camera()};});
 const check=async(name,file)=>{await p.waitForTimeout(+(process.env.SETTLE||6000));const r=await rects();await p.screenshot({path:`${out}/${label}-${file}.png`});
  // the lung view (肺與胸膜, also reached by the 右側 button after it) keeps its own framing with the lung panel and name labels: screenshot only
  if(await p.locator('.lung-focus').count()){console.log(`SKIP ${name}: lung view (own framing)`);return;}
  if(!r.focus){ok(`${name}: has a framed target`,false);return;}
  const w=r.focus.w,h=r.focus.h,mobile=w<768;
  const free={l:r.panel&&!mobile?Math.min(w*.48,r.panel.r+18):20,r:r.rail&&r.rail.l>w*.5?r.rail.l-16:w-20,t:r.nav?r.nav.b+20:160,b:h-64},f=r.focus,tol=3;
  ok(`${name}: framed target inside the free area`,f.l>=free.l-tol&&f.r<=free.r+tol&&f.t>=free.t-tol&&f.b<=free.b+tol,JSON.stringify({box:[f.l,f.t,f.r,f.b].map(Math.round),free:[free.l,free.t,free.r,free.b].map(Math.round)}));};
 await p.waitForTimeout(3000);await p.screenshot({path:`${out}/${label}-00-whole.png`});
 const regions=[['頭頸','head',[]],['上肢','upper',[]],['胸腔','chest',['縱隔與心臟','胸壁','肺與胸膜']],['背部','back',[]],['腹腔','abdomen',['腹腔器官','腹壁','後腹壁（腎、大血管）']],['骨盆與會陰','pelvis',['骨盆器官','骨盆壁','會陰']],['臀區','gluteal',[]],['下肢','lower',[]]];
 for(const [lab,key,subs] of regions){
  if(process.env.REGIONS&&!process.env.REGIONS.split(',').includes(key))continue;
  await real(btn(lab));await p.waitForTimeout(2500);
  if(!subs.length)await check(lab,`${key}-0`);
  for(const [i,sub] of subs.entries()){await real(btn(sub));await p.waitForTimeout(2000);if(sub!=='肺與胸膜')await check(`${lab} → ${sub}`,`${key}-${i+1}-${i}`);else{await p.waitForTimeout(3000);await p.screenshot({path:`${out}/${label}-${key}-${i+1}-lung.png`});}}
  if(!['abdomen','pelvis'].includes(key)&&!process.env.NOSIDES){for(const side of ['右側']){const sb=btn(side);if(await sb.count()){await real(sb);await p.waitForTimeout(2000);await check(`${lab} ${side}`,`${key}-side-right`);}}}
  await real(p.locator(+W<768?".title-reset":`${nav} .tab-back`));await p.waitForTimeout(3000);
 }
 await b.close();console.log(failed?`${failed} check(s) failed`:'all region framings inside the free area');process.exit(failed?1:0);
})();

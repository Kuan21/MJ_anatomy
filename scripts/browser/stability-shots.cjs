// Fixed-view screenshots for the stability checks (production build + vite preview, software GL, light theme): every region of the atlas, the lungs, the brain and the heart,
// each from the front, back, left and right. Names are <tag>-<view>-<angle>.png so scripts/stability-compare.py can pair two runs.
// usage: node scripts/browser/stability-shots.cjs <port> <outDir> <tag> [only]      only = comma list of view keys (default all). Needs playwright (NODE_PATH) and a preview server.
const {chromium}=require('playwright');const fs=require('fs');
const [port='5800',out='/tmp/stability-shots',tag='after',only='']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const want=only?new Set(only.split(',')):null;
// body-right is -x. Angles as seen by the viewer: front = camera on +z.
const ANGLES={front:[0,0,1],back:[0,0,-1],left:[1,0,0],right:[-1,0,0]};
const REGIONS=[['head','頭頸',[]],['upper','上肢',[]],['chest','胸腔',['縱隔與心臟','胸壁']],['back','背部',[]],['abdomen','腹腔',['腹腔器官','腹壁','後腹壁（腎、大血管）']],['pelvis','骨盆與會陰',['骨盆器官','骨盆壁','會陰']],['gluteal','臀區',[]],['lower','下肢',[]]];
const slug=s=>s.replace(/[^a-z0-9]+/gi,'');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1500,height:950}});p.setDefaultTimeout(60000);p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,200)));
 const real=async loc=>{const bx=await loc.boundingBox();if(!bx)throw new Error('no box');await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);};
 const btn=(t,scope='.region-bar')=>p.locator(`${scope} button`,{hasText:new RegExp('^'+t+'$')}).first();
 const toTop=async()=>{for(let i=0;i<5&&!(await btn('頭頸').isVisible());i++){const back=p.locator('.region-bar .tab-back');if(await back.isVisible())await real(back);await p.waitForTimeout(3000);}await btn('頭頸').waitFor({state:'visible',timeout:60000});};
 const shoot=async(key)=>{ // four fixed angles around the current camera target and distance
  if(want&&!want.has(key))return;
  if(process.env.RESUME&&fs.existsSync(`${out}/${tag}-${key}-left.png`))return;
  const cam=await p.evaluate(()=>window.__mjView.camera()),t=cam.slice(3,6),dist=Math.hypot(cam[0]-t[0],cam[1]-t[1],cam[2]-t[2]);
  for(const [a,d] of Object.entries(ANGLES)){await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,dist]);await p.waitForTimeout(+(process.env.SETTLE||2500));await p.screenshot({path:`${out}/${tag}-${key}-${a}.png`});}
  console.log('shot',key);};
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);await p.waitForSelector('.region-bar',{timeout:240000});await p.waitForTimeout(+(process.env.LOAD_WAIT||120000));await p.mouse.move(5,5);
 await shoot('whole');
 for(const [key,lab,subs] of REGIONS){
  if(process.env.REGIONS&&!process.env.REGIONS.split(',').includes(key))continue;
  try{
   // back to the whole-body bar first (a sub-region needs one more step back than a region)
   await toTop();
   await real(btn(lab));await p.waitForTimeout(3500);
   if(!subs.length)await shoot(key);
   for(const sub of subs){await btn(sub).waitFor({state:'visible',timeout:60000});await real(btn(sub));await p.waitForTimeout(3000);await shoot(`${key}-${slug(sub)||subs.indexOf(sub)}`);}
  }catch(e){console.log('SKIP',key,e.message.slice(0,120));}
 }
 // lungs: the lung focus view, both lungs, then each alone
 if(!want||[...want].some(k=>k.startsWith('lung')))try{
  await toTop();
  await real(p.locator('.detail-atlas-shortcuts button:nth-child(3)'));await p.waitForTimeout(8000);
  for(const [name,n] of [['lung-both',1],['lung-left',2],['lung-right',3]]){await real(p.locator(`.lung-focus-sides button:nth-child(${n})`));await p.waitForTimeout(5000);await shoot(name);}
 }catch(e){console.log('SKIP lungs',e.message.slice(0,120));}
 // organ detail modes are separate pages with their own canvas: the camera is turned by dragging (a drag of a quarter of the height is 90 degrees of OrbitControls)
 const turn=async()=>{const bx=await p.locator('canvas').first().boundingBox();const y=bx.y+bx.height/2,x=bx.x+bx.width/2,dx=bx.height/4;await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x-dx,y,{steps:12});await p.mouse.up();await p.waitForTimeout(1500);};
 const organ=async(key,hash,ready,steps)=>{
  if(want&&!want.has(key))return;
  await p.evaluate(h=>{location.hash=h;},hash);await p.waitForSelector(ready,{timeout:240000});await p.waitForTimeout(+(process.env.ORGAN_WAIT||40000));
  for(const [name,fn] of steps){if(fn)await fn();await p.waitForTimeout(3500);
   for(const a of ['front','side1','back','side2']){await p.screenshot({path:`${out}/${tag}-${key}${name?'-'+name:''}-${a}.png`});await turn();}}
  console.log('shot',key);};
 try{await organ('brain','#/organ/brain','canvas',[['',null]]);}catch(e){console.log('SKIP brain',e.message.slice(0,120));}
 try{await organ('heart','#/organ/heart','.organ-chambers button',[['closed',null],...['ra','rv','la','lv'].flatMap((id,i)=>[[id,()=>p.evaluate(n=>document.querySelectorAll('.organ-chambers button')[n].click(),i)],[id+'-open',async()=>{const t=p.locator('button',{hasText:/打開心腔/}).first();if(await t.count())await t.click();await p.waitForTimeout(9000);}]])]);}catch(e){console.log('SKIP heart',e.message.slice(0,120));}
 // Regression views for translucent surfaces (the dotted screen-door look): the abdominal wall from the front in the default whole-body view, and the right tibia of the lower limb with only bones and nerves on.
 // They run last because they change the system switches.
 if(!want||want.has('regress'))try{
  await p.goto(`http://127.0.0.1:${port}/?mjview=1`);await p.waitForSelector('.region-bar',{timeout:240000});await p.waitForTimeout(+(process.env.LOAD_WAIT||120000));await p.mouse.move(5,5);
  const setSys=async map=>{for(const [n,on] of Object.entries(map)){const cur=await p.evaluate(n=>[...document.querySelectorAll('.system-row')].find(r=>r.textContent.includes(n))?.querySelector('[data-slot=switch]')?.getAttribute('aria-checked')==='true',n);if(cur!==on){await real(p.locator('.system-row',{hasText:n}).locator('[data-slot=switch]').first());await p.waitForTimeout(1200);}}};
  const look=async(t,d,r)=>{await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[t,d,r]);await p.waitForTimeout(+(process.env.SETTLE||2500));};
  await look([0,1.0,0],[0,0,1],3.2);await p.screenshot({path:`${out}/${tag}-regress-abdominal-wall-whole.png`});
  await look([0,1.08,0],[0,0,1],.5);await p.screenshot({path:`${out}/${tag}-regress-abdominal-wall-close.png`});
  await real(btn('下肢'));await p.waitForTimeout(3500);
  await setSys({Skeleton:true,Muscles:false,Arteries:false,Veins:false,'Nervous system':true,'Connective tissue':false});
  await real(p.locator('button',{hasText:/^右側$/}).first());await p.waitForTimeout(3000);
  await look([-0.09,0.45,0.02],[0,0,1],.5);await p.screenshot({path:`${out}/${tag}-regress-right-tibia-front.png`});
  await look([-0.09,0.45,0.02],[-1,0,0],.5);await p.screenshot({path:`${out}/${tag}-regress-right-tibia-side.png`});
  console.log('shot regress');
 }catch(e){console.log('SKIP regress',e.message.slice(0,120));}
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,400));process.exit(1);});

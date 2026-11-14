// Front / side / back screenshots of the lower limb, the gluteal region and the abdominal wall on a built site (vite preview, software GL), plus console errors.
// usage: node scripts/browser/region-views.cjs <port> <outDir> <tag> [keys]   keys = comma list of: glute, abdwall, lower, knee, abdclose, chestclose, kneeclose, abdvessels, chestvessels (muscles switched off)
const {chromium}=require('playwright');const fs=require('fs');
const [port='5800',out='/tmp/region-views',tag='after',only='']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const want=only?new Set(only.split(',')):null;
const ANG={front:[0,0,1],left:[1,0,0],back:[0,0,-1],right:[-1,0,0]};
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1500,height:950}});p.setDefaultTimeout(60000);
 const errors=[];p.on('pageerror',e=>errors.push('pageerror: '+e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text().slice(0,200));});
 const real=async loc=>{const bx=await loc.boundingBox();if(!bx)throw new Error('no box');await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);};
 const btn=(t,scope='.region-bar')=>p.locator(`${scope} button`,{hasText:new RegExp('^'+t+'$')}).first();
 const toTop=async()=>{for(let i=0;i<5&&!(await btn('頭頸').isVisible());i++){const back=p.locator('.region-bar .tab-back');if(await back.isVisible())await real(back);await p.waitForTimeout(3000);}await btn('頭頸').waitFor({state:'visible',timeout:60000});};
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);await p.waitForSelector('.region-bar',{timeout:240000});
 await p.waitForFunction(()=>{const b=document.querySelector('[data-testid=load-bar]');return !b||+b.getAttribute('aria-valuenow')>=100;},null,{timeout:1500000});await p.waitForTimeout(8000);await p.mouse.move(5,5);
 const shoot=async(key,target,dist,angles=['front','left','back'])=>{
  const cam=await p.evaluate(()=>window.__mjView.camera()),t=target||cam.slice(3,6),d=dist||Math.hypot(cam[0]-t[0],cam[1]-t[1],cam[2]-t[2]);
  for(const a of angles){await p.evaluate(([t,dir,r])=>window.__mjView.look(t,dir,r),[t,ANG[a],d]);await p.waitForTimeout(2500);await p.screenshot({path:`${out}/${tag}-${key}-${a}.png`});}console.log('shot',key);};
 const run=async(key,top,sub,target,dist,angles,hideMuscles)=>{if(want&&!want.has(key))return;try{await toTop();await real(btn(top));await p.waitForTimeout(3500);if(sub){await btn(sub).waitFor({state:'visible',timeout:60000});await real(btn(sub));await p.waitForTimeout(3500);}if(hideMuscles){await real(p.locator('button.system-name[title^="隱藏肌肉"]').first());await p.waitForTimeout(4000);}await shoot(key,target,dist,angles);}catch(e){console.log('SKIP',key,e.message.slice(0,120));}};
 await run('glute','臀區',null,null,null,['back','left','front']);
 await run('abdwall','腹腔','腹壁',null,null,['front','left','back']);
 await run('lower','下肢',null,null,null,['front','left','back']);
 await run('knee','下肢',null,[0.09,0.47,0.03],0.55,['front','left','back']);
 await run('abdclose','腹腔','腹壁',[0.03,1.0,0.09],0.3,['front','left']);
 await run('chestclose','腹腔','腹壁',[0.0,1.17,0.09],0.3,['front','left']);
 await run('abdvessels','腹腔','腹壁',[0.03,1.0,0.09],0.3,['front'],true);
 await run('chestvessels','腹腔','腹壁',[0.0,1.17,0.09],0.3,['front'],true);
 await run('kneeclose','下肢',null,[0.05,0.5,0.0],0.3,['front','left']);
 fs.writeFileSync(`${out}/${tag}-errors.json`,JSON.stringify(errors,null,1));console.log('errors',errors.length);await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,400));process.exit(1);});

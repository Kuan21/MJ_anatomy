// Production-build screenshots of the back and gluteal region: each scene turns on a set of systems (the first is shown alone), then photographs the views.
// usage: node back-glute-shots.cjs <port> <outDir> <tag>      env: SCENES=a,b (default all)  VIEWS=a,b  LOAD_WAIT=ms     (needs `vite preview` of a production build)
const {chromium}=require('playwright');const fs=require('fs');
const [port='5731',out='/tmp/bgshots',tag='after']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const V=(name,target,dir,d)=>({name,target,dir,d});
const VIEWS=[V('back',[0,1.2,-.05],[0,0,-1],1.3),V('torso-back',[0,1.28,-.06],[0,0,-1],.75),
 V('trap-right-back',[-.075,1.42,-.08],[0,.15,-1],.38),V('trap-right-top',[-.075,1.42,-.08],[0,1,-.12],.38),V('trap-right-lateral',[-.075,1.42,-.08],[-1,.1,-.2],.4),
 V('trap-left-back',[.075,1.42,-.08],[0,.15,-1],.38),V('trap-left-top',[.075,1.42,-.08],[0,1,-.12],.38),
 V('glute-back',[0,.93,-.08],[0,0,-1],.62),V('glute-right-lateral',[-.07,.92,-.06],[-1,0,-.15],.55),V('glute-top',[0,.93,-.08],[0,1,-.2],.5),V('glute-oblique',[-.05,.92,-.08],[-.7,.2,-.7],.5),
 V('hip-front-oblique',[0,.93,-.05],[0,0,1],.7),
 V('lumbar-back',[0,1.08,-.07],[0,0,-1],.5),V('nerve-thoracic-back',[-.03,1.3,-.06],[0,0,-1],.32),V('nerve-thoracic-lateral',[-.03,1.3,-.06],[-1,0,-.15],.32),V('glute-cleft',[0,.88,-.09],[0,.15,-1],.3)];
const SCENES={
 muscles:['Skeleton','Muscles'],
 tendons:['Skeleton','Muscles','Tendons'],
 nerves:['Skeleton','Nervous'],
 connective:['Skeleton','Connective'],
 vessels:['Skeleton','Muscles','Arteries','Veins'],
 vesselsonly:['Skeleton','Arteries','Veins']};
// structures selected through the search box (the muscles shown, the rest faded), then photographed from the listed views
const SELECTS=[
 {find:'Transverse part of right trapezius',views:['trap-right-back','trap-right-top','trap-right-lateral']},
 {find:'Transverse part of left trapezius',views:['trap-left-back','trap-left-top']},
 {find:'Right gluteus maximus',views:['glute-back','glute-right-lateral','glute-oblique']},
 {find:'thoracolumbar fascia',views:['lumbar-back','torso-back'],scene:'connective'},
 {find:'Right inferior gluteal vein',views:['glute-back','glute-right-lateral'],scene:'vessels'},
 {find:'Right dorsal ramus of thoracic spinal nerve',views:['nerve-thoracic-back','nerve-thoracic-lateral'],scene:'nerves'}];
const only=(process.env.SCENES||'').split(',').filter(Boolean),onlyV=(process.env.VIEWS||'').split(',').filter(Boolean);
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1500,height:950}});p.setDefaultTimeout(300000);p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);await p.waitForSelector('.system-list',{timeout:300000});await p.waitForTimeout(+(process.env.LOAD_WAIT||60000));
 for(let i=0;i<120;i++){const busy=await p.evaluate(()=>/周邊神經/.test(document.body.innerText));if(!busy)break;await p.waitForTimeout(5000);}
 await p.waitForTimeout(8000);
 for(const [scene,systems] of Object.entries(SCENES)){if(only.length&&!only.includes(scene))continue;if(process.env.SELECT&&!process.env.SCENES)break;
  await p.locator('.system-row',{hasText:systems[0]}).first().locator('button').first().click();await p.waitForTimeout(1500);
  for(const t of systems.slice(1)){await p.locator('.system-row',{hasText:t}).first().locator('[role=switch]').click();await p.waitForTimeout(1500);}
  await p.waitForTimeout(5000);
  for(const v of VIEWS){if(onlyV.length&&!onlyV.includes(v.name))continue;
   await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[v.target,v.dir,v.d]);await p.waitForTimeout(4000);
   const name=`${tag}-${scene}-${v.name}.png`;await p.screenshot({path:`${out}/${name}`,clip:{x:330,y:60,width:840,height:830}});console.log('shot',name);}
 }
 if(process.env.SELECT){
  let cur='';
  for(const sel of SELECTS){const scene=sel.scene||'muscles';
   if(cur!==scene){ // return to the plain scene first: all systems off except the scene's
    const systems=SCENES[scene];await p.locator('.system-row',{hasText:systems[0]}).first().locator('button').first().click();await p.waitForTimeout(1500);
    for(const t of systems.slice(1)){await p.locator('.system-row',{hasText:t}).first().locator('[role=switch]').click();await p.waitForTimeout(1500);}cur=scene;}
   await p.getByRole('button',{name:'搜尋構造'}).click();await p.waitForTimeout(800);
   await p.locator('.search-panel input[role=combobox]').first().fill(sel.find);await p.waitForTimeout(1200);
   await p.locator('[data-slot=combobox-item]').first().click();await p.waitForTimeout(3500);
   for(const vn of sel.views){const v=VIEWS.find(x=>x.name===vn);await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[v.target,v.dir,v.d]);await p.waitForTimeout(3500);
    const name=`${tag}-sel-${sel.find.replace(/[^a-z]+/gi,'-').toLowerCase()}-${v.name}.png`;await p.screenshot({path:`${out}/${name}`,clip:{x:330,y:60,width:840,height:830}});console.log('shot',name);}
   await p.keyboard.press('Escape').catch(()=>{});await p.waitForTimeout(500);
  }
 }
 await b.close();
})().catch(e=>{console.log('FAIL',e.message.slice(0,400));process.exit(1);});

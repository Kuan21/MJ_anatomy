// Browser test (production build, software GL): 背部 → 雙側 → 組織深度. Each layer shows only its own muscles, the thoracolumbar fascia lies behind the erector spinae, bone stays as the reference.
// usage: node back-depth.cjs <port> <outDir> [width] [height]    needs a static server of the production build and playwright; every click is a real mouse click.
const {chromium}=require('playwright');const fs=require('fs');
const [port='5852',out='/tmp/depthshots',W='1500',H='950']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
let failed=0;const ok=(name,pass,info='')=>{if(!pass)failed++;console.log((pass?'PASS ':'FAIL ')+name+(info?'  '+info:''));};
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:+W,height:+H}});p.setDefaultTimeout(240000);p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);await p.waitForSelector('.region-bar',{timeout:240000});await p.waitForTimeout(+(process.env.LOAD_WAIT||150000));
 await p.mouse.move(5,5);
 const real=async loc=>{const bx=await loc.boundingBox();if(!bx)throw new Error('no box');await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);};
 const btn=(text,scope='.region-bar')=>p.locator(`${scope} button`,{hasText:new RegExp('^'+text+'$')}).first();
 const shot=async n=>{await p.waitForTimeout(3000);await p.screenshot({path:`${out}/${n}.png`});};
 const shown=async rx=>(await p.evaluate(rx=>window.__mjView.partsState().filter(x=>new RegExp(rx,'i').test(x.name)&&x.visible>.5).map(x=>x.id),rx)).length;
 await real(btn('背部'));await p.waitForTimeout(5000);
 await real(p.locator('.right-tool-rail button',{hasText:/^組織深度$/}).first());await p.waitForTimeout(1500);
 const layer=async(label,file,expect)=>{
  await real(p.locator('#tool-depth button',{hasText:new RegExp('^'+label+'$')}).first());await p.waitForTimeout(4000);await shot(file);
  for(const [rx,want] of expect){const n=await shown(rx);ok(`${label}: ${rx} ${want?'shown':'hidden'}`,want?n>0:n===0,String(n));}
 };
 await layer('全部','depth-0-all',[['rhomboid',true],['longissimus thoracis',true],['trapezius',true],['thoracolumbar fascia',true]]);
 await layer('淺層','depth-1-superficial',[['trapezius',true],['latissimus dorsi',true],['thoracolumbar fascia',true],['rhomboid',false],['longissimus thoracis',false],['^Right sacrum$|^Sacrum$',true]]);
 await layer('中層','depth-2-middle',[['rhomboid',true],['levator scapulae',true],['serratus posterior',true],['trapezius',false],['longissimus thoracis',false],['thoracolumbar fascia',false]]);
 await layer('深層','depth-3-deep',[['longissimus thoracis',true],['multifidus',true],['splenius',true],['rhomboid',false],['trapezius',false],['thoracolumbar fascia',false]]);
 await b.close();console.log(failed?`${failed} check(s) failed`:'all browser checks passed');process.exit(failed?1:0);
})();

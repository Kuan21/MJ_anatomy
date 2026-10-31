// Production-build screenshots of the lower-limb nerves: bones + nerves only, then bones + nerves + vessels; front, back, medial, lateral and close-ups.
// usage: node lower-limb-nerve-shots.cjs <port> <outDir> [side=right]   (needs `vite preview` of a production build; loading takes about 2 minutes in software GL)
const {chromium}=require('playwright');const fs=require('fs');
const [port='5731',out='/tmp/llnshots',side='right']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const sx=side==='right'?-1:1;
const V=(name,target,dir,d)=>({name,target,dir,d});
const VIEWS=[V('front',[sx*.085,.25,0],[0,0,1],1.35),V('back',[sx*.085,.25,0],[0,0,-1],1.35),V('lateral',[sx*.085,.25,0],[sx,0,0],1.35),V('medial',[sx*.085,.25,0],[-sx,0,0],1.35),
 V('leg-front',[sx*.09,.22,0],[0,0,1],.7),V('leg-lateral',[sx*.09,.22,0],[sx,0,0],.7),V('leg-medial',[sx*.09,.22,0],[-sx,0,0],.7),
 V('knee-front',[sx*.08,.44,0],[0,0,1],.35),V('knee-lateral',[sx*.1,.42,-.03],[sx,0,0],.4),V('knee-medial',[sx*.07,.42,-.03],[-sx,0,0],.4),V('knee-back',[sx*.08,.43,-.04],[0,0,-1],.4),
 V('ankle-front',[sx*.085,.07,.02],[0,.05,1],.28),V('ankle-lateral',[sx*.1,.07,0],[sx,.05,0],.3),V('ankle-medial',[sx*.07,.07,-.02],[-sx,.05,0],.3),V('ankle-back',[sx*.08,.08,-.04],[0,.05,-1],.3),
 V('neck-lateral',[sx*.105,.39,-.04],[sx,0,0],.2),V('neck-front',[sx*.105,.39,-.04],[0,0,1],.2),V('hip-back',[sx*.06,.9,-.06],[0,0,-1],.55)];
const only=(process.env.ONLY||'').split(',').filter(Boolean);
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1500,height:950}});p.setDefaultTimeout(300000);p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);await p.waitForSelector('.system-list',{timeout:300000});await p.waitForTimeout(+(process.env.LOAD_WAIT||60000));
 // the peripheral nerve packages stream in after the page is ready: wait until the loading status no longer mentions them
 for(let i=0;i<120;i++){const busy=await p.evaluate(()=>/周邊神經/.test(document.body.innerText));if(!busy)break;await p.waitForTimeout(5000);}
 await p.waitForTimeout(8000);
 await p.locator('.system-row',{hasText:'Skeleton'}).first().locator('button').first().click();await p.waitForTimeout(1500);
 await p.locator('.system-row',{hasText:'Nervous'}).first().locator('[role=switch]').click();await p.waitForTimeout(4000);
 await p.getByRole('button',{name:'下肢',exact:true}).first().click({timeout:20000});await p.waitForTimeout(3000);
 const run=async(tag)=>{for(const v of VIEWS){if(only.length&&!only.includes(v.name))continue;
   await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[v.target,v.dir,v.d]);await p.waitForTimeout(4500);
   const name=`${side}-${tag}-${v.name}.png`;await p.screenshot({path:`${out}/${name}`,clip:{x:330,y:60,width:840,height:830}});console.log('shot',name);}};
 await run('nerves');
 if(!process.env.NO_VESSELS){for(const t of ['Arteries','Veins'])await p.locator('.system-row',{hasText:t}).first().locator('[role=switch]').click();await p.waitForTimeout(5000);await run('vessels');}
 await b.close();
})().catch(e=>{console.log('FAIL',e.message.slice(0,400));process.exit(1);});

// Production-build screenshots of the lower-limb tendon batch: bones + tendons + ligaments only, four sides, tarsal tunnel close-ups, and the same views with the knee, ankle and hip set
// to their limits through the motion sliders of the page (so the screenshots show what a user sees, not an offline pose).
// usage: node lower-limb-tendon-shots.cjs <port> <outDir> [side=right]     (needs `vite preview` of a production build; loading takes about 2 minutes in software GL)
const {chromium}=require('playwright');const fs=require('fs');
const [port='5731',out='/tmp/llshots',side='right']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const sx=side==='right'?-1:1;
const V=(name,target,dir,d)=>({name,target,dir,d});
const VIEWS=[V('front',[sx*.085,.3,0],[0,0,1],1.5),V('back',[sx*.085,.3,0],[0,0,-1],1.5),V('lateral',[sx*.085,.3,0],[sx,0,0],1.5),V('medial',[sx*.085,.3,0],[-sx,0,0],1.5),
 V('ankle-medial',[sx*.07,.07,-.02],[-sx,.05,0],.4),V('ankle-lateral',[sx*.09,.07,-.02],[sx,.05,0],.4),V('tarsal-tunnel-medial',[sx*.055,.065,-.04],[-sx,.08,-.25],.2),V('tarsal-tunnel-back',[sx*.06,.065,-.04],[-sx*.45,.1,-1],.22),
 V('knee-front',[sx*.08,.45,0],[0,0,1],.5),V('knee-lateral',[sx*.08,.43,-.02],[sx,0,0],.5),V('knee-medial',[sx*.08,.42,-.02],[-sx,0,0],.5)];
const POSES=[['rest',{}],['knee-flexion-120',{'膝屈曲':120}],['ankle-dorsiflexion',{'踝背屈':20}],['ankle-plantarflexion',{'踝背屈':-45}],['hip-flexion-90',{'髖屈曲':90}]];
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1500,height:950}});p.setDefaultTimeout(300000);p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);await p.waitForSelector('.system-list',{timeout:300000});await p.waitForTimeout(+(process.env.LOAD_WAIT||100000));
 // systems: bones, tendons and connective tissue (ligaments, retinacula) only
 await p.locator('.system-row',{hasText:'Skeleton'}).first().locator('button').first().click();await p.waitForTimeout(1500);
 for(const t of ['Tendons','Connective'])await p.locator('.system-row',{hasText:t}).first().locator('[role=switch]').click();
 await p.waitForTimeout(4000);
 await p.getByRole('button',{name:'下肢',exact:true}).first().click({timeout:20000});await p.waitForTimeout(2000);
 const det=p.locator('details.joint-workspace');if(!(await det.evaluate(d=>d.open)))await det.locator('summary').first().click();await p.waitForTimeout(1000);
 await p.locator('.motion-enable-toggle input').check({timeout:20000});await p.waitForTimeout(1500);
 await p.getByRole('button',{name:side==='right'?/Right/:/Left/}).click({timeout:20000});await p.waitForTimeout(2500);
 const setAngle=async(label,v)=>{await p.evaluate(([l,v])=>{const i=[...document.querySelectorAll('input[type=range]')].find(x=>(x.getAttribute('aria-label')||'').includes(l));if(!i)throw new Error('no slider '+l);const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(i,String(v));i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}));},[label,v]);};
 for(const [pose,angles] of POSES){
  await p.getByRole('button',{name:'復位'}).first().click().catch(()=>{});await p.waitForTimeout(1500);
  for(const [l,v] of Object.entries(angles))await setAngle(l,v);
  await p.waitForTimeout(4000);
  for(const v of (pose==='rest'?VIEWS:VIEWS.filter(x=>/^(lateral|medial|ankle|tarsal|knee)/.test(x.name)&&(pose.startsWith('knee')?/knee|lateral|medial$/.test(x.name):pose.startsWith('ankle')?/ankle|tarsal/.test(x.name):/^(lateral|medial)$/.test(x.name))))){
   await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[v.target,v.dir,v.d]);await p.waitForTimeout(5000);
   const name=`${side}-${pose}-${v.name}.png`;await p.screenshot({path:`${out}/${name}`,clip:{x:330,y:60,width:840,height:830}});console.log('shot',name);
  }
 }
 await b.close();
})().catch(e=>{console.log('FAIL',e.message.slice(0,400));process.exit(1);});

// Upper-limb pose screenshots of a built site (vite preview, software GL): the reported poses and a full slider sweep.
// usage: node scripts/browser/limb-pose-shots.cjs <port> <outDir> <tag> [mode]     mode = poses (default) | sweep
//   poses: front/side/back shots of each reported pose.  sweep: every slider from its minimum to its maximum, reporting console errors, torn meshes and arm/trunk penetration read from the live scene.
// Needs playwright (NODE_PATH) and a preview server for the build under test.
const {chromium}=require('playwright');const fs=require('fs');
const [port='5800',out='/tmp/limb-pose-shots',tag='after',mode='poses']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const SIDE=process.env.SIDE||'right';
const LABELS={shoulderFlexion:'肩屈曲（＋）／伸展（－）',shoulderAbduction:'肩外展',shoulderRotation:'肩內旋（＋）／外旋（－）',elbowFlexion:'肘屈曲（＋）／伸展（－）',forearmRotation:'前臂旋前（＋）／旋後（－）',wristFlexion:'腕屈曲（＋）／伸展（－）',wristDeviation:'腕尺偏（＋）／橈偏（－）'};
const POSES=[['flex97',{shoulderFlexion:97}],['flex73-abd158',{shoulderFlexion:73,shoulderAbduction:158}],['rot48-elbow129-wrist80',{shoulderRotation:48,elbowFlexion:129,wristFlexion:80}],['neutral',{}]];
const VIEWS={front:[0,0,1],side:[SIDE==='right'?-1:1,0,0],back:[0,0,-1]};
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:+(process.env.W||1500),height:+(process.env.H||950)}});p.setDefaultTimeout(60000);
 const errors=[];p.on('pageerror',e=>errors.push('pageerror: '+e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text().slice(0,200));});
 const real=async loc=>{const bx=await loc.boundingBox();if(!bx)throw new Error('no box');await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);};
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);await p.waitForSelector('.region-bar',{timeout:240000});await p.waitForFunction(()=>{const b=document.querySelector('[data-testid=load-bar]');return !b||+b.getAttribute('aria-valuenow')>=100;},null,{timeout:900000});await p.waitForTimeout(+(process.env.LOAD_WAIT||8000));await p.mouse.move(5,5);
 await real(p.locator('.region-bar button',{hasText:/^上肢$/}).first());await p.waitForTimeout(4000);
 const ws=p.locator('.joint-workspace');if(!(await ws.getAttribute('open')!==null))await real(ws.locator('summary span').first());
 await p.locator('.motion-enable-toggle input').check({timeout:20000});await p.waitForTimeout(1500);
 await real(p.locator('.mj-motion-sides button',{hasText:new RegExp(SIDE==='right'?'Right':'Left')}).first());await p.waitForTimeout(2500);
 const setSlider=async(key,v)=>{await p.evaluate(([label,v])=>{const el=document.querySelector(`input[aria-label="${label} angle"]`);const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(el,String(v));el.dispatchEvent(new Event('input',{bubbles:true}));},[LABELS[key],v]);};
 const reset=async()=>{for(const k of Object.keys(LABELS))await setSlider(k,0);await p.waitForTimeout(800);};
 const limits=async()=>p.evaluate(L=>Object.fromEntries(Object.entries(L).map(([k,l])=>{const el=document.querySelector(`input[aria-label="${l} angle"]`);return[k,[+el.min,+el.max,+el.value]];})),LABELS);
 const sx=SIDE==='right'?-1:1,TARGET=[sx*.2,1.2,0];
 const frame=async(view,dist)=>{await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[TARGET,VIEWS[view],dist]);await p.waitForTimeout(+(process.env.SETTLE||1800));};
 if(mode==='poses'){
  for(const [name,pose] of POSES){
   await reset();for(const [k,v] of Object.entries(pose))await setSlider(k,v);await p.waitForTimeout(+(process.env.POSE_WAIT||6000));
   const shown=await limits();console.log(name,JSON.stringify(Object.fromEntries(Object.entries(shown).map(([k,v])=>[k,v[2]]))));
   for(const view of Object.keys(VIEWS)){await frame(view,+(process.env.DIST||2.2));await p.screenshot({path:`${out}/${tag}-${name}-${view}.png`});}
  }
 }else{
  const rep={};
  for(const [key] of Object.entries(LABELS)){
   const [lo,hi]=(await limits())[key].slice(0,2);rep[key]={min:lo,max:hi,steps:[]};
   for(const v of [lo,Math.round(lo/2),0,Math.round(hi/2),hi]){await reset();await setSlider(key,v);await p.waitForTimeout(+(process.env.POSE_WAIT||2500));
    const s=await p.evaluate(()=>window.__mjView.jointsState&&window.__mjView.jointsState());rep[key].steps.push({v,state:s&&JSON.stringify(s).slice(0,300)});
    if(process.env.SHOTS){await frame('front',2.2);await p.screenshot({path:`${out}/${tag}-sweep-${key}-${v}.png`});}}
  }
  fs.writeFileSync(`${out}/${tag}-sweep.json`,JSON.stringify({rep,errors},null,1));
 }
 console.log('console/page errors:',errors.length);errors.slice(0,10).forEach(e=>console.log(' ',e));
 await b.close();console.log('done');
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1);});

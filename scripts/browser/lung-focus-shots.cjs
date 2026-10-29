// Screenshot set for the 肺 focus view: front, back, lateral and mediastinal views, opaque and 30 % opacity, both lungs and each lung alone.
// usage: node lung-focus-shots.cjs <port> <outDir> <tag>      env REALCLICK=0 uses element.click() (only for builds whose panel cannot be clicked)
const {chromium}=require('playwright');
const fs=require('fs');
const [port='5611',out='/tmp/lungshots',tag='shot']=process.argv.slice(2);
fs.mkdirSync(out,{recursive:true});
const real=process.env.REALCLICK!=='0';
const C=[0,1.305,0.005];
// body-right is -x. views: [name,dir,distance]
const VIEWS={front:[[0,0,1],.78],back:[[0,0,-1],.78],'right-lateral':[[-1,0,0],.78],'left-lateral':[[1,0,0],.78]};
const PLAN=[ // side, opacity %, views
 ['both',100,['front','back','right-lateral','left-lateral']],
 ['both',30,['front','back']],
 ['left',100,['front','left-lateral','right-lateral']],   // right-lateral of the left lung alone = its mediastinal face
 ['right',100,['front','right-lateral','left-lateral']],  // left-lateral of the right lung alone = its mediastinal face
 ['left',30,['front']],['right',30,['front']]
];
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1500,height:950}});p.setDefaultTimeout(240000);
 p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);
 await p.waitForSelector('.detail-atlas-shortcuts',{timeout:240000});
 await p.waitForTimeout(+(process.env.LOAD_WAIT||80000));
 await p.mouse.move(5,5);
 const press=async sel=>{if(real){const bx=await p.locator(sel).boundingBox();await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);}else await p.evaluate(s=>document.querySelector(s).click(),sel);};
 await press('.detail-atlas-shortcuts button:nth-child(3)');await p.waitForTimeout(3000);
 await p.waitForFunction(()=>{const a=window.__mjView.partsState('lobe of (right|left) lung');return a.length===5&&a.every(x=>x.picker);},null,{timeout:900000,polling:3000});await p.waitForTimeout(5000);
 if(process.env.DUMP_VISIBLE){console.log('VISIBLE '+JSON.stringify([...new Set((await p.evaluate(()=>window.__mjView.partsState('.').filter(x=>x.visible>.5).map(x=>x.name))).filter(n=>!/rib$|vertebra|costal cartilage/i.test(n)))]));}
 const sideSel={both:1,left:2,right:3};
 const setOpacity=async v=>{const s='.lung-focus input[type=range]';if(real){const bx=await p.locator(s).boundingBox();await p.mouse.click(Math.min(bx.x+bx.width-4,bx.x+4+(bx.width-8)*((v-10)/90)),bx.y+bx.height/2);}else await p.evaluate(v=>{const e=document.querySelector('.lung-focus input[type=range]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,String(v));e.dispatchEvent(new Event('input',{bubbles:true}));},v);await p.waitForTimeout(2500);};
 for(const [side,op,views] of PLAN.filter(r=>(!process.env.ONLY_OPACITY||r[1]===+process.env.ONLY_OPACITY)&&(!process.env.ONLY_SIDES||process.env.ONLY_SIDES.split(',').includes(r[0])))){
  await press(`.lung-focus-sides button:nth-child(${sideSel[side]})`);await p.waitForTimeout(4000);
  await setOpacity(op);
  for(const v of views){const [dir,dist]=VIEWS[v];await p.evaluate(([c,d,r])=>window.__mjView.look(c,d,r),[C,dir,dist]);await p.waitForTimeout(9000);
   const name=`${tag}-${side}-${op}-${v}.png`;await p.screenshot({path:`${out}/${name}`,clip:{x:330,y:70,width:840,height:800}});console.log('shot',name);}
 }
 await b.close();
})().catch(e=>{console.log('FAIL',e.message.slice(0,400));process.exit(1);});

// Investigation (production build, software GL): the two beige oval patches above the gluteal region. Photographs skeleton + muscles from behind, behind-oblique, the side and from above, then clicks a grid
// over the lower back and reports which structure each click selects (title of the info card). usage: node glute-ellipse.cjs <port> <outDir>
const {chromium}=require('playwright');const fs=require('fs');
const [port='5891',out='/tmp/ellipse']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const VIEWS=[['back',[0,.98,-.08],[0,.05,-1],.55],['oblique',[-.05,.96,-.08],[-.75,.25,-.65],.5],['side',[-.06,.96,-.06],[-1,.05,-.1],.6],['top',[0,1.0,-.08],[0,1,-.35],.55]];
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1500,height:950}});p.setDefaultTimeout(240000);p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/?mjview=1`);await p.waitForSelector('.system-list');await p.waitForTimeout(+(process.env.LOAD_WAIT||100000));
 for(let i=0;i<120;i++){if(!(await p.evaluate(()=>/周邊神經/.test(document.body.innerText))))break;await p.waitForTimeout(5000);}
 const sys=async(names)=>{await p.locator('.system-row',{hasText:names[0]}).first().locator('button').first().click();await p.waitForTimeout(1500);for(const t of names.slice(1)){await p.locator('.system-row',{hasText:t}).first().locator('[role=switch]').click();await p.waitForTimeout(1500);}await p.waitForTimeout(4000);};
 const look=async v=>{await p.evaluate(([t,d,r])=>window.__mjView.look(t,d,r),[v[1],v[2],v[3]]);await p.waitForTimeout(3500);};
 const clip={x:330,y:60,width:840,height:830};
 // 1. skeleton only, then skeleton + muscles
 for(const [scene,names] of [['bones',['Skeleton']],['muscles',['Skeleton','Muscles']]]){await sys(names);for(const v of VIEWS){await look(v);await p.screenshot({path:`${out}/${scene}-${v[0]}.png`,clip});console.log('shot',scene,v[0]);}}
 // 2. click grid on the back view with skeleton + muscles
 await look(VIEWS[0]);const seen=new Map();
 const cx=750,cy=475,step=+(process.env.STEP||45),span=+(process.env.SPAN||5);
 for(let j=-span;j<=span;j++)for(let i=-span;i<=span;i++){const x=cx+i*step,y=cy+j*step;await p.mouse.click(x,y);await p.waitForTimeout(700);
  const t=(await p.locator('.detail-sheet .structure-title').first().innerText().catch(()=>'')).replace(/\s+/g,' ');const k=t||'(nothing)';if(!seen.has(k))seen.set(k,[]);seen.get(k).push([x,y]);}
 for(const [k,v] of seen)console.log('PICK',k,'|',v.length,'clicks, e.g.',JSON.stringify(v.slice(0,3)));
 await b.close();
})().catch(e=>{console.log('FAIL',e.message.slice(0,300));process.exit(1);});

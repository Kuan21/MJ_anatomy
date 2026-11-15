// Brain detail mode screenshots at fixed views (front, back, left, right, top), default layers, and a deep structure selected (corticopontine tract) with Focus.
// usage: node brain-views.cjs <port> <outDir> <label>   needs playwright and `vite preview` of a production build; ~3 minutes (software GL).
const {chromium}=require('playwright');const fs=require('fs');
const [port='5841',out='/tmp/brainshots',label='after']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1500,height:950}});p.setDefaultTimeout(240000);p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/#/organ/brain`);await p.waitForSelector('.organ-views');
 await p.waitForFunction(()=>!document.querySelector('.organ-progress'),null,{timeout:240000});await p.waitForTimeout(6000);
 const real=async loc=>{const bx=await loc.boundingBox();await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);};
 for(const [v,zh] of [['front','前面'],['back','後面'],['left','左側'],['right','右側'],['top','上面']]){await real(p.locator('.organ-views button',{hasText:new RegExp('^'+zh+'$')}));await p.waitForTimeout(2500);await p.screenshot({path:`${out}/${label}-${v}.png`});console.log('shot',v);}
 // a deep structure: search it, select, Focus (the hint tells the user to press Focus when its layer is off)
 await real(p.locator('.organ-views button',{hasText:/^前面$/}));await p.waitForTimeout(1500);
 const input=p.locator('input[type=search],input[type=text]').first();await input.fill('Corticopontine tract (parietal)');await p.waitForTimeout(1200);
 const row=p.locator('.organ-part-row button, .organ-part button, li button',{hasText:/Corticopontine tract/}).first();
 if(await row.count()){await row.click();await p.waitForTimeout(2000);await p.screenshot({path:`${out}/${label}-deep-selected.png`});
  const f=p.locator('.organ-actions button',{hasText:/Focus/});if(await f.count()){await f.click();await p.waitForTimeout(4000);}
  await p.screenshot({path:`${out}/${label}-deep-focus.png`});console.log('deep shots');}
 else console.log('no row for the deep structure');
 await b.close();
})();

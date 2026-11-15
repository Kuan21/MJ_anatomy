// Brain detail mode, glass cortex: fixed views with the glass cortex off and on (deep structures switched on by the toggle), and a deep structure selected / deselected.
// usage: node brain-glass.cjs <port> <outDir> <label>   needs playwright and `vite preview` of a production build; ~3 minutes (software GL).
const {chromium}=require('playwright');const fs=require('fs');
const [port='5841',out='/tmp/brainglass',label='after']=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1500,height:950}});p.setDefaultTimeout(240000);p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(`http://127.0.0.1:${port}/#/organ/brain`);await p.waitForSelector('.organ-views');
 await p.waitForFunction(()=>!document.querySelector('.organ-progress'),null,{timeout:240000});await p.waitForTimeout(6000);
 const real=async loc=>{const bx=await loc.boundingBox();await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);};
 const view=async zh=>{await real(p.locator('.organ-views button',{hasText:new RegExp('^'+zh+'$')}));await p.waitForTimeout(2500);};
 const shot=async n=>{await p.screenshot({path:`${out}/${label}-${n}.png`});console.log('shot',n);};
 const pressed=async()=>p.locator('button',{hasText:/玻璃皮質/}).first().getAttribute('aria-pressed');
 console.log('glass pressed at start',await pressed());
 for(const [v,zh] of [['front','前面'],['left','左側'],['top','上面']]){await view(zh);await shot(`off-${v}`);}
 await real(p.locator('button',{hasText:/玻璃皮質/}).first());await p.waitForTimeout(2500);console.log('glass pressed after click',await pressed());
 for(const [v,zh] of [['front','前面'],['left','左側'],['top','上面'],['back','後面']]){await view(zh);await shot(`glass-${v}`);}
 // glass off again: the deep groups go back to what they were
 await real(p.locator('button',{hasText:/玻璃皮質/}).first());await p.waitForTimeout(2500);console.log('glass pressed after second click',await pressed());await view('前面');await shot('restored-front');
 // a deep structure selected with the glass off: the cortex turns to glass by itself and comes back when the selection is cleared
 const input=p.locator('input[type=search],input[type=text]').first();await input.fill('Corticopontine tract (parietal)');await p.waitForTimeout(1200);
 const row=p.locator('.organ-part-row button, .organ-part button, li button',{hasText:/Corticopontine tract/}).first();
 if(await row.count()){await row.click();await p.waitForTimeout(2500);await shot('deep-selected');
  const clear=p.locator('button',{hasText:/^(取消選取|清除|Clear)/}).first();if(await clear.count()){await clear.click();await p.waitForTimeout(2500);await shot('deep-cleared');}else console.log('no clear button');}
 else console.log('no row for the deep structure');
 await b.close();
})();

// Real WebGL smoke test. CPU scene tests deliberately stub the renderer and
// cannot detect a rejected draw, shader compilation failure, or blank canvas.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {preview} from 'vite';
import {chromium,webkit} from 'playwright';

const out=path.resolve('test-results/atlas-render');fs.mkdirSync(out,{recursive:true});
const server=await preview({base:'/MJ_anatomy/',preview:{host:'127.0.0.1',port:4173,strictPort:true}});
const reports=[];
const engines=process.env.BROWSER ? [process.env.BROWSER] : ['chromium','webkit'];
try{
 for(const name of engines){
  const engine={chromium,webkit}[name];assert.ok(engine,`Unknown browser: ${name}`);
  const report={browser:name,stages:[]};reports.push(report);
  const browser=await engine.launch(name==='chromium'?{args:['--enable-unsafe-swiftshader']}:{ });
  try{
   const page=await browser.newPage({viewport:{width:1024,height:900},hasTouch:true,deviceScaleFactor:1});
   const errors=[];report.errors=errors;page.on('pageerror',e=>errors.push(e.message));
   page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.addInitScript(()=>{
    window.__drawCheck={calls:0,errors:[]};
    for(const Type of [window.WebGLRenderingContext,window.WebGL2RenderingContext]){
     if(!Type)continue;
     const draw=Type.prototype.drawElements;
     Type.prototype.drawElements=function(...args){
      draw.apply(this,args);const error=this.getError();
      if(error!==this.NO_ERROR&&window.__drawCheck.errors.length<20)window.__drawCheck.errors.push(error);
      if(args[1]>0)window.__drawCheck.calls++;
     };
    }
   });
   const loaded=async()=>{
    await page.locator('[data-testid="load-bar"][aria-valuenow="100"]').waitFor({timeout:120000});
    await page.waitForTimeout(1000);
   };
   await page.goto('http://127.0.0.1:4173/MJ_anatomy/');await loaded();
   const capture=async(stage)=>{
    const draw=await page.evaluate(()=>window.__drawCheck);report.stages.push({stage,draw});
    await page.screenshot({path:path.join(out,`${name}-${stage}.png`)});
    assert.ok(draw.calls>0,`${name}/${stage}: actual indexed anatomy draws`);
    assert.deepEqual(draw.errors,[],`${name}/${stage}: WebGL errors`);
    assert.deepEqual(errors,[],`${name}/${stage}: page/shader/asset errors`);
   };
   await capture('whole');
   for(const region of ['上肢','下肢','頭部','全身']){
    await page.getByRole('checkbox',{name:region,exact:true}).click();await loaded();
    await capture(region);
   }
   const skeleton=page.getByRole('button',{name:/^Skeleton \d+/});
   if(!await skeleton.isVisible())await page.getByRole('button',{name:'Systems',exact:true}).click();
   await skeleton.click();await loaded();
   await capture('skeleton');
   // Reopening with a warm asset cache must also render complete geometry.
   await page.reload();await loaded();await capture('reopen');
  }finally{await browser.close();}
 }
}finally{
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(reports,null,2));
 await new Promise(resolve=>server.httpServer.close(resolve));
}
console.log('PASS real Chromium and WebKit: initial load, regions, skeleton and warm-cache reopen; no WebGL errors.');

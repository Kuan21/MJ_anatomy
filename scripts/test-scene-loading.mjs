// CPU integration of the actual scene loader. GPU drawing and browser DOM are
// stubbed; real Three.js geometry, package decoding and registration run.
// This is not an iPad/WebGL visual test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import * as THREE from 'three';
const root=fileURLToPath(new URL('../',import.meta.url));
let scene,effects=[],cleanups=[],refs=[],refCursor=0,statuses=[],progress=[],retryAvailable=false,nextFrame;
const element=()=>({style:{},clientWidth:1024,clientHeight:768,appendChild(){},setAttribute(){},addEventListener(){},removeEventListener(){},remove(){},getBoundingClientRect(){return{left:0,top:0,width:1024,height:768};}});
const host=element();
class Renderer{domElement=element();setPixelRatio(n){assert.equal(n,1);}setClearColor(){}setSize(){}render(s){scene=s;}dispose(){}}
class PMREM{fromScene(){return{texture:new THREE.Texture(),dispose(){}};}dispose(){}}
class Controls{target=new THREE.Vector3();mouseButtons={};touches={};addEventListener(){}update(){}dispose(){}}
class Room extends THREE.Scene{dispose(){}}
class Draco{setDecoderPath(){}setWorkerLimit(){}dispose(){}}
class Gltf{setDRACOLoader(){}async parseAsync(){return{scene:new THREE.Group()};}}
const requests=[],failedPath='/models/body-14.bin',failOnce=process.argv.includes('--fail');
globalThis.window=globalThis;globalThis.document={createElement:element,querySelector(){return null;}};
Object.defineProperty(globalThis,'navigator',{value:{userAgent:'masked WKWebView',platform:'unknown',maxTouchPoints:5},configurable:true});
globalThis.matchMedia=()=>({matches:true});globalThis.devicePixelRatio=2;globalThis.innerWidth=1024;
globalThis.ResizeObserver=class{constructor(fn){this.fn=fn;}observe(){this.fn();}disconnect(){}};
globalThis.requestAnimationFrame=fn=>{nextFrame=fn;return 1;};globalThis.cancelAnimationFrame=()=>{};
globalThis.fetch=async url=>{
 requests.push(String(url));
 if(failOnce&&!retryAvailable&&String(url).replace(/\.gz$/,'')===failedPath)return new Response('offline',{status:503});
 const file=path.join(root,'public',String(url));
 return fs.existsSync(file)?new Response(fs.readFileSync(file)):new Response('missing',{status:404});
};
const external={
 three:{...THREE,WebGLRenderer:Renderer,PMREMGenerator:PMREM},
 react:{useRef(value){const i=refCursor++;return refs[i]??(refs[i]={current:i===1?host:value});},useEffect(fn){effects.push(fn);}},
 'react/jsx-runtime':{jsx(){return null;}},
 'three/examples/jsm/controls/OrbitControls.js':{OrbitControls:Controls},
 'three/examples/jsm/environments/RoomEnvironment.js':{RoomEnvironment:Room},
 'three/examples/jsm/loaders/GLTFLoader.js':{GLTFLoader:Gltf},
 'three/examples/jsm/loaders/DRACOLoader.js':{DRACOLoader:Draco}
};
const cache=new Map();
const synthetic=(key,exports)=>new vm.SyntheticModule(Object.keys(exports),function(){for(const [name,value] of Object.entries(exports))this.setExport(name,value);},{identifier:key});
async function getModule(key){
 if(cache.has(key))return cache.get(key);
 let mod;
 if(external[key])mod=synthetic(key,external[key]);
 else if(!key.startsWith('/'))mod=synthetic(key,await import(key));
 else if(key.endsWith('.json'))mod=synthetic(key,{default:JSON.parse(fs.readFileSync(key,'utf8'))});
 else{
  const source=fs.readFileSync(key,'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  mod=new vm.SourceTextModule(code,{identifier:key,initializeImportMeta(meta){meta.env={BASE_URL:'/'};}});
 }
 cache.set(key,mod);return mod;
}
const main=await getModule(path.join(root,'app/scene.tsx'));
await main.link(async(spec,ref)=>{
 let key=spec;
 if(spec.startsWith('.')){key=path.resolve(path.dirname(ref.identifier),spec);if(!fs.existsSync(key))key=['.ts','.tsx','.json'].map(ext=>key+ext).find(fs.existsSync);}
 return getModule(key);
});await main.evaluate();
const atlas=JSON.parse(fs.readFileSync(path.join(root,'public/models/atlas.json'),'utf8'));
let resolveDone;let done=new Promise(resolve=>{resolveDone=resolve;});
const state={tissueMotion:true,explode:0,visible:['skeletal','muscular','arterial','venous','nervous','connective'],selected:[],hiddenParts:[],depthFilter:'all',isolate:false,view:'three-quarter',rotate:false,reset:0};
const props={atlas,state,onSelect(){},onProgress(n){progress.push(n);},onLoadStatus(s){statuses.push(s);if(!s.busy&&(s.loaded===s.total||s.failed.length))resolveDone(s);},onError(e){assert.fail(e);}};
main.namespace.default(props);for(const fn of effects)cleanups.push(fn());effects=[];
const timeout=setTimeout(()=>{console.error('Scene loader timed out');process.exit(1);},20000);
const first=await done;
assert.ok(first.interactive);assert.equal(first.total,2234);
if(failOnce){
 assert.ok(first.failed.length);assert.ok(first.loaded<first.total);assert.ok(!progress.includes(100),'never report complete for missing vessels');
 const counts=new Map(requests.map(url=>[url,requests.filter(x=>x===url).length]));
 retryAvailable=true;done=new Promise(resolve=>{resolveDone=resolve;});refCursor=0;
 main.namespace.default({...props,retryNonce:1});effects[1]();effects=[];
 const resumed=await done;assert.equal(resumed.loaded,2234);assert.equal(resumed.failed.length,0);
 for(const [url,count] of counts)if(!url.includes('body-14'))assert.equal(requests.filter(x=>x===url).length,count,'retry duplicated successful package');
}
const final=statuses.at(-1);assert.equal(final.loaded,2234);assert.equal(final.failed.length,0);assert.equal(progress.at(-1),100);
for(const system of state.visible){const expected=atlas.parts.filter(p=>p.system===system).length;assert.equal(final.systems[system],expected,`${system} complete`);}
const rendered=new Set();scene.traverse(o=>{const a=o.geometry?.getAttribute('partIndex');if(a)for(const value of a.array)rendered.add(value);});
assert.equal(rendered.size,2234,'all catalogue parts have assembled scene geometry');
assert.equal(new Set(requests.filter(x=>/body-\d+\.bin\.gz$/.test(x))).size,15);
// Exercise the newly lazy motion bindings in the actual scene, including
// merging updates back into the rendered muscle/vessel/nerve geometry.
const humerus=atlas.parts.find(p=>/right humerus/i.test(p.name));assert.ok(humerus);
refCursor=0;
main.namespace.default({...props,state:{...state,partTransforms:{[humerus.id]:{translation:[0,0,0],quaternion:[0,0,0,1]}}}});
nextFrame();
scene.traverse(o=>{const a=o.geometry?.getAttribute('position');if(a)for(const value of a.array)assert.ok(Number.isFinite(value),'finite geometry after lazy motion');});
cleanups[0]();clearTimeout(timeout);
console.log(`PASS actual scene loader: ${rendered.size} geometries, all 6 initial systems complete, lazy motion finite${failOnce?', missing vessels resumed without duplicating anatomy':''}. GPU rendering was stubbed.`);

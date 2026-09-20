import {mkdir,copyFile} from 'node:fs/promises';
const output=new URL('../public/draco/',import.meta.url);
const source=new URL('../node_modules/three/examples/jsm/libs/draco/gltf/',import.meta.url);
await mkdir(output,{recursive:true});
for(const name of ['draco_wasm_wrapper.js','draco_decoder.wasm','draco_decoder.js'])await copyFile(new URL(name,source),new URL(name,output));

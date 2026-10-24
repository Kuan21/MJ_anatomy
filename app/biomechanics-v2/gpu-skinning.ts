import type {Side} from './skeleton';
import {FRAMES,type Palette,type SkinBinding} from './soft-tissue';

/**
 * GPU stage of biomechanics-v2 skinning.
 *
 * Bindings that isLinearBinding() accepts are exactly one normalized
 * dual-quaternion blend of the soft-rig palette per vertex. Instead of being
 * re-solved in the shoulder worker and re-uploaded for every pose, their
 * existing indices/weights are written once into the merged mesh and the
 * shader blends the same palette (same hemisphere and dual-part projection as
 * soft-tissue.ts `blended`). Fibre guides, sections, wraps, cables and surface
 * guards stay on the CPU solver.
 *
 * Palette slots: 0 = identity, then the FRAMES of each side. Body regions can
 * claim further slots the same way; the shader does not change.
 */
export const FRAME_COUNT=FRAMES.length;
export const SIDE_BASE:Record<Side,number>={left:1,right:1+FRAME_COUNT};
export const SLOT_COUNT=1+2*FRAME_COUNT;
/** Two RGBA texels (real, dual) per slot, power-of-two width. */
export const PALETTE_WIDTH=2**Math.ceil(Math.log2(SLOT_COUNT*2));
const IDENTITY=[0,0,0,1,0,0,0,0];
const WEIGHT_SCALE=65535;

export interface GpuBinding {side:Side;indices:Uint8Array;weights:Float32Array}
export const gpuBinding=(side:Side,b:Pick<SkinBinding,'indices'|'weights'>):GpuBinding=>({side,indices:b.indices,weights:b.weights});

/** Pack both sides' soft-rig palettes into the palette texture data (missing side = identity). */
export function writePalette(data:Float32Array,palettes:Record<Side,Palette|null>){
 data.fill(0);data.set(IDENTITY,0);
 for(const side of ['left','right'] as Side[])for(let f=0;f<FRAME_COUNT;f++){
  const slot=(SIDE_BASE[side]+f)*8,p=palettes[side];
  if(p)for(let c=0;c<8;c++)data[slot+c]=p[f*8+c];else data.set(IDENTITY,slot);
 }
 return data;
}

/** Write one binding into the merged mesh's slot/weight attributes at a vertex offset. Weights keep an exact partition of unity. */
export function writeGpuAttributes(b:GpuBinding,slots:Uint8Array,weights:Uint16Array,offset:number){
 const count=b.indices.length/4,base=SIDE_BASE[b.side];
 for(let v=0;v<count;v++){
  const o=v*4,to=(offset+v)*4;let total=0,largest=0;
  for(let k=0;k<4;k++){const w=Math.max(0,b.weights[o+k]);total+=w;}
  const q=[0,0,0,0];let sum=0;
  for(let k=0;k<4;k++){q[k]=total>0?Math.round(Math.max(0,b.weights[o+k])/total*WEIGHT_SCALE):k===0?WEIGHT_SCALE:0;sum+=q[k];if(q[k]>q[largest])largest=k;}
  q[largest]+=WEIGHT_SCALE-sum;
  for(let k=0;k<4;k++){slots[to+k]=base+b.indices[o+k];weights[to+k]=q[k];}
 }
}
/** Reset a vertex range to the identity slot (rigid per-part transforms then apply as before). */
export function clearGpuAttributes(slots:Uint8Array,weights:Uint16Array,offset:number,count:number){
 slots.fill(0,offset*4,(offset+count)*4);weights.fill(0,offset*4,(offset+count)*4);
 for(let v=offset;v<offset+count;v++)weights[v*4]=WEIGHT_SCALE;
}

/** Shader chunks. `motionState.w` > 0.5 marks a part as GPU-skinned; qrot, partIndex and stateWidth come from the anatomy material. */
export const GPU_SKIN_PARS=`attribute vec4 segIndex; attribute vec4 segWeight; uniform sampler2D paletteState; uniform float paletteWidth;
vec4 mjSlotReal(float s){ return texture2D(paletteState, vec2((2.0*s+0.5)/paletteWidth, 0.5)); }
vec4 mjSlotDual(float s){ return texture2D(paletteState, vec2((2.0*s+1.5)/paletteWidth, 0.5)); }
`;
export const GPU_SKIN_NORMAL=`
float mjGpuSkin = texture2D(motionState, vec2((partIndex + 0.5) / stateWidth, 0.5)).w;
vec4 mjReal = vec4(0.0,0.0,0.0,1.0), mjDual = vec4(0.0);
if(mjGpuSkin > 0.5){
 vec4 mjR0 = mjSlotReal(segIndex.x); float mjTotal = max(dot(segWeight, vec4(1.0)), 1e-6); mjReal = vec4(0.0);
 for(int k = 0; k < 4; k++){
  float w = segWeight[k]/mjTotal; if(w <= 0.0) continue;
  vec4 r = mjSlotReal(segIndex[k]); if(dot(r, mjR0) < 0.0) w = -w;
  mjReal += w*r; mjDual += w*mjSlotDual(segIndex[k]);
 }
 float mjLen = max(length(mjReal), 1e-10); mjReal /= mjLen; mjDual /= mjLen; mjDual -= dot(mjReal, mjDual)*mjReal;
 objectNormal = qrot(mjReal, objectNormal);
}
`;
export const GPU_SKIN_POSITION=`
if(mjGpuSkin > 0.5) transformed = qrot(mjReal, transformed) + 2.0*(mjReal.w*mjDual.xyz - mjDual.w*mjReal.xyz + cross(mjReal.xyz, mjDual.xyz));
`;

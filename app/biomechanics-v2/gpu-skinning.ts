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
 * Palette slots: 0 = identity, then the FRAMES of each side, then the four moving
 * frames (thigh, shank, foot, half-knee) of each leg body region. The shader does
 * not change: it only blends whichever slots a vertex names.
 *
 * Skin (and any other unbound limb surface) carries ABSOLUTE slots computed at
 * build time by scripts/prepare-skin-weights.mjs, so skin, muscles, vessels and
 * bones all follow the same segment chain.
 */
export const FRAME_COUNT=FRAMES.length;
export const SIDE_BASE:Record<Side,number>={left:1,right:1+FRAME_COUNT};
export const LEG_FRAME_COUNT=4;
const ARM_SLOTS=1+2*FRAME_COUNT;
/** Slot of leg frame k (1 = thigh, 2 = shank, 3 = foot, 4 = half-knee) is LEG_BASE[side]+k-1. */
export const LEG_BASE:Record<Side,number>={left:ARM_SLOTS,right:ARM_SLOTS+LEG_FRAME_COUNT};
export const SLOT_COUNT=ARM_SLOTS+2*LEG_FRAME_COUNT;
/** Two RGBA texels (real, dual) per slot, power-of-two width. */
export const PALETTE_WIDTH=2**Math.ceil(Math.log2(SLOT_COUNT*2));
const IDENTITY=[0,0,0,1,0,0,0,0];
const WEIGHT_SCALE=65535;

/** `side` selects the arm palette the indices are relative to; `side:null` means the indices are absolute palette slots.
 * `exact`: the GPU blend is the whole solution (linear binding). Otherwise the CPU/worker result is the exact one and
 * the GPU blend is only the coarse live preview shown while the pose is still being dragged.
 * `lbs`: the preview uses linear blend skinning (chest/pectoral sheets) instead of dual quaternions. */
export interface GpuBinding {side:Side|null;indices:Uint8Array;weights:Float32Array;exact:boolean;lbs:boolean}
export const gpuBinding=(side:Side|null,b:Pick<SkinBinding,'indices'|'weights'>,exact=true,lbs=false):GpuBinding=>({side,indices:b.indices,weights:b.weights,exact,lbs});
/** Value written to the per-part shader flag: 0 off, 1 dual quaternion, 2 linear blend. */
export const skinMode=(b:Pick<GpuBinding,'lbs'>|undefined,on:boolean)=>on?(b?.lbs?2:1):0;

/** Pack both sides' soft-rig palettes, and the active leg body palette, into the palette texture data (missing = identity). */
export function writePalette(data:Float32Array,palettes:Record<Side,Palette|null>,legs?:Partial<Record<Side,Palette|null>>){
 data.fill(0);data.set(IDENTITY,0);
 for(const side of ['left','right'] as Side[]){
  for(let f=0;f<FRAME_COUNT;f++){
   const slot=(SIDE_BASE[side]+f)*8,p=palettes[side];
   if(p)for(let c=0;c<8;c++)data[slot+c]=p[f*8+c];else data.set(IDENTITY,slot);
  }
  // A body-region palette holds the root (identity) at frame 0, then the moving frames.
  for(let f=0;f<LEG_FRAME_COUNT;f++){
   const slot=(LEG_BASE[side]+f)*8,p=legs?.[side];
   if(p&&p.length>=(f+2)*8)for(let c=0;c<8;c++)data[slot+c]=p[(f+1)*8+c];else data.set(IDENTITY,slot);
  }
 }
 return data;
}

/** Write one binding into the merged mesh's slot/weight attributes at a vertex offset. Weights keep an exact partition of unity. */
export function writeGpuAttributes(b:GpuBinding,slots:Uint8Array,weights:Uint16Array,offset:number){
 const count=b.indices.length/4,base=b.side?SIDE_BASE[b.side]:0;
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

/** Shader chunks. The blend is applied when `flag` (a float expression) is above 0.5. The anatomy material reads it from
 * the per-part motion texture; other materials (peripheral nerves) read a uniform. */
export const GPU_SKIN_PARS=`attribute vec4 segIndex; attribute vec4 segWeight; uniform highp sampler2D paletteState; uniform float paletteWidth;
vec4 mjSlotReal(float s){ return texture2D(paletteState, vec2((2.0*s+0.5)/paletteWidth, 0.5)); }
vec4 mjSlotDual(float s){ return texture2D(paletteState, vec2((2.0*s+1.5)/paletteWidth, 0.5)); }
vec3 mjQrot(vec4 q, vec3 v){ return v + 2.0*cross(q.xyz, cross(q.xyz,v)+q.w*v); }
`;
export const gpuSkinNormal=(flag:string)=>`
float mjGpuSkin = ${flag};
vec4 mjReal = vec4(0.0,0.0,0.0,1.0), mjDual = vec4(0.0); vec3 mjLbs = position;
if(mjGpuSkin > 1.5){
 float mjTot = max(dot(segWeight, vec4(1.0)), 1e-6); vec3 mjAcc = vec3(0.0), mjNormal = vec3(0.0);
 for(int k = 0; k < 4; k++){
  float w = segWeight[k]/mjTot; if(w <= 0.0) continue;
  vec4 r = mjSlotReal(segIndex[k]), d = mjSlotDual(segIndex[k]);
  mjAcc += w*(mjQrot(r, position) + 2.0*(r.w*d.xyz - d.w*r.xyz + cross(r.xyz, d.xyz))); mjNormal += w*mjQrot(r, objectNormal);
 }
 mjLbs = mjAcc; objectNormal = normalize(mjNormal);
} else if(mjGpuSkin > 0.5){
 vec4 mjR0 = mjSlotReal(segIndex.x); float mjTotal = max(dot(segWeight, vec4(1.0)), 1e-6); mjReal = vec4(0.0);
 for(int k = 0; k < 4; k++){
  float w = segWeight[k]/mjTotal; if(w <= 0.0) continue;
  vec4 r = mjSlotReal(segIndex[k]); if(dot(r, mjR0) < 0.0) w = -w;
  mjReal += w*r; mjDual += w*mjSlotDual(segIndex[k]);
 }
 float mjLen = max(length(mjReal), 1e-10); mjReal /= mjLen; mjDual /= mjLen; mjDual -= dot(mjReal, mjDual)*mjReal;
 objectNormal = mjQrot(mjReal, objectNormal);
}
`;
export const GPU_SKIN_POSITION=`
if(mjGpuSkin > 1.5) transformed = mjLbs;
else if(mjGpuSkin > 0.5) transformed = mjQrot(mjReal, transformed) + 2.0*(mjReal.w*mjDual.xyz - mjDual.w*mjReal.xyz + cross(mjReal.xyz, mjDual.xyz));
`;
export const GPU_SKIN_NORMAL=gpuSkinNormal('texture2D(motionState, vec2((partIndex + 0.5) / stateWidth, 0.5)).w');


/** CPU twin of GPU_SKIN_POSITION for absolute-slot bindings, reading the packed float32 palette (picking, tests). */
export function slotSkin(b:Pick<GpuBinding,'indices'|'weights'>&{lbs?:boolean},base:ArrayLike<number>,palette:Float32Array,out:Float32Array){
 const R=[0,0,0,0],D=[0,0,0,0];
 if(b.lbs){
  // Linear blend of the posed positions (shader mode 2): where two segments that turn far apart meet, the skin folds in rather than swinging outward.
  for(let v=0;v<out.length/3;v++){
   const o=v*4,x=base[v*3],y=base[v*3+1],z=base[v*3+2];let total=0;for(let k=0;k<4;k++)total+=Math.max(0,b.weights[o+k]);total=Math.max(total,1e-6);
   let ax=0,ay=0,az=0;
   for(let k=0;k<4;k++){
    const w=Math.max(0,b.weights[o+k])/total;if(w<=0)continue;const s=b.indices[o+k]*8,r0=palette[s],r1=palette[s+1],r2=palette[s+2],r3=palette[s+3],d0=palette[s+4],d1=palette[s+5],d2=palette[s+6],d3=palette[s+7];
    const cx=r1*z-r2*y+r3*x,cy=r2*x-r0*z+r3*y,cz=r0*y-r1*x+r3*z;
    ax+=w*(x+2*(r1*cz-r2*cy)+2*(r3*d0-d3*r0+r1*d2-r2*d1));ay+=w*(y+2*(r2*cx-r0*cz)+2*(r3*d1-d3*r1+r2*d0-r0*d2));az+=w*(z+2*(r0*cy-r1*cx)+2*(r3*d2-d3*r2+r0*d1-r1*d0));
   }
   out[v*3]=ax;out[v*3+1]=ay;out[v*3+2]=az;
  }
  return out;
 }
 for(let v=0;v<out.length/3;v++){
  const o=v*4,s0=b.indices[o]*8;let total=0;for(let k=0;k<4;k++)total+=Math.max(0,b.weights[o+k]);total=Math.max(total,1e-6);
  R.fill(0);D.fill(0);
  for(let k=0;k<4;k++){
   let w=Math.max(0,b.weights[o+k])/total;if(w<=0)continue;const s=b.indices[o+k]*8;
   if(palette[s]*palette[s0]+palette[s+1]*palette[s0+1]+palette[s+2]*palette[s0+2]+palette[s+3]*palette[s0+3]<0)w=-w;
   for(let c=0;c<4;c++){R[c]+=w*palette[s+c];D[c]+=w*palette[s+4+c];}
  }
  const len=Math.max(Math.hypot(R[0],R[1],R[2],R[3]),1e-10);for(let c=0;c<4;c++){R[c]/=len;D[c]/=len;}
  const dot=R[0]*D[0]+R[1]*D[1]+R[2]*D[2]+R[3]*D[3];for(let c=0;c<4;c++)D[c]-=dot*R[c];
  const x=base[v*3],y=base[v*3+1],z=base[v*3+2],cx=R[1]*z-R[2]*y+R[3]*x,cy=R[2]*x-R[0]*z+R[3]*y,cz=R[0]*y-R[1]*x+R[3]*z;
  out[v*3]=x+2*(R[1]*cz-R[2]*cy)+2*(R[3]*D[0]-D[3]*R[0]+R[1]*D[2]-R[2]*D[1]);
  out[v*3+1]=y+2*(R[2]*cx-R[0]*cz)+2*(R[3]*D[1]-D[3]*R[1]+R[2]*D[0]-R[0]*D[2]);
  out[v*3+2]=z+2*(R[0]*cy-R[1]*cx)+2*(R[3]*D[2]-D[3]*R[2]+R[0]*D[1]-R[1]*D[0]);
 }
 return out;
}

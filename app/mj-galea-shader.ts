/**
 * Look of the tendon-like sheets on the skull (the epicranial aponeurosis and the tendinous origin of trapezius below it): the colour every aponeurosis shares (app/mj-tissue-colors.ts), a fine fibre relief and a soft darker edge.
 * The relief is computed in the fragment shader from the position of the point in the model (no image, no texture): wavy fibres that run from top to bottom over the back of the skull, as the tendon fibres do,
 * plus a very fine grain. It only bends the shading normal, the surface itself stays smooth.
 */
import {APONEUROSIS_COLOR} from './mj-tissue-colors';
export const GALEA_COLOR=APONEUROSIS_COLOR;
/** How far from the rim of the sheet the soft edge reaches, in millimetres. */
export const GALEA_EDGE_MM=9;
export const GALEA_FRAG=`
varying float vEdge; varying vec3 vFibPos;
float gHash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float gNoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(gHash(i), gHash(i+vec2(1.0,0.0)), f.x), mix(gHash(i+vec2(0.0,1.0)), gHash(i+vec2(1.0,1.0)), f.x), f.y); }
// height of the fibre relief in metres. The phase of the stripes depends on the sideways position x only, so every fibre lies in a sagittal plane: it runs from front to back over the vault and
// down the back of the skull following the curve of the bone (and from top to bottom on the nuchal sheet), never across it. Bundles about 2.0 mm apart that wander a little (they are what the eye reads
// at normal distance), finer fibres about 0.9 mm apart between them, and a faint grain.
float galeaHeight(vec3 p){
  float w = gNoise(vec2(p.x*300.0, p.y*45.0));
  float coarse = sin(p.x*3100.0 + 3.0*w);
  float fine = sin(p.x*7000.0 + 3.0*gNoise(vec2(p.x*700.0, p.y*90.0)));
  float grain = gNoise(vec2(p.x*3000.0, p.y*1200.0)) - 0.5;
  return 0.000034*coarse + 0.000014*fine + 0.000012*grain;
}
vec3 galeaColor(vec3 base, float edge, vec3 p){
  float fibre = gNoise(vec2(p.x*2100.0, p.y*55.0));
  vec3 c = base * (0.96 + 0.08*fibre);
  // towards the muscle that takes over at the border: a warmer, slightly darker tone
  float t = smoothstep(0.0, 1.0, edge);
  return mix(c, vec3(0.36, 0.25, 0.22), 0.7*t);
}
vec3 galeaNormal(vec3 normal, vec3 p, vec3 viewPosition, float faceDirection){
  float h = galeaHeight(p);
  vec2 dH = vec2(dFdx(h), dFdy(h));
  vec3 sX = dFdx(-viewPosition), sY = dFdy(-viewPosition);
  vec3 R1 = cross(sY, normal), R2 = cross(normal, sX);
  float det = dot(sX, R1) * faceDirection;
  vec3 grad = sign(det) * (dH.x * R1 + dH.y * R2);
  return normalize(abs(det) * normal - grad);
}
`;
